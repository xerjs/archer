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
            .get('/users')
            .set('Accept', 'application/json');
        assert.match(response.headers["content-type"], /json/);
        assert.equal(response.status, 200);
        assert.deepEqual(response.body, [{ age: 3 }]);
    });

    it("one user", async () => {
        const res = await agent(server)
            .get('/users/123')
            .set('Accept', 'application/json');
        assert.deepEqual(res.body, { id: 123, age: 1 });
    });
});