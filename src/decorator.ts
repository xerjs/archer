import { action, MetaRule, Provider, actionArr } from "@xerjs/avalon";

export const apiRule = new MetaRule("avalon:svc", "api");

export function svc(perfix: string): ClassDecorator {
    return (target) => {
        Provider()(target);
        Reflect.defineMetadata(apiRule.perfix, { perfix }, target);
    };
}

export interface ActOpt {
    method: string;
    path: string;
}

export namespace svc {

    export const rule = apiRule;

    function httpAct(opt: ActOpt): MethodDecorator {
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

    export function put(path: string): MethodDecorator {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return httpAct({ method: "PUT", path })(target, propertyKey, descriptor);
        };
    };

    export function del(path: string): MethodDecorator {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return httpAct({ method: "DEL", path })(target, propertyKey, descriptor);
        };
    };

    export function patch(path: string): MethodDecorator {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return httpAct({ method: "PATCH", path })(target, propertyKey, descriptor);
        };
    };
}

export interface ParOpt {
    index: number;
    from: "body" | "query" | "param";
    convert?: Convert;
    key?: string;
}

type Convert = (v: unknown) => any;

const reqRule = new MetaRule("avalon:act", "req");

export namespace req {

    export const rule = reqRule;

    function reqAct(opt: ParOpt): MethodDecorator {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return actionArr(opt, reqRule)(target, propertyKey, descriptor);
        };
    }

    const noop = () => { };

    export function query(key?: string, fn?: Convert): ParameterDecorator {
        return (target: Object, propertyKey: string | symbol, index: number) => {
            return reqAct({ index, from: "query", key, convert: fn })(target, propertyKey, { value: noop });
        };
    }

    export function body(key?: string, fn?: Convert): ParameterDecorator {
        return (target: Object, propertyKey: string | symbol, index: number) => {
            return reqAct({ index, from: "body", key, convert: fn })(target, propertyKey, { value: noop });
        };
    }

    export function param(key: string, fn?: Convert): ParameterDecorator {
        return (target: Object, propertyKey: string | symbol, index: number) => {
            return reqAct({ index, from: "param", key, convert: fn })(target, propertyKey, { value: noop });
        };
    }
};

const resRule = new MetaRule("archer:method", "res");

export interface ResOpt {
    act: "redirect";
    code: number;
}

export namespace res {
    export const rule = resRule;
    export function redirect(code: number = 302): MethodDecorator {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return actionArr({ code, act: "redirect" }, rule)(target, propertyKey, descriptor);
        };
    }
}