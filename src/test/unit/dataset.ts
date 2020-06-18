import { assert } from 'chai'

import { datasetModule } from '../../package/modules/dataset'
import { init } from '../../package/init'
import { h } from '../../package/h'

var patch = init([
  datasetModule
])

describe('dataset', function () {
  before(function () {
    if (!Object.hasOwnProperty.call(HTMLElement.prototype, 'dataset')) {
      this.skip()
    }
  })

  var elm: any, vnode0: any
  beforeEach(function () {
    elm = document.createElement('div')
    vnode0 = elm
  })
  it('is set on initial element creation', function () {
    elm = patch(vnode0, h('div', { dataset: { foo: 'foo' } })).elm
    assert.strictEqual(elm.dataset.foo, 'foo')
  })
  it('updates dataset', function () {
    var vnode1 = h('i', { dataset: { foo: 'foo', bar: 'bar' } })
    var vnode2 = h('i', { dataset: { baz: 'baz' } })
    elm = patch(vnode0, vnode1).elm
    assert.strictEqual(elm.dataset.foo, 'foo')
    assert.strictEqual(elm.dataset.bar, 'bar')
    elm = patch(vnode1, vnode2).elm
    assert.strictEqual(elm.dataset.baz, 'baz')
    assert.strictEqual(elm.dataset.foo, undefined)
  })
  it('can be memoized', function () {
    var cachedDataset = { foo: 'foo', bar: 'bar' }
    var vnode1 = h('i', { dataset: cachedDataset })
    var vnode2 = h('i', { dataset: cachedDataset })
    elm = patch(vnode0, vnode1).elm
    assert.strictEqual(elm.dataset.foo, 'foo')
    assert.strictEqual(elm.dataset.bar, 'bar')
    elm = patch(vnode1, vnode2).elm
    assert.strictEqual(elm.dataset.foo, 'foo')
    assert.strictEqual(elm.dataset.bar, 'bar')
  })
  it('handles string conversions', function () {
    var vnode1 = h('i', { dataset: { empty: '', dash: '-', dashed: 'foo-bar', camel: 'fooBar', integer: 0 as any, float: 0.1 as any } })
    elm = patch(vnode0, vnode1).elm

    assert.strictEqual(elm.dataset.empty, '')
    assert.strictEqual(elm.dataset.dash, '-')
    assert.strictEqual(elm.dataset.dashed, 'foo-bar')
    assert.strictEqual(elm.dataset.camel, 'fooBar')
    assert.strictEqual(elm.dataset.integer, '0')
    assert.strictEqual(elm.dataset.float, '0.1')
  })
})
