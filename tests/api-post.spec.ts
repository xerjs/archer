import { assert } from "chai";
import { Server } from "http";
import agent from "supertest";
import { Archer } from "../src";
import { globalData } from "./data";

describe("api-post", () => {
    let archer: Archer;
    let server: Server;
    before(() => {
        archer = globalData.archer;
        server = globalData.server;
    });

    it("add user", async () => {
        const res = await agent(server)
            .post('/users')
            .send({ age: 111 });
        assert.deepEqual(res.body, { age: 111, q: "111" });
    });
});