export interface UserData {
    id: string;
    name: string;
}

export default class User implements UserData {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}