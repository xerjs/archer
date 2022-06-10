import { action, MetaRule, Provider, actionArr } from "@xerjs/avalon";

export const apiRule = new MetaRule("avalon:svc", "api");

export function apiSvc(perfix: string): ClassDecorator {
    return (target) => {
        Provider()(target);
        Reflect.defineMetadata(apiRule.perfix, { perfix }, target);
    };
}

export interface ActOpt {
    method: string;
    path: string;
}

export namespace apiSvc {

    export const rule = apiRule;

    function httpAct(opt: ActOpt) {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return action(opt, rule)(target, propertyKey, descriptor);
        };
    }

    export function get(path: string): MethodDecorator {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return httpAct({ method: "GET", path })(target, propertyKey, descriptor);
        };
    };

    export function post(path: string): MethodDecorator {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return httpAct({ method: "POST", path })(target, propertyKey, descriptor);
        };
    };
}

export interface ParOpt {
    index: number;
    from: "body" | "query" | "param";
    convert?: Convert;
    key?: string;
}

type Convert = <T>(v: unknown) => T;

export const reqRule = new MetaRule("avalon:svc", "req");

export namespace req {
    function reqAct(opt: ParOpt) {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return actionArr(opt, reqRule)(target, propertyKey, descriptor);
        };
    }

    export function query(key?: string, fn?: Convert): ParameterDecorator {
        return (target: Object, propertyKey: string | symbol, index: number) => {
            return reqAct({ index, from: "query", key, convert: fn });
        };
    }

    export function body(key?: string, fn?: Convert): ParameterDecorator {
        return (target: Object, propertyKey: string | symbol, index: number) => {
            return reqAct({ index, from: "body", key, convert: fn });
        };
    }

    export function param(key: string, fn?: Convert): ParameterDecorator {
        return (target: Object, propertyKey: string | symbol, index: number) => {
            return reqAct({ index, from: "param", key, convert: fn });
        };
    }
}