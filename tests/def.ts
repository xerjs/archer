import { sleep } from "@xerjs/avalon";
import { svc, req } from "../src";


class Person {
    id!: string;
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

    @svc.get("/users/:id")
    async oneUser(
        @req.param("id", Number)
        id: string
    ): Promise<Person> {
        const p = new Person();
        p.id = id;
        p.age = 1;
        return p;
    }

    @svc.post("/users")
    async addUsers(): Promise<Person> {
        const p = new Person();
        p.age = Math.random();
        return p;
    }
}