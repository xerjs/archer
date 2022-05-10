import { action, MetaRule, Provider } from "@xerjs/avalon";

export const apiRule = new MetaRule("avalon:svc", "api");

export function apiSvc(perfix: string): ClassDecorator {
    return (target) => {
        Provider()(target);
        Reflect.defineMetadata(apiRule.perfix, { perfix }, target);
    };
}

export namespace apiSvc {
    export interface ActOpt {
        method: string;
        path: string;
    }

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