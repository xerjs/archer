import { AvalonContainer, Provider } from "@xerjs/avalon";
import { Blade, rpc, rpcFun } from "../../src";
import { assert } from "chai";
import { createAgent } from "../helper/agent";

interface BisHandler {
    say(): Promise<void>;
    now(): Promise<number>;
    add(a: number, b: number): Promise<number>;
    info(): Promise<{ id: string; version: string }>;
}

@Provider()
@rpc({ path: "Bis" })
class BisHandlerImp implements BisHandler {
    @rpcFun()
    async add(a: number, b: number): Promise<number> {
        return a + b;
    }
    @rpcFun()
    async say(): Promise<void> {
        console.log("say log");
    }

    @rpcFun()
    async now(): Promise<number> {
        return Date.now();
    }

    @rpcFun()
    async info(): Promise<{ id: string; version: string }> {
        return { id: __dirname, version: "1.0" };
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

        assert.deepEqual(
            info.map((e) => e.path),
            ["add", "say", "now", "info"].map((e) => `/Bis/${e}`),
        );

        assert.isTrue(info[0].instance instanceof BisHandlerImp);
    });

    it("send req", async () => {
        const resp = await agent.post("/Bis/add").send({ args: [1, 2] });
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.body, { code: 200, data: 3 });
    });
});