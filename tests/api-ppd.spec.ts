import { assert } from "chai";
import { Server } from "http";
import agent from "supertest";
import { Archer } from "../src";
import { globalData } from "./data";

describe("api-ppd", () => {
    let archer: Archer;
    let server: Server;
    before(() => {
        archer = globalData.archer;
        server = globalData.server;
    });

    it("put user", async () => {
        const res = await agent(server)
            .put('/users/123')
            .set('Accept', 'application/json');
        assert.deepEqual(res.body, { id: 123, age: 246 });
    });

    it("patch user", async () => {
        const res = await agent(server)
            .patch('/users/123')
            .set('Accept', 'application/json');
        assert.deepEqual(res.body, { id: 123, age: 369 });
    });

    it("del user", async () => {
        const res = await agent(server)
            .del('/users/123')
            .set('Accept', 'application/json');
        assert.deepEqual(res.body, { id: 123, age: -123 });
    });

    it("del no", async () => {
        agent(server)
            .del('/no')
            .expect(301)
            .expect("location", "/404");
    });
});