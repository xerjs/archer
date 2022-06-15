import { assert } from "chai";
import { Server } from "http";
import supertest from "supertest";
import { Archer } from "../src";
import { testData } from "./data";

describe("api-post", () => {
    let archer: Archer;
    let server: Server;
    let agent: supertest.SuperTest<supertest.Test>;
    before(() => {
        archer = testData.archer;
        server = testData.server;
        agent = testData.agent;
    });

    it("add user", async () => {
        const res = await agent
            .post('/users')
            .send({ age: 111 });
        assert.deepEqual(res.body, { age: 111, q: "111" });
    });
});