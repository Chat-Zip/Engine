import { Group } from 'three';
import NameLabel from './NameLabel';
import UserAppearance from './UserAppearance';

export default class UserModel extends Group {
    public nameLabel: NameLabel;
    public appearance: UserAppearance;

    constructor(name: string, avatar: string) {
        super();
        this.nameLabel = new NameLabel(name);
        this.appearance = new UserAppearance(avatar);
        this.add(this.nameLabel);
        this.add(this.appearance);
    }
    updateAppearance(newAvatarURL: string) {
        this.remove(this.appearance);
        this.appearance.dispose();
        this.appearance = new UserAppearance(newAvatarURL);
        this.add(this.appearance);
    }
    dispose() {
        this.nameLabel.dispose();
        this.appearance.dispose();
    }
}
