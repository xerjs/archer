import { assert } from 'chai'
import * as _ from '../../src/utils'

describe('util test', () => {
    describe('util obj test', () => {
        it('obj get', () => {
            const res = {
                a: 1,
            }

            assert.equal(_.get(res, 'a'), 1)
        })
    })
})
