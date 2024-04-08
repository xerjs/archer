import { RequestListener } from 'http'
import supertest from 'supertest'

export function createAgent(app: RequestListener) {
    return supertest(app)
}
