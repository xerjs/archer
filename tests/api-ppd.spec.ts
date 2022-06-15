import { assert } from "chai";
import { Server } from "http";
import supertest from "supertest";
import { Archer } from "../src";
import { testData } from "./data";

describe("api-ppd", () => {
    let archer: Archer;
    let server: Server;
    let agent: supertest.SuperTest<supertest.Test>;
    before(() => {
        archer = testData.archer;
        server = testData.server;
        agent = testData.agent;
    });

    it("put user", async () => {
        const res = await agent
            .put('/users/123');
        assert.deepEqual(res.body, { id: 123, age: 246 });
    });

    it("patch user", async () => {
        const res = await agent
            .patch('/users/123');
        assert.deepEqual(res.body, { id: 123, age: 369 });
    });

    it("del user", async () => {
        const res = await agent
            .del('/users/123');
        assert.deepEqual(res.body, { id: 123, age: -123 });
    });

    it("direct no", async () => {
        agent
            .del('/no')
            .expect(301)
            .expect("location", "/404");
    });
});