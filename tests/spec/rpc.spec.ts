import { AvalonContainer, Provider } from "@xerjs/avalon";
import { Blade, rpc, rpcFun } from "../../src";
import { assert } from "chai";
import { createAgent } from "../helper/agent";
import { z } from "zod";
import { BisError } from "../helper/err";

interface BisHandler {
    say(): Promise<void>;
    now(): Promise<number>;
    add(a: number, b: number): Promise<number>;
    info(): Promise<{ id: string; version: string }>;
}

@Provider()
@rpc({ path: "Bis" })
class BisHandlerImp implements BisHandler {
    @rpcFun({ types: z.tuple([z.number(), z.number()]) })
    async add(a: number, b: number): Promise<number> {
        return a + b;
    }
    @rpcFun()
    async say(): Promise<void> {
        throw new Error("say err");
    }

    @rpcFun()
    async now(): Promise<number> {
        return Date.now();
    }

    @rpcFun()
    async info(): Promise<{ id: string; version: string }> {
        throw new BisError(400, "info err");
    }
}

describe("rpc svc imp Blade", () => {
    const blade = AvalonContainer.root.resolve(Blade);
    const agent = createAgent(blade.install([BisHandlerImp]));

    it("Blade info", () => {
        const info = blade.info(BisHandlerImp);

        assert.deepEqual(
            info.map((e) => e.name),
            ["add", "say", "now", "info"],
        );

        const add = info.find((e) => e.name === "add")!;
        assert.deepEqual(add.pars, [Number, Number]);

        assert.deepEqual(
            info.map((e) => e.path),
            ["add", "say", "now", "info"].map((e) => `/Bis/${e}`),
        );

        assert.isTrue(info[0].instance instanceof BisHandlerImp);
    });

    it("send req;expect=404", async () => {
        let resp = await agent.post("/ais/add").send({ args: [] });
        assert.equal(resp.status, 404);
        assert.deepEqual(resp.text, "Not Found");

        resp = await agent.post("/Bis/abc").send({ args: [] });
        assert.equal(resp.status, 404);
        assert.deepEqual(resp.text, "Not Found");
    });

    it("send req;args=err;expect=err", async () => {
        let resp = await agent.post("/Bis/add").send({ args: null });
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.body, { code: 500, message: "Expected body.args is array" });

        resp = await agent.post("/Bis/add").send({ args: [1] });
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.body, { code: 500, message: "Expected 2 arguments of add, but got 1." });
    });

    it("send req;args=err type;expect=zodError", async () => {
        let resp = await agent.post("/Bis/add").send({ args: ["a", "b"] });
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.body, { code: 500, message: "Expected number, received string @args 0" });

        resp = await agent.post("/Bis/add").send({ args: [1, "b"] });
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.body, { code: 500, message: "Expected number, received string @args 1" });
    });

    it("send req;expect=200", async () => {
        let resp = await agent.post("/Bis/add").send({ args: [1, 2] });
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.body, { code: 200, data: 3 });
        const now = Date.now();
        resp = await agent.post("/Bis/now").send({ args: [] });
        assert.equal(resp.status, 200);
        assert.isTrue(resp.body.data >= now);
    });

    it("send req;expect=err", async () => {
        let resp = await agent.post("/Bis/say").send({ args: [] });
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.body, { code: 500, message: "say err" });

        resp = await agent.post("/Bis/info").send({ args: [] });
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.body, { code: 400, message: "info err" });
    });

    it("agent with prefix", async () => {
        const ag = createAgent(blade.install([BisHandlerImp], "/ii"));
        const resp = await ag.post("/ii/Bis/add").send({ args: [1, 2] });
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.body, { code: 200, data: 3 });
    });
});
