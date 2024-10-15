import '../elements/chatzip-renderer';
import engine from '..';
import User from '../world/components/user/User';

import PERSON_IMG from '../world/components/user/model/person.png';

let newConnectionUserId: string | undefined = undefined;
const world = engine.world;

function createUserObject(): User {
    const id = Math.random().toString(36).substring(2,6);
    const user = new User(world.self.camera, id, id, PERSON_IMG);
    return user;
}

window.onload = () => {
    const logDiv = document.getElementById('log') as HTMLDivElement;
    function log(msg: string) {
        const logMsg = document.createElement('div');
        logMsg.innerText = msg;
        logDiv.appendChild(logMsg);
    }

    document.getElementById('btn-editor-on')!.onclick = () => {
        engine.enableEditor(true);
        log('Enabled editor mode.');
    }
    document.getElementById('btn-editor-off')!.onclick = () => {
        engine.enableEditor(false);
        log('Disabled editor mode.');
    }

    document.getElementById('btn-create-offer')!.onclick = () => {
        const user = createUserObject();
        newConnectionUserId = user.userId;
        user.conn.createSessionDescription('offer').then(sessionDescription => {
            console.log(JSON.stringify(sessionDescription));
            log("Created offer: " + JSON.stringify(sessionDescription));
        });
        world.users.set(user.userId, user);
    }
    const inputAnswerDesc = document.getElementById('input-answer-desc') as HTMLInputElement;
    document.getElementById('btn-answer-desc')!.onclick = () => {
        if (!newConnectionUserId) return;

        const user = world.users.get(newConnectionUserId);
        if (!user) return;

        user.conn.setRemoteDescription(JSON.parse(inputAnswerDesc.value));

        world.self.peers.set(newConnectionUserId, user.conn);

        user.conn.movement.onopen = () => {
            newConnectionUserId = undefined;
            log(`Connected with (${user.userId})`);
            world.add(user);

            const posBuffer = new ArrayBuffer(12);
            const posArr = new Float32Array(posBuffer);
            posArr.set(world.self.state.pos);
            user.conn.movement.send(posArr);
        }
    }

    const inputOfferDesc = document.getElementById('input-offer-desc') as HTMLInputElement;
    document.getElementById('btn-offer-desc')!.onclick = () => {
        const user = createUserObject();
        newConnectionUserId = user.userId;

        user.conn.setRemoteDescription(JSON.parse(inputOfferDesc.value));

        user.conn.createSessionDescription('answer').then(sessionDescription => {
            console.log(JSON.stringify(sessionDescription));
            log("Created answer: " + JSON.stringify(sessionDescription));
        });

        world.users.set(user.userId, user);
        world.self.peers.set(newConnectionUserId, user.conn);
        
        user.conn.movement.onopen = () => {
            newConnectionUserId = undefined;
            log(`Connected with (${user.userId})`);
            world.add(user);

            const posBuffer = new ArrayBuffer(12);
            const posArr = new Float32Array(posBuffer);
            posArr.set(world.self.state.pos);
            user.conn.movement.send(posArr);
        }
    }
    // document.getElementById('btn-create-answer')!.onclick = () => {
        
    // }
}