import { sleep } from "@xerjs/avalon";
import { svc, req, res } from "../src";


class Person {
    id!: number;
    age!: number;
    q?: string;
}


@svc("/")
export class Serve {
    pp: string;
    constructor() {
        this.pp = "xxx";
    }

    @svc.get("/users")
    async listUsers(): Promise<Person[]> {
        await sleep(8);
        const p = new Person();
        p.age = this.pp.length;
        return [p];
    }

    @svc.get("/users/s")
    async queryUsers(
        @req.query("query") query: string
    ) {
        await sleep(8);
        const p = new Person();
        p.q = query;
        return [p];
    }

    @svc.get("/users/:id")
    async oneUser(
        @req.param("id", Number) id: number
    ): Promise<Person> {
        await sleep(8);
        const p = new Person();
        p.id = id;
        p.age = 1;
        return p;
    }

    @svc.post("/users")
    async addUsers(@req.body() per: Partial<Person>): Promise<Person> {
        await sleep(8);
        const p = new Person();
        Object.assign(p, per);
        p.q = p.age.toString();
        return p;
    }

    @svc.put("/users/:id")
    async putUser(
        @req.param("id", Number) id: number
    ): Promise<Person> {
        await sleep(8);
        const p = new Person();
        p.id = id;
        p.age = id * 2;
        return p;
    }


    @svc.patch("/users/:id")
    async patchUser(
        @req.param("id", Number) id: number
    ): Promise<Person> {
        await sleep(8);
        const p = new Person();
        p.id = id;
        p.age = id * 3;
        return p;
    }

    @svc.del("/users/:id")
    async delUser(
        @req.param("id", Number) id: number
    ): Promise<Person> {
        await sleep(8);
        const p = new Person();
        p.id = id;
        p.age = -id;
        return p;
    }

    @svc.del("/no")
    @res.redirect(301)
    async del302(
        @req.param("id", Number) id: number
    ): Promise<string> {
        await sleep(8);
        return "/404";
    }
}