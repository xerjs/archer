import { Archer } from "../src";
import { Serve } from "./def";
import { globalData } from "./data";
import { createServer, Server } from "http";


describe("@xerjs/archer tests", () => {
    let server: Server;
    before(() => {
        const archer = new Archer([Serve]);
        server = createServer(archer.app.callback());
        globalData.archer = archer;
        globalData.server = server;
    });

    after(() => {
        server.close();
    });

    require("./api-get.spec");
});