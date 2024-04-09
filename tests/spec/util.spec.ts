import { assert } from 'chai'
import * as _ from '../../src/utils'

describe('util test', () => {
    describe('util obj test', () => {
        it('obj get', () => {
            const res = {
                a: 1,
                b: {
                    c: 2,
                },
                rr: [4, 5],
                rrr: [{ a: 1 }, { a: 2 }],
            }
            assert.equal(_.get(res, 'a'), 1)
            assert.equal(_.get(res, 'b.c'), 2)
            assert.equal(_.get(res, 'rr.1'), 5)
            assert.equal(_.get(res, 'rrr.1.a'), 2)
        })
    })
})
