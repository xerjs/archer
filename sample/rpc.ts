import { AvalonContainer, Provider } from "@xerjs/avalon";
import { rpc, rpcFun } from "../src";

interface RcpDef {
    say(): Promise<void>;
    now(): Promise<number>;
    add(a: number, b: number): Promise<number>;
    info(): Promise<{ id: string; version: string }>;
}

@Provider()
@rpc()
class RpcSvc implements RcpDef {
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

async function main() {
    const ins = AvalonContainer.root.resolve(RpcSvc);
}

process.nextTick(main);
