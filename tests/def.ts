import { sleep } from "@xerjs/avalon";
import { svc, req } from "../src";


class Person {
    age!: number;
}


@svc("/")
export class Serve {
    pp: string;
    constructor() {
        this.pp = "xxx";
    }

    @svc.get("/users")
    async listUsers(): Promise<Person[]> {
        await sleep(100);
        const p = new Person();
        p.age = this.pp.length;
        return [p];
    }

    @svc.post("/users")
    async addUsers(): Promise<Person> {
        const p = new Person();
        p.age = Math.random();
        return p;
    }
}