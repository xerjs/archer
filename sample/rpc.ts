import { AvalonContainer, Provider } from "@xerjs/avalon";
import { rpc, rpcFun } from "../src";
import * as http from "http";

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

const port = 4090;
async function main() {
    const ins = AvalonContainer.root.resolve(RpcSvc);

    const handler = (req: http.IncomingMessage, res: http.ServerResponse) => {
        // 处理请求
        res.statusCode = 200;
        setTimeout(() => {
            res.setHeader("Content-Type", "text/plain");
            res.end("Hello World\n");
        }, 1000);
    };

    // 创建 HTTP 服务器并监听端口
    const server = http.createServer(handler);

    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    });
}

process.nextTick(main);
