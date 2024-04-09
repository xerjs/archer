import { AvalonContainer, ClassType, Provider } from '@xerjs/avalon'
import { KoaAdapter } from './ada/koa-app'
import { apiMeta, resolveParam } from './decorator'
import { ApiInfo, ApiOpt, RenderOpt } from './types'
import { createServer, RequestListener, Server } from 'http'

type ApiGroup = Record<string, ClassType>

@Provider()
export class Shield {
    constructor(protected ada: KoaAdapter) {}

    info(cls: ClassType, prefix: string): ApiInfo[] {
        const instance = AvalonContainer.root.resolve(cls)
        const clsMeta = apiMeta.classValue(cls) as RenderOpt
        const infos: ApiInfo[] = apiMeta.propertyKeys(cls).map((mk) => {
            const res = apiMeta.returnType(cls, mk)
            const pars = apiMeta.paramTypes(cls, mk)
            const mMate = apiMeta.propertyValue(cls, mk) as ApiOpt
            return {
                name: mk,
                render: clsMeta,
                res,
                pars,
                inject: resolveParam(cls, mk), // 注入参数
                path: prefix + mMate.path,
                method: mMate.method,
                instance,
            } as ApiInfo
        })

        return infos
    }

    install(api: ApiGroup): RequestListener {
        const app = this.ada.createApp()
        const router = this.ada.createEmptyRouter()
        for (const [name, cls] of Object.entries(api)) {
            const infos = this.info(cls, name)
            this.ada.registerRouter(router, infos)
        }
        app.use(router.routes())
        return app.callback()
    }

    createServer(api: ApiGroup): Server {
        return createServer(this.install(api))
    }
}
