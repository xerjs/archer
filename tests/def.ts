import { sleep } from '@xerjs/avalon'

class Person {
    id!: number
    age!: number
    q?: string
}

export class Serve {
    pp: string
    constructor() {
        this.pp = 'xxx'
    }

    async listUsers(): Promise<Person[]> {
        await sleep(8)
        const p = new Person()
        p.age = this.pp.length
        return [p]
    }

    async queryUsers(query: string) {
        await sleep(8)
        const p = new Person()
        p.q = query
        return [p]
    }

    async oneUser(id: number): Promise<Person> {
        await sleep(8)
        const p = new Person()
        p.id = id
        p.age = 1
        return p
    }

    async addUsers(per: Partial<Person>): Promise<Person> {
        await sleep(8)
        const p = new Person()
        Object.assign(p, per)
        p.q = p.age.toString()
        return p
    }

    async putUser(id: number): Promise<Person> {
        await sleep(8)
        const p = new Person()
        p.id = id
        p.age = id * 2
        return p
    }

    async patchUser(id: number): Promise<Person> {
        await sleep(8)
        const p = new Person()
        p.id = id
        p.age = id * 3
        return p
    }

    async delUser(id: number): Promise<Person> {
        await sleep(8)
        const p = new Person()
        p.id = id
        p.age = -id
        return p
    }

    async del302(id: number): Promise<string> {
        await sleep(8 + id)
        return '/404'
    }
}
