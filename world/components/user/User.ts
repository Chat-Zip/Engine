import UserModel from "./model";

export interface UserData {
    userId: string;
    name: string;
}

export default class User extends UserModel implements UserData {
    userId: string;
    name: string;

    constructor(id: string, name: string) {
        super(name);
        this.userId = id;
        this.name = name;
    }
}