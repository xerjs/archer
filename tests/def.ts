import { sleep } from "@xerjs/avalon";
import { apiSvc } from "../src";


class Person {
    age!: number;
}


@apiSvc("/")
export class Serve {
    pp: string;
    constructor() {
        this.pp = "xxx";
    }

    @apiSvc.get("/users")
    async listUsers(): Promise<Person[]> {
        await sleep(100);
        const p = new Person();
        p.age = this.pp.length;
        return [p];
    }

    @apiSvc.post("/users")
    async addUsers(): Promise<Person> {
        const p = new Person();
        p.age = Math.random();
        return p;
    }
}