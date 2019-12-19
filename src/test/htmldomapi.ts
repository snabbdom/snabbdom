import assert from 'assert'

import { init } from '../snabbdom'
import h from '../h'
import attributesModule from '../modules/attributes'
var patch = init([
  attributesModule
]);

describe('svg', function () {
  var elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement('svg');
    vnode0 = elm;
  });

  it('removes child svg elements', function () {
    var a = h('svg', {}, [
      h('g'),
      h('g')
    ]);
    var b = h('svg', {}, [
      h('g')
    ]);
    var result = patch(patch(vnode0, a), b).elm as SVGElement;
    assert.equal(result.childNodes.length, 1);
  });

  it('adds correctly xlink namespaced attribute', function () {
    var xlinkNS = 'http://www.w3.org/1999/xlink';
    var testUrl = '/test';
    var a = h('svg', {}, [
      h('use', {
        attrs: { 'xlink:href': testUrl }
      }, [])
    ]);

    var result = patch(vnode0, a).elm as SVGElement;
    assert.equal(result.childNodes.length, 1);
    const child = result.childNodes[0] as SVGUseElement;
    assert.equal(child.getAttribute('xlink:href'), testUrl);
    assert.equal(child.getAttributeNS(xlinkNS, 'href'), testUrl);
  });

  it('adds correctly xml namespaced attribute', function () {
    var xmlNS = 'http://www.w3.org/XML/1998/namespace';
    var testAttrValue = 'und';
    var a = h('svg', { attrs: { 'xml:lang': testAttrValue } }, []);

    var result = patch(vnode0, a).elm as SVGElement;
    assert.equal(result.getAttributeNS(xmlNS, 'lang'), testAttrValue);
    assert.equal(result.getAttribute('xml:lang'), testAttrValue);
  });
})
