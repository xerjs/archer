import { assert } from "chai";
import { Server } from "http";
import agent from "supertest";
import { Archer } from "../src";
import { globalData } from "./data";

describe("api-get", () => {
    let archer: Archer;
    let server: Server;
    before(() => {
        archer = globalData.archer;
        server = globalData.server;
    });

    it("get users", async () => {
        const response = await agent(server)
            .get('/users');
        assert.match(response.headers["content-type"], /json/);
        assert.equal(response.status, 200);
        assert.deepEqual(response.body, [{ age: 3 }]);
    });

    it("one user", async () => {
        const res = await agent(server)
            .get('/users/123');
        assert.deepEqual(res.body, { id: 123, age: 1 });
    });

    it("q user", async () => {
        const res = await agent(server)
            .get('/users/s')
            .query({ query: "abc" });
        assert.deepEqual(res.body, [{ q: "abc" }]);
    });
});