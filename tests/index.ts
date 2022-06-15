import { Archer } from "../src";
import { Serve } from "./def";
import { testData } from "./data";
import supertest from "supertest";
import { createServer, Server } from "http";


describe("@xerjs/archer tests", () => {
    let server: Server;
    before(() => {
        const archer = new Archer([Serve]);
        server = createServer(archer.app.callback());
        testData.archer = archer;
        testData.server = server;
        testData.agent = supertest(server);
    });

    after(() => {
        server.close();
    });

    require("./api-get.spec");
    require("./api-post.spec");
    require("./api-ppd.spec");
});