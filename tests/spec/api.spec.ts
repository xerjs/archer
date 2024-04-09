import { AvalonContainer, Provider } from '@xerjs/avalon'
import {
    Shield,
    apiPost,
    z,
    apiGet,
    fromParam,
    fromQuery,
    fromHeader,
    fromBody,
    apiText,
} from '../../src'
import { assert } from 'chai'
import { createAgent } from '../helper/agent'
import { info, log } from 'console'

@Provider()
class BisHandler {
    @apiPost('/add')
    async add(a: number, b: number): Promise<number> {
        return a + b
    }

    @apiGet('/hello/:name')
    async hello(@fromParam('name') name: string) {
        return 'hello ' + name
    }

    @apiGet('/hi')
    async hi(@fromQuery('name') name: string = '', @fromQuery('age') age: string = '') {
        return 'hi' + name + age
    }

    async local(name: string) {
        return 'local ' + name
    }

    @apiGet('/add/:a/:b')
    async paramNumber(@fromParam.int('a') a: number, @fromParam.int('b') b: number) {
        return a * b
    }

    @apiGet('/echo/header')
    async echoHeader(@fromHeader() header: any) {
        return header
    }

    @apiPost('/echo/body')
    async echoBody(@fromBody() body: any) {
        return body
    }
}

@Provider()
@apiText()
class TextWeb {
    @apiGet('/ping')
    ping() {
        return 'pong'
    }
}

describe('Shield api', () => {
    const shield = AvalonContainer.root.resolve(Shield)
    const apiSet = {
        '': TextWeb,
        '/api/v1': BisHandler,
    }
    const call = shield.install(apiSet)

    const agent = createAgent(call)

    it('Shield info', () => {
        const infos = shield.info(BisHandler, '/api/v1')

        const add = infos.find((e) => e.name === 'add')
        assert.include(add, {
            name: 'add',
            method: 'post',
            path: '/api/v1/add',
        })

        const hello = infos.find((e) => e.name === 'hello')
        assert.include(hello, {
            name: 'hello',
            method: 'get',
            path: '/api/v1/hello/:name',
        })

        const hi = infos.find((e) => e.name === 'hi')
        assert.include(hi, {
            name: 'hi',
            method: 'get',
            path: '/api/v1/hi',
        })

        assert.isTrue(infos[0].instance instanceof BisHandler)
    })

    it('get 404', async () => {
        let res = await agent.get('/api/v1/' + Math.random())
        assert.equal(res.status, 404)
        assert.deepEqual(res.body, {})
    })

    it('get sample', async () => {
        let res = await agent.get('/api/v1/hi')
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, { code: 200, data: 'hi' })
    })

    it('get params', async () => {
        const res = await agent.get('/api/v1/hello/xerjs')
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, { code: 200, data: 'hello xerjs' })
    })

    it('get query', async () => {
        let res = await agent.get('/api/v1/hi?name=xerjs')
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, { code: 200, data: 'hixerjs' })

        res = await agent.get('/api/v1/hi?name=xerjs&age=18')
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, { code: 200, data: 'hixerjs18' })
    })

    it('get params int', async () => {
        let res = await agent.get('/api/v1/add/2/3')
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, { code: 200, data: 6 })

        res = await agent.get('/api/v1/add/3/3')
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, { code: 200, data: 9 })
    })

    it('get params int;error', async () => {
        let res = await agent.get('/api/v1/add/x/3')
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, {
            code: 40000,
            message: 'param.a: Expected number, received string',
        })
    })

    it('get header info;ok', async () => {
        let res = await agent.get('/api/v1/echo/header')
        assert.equal(res.status, 200)
        assert.equal(res.body.code, 200)
        assert.include(res.body.data, { 'accept-encoding': 'gzip, deflate', connection: 'close' })
    })

    it('echo post body;ok', async () => {
        const data = { a: 1, b: 2 }
        let res = await agent.post('/api/v1/echo/body').send(data)
        assert.equal(res.status, 200)
        assert.equal(res.body.code, 200)
        assert.deepEqual(res.body.data, data)
    })

    it('render text', async () => {
        const res = await agent.get('/ping')
        assert.equal(res.status, 200)
        assert.equal(res.text, 'pong')
    })
})
