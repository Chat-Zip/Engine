import { Group } from 'three';
import NameLabel from './NameLabel';
import UserAppearance from './UserAppearance';

export default class UserModel extends Group {
    public nameLabel: NameLabel;
    public appearance: UserAppearance;

    constructor(name: string) {
        super();
        this.nameLabel = new NameLabel(name);
        this.appearance = new UserAppearance();
        this.add(this.nameLabel);
        this.add(this.appearance);
    }
    dispose() {
        this.nameLabel.dispose();
        this.appearance.dispose();
    }
}