import { assert } from 'chai'
import shuffle from 'lodash.shuffle'

import { init } from '../../package/init'
import { classModule } from '../../package/modules/class'
import { propsModule } from '../../package/modules/props'
import { styleModule } from '../../package/modules/style'
import { eventListenersModule } from '../../package/modules/eventlisteners'
import { h } from '../../package/h'
import { toVNode } from '../../package/tovnode'
import { vnode, VNode } from '../../package/vnode'
import { htmlDomApi } from '../../package/htmldomapi'
import { CreateHook, InsertHook, PrePatchHook, RemoveHook, InitHook, DestroyHook, UpdateHook } from '../../package/hooks'

const hasSvgClassList = 'classList' in SVGElement.prototype

var patch = init([
  classModule,
  propsModule,
  eventListenersModule
])

function prop<T> (name: string) {
  return function (obj: {[index: string]: T}) {
    return obj[name]
  }
}

function map (fn: any, list: any[]) {
  var ret = []
  for (var i = 0; i < list.length; ++i) {
    ret[i] = fn(list[i])
  }
  return ret
}

var inner = prop('innerHTML')

describe('snabbdom', function () {
  var elm: any, vnode0: any
  beforeEach(function () {
    elm = document.createElement('div')
    vnode0 = elm
  })
  describe('hyperscript', function () {
    it('can create vnode with proper tag', function () {
      assert.strictEqual(h('div').sel, 'div')
      assert.strictEqual(h('a').sel, 'a')
    })
    it('can create vnode with children', function () {
      var vnode = h('div', [h('span#hello'), h('b.world')])
      assert.strictEqual(vnode.sel, 'div')
      const children = vnode.children as [VNode, VNode]
      assert.strictEqual(children[0].sel, 'span#hello')
      assert.strictEqual(children[1].sel, 'b.world')
    })
    it('can create vnode with one child vnode', function () {
      var vnode = h('div', h('span#hello'))
      assert.strictEqual(vnode.sel, 'div')
      const children = vnode.children as [VNode]
      assert.strictEqual(children[0].sel, 'span#hello')
    })
    it('can create vnode with props and one child vnode', function () {
      var vnode = h('div', {}, h('span#hello'))
      assert.strictEqual(vnode.sel, 'div')
      const children = vnode.children as [VNode]
      assert.strictEqual(children[0].sel, 'span#hello')
    })
    it('can create vnode with text content', function () {
      var vnode = h('a', ['I am a string'])
      const children = vnode.children as [VNode]
      assert.strictEqual(children[0].text, 'I am a string')
    })
    it('can create vnode with text content in string', function () {
      var vnode = h('a', 'I am a string')
      assert.strictEqual(vnode.text, 'I am a string')
    })
    it('can create vnode with props and text content in string', function () {
      var vnode = h('a', {}, 'I am a string')
      assert.strictEqual(vnode.text, 'I am a string')
    })
    it('can create vnode with null props', function () {
      var vnode = h('a', null)
      assert.deepEqual(vnode.data, {})
      vnode = h('a', null, ['I am a string'])
      const children = vnode.children as [VNode]
      assert.strictEqual(children[0].text, 'I am a string')
    })
    it('can create vnode for comment', function () {
      var vnode = h('!', 'test')
      assert.strictEqual(vnode.sel, '!')
      assert.strictEqual(vnode.text, 'test')
    })
  })
  describe('created element', function () {
    it('has tag', function () {
      elm = patch(vnode0, h('div')).elm
      assert.strictEqual(elm.tagName, 'DIV')
    })
    it('has different tag and id', function () {
      var elm = document.createElement('div')
      vnode0.appendChild(elm)
      var vnode1 = h('span#id')
      const patched = patch(elm, vnode1).elm as HTMLSpanElement
      assert.strictEqual(patched.tagName, 'SPAN')
      assert.strictEqual(patched.id, 'id')
    })
    it('has id', function () {
      elm = patch(vnode0, h('div', [h('div#unique')])).elm
      assert.strictEqual(elm.firstChild.id, 'unique')
    })
    it('has correct namespace', function () {
      var SVGNamespace = 'http://www.w3.org/2000/svg'
      var XHTMLNamespace = 'http://www.w3.org/1999/xhtml'

      elm = patch(vnode0, h('div', [h('div', { ns: SVGNamespace })])).elm
      assert.strictEqual(elm.firstChild.namespaceURI, SVGNamespace)

      // verify that svg tag automatically gets svg namespace
      elm = patch(vnode0, h('svg', [
        h('foreignObject', [
          h('div', ['I am HTML embedded in SVG'])
        ])
      ])).elm
      assert.strictEqual(elm.namespaceURI, SVGNamespace)
      assert.strictEqual(elm.firstChild.namespaceURI, SVGNamespace)
      assert.strictEqual(elm.firstChild.firstChild.namespaceURI, XHTMLNamespace)

      // verify that svg tag with extra selectors gets svg namespace
      elm = patch(vnode0, h('svg#some-id')).elm
      assert.strictEqual(elm.namespaceURI, SVGNamespace)

      // verify that non-svg tag beginning with 'svg' does NOT get namespace
      elm = patch(vnode0, h('svg-custom-el')).elm
      assert.notStrictEqual(elm.namespaceURI, SVGNamespace)
    })
    it('receives classes in selector', function () {
      elm = patch(vnode0, h('div', [h('i.am.a.class')])).elm
      assert(elm.firstChild.classList.contains('am'))
      assert(elm.firstChild.classList.contains('a'))
      assert(elm.firstChild.classList.contains('class'))
    })
    it('receives classes in class property', function () {
      elm = patch(vnode0, h('i', { class: { am: true, a: true, class: true, not: false } })).elm
      assert(elm.classList.contains('am'))
      assert(elm.classList.contains('a'))
      assert(elm.classList.contains('class'))
      assert(!elm.classList.contains('not'))
    })
    it('receives classes in selector when namespaced', function () {
      if (!hasSvgClassList) {
        this.skip()
      } else {
        elm = patch(vnode0,
          h('svg', [
            h('g.am.a.class.too')
          ])
        ).elm
        assert(elm.firstChild.classList.contains('am'))
        assert(elm.firstChild.classList.contains('a'))
        assert(elm.firstChild.classList.contains('class'))
      }
    })
    it('receives classes in class property when namespaced', function () {
      if (!hasSvgClassList) {
        this.skip()
      } else {
        elm = patch(vnode0,
          h('svg', [
            h('g', { class: { am: true, a: true, class: true, not: false, too: true } })
          ])
        ).elm
        assert(elm.firstChild.classList.contains('am'))
        assert(elm.firstChild.classList.contains('a'))
        assert(elm.firstChild.classList.contains('class'))
        assert(!elm.firstChild.classList.contains('not'))
      }
    })
    it('handles classes from both selector and property', function () {
      elm = patch(vnode0, h('div', [h('i.has', { class: { classes: true } })])).elm
      assert(elm.firstChild.classList.contains('has'))
      assert(elm.firstChild.classList.contains('classes'))
    })
    it('can create elements with text content', function () {
      elm = patch(vnode0, h('div', ['I am a string'])).elm
      assert.strictEqual(elm.innerHTML, 'I am a string')
    })
    it('can create elements with span and text content', function () {
      elm = patch(vnode0, h('a', [h('span'), 'I am a string'])).elm
      assert.strictEqual(elm.childNodes[0].tagName, 'SPAN')
      assert.strictEqual(elm.childNodes[1].textContent, 'I am a string')
    })
    it('can create elements with props', function () {
      elm = patch(vnode0, h('a', { props: { src: 'http://localhost/' } })).elm
      assert.strictEqual(elm.src, 'http://localhost/')
    })
    it('can create an element created inside an iframe', function (done) {
      // Only run if srcdoc is supported.
      var frame = document.createElement('iframe')
      if (typeof frame.srcdoc !== 'undefined') {
        frame.srcdoc = '<div>Thing 1</div>'
        frame.onload = function () {
          const div0 = frame.contentDocument!.body.querySelector('div') as HTMLDivElement
          patch(div0, h('div', 'Thing 2'))
          const div1 = frame.contentDocument!.body.querySelector('div') as HTMLDivElement
          assert.strictEqual(div1.textContent, 'Thing 2')
          frame.remove()
          done()
        }
        document.body.appendChild(frame)
      } else {
        done()
      }
    })
    it('is a patch of the root element', function () {
      var elmWithIdAndClass = document.createElement('div')
      elmWithIdAndClass.id = 'id'
      elmWithIdAndClass.className = 'class'
      var vnode1 = h('div#id.class', [h('span', 'Hi')])
      elm = patch(elmWithIdAndClass, vnode1).elm
      assert.strictEqual(elm, elmWithIdAndClass)
      assert.strictEqual(elm.tagName, 'DIV')
      assert.strictEqual(elm.id, 'id')
      assert.strictEqual(elm.className, 'class')
    })
    it('can create comments', function () {
      elm = patch(vnode0, h('!', 'test')).elm
      assert.strictEqual(elm.nodeType, document.COMMENT_NODE)
      assert.strictEqual(elm.textContent, 'test')
    })
  })
  describe('patching an element', function () {
    it('changes the elements classes', function () {
      var vnode1 = h('i', { class: { i: true, am: true, horse: true } })
      var vnode2 = h('i', { class: { i: true, am: true, horse: false } })
      patch(vnode0, vnode1)
      elm = patch(vnode1, vnode2).elm
      assert(elm.classList.contains('i'))
      assert(elm.classList.contains('am'))
      assert(!elm.classList.contains('horse'))
    })
    it('changes classes in selector', function () {
      var vnode1 = h('i', { class: { i: true, am: true, horse: true } })
      var vnode2 = h('i', { class: { i: true, am: true, horse: false } })
      patch(vnode0, vnode1)
      elm = patch(vnode1, vnode2).elm
      assert(elm.classList.contains('i'))
      assert(elm.classList.contains('am'))
      assert(!elm.classList.contains('horse'))
    })
    it('preserves memoized classes', function () {
      var cachedClass = { i: true, am: true, horse: false }
      var vnode1 = h('i', { class: cachedClass })
      var vnode2 = h('i', { class: cachedClass })
      elm = patch(vnode0, vnode1).elm
      assert(elm.classList.contains('i'))
      assert(elm.classList.contains('am'))
      assert(!elm.classList.contains('horse'))
      elm = patch(vnode1, vnode2).elm
      assert(elm.classList.contains('i'))
      assert(elm.classList.contains('am'))
      assert(!elm.classList.contains('horse'))
    })
    it('removes missing classes', function () {
      var vnode1 = h('i', { class: { i: true, am: true, horse: true } })
      var vnode2 = h('i', { class: { i: true, am: true } })
      patch(vnode0, vnode1)
      elm = patch(vnode1, vnode2).elm
      assert(elm.classList.contains('i'))
      assert(elm.classList.contains('am'))
      assert(!elm.classList.contains('horse'))
    })
    it('changes an elements props', function () {
      var vnode1 = h('a', { props: { src: 'http://other/' } })
      var vnode2 = h('a', { props: { src: 'http://localhost/' } })
      patch(vnode0, vnode1)
      elm = patch(vnode1, vnode2).elm
      assert.strictEqual(elm.src, 'http://localhost/')
    })
    it('can set prop value to `0`', function () {
      var patch = init([propsModule, styleModule])
      var view = (scrollTop: number) => h('div',
        {
          style: { height: '100px', overflowY: 'scroll' },
          props: { scrollTop },
        },
        [h('div', { style: { height: '200px' } })]
      )
      var vnode1 = view(0)
      var mountPoint = document.body.appendChild(document.createElement('div'))
      var { elm } = patch(mountPoint, vnode1)
      if (!(elm instanceof HTMLDivElement)) throw new Error()
      assert.strictEqual(elm.scrollTop, 0)
      var vnode2 = view(20)
      patch(vnode1, vnode2)
      assert.isAtLeast(elm.scrollTop, 18)
      assert.isAtMost(elm.scrollTop, 20)
      var vnode3 = view(0)
      patch(vnode2, vnode3)
      assert.strictEqual(elm.scrollTop, 0)
      document.body.removeChild(mountPoint)
    })
    it('can set prop value to empty string', function () {
      var vnode1 = h('p', { props: { textContent: 'foo' } })
      var { elm } = patch(vnode0, vnode1)
      if (!(elm instanceof HTMLParagraphElement)) throw new Error()
      assert.strictEqual(elm.textContent, 'foo')
      var vnode2 = h('p', { props: { textContent: '' } })
      patch(vnode1, vnode2)
      assert.strictEqual(elm.textContent, '')
    })
    it('preserves memoized props', function () {
      var cachedProps = { src: 'http://other/' }
      var vnode1 = h('a', { props: cachedProps })
      var vnode2 = h('a', { props: cachedProps })
      elm = patch(vnode0, vnode1).elm
      assert.strictEqual(elm.src, 'http://other/')
      elm = patch(vnode1, vnode2).elm
      assert.strictEqual(elm.src, 'http://other/')
    })
    it('removes custom props', function () {
      var vnode1 = h('a', { props: { src: 'http://other/' } })
      var vnode2 = h('a')
      patch(vnode0, vnode1)
      patch(vnode1, vnode2)
      assert.strictEqual(elm.src, undefined)
    })
    it('cannot remove native props', function () {
      var vnode1 = h('a', { props: { href: 'http://example.com/' } })
      var vnode2 = h('a')
      var { elm: elm1 } = patch(vnode0, vnode1)
      if (!(elm1 instanceof HTMLAnchorElement)) throw new Error()
      assert.strictEqual(elm1.href, 'http://example.com/')
      var { elm: elm2 } = patch(vnode1, vnode2)
      if (!(elm2 instanceof HTMLAnchorElement)) throw new Error()
      assert.strictEqual(elm2.href, 'http://example.com/')
    })
    it('does not delete custom props', function () {
      var vnode1 = h('p', { props: { a: 'foo' } })
      var vnode2 = h('p')
      const { elm } = patch(vnode0, vnode1)
      if (!(elm instanceof HTMLParagraphElement)) throw new Error()
      assert.strictEqual((elm as any).a, 'foo')
      patch(vnode1, vnode2)
      assert.strictEqual((elm as any).a, 'foo')
    })
    describe('using toVNode()', function () {
      it('can remove previous children of the root element', function () {
        var h2 = document.createElement('h2')
        h2.textContent = 'Hello'
        var prevElm = document.createElement('div')
        prevElm.id = 'id'
        prevElm.className = 'class'
        prevElm.appendChild(h2)
        var nextVNode = h('div#id.class', [h('span', 'Hi')])
        elm = patch(toVNode(prevElm), nextVNode).elm
        assert.strictEqual(elm, prevElm)
        assert.strictEqual(elm.tagName, 'DIV')
        assert.strictEqual(elm.id, 'id')
        assert.strictEqual(elm.className, 'class')
        assert.strictEqual(elm.childNodes.length, 1)
        assert.strictEqual(elm.childNodes[0].tagName, 'SPAN')
        assert.strictEqual(elm.childNodes[0].textContent, 'Hi')
      })
      it('can support patching in a DocumentFragment', function () {
        var prevElm = document.createDocumentFragment()
        var nextVNode = vnode('', {}, [
          h('div#id.class', [h('span', 'Hi')])
        ], undefined, prevElm as any)
        elm = patch(toVNode(prevElm), nextVNode).elm
        assert.strictEqual(elm, prevElm)
        assert.strictEqual(elm.nodeType, 11)
        assert.strictEqual(elm.childNodes.length, 1)
        assert.strictEqual(elm.childNodes[0].tagName, 'DIV')
        assert.strictEqual(elm.childNodes[0].id, 'id')
        assert.strictEqual(elm.childNodes[0].className, 'class')
        assert.strictEqual(elm.childNodes[0].childNodes.length, 1)
        assert.strictEqual(elm.childNodes[0].childNodes[0].tagName, 'SPAN')
        assert.strictEqual(elm.childNodes[0].childNodes[0].textContent, 'Hi')
      })
      it('can remove some children of the root element', function () {
        var h2 = document.createElement('h2')
        h2.textContent = 'Hello'
        var prevElm = document.createElement('div')
        prevElm.id = 'id'
        prevElm.className = 'class'
        var text = document.createTextNode('Foobar')
        const reference = {};
        (text as any).testProperty = reference // ensures we dont recreate the Text Node
        prevElm.appendChild(text)
        prevElm.appendChild(h2)
        var nextVNode = h('div#id.class', ['Foobar'])
        elm = patch(toVNode(prevElm), nextVNode).elm
        assert.strictEqual(elm, prevElm)
        assert.strictEqual(elm.tagName, 'DIV')
        assert.strictEqual(elm.id, 'id')
        assert.strictEqual(elm.className, 'class')
        assert.strictEqual(elm.childNodes.length, 1)
        assert.strictEqual(elm.childNodes[0].nodeType, 3)
        assert.strictEqual(elm.childNodes[0].wholeText, 'Foobar')
        assert.strictEqual(elm.childNodes[0].testProperty, reference)
      })
      it('can remove text elements', function () {
        var h2 = document.createElement('h2')
        h2.textContent = 'Hello'
        var prevElm = document.createElement('div')
        prevElm.id = 'id'
        prevElm.className = 'class'
        var text = document.createTextNode('Foobar')
        prevElm.appendChild(text)
        prevElm.appendChild(h2)
        var nextVNode = h('div#id.class', [h('h2', 'Hello')])
        elm = patch(toVNode(prevElm), nextVNode).elm
        assert.strictEqual(elm, prevElm)
        assert.strictEqual(elm.tagName, 'DIV')
        assert.strictEqual(elm.id, 'id')
        assert.strictEqual(elm.className, 'class')
        assert.strictEqual(elm.childNodes.length, 1)
        assert.strictEqual(elm.childNodes[0].nodeType, 1)
        assert.strictEqual(elm.childNodes[0].textContent, 'Hello')
      })
      it('can work with domApi', function () {
        var domApi = {
          ...htmlDomApi,
          tagName: function (elm: Element) { return 'x-' + elm.tagName.toUpperCase() }
        }
        var h2 = document.createElement('h2')
        h2.id = 'hx'
        h2.setAttribute('data-env', 'xyz')
        var text = document.createTextNode('Foobar')
        var elm = document.createElement('div')
        elm.id = 'id'
        elm.className = 'class other'
        elm.setAttribute('data', 'value')
        elm.appendChild(h2)
        elm.appendChild(text)
        var vnode = toVNode(elm, domApi)
        assert.strictEqual(vnode.sel, 'x-div#id.class.other')
        assert.deepEqual(vnode.data, { attrs: { data: 'value' } })
        const children = vnode.children as [VNode, VNode]
        assert.strictEqual(children[0].sel, 'x-h2#hx')
        assert.deepEqual(children[0].data, { attrs: { 'data-env': 'xyz' } })
        assert.strictEqual(children[1].text, 'Foobar')
      })
    })
    describe('updating children with keys', function () {
      function spanNum (n?: null | string | number) {
        if (n == null) {
          return n
        } else if (typeof n === 'string') {
          return h('span', {}, n)
        } else {
          return h('span', { key: n }, n.toString())
        }
      }
      describe('addition of elements', function () {
        it('appends elements', function () {
          var vnode1 = h('span', [1].map(spanNum))
          var vnode2 = h('span', [1, 2, 3].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 1)
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.children.length, 3)
          assert.strictEqual(elm.children[1].innerHTML, '2')
          assert.strictEqual(elm.children[2].innerHTML, '3')
        })
        it('prepends elements', function () {
          var vnode1 = h('span', [4, 5].map(spanNum))
          var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 2)
          elm = patch(vnode1, vnode2).elm
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5'])
        })
        it('add elements in the middle', function () {
          var vnode1 = h('span', [1, 2, 4, 5].map(spanNum))
          var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 4)
          assert.strictEqual(elm.children.length, 4)
          elm = patch(vnode1, vnode2).elm
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5'])
        })
        it('add elements at begin and end', function () {
          var vnode1 = h('span', [2, 3, 4].map(spanNum))
          var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 3)
          elm = patch(vnode1, vnode2).elm
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5'])
        })
        it('adds children to parent with no children', function () {
          var vnode1 = h('span', { key: 'span' })
          var vnode2 = h('span', { key: 'span' }, [1, 2, 3].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 0)
          elm = patch(vnode1, vnode2).elm
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3'])
        })
        it('removes all children from parent', function () {
          var vnode1 = h('span', { key: 'span' }, [1, 2, 3].map(spanNum))
          var vnode2 = h('span', { key: 'span' })
          elm = patch(vnode0, vnode1).elm
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3'])
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.children.length, 0)
        })
        it('update one child with same key but different sel', function () {
          var vnode1 = h('span', { key: 'span' }, [1, 2, 3].map(spanNum))
          var vnode2 = h('span', { key: 'span' }, [spanNum(1), h('i', { key: 2 }, '2'), spanNum(3)])
          elm = patch(vnode0, vnode1).elm
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3'])
          elm = patch(vnode1, vnode2).elm
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3'])
          assert.strictEqual(elm.children.length, 3)
          assert.strictEqual(elm.children[1].tagName, 'I')
        })
      })
      describe('removal of elements', function () {
        it('removes elements from the beginning', function () {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum))
          var vnode2 = h('span', [3, 4, 5].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 5)
          elm = patch(vnode1, vnode2).elm
          assert.deepEqual(map(inner, elm.children), ['3', '4', '5'])
        })
        it('removes elements from the end', function () {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum))
          var vnode2 = h('span', [1, 2, 3].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 5)
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.children.length, 3)
          assert.strictEqual(elm.children[0].innerHTML, '1')
          assert.strictEqual(elm.children[1].innerHTML, '2')
          assert.strictEqual(elm.children[2].innerHTML, '3')
        })
        it('removes elements from the middle', function () {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum))
          var vnode2 = h('span', [1, 2, 4, 5].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 5)
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.children.length, 4)
          assert.deepEqual(elm.children[0].innerHTML, '1')
          assert.strictEqual(elm.children[0].innerHTML, '1')
          assert.strictEqual(elm.children[1].innerHTML, '2')
          assert.strictEqual(elm.children[2].innerHTML, '4')
          assert.strictEqual(elm.children[3].innerHTML, '5')
        })
      })
      describe('element reordering', function () {
        it('moves element forward', function () {
          var vnode1 = h('span', [1, 2, 3, 4].map(spanNum))
          var vnode2 = h('span', [2, 3, 1, 4].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 4)
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.children.length, 4)
          assert.strictEqual(elm.children[0].innerHTML, '2')
          assert.strictEqual(elm.children[1].innerHTML, '3')
          assert.strictEqual(elm.children[2].innerHTML, '1')
          assert.strictEqual(elm.children[3].innerHTML, '4')
        })
        it('moves element to end', function () {
          var vnode1 = h('span', [1, 2, 3].map(spanNum))
          var vnode2 = h('span', [2, 3, 1].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 3)
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.children.length, 3)
          assert.strictEqual(elm.children[0].innerHTML, '2')
          assert.strictEqual(elm.children[1].innerHTML, '3')
          assert.strictEqual(elm.children[2].innerHTML, '1')
        })
        it('moves element backwards', function () {
          var vnode1 = h('span', [1, 2, 3, 4].map(spanNum))
          var vnode2 = h('span', [1, 4, 2, 3].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 4)
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.children.length, 4)
          assert.strictEqual(elm.children[0].innerHTML, '1')
          assert.strictEqual(elm.children[1].innerHTML, '4')
          assert.strictEqual(elm.children[2].innerHTML, '2')
          assert.strictEqual(elm.children[3].innerHTML, '3')
        })
        it('swaps first and last', function () {
          var vnode1 = h('span', [1, 2, 3, 4].map(spanNum))
          var vnode2 = h('span', [4, 2, 3, 1].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 4)
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.children.length, 4)
          assert.strictEqual(elm.children[0].innerHTML, '4')
          assert.strictEqual(elm.children[1].innerHTML, '2')
          assert.strictEqual(elm.children[2].innerHTML, '3')
          assert.strictEqual(elm.children[3].innerHTML, '1')
        })
      })
      describe('combinations of additions, removals and reorderings', function () {
        it('move to left and replace', function () {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum))
          var vnode2 = h('span', [4, 1, 2, 3, 6].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 5)
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.children.length, 5)
          assert.strictEqual(elm.children[0].innerHTML, '4')
          assert.strictEqual(elm.children[1].innerHTML, '1')
          assert.strictEqual(elm.children[2].innerHTML, '2')
          assert.strictEqual(elm.children[3].innerHTML, '3')
          assert.strictEqual(elm.children[4].innerHTML, '6')
        })
        it('moves to left and leaves hole', function () {
          var vnode1 = h('span', [1, 4, 5].map(spanNum))
          var vnode2 = h('span', [4, 6].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 3)
          elm = patch(vnode1, vnode2).elm
          assert.deepEqual(map(inner, elm.children), ['4', '6'])
        })
        it('handles moved and set to undefined element ending at the end', function () {
          var vnode1 = h('span', [2, 4, 5].map(spanNum))
          var vnode2 = h('span', [4, 5, 3].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.children.length, 3)
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.children.length, 3)
          assert.strictEqual(elm.children[0].innerHTML, '4')
          assert.strictEqual(elm.children[1].innerHTML, '5')
          assert.strictEqual(elm.children[2].innerHTML, '3')
        })
        it('moves a key in non-keyed nodes with a size up', function () {
          var vnode1 = h('span', [1, 'a', 'b', 'c'].map(spanNum))
          var vnode2 = h('span', ['d', 'a', 'b', 'c', 1, 'e'].map(spanNum))
          elm = patch(vnode0, vnode1).elm
          assert.strictEqual(elm.childNodes.length, 4)
          assert.strictEqual(elm.textContent, '1abc')
          elm = patch(vnode1, vnode2).elm
          assert.strictEqual(elm.childNodes.length, 6)
          assert.strictEqual(elm.textContent, 'dabc1e')
        })
      })
      it('reverses elements', function () {
        var vnode1 = h('span', [1, 2, 3, 4, 5, 6, 7, 8].map(spanNum))
        var vnode2 = h('span', [8, 7, 6, 5, 4, 3, 2, 1].map(spanNum))
        elm = patch(vnode0, vnode1).elm
        assert.strictEqual(elm.children.length, 8)
        elm = patch(vnode1, vnode2).elm
        assert.deepEqual(map(inner, elm.children), ['8', '7', '6', '5', '4', '3', '2', '1'])
      })
      it('something', function () {
        var vnode1 = h('span', [0, 1, 2, 3, 4, 5].map(spanNum))
        var vnode2 = h('span', [4, 3, 2, 1, 5, 0].map(spanNum))
        elm = patch(vnode0, vnode1).elm
        assert.strictEqual(elm.children.length, 6)
        elm = patch(vnode1, vnode2).elm
        assert.deepEqual(map(inner, elm.children), ['4', '3', '2', '1', '5', '0'])
      })
      it('handles random shuffles', function () {
        var n
        var i
        var arr = []
        var opacities: string[] = []
        var elms = 14
        var samples = 5
        function spanNumWithOpacity (n: number, o: string) {
          return h('span', { key: n, style: { opacity: o } }, n.toString())
        }
        for (n = 0; n < elms; ++n) {
          arr[n] = n
        }
        for (n = 0; n < samples; ++n) {
          var vnode1 = h('span', arr.map(function (n) {
            return spanNumWithOpacity(n, '1')
          }))
          var shufArr = shuffle(arr.slice(0))
          var elm: HTMLDivElement | HTMLSpanElement = document.createElement('div')
          elm = patch(elm, vnode1).elm as HTMLSpanElement
          for (i = 0; i < elms; ++i) {
            assert.strictEqual(elm.children[i].innerHTML, i.toString())
            opacities[i] = Math.random().toFixed(5).toString()
          }
          var vnode2 = h('span', arr.map(function (n) {
            return spanNumWithOpacity(shufArr[n], opacities[n])
          }))
          elm = patch(vnode1, vnode2).elm as HTMLSpanElement
          for (i = 0; i < elms; ++i) {
            assert.strictEqual(elm.children[i].innerHTML, shufArr[i].toString())
            const opacity = (elm.children[i] as HTMLSpanElement).style.opacity as string
            assert.strictEqual(opacities[i].indexOf(opacity), 0)
          }
        }
      })
      it('supports null/undefined children', function () {
        var vnode1 = h('i', [0, 1, 2, 3, 4, 5].map(spanNum))
        var vnode2 = h('i', [null, 2, undefined, null, 1, 0, null, 5, 4, null, 3, undefined].map(spanNum))
        elm = patch(vnode0, vnode1).elm
        assert.strictEqual(elm.children.length, 6)
        elm = patch(vnode1, vnode2).elm
        assert.deepEqual(map(inner, elm.children), ['2', '1', '0', '5', '4', '3'])
      })
      it('supports all null/undefined children', function () {
        var vnode1 = h('i', [0, 1, 2, 3, 4, 5].map(spanNum))
        var vnode2 = h('i', [null, null, undefined, null, null, undefined])
        var vnode3 = h('i', [5, 4, 3, 2, 1, 0].map(spanNum))
        patch(vnode0, vnode1)
        elm = patch(vnode1, vnode2).elm
        assert.strictEqual(elm.children.length, 0)
        elm = patch(vnode2, vnode3).elm
        assert.deepEqual(map(inner, elm.children), ['5', '4', '3', '2', '1', '0'])
      })
      it('handles random shuffles with null/undefined children', function () {
        var i
        var j
        var r
        var len
        var arr
        var maxArrLen = 15
        var samples = 5
        var vnode1 = vnode0
        var vnode2
        for (i = 0; i < samples; ++i, vnode1 = vnode2) {
          len = Math.floor(Math.random() * maxArrLen)
          arr = []
          for (j = 0; j < len; ++j) {
            if ((r = Math.random()) < 0.5) arr[j] = String(j)
            else if (r < 0.75) arr[j] = null
            else arr[j] = undefined
          }
          shuffle(arr)
          vnode2 = h('div', arr.map(spanNum))
          elm = patch(vnode1, vnode2).elm
          assert.deepEqual(map(inner, elm.children), arr.filter(function (x) {
            return x != null
          }))
        }
      })
    })
    describe('updating children without keys', function () {
      it('appends elements', function () {
        var vnode1 = h('div', [h('span', 'Hello')])
        var vnode2 = h('div', [h('span', 'Hello'), h('span', 'World')])
        elm = patch(vnode0, vnode1).elm
        assert.deepEqual(map(inner, elm.children), ['Hello'])
        elm = patch(vnode1, vnode2).elm
        assert.deepEqual(map(inner, elm.children), ['Hello', 'World'])
      })
      it('handles unmoved text nodes', function () {
        var vnode1 = h('div', ['Text', h('span', 'Span')])
        var vnode2 = h('div', ['Text', h('span', 'Span')])
        elm = patch(vnode0, vnode1).elm
        assert.strictEqual(elm.childNodes[0].textContent, 'Text')
        elm = patch(vnode1, vnode2).elm
        assert.strictEqual(elm.childNodes[0].textContent, 'Text')
      })
      it('handles changing text children', function () {
        var vnode1 = h('div', ['Text', h('span', 'Span')])
        var vnode2 = h('div', ['Text2', h('span', 'Span')])
        elm = patch(vnode0, vnode1).elm
        assert.strictEqual(elm.childNodes[0].textContent, 'Text')
        elm = patch(vnode1, vnode2).elm
        assert.strictEqual(elm.childNodes[0].textContent, 'Text2')
      })
      it('handles unmoved comment nodes', function () {
        var vnode1 = h('div', [h('!', 'Text'), h('span', 'Span')])
        var vnode2 = h('div', [h('!', 'Text'), h('span', 'Span')])
        elm = patch(vnode0, vnode1).elm
        assert.strictEqual(elm.childNodes[0].textContent, 'Text')
        elm = patch(vnode1, vnode2).elm
        assert.strictEqual(elm.childNodes[0].textContent, 'Text')
      })
      it('handles changing comment text', function () {
        var vnode1 = h('div', [h('!', 'Text'), h('span', 'Span')])
        var vnode2 = h('div', [h('!', 'Text2'), h('span', 'Span')])
        elm = patch(vnode0, vnode1).elm
        assert.strictEqual(elm.childNodes[0].textContent, 'Text')
        elm = patch(vnode1, vnode2).elm
        assert.strictEqual(elm.childNodes[0].textContent, 'Text2')
      })
      it('handles changing empty comment', function () {
        var vnode1 = h('div', [h('!'), h('span', 'Span')])
        var vnode2 = h('div', [h('!', 'Test'), h('span', 'Span')])
        elm = patch(vnode0, vnode1).elm
        assert.strictEqual(elm.childNodes[0].textContent, '')
        elm = patch(vnode1, vnode2).elm
        assert.strictEqual(elm.childNodes[0].textContent, 'Test')
      })
      it('prepends element', function () {
        var vnode1 = h('div', [h('span', 'World')])
        var vnode2 = h('div', [h('span', 'Hello'), h('span', 'World')])
        elm = patch(vnode0, vnode1).elm
        assert.deepEqual(map(inner, elm.children), ['World'])
        elm = patch(vnode1, vnode2).elm
        assert.deepEqual(map(inner, elm.children), ['Hello', 'World'])
      })
      it('prepends element of different tag type', function () {
        var vnode1 = h('div', [h('span', 'World')])
        var vnode2 = h('div', [h('div', 'Hello'), h('span', 'World')])
        elm = patch(vnode0, vnode1).elm
        assert.deepEqual(map(inner, elm.children), ['World'])
        elm = patch(vnode1, vnode2).elm
        assert.deepEqual(map(prop('tagName'), elm.children), ['DIV', 'SPAN'])
        assert.deepEqual(map(inner, elm.children), ['Hello', 'World'])
      })
      it('removes elements', function () {
        var vnode1 = h('div', [h('span', 'One'), h('span', 'Two'), h('span', 'Three')])
        var vnode2 = h('div', [h('span', 'One'), h('span', 'Three')])
        elm = patch(vnode0, vnode1).elm
        assert.deepEqual(map(inner, elm.children), ['One', 'Two', 'Three'])
        elm = patch(vnode1, vnode2).elm
        assert.deepEqual(map(inner, elm.children), ['One', 'Three'])
      })
      it('removes a single text node', function () {
        var vnode1 = h('div', 'One')
        var vnode2 = h('div')
        patch(vnode0, vnode1)
        assert.strictEqual(elm.textContent, 'One')
        patch(vnode1, vnode2)
        assert.strictEqual(elm.textContent, '')
      })
      it('removes a single text node when children are updated', function () {
        var vnode1 = h('div', 'One')
        var vnode2 = h('div', [h('div', 'Two'), h('span', 'Three')])
        patch(vnode0, vnode1)
        assert.strictEqual(elm.textContent, 'One')
        patch(vnode1, vnode2)
        assert.deepEqual(map(prop('textContent'), elm.childNodes), ['Two', 'Three'])
      })
      it('removes a text node among other elements', function () {
        var vnode1 = h('div', ['One', h('span', 'Two')])
        var vnode2 = h('div', [h('div', 'Three')])
        patch(vnode0, vnode1)
        assert.deepEqual(map(prop('textContent'), elm.childNodes), ['One', 'Two'])
        patch(vnode1, vnode2)
        assert.strictEqual(elm.childNodes.length, 1)
        assert.strictEqual(elm.childNodes[0].tagName, 'DIV')
        assert.strictEqual(elm.childNodes[0].textContent, 'Three')
      })
      it('reorders elements', function () {
        var vnode1 = h('div', [h('span', 'One'), h('div', 'Two'), h('b', 'Three')])
        var vnode2 = h('div', [h('b', 'Three'), h('span', 'One'), h('div', 'Two')])
        elm = patch(vnode0, vnode1).elm
        assert.deepEqual(map(inner, elm.children), ['One', 'Two', 'Three'])
        elm = patch(vnode1, vnode2).elm
        assert.deepEqual(map(prop('tagName'), elm.children), ['B', 'SPAN', 'DIV'])
        assert.deepEqual(map(inner, elm.children), ['Three', 'One', 'Two'])
      })
      it('supports null/undefined children', function () {
        var vnode1 = h('i', [null, h('i', '1'), h('i', '2'), null])
        var vnode2 = h('i', [h('i', '2'), undefined, undefined, h('i', '1'), undefined])
        var vnode3 = h('i', [null, h('i', '1'), undefined, null, h('i', '2'), undefined, null])
        elm = patch(vnode0, vnode1).elm
        assert.deepEqual(map(inner, elm.children), ['1', '2'])
        elm = patch(vnode1, vnode2).elm
        assert.deepEqual(map(inner, elm.children), ['2', '1'])
        elm = patch(vnode2, vnode3).elm
        assert.deepEqual(map(inner, elm.children), ['1', '2'])
      })
      it('supports all null/undefined children', function () {
        var vnode1 = h('i', [h('i', '1'), h('i', '2')])
        var vnode2 = h('i', [null, undefined])
        var vnode3 = h('i', [h('i', '2'), h('i', '1')])
        patch(vnode0, vnode1)
        elm = patch(vnode1, vnode2).elm
        assert.strictEqual(elm.children.length, 0)
        elm = patch(vnode2, vnode3).elm
        assert.deepEqual(map(inner, elm.children), ['2', '1'])
      })
    })
  })
  describe('hooks', function () {
    describe('element hooks', function () {
      it('calls `create` listener before inserted into parent but after children', function () {
        var result = []
        const cb: CreateHook = (empty, vnode) => {
          assert(vnode.elm instanceof Element)
          assert.strictEqual((vnode.elm as HTMLDivElement).children.length, 2)
          assert.strictEqual(vnode.elm!.parentNode, null)
          result.push(vnode)
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', { hook: { create: cb } }, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
          h('span', 'Can\'t touch me'),
        ])
        patch(vnode0, vnode1)
        assert.strictEqual(1, result.length)
      })
      it('calls `insert` listener after both parents, siblings and children have been inserted', function () {
        var result = []
        const cb: InsertHook = (vnode) => {
          assert(vnode.elm instanceof Element)
          assert.strictEqual((vnode.elm as HTMLDivElement).children.length, 2)
          assert.strictEqual(vnode.elm!.parentNode!.children.length, 3)
          result.push(vnode)
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', { hook: { insert: cb } }, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
          h('span', 'Can touch me'),
        ])
        patch(vnode0, vnode1)
        assert.strictEqual(1, result.length)
      })
      it('calls `prepatch` listener', function () {
        var result = []
        const cb: PrePatchHook = (oldVnode, vnode) => {
          assert.strictEqual(oldVnode, vnode1.children![1])
          assert.strictEqual(vnode, vnode2.children![1])
          result.push(vnode)
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', { hook: { prepatch: cb } }, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ])
        var vnode2 = h('div', [
          h('span', 'First sibling'),
          h('div', { hook: { prepatch: cb } }, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ])
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
        assert.strictEqual(result.length, 1)
      })
      it('calls `postpatch` after `prepatch` listener', function () {
        var pre = 0
        var post = 0
        function preCb () {
          pre++
        }
        function postCb () {
          assert.strictEqual(pre, post + 1)
          post++
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', { hook: { prepatch: preCb, postpatch: postCb } }, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ])
        var vnode2 = h('div', [
          h('span', 'First sibling'),
          h('div', { hook: { prepatch: preCb, postpatch: postCb } }, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ])
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
        assert.strictEqual(pre, 1)
        assert.strictEqual(post, 1)
      })
      it('calls `update` listener', function () {
        var result1: VNode[] = []
        var result2: VNode[] = []
        function cb (result: VNode[], oldVnode: VNode, vnode: VNode) {
          if (result.length > 0) {
            console.log(result[result.length - 1])
            console.log(oldVnode)
            assert.strictEqual(result[result.length - 1], oldVnode)
          }
          result.push(vnode)
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', { hook: { update: cb.bind(null, result1) } }, [
            h('span', 'Child 1'),
            h('span', { hook: { update: cb.bind(null, result2) } }, 'Child 2'),
          ]),
        ])
        var vnode2 = h('div', [
          h('span', 'First sibling'),
          h('div', { hook: { update: cb.bind(null, result1) } }, [
            h('span', 'Child 1'),
            h('span', { hook: { update: cb.bind(null, result2) } }, 'Child 2'),
          ]),
        ])
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
        assert.strictEqual(result1.length, 1)
        assert.strictEqual(result2.length, 1)
      })
      it('calls `remove` listener', function () {
        var result = []
        const cb: RemoveHook = (vnode, rm) => {
          var parent = vnode.elm!.parentNode as HTMLDivElement
          assert(vnode.elm instanceof Element)
          assert.strictEqual((vnode.elm as HTMLDivElement).children.length, 2)
          assert.strictEqual(parent.children.length, 2)
          result.push(vnode)
          rm()
          assert.strictEqual(parent.children.length, 1)
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', { hook: { remove: cb } }, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ])
        var vnode2 = h('div', [
          h('span', 'First sibling'),
        ])
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
        assert.strictEqual(1, result.length)
      })
      it('calls `destroy` listener when patching text node over node with children', function () {
        var calls = 0
        function cb () {
          calls++
        }
        var vnode1 = h('div', [
          h('div', { hook: { destroy: cb } }, [
            h('span', 'Child 1'),
          ]),
        ])
        var vnode2 = h('div', 'Text node')
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
        assert.strictEqual(calls, 1)
      })
      it('calls `init` and `prepatch` listeners on root', function () {
        var count = 0
        const init: InitHook = (vnode) => {
          assert.strictEqual(vnode, vnode2)
          count += 1
        }
        const prepatch: PrePatchHook = (oldVnode, vnode) => {
          assert.strictEqual(vnode, vnode1)
          count += 1
        }
        var vnode1 = h('div', { hook: { init: init, prepatch: prepatch } })
        patch(vnode0, vnode1)
        assert.strictEqual(1, count)
        var vnode2 = h('span', { hook: { init: init, prepatch: prepatch } })
        patch(vnode1, vnode2)
        assert.strictEqual(2, count)
      })
      it('removes element when all remove listeners are done', function () {
        var rm1, rm2, rm3
        var patch = init([
          { remove: function (_, rm) { rm1 = rm } },
          { remove: function (_, rm) { rm2 = rm } },
        ])
        var vnode1 = h('div', [h('a', {
          hook: {
            remove: function (_, rm) {
              rm3 = rm
            }
          }
        })])
        var vnode2 = h('div', [])
        elm = patch(vnode0, vnode1).elm
        assert.strictEqual(elm.children.length, 1)
        elm = patch(vnode1, vnode2).elm
        assert.strictEqual(elm.children.length, 1);
        (rm1 as any)()
        assert.strictEqual(elm.children.length, 1);
        (rm3 as any)()
        assert.strictEqual(elm.children.length, 1);
        (rm2 as any)()
        assert.strictEqual(elm.children.length, 0)
      })
      it('invokes remove hook on replaced root', function () {
        var result = []
        var parent = document.createElement('div')
        var vnode0 = document.createElement('div')
        parent.appendChild(vnode0)
        const cb: RemoveHook = (vnode, rm) => {
          result.push(vnode)
          rm()
        }
        var vnode1 = h('div', { hook: { remove: cb } }, [
          h('b', 'Child 1'),
          h('i', 'Child 2'),
        ])
        var vnode2 = h('span', [
          h('b', 'Child 1'),
          h('i', 'Child 2'),
        ])
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
        assert.strictEqual(1, result.length)
      })
    })
    describe('module hooks', function () {
      it('invokes `pre` and `post` hook', function () {
        var result: string[] = []
        var patch = init([
          { pre: function () { result.push('pre') } },
          { post: function () { result.push('post') } },
        ])
        var vnode1 = h('div')
        patch(vnode0, vnode1)
        assert.deepEqual(result, ['pre', 'post'])
      })
      it('invokes global `destroy` hook for all removed children', function () {
        var result = []
        const cb: DestroyHook = (vnode) => {
          result.push(vnode)
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', [
            h('span', { hook: { destroy: cb } }, 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ])
        var vnode2 = h('div')
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
        assert.strictEqual(result.length, 1)
      })
      it('handles text vnodes with `undefined` `data` property', function () {
        var vnode1 = h('div', [
          ' '
        ])
        var vnode2 = h('div', [])
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
      })
      it('invokes `destroy` module hook for all removed children', function () {
        var created = 0
        var destroyed = 0
        var patch = init([
          { create: function () { created++ } },
          { destroy: function () { destroyed++ } },
        ])
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ])
        var vnode2 = h('div')
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
        assert.strictEqual(created, 4)
        assert.strictEqual(destroyed, 4)
      })
      it('does not invoke `create` and `remove` module hook for text nodes', function () {
        var created = 0
        var removed = 0
        var patch = init([
          { create: function () { created++ } },
          { remove: function () { removed++ } },
        ])
        var vnode1 = h('div', [
          h('span', 'First child'),
          '',
          h('span', 'Third child'),
        ])
        var vnode2 = h('div')
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
        assert.strictEqual(created, 2)
        assert.strictEqual(removed, 2)
      })
      it('does not invoke `destroy` module hook for text nodes', function () {
        var created = 0
        var destroyed = 0
        var patch = init([
          { create: function () { created++ } },
          { destroy: function () { destroyed++ } },
        ])
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', [
            h('span', 'Child 1'),
            h('span', ['Text 1', 'Text 2']),
          ]),
        ])
        var vnode2 = h('div')
        patch(vnode0, vnode1)
        patch(vnode1, vnode2)
        assert.strictEqual(created, 4)
        assert.strictEqual(destroyed, 4)
      })
    })
  })
  describe('short circuiting', function () {
    it('does not update strictly equal vnodes', function () {
      var result = []
      const cb: UpdateHook = (vnode) => {
        result.push(vnode)
      }
      var vnode1 = h('div', [
        h('span', { hook: { update: cb } }, 'Hello'),
        h('span', 'there'),
      ])
      patch(vnode0, vnode1)
      patch(vnode1, vnode1)
      assert.strictEqual(result.length, 0)
    })
    it('does not update strictly equal children', function () {
      var result = []
      function cb (vnode: VNode) {
        result.push(vnode)
      }
      var vnode1 = h('div', [
        h('span', { hook: { patch: cb } as any }, 'Hello'),
        h('span', 'there'),
      ])
      var vnode2 = h('div')
      vnode2.children = vnode1.children
      patch(vnode0, vnode1)
      patch(vnode1, vnode2)
      assert.strictEqual(result.length, 0)
    })
  })
})
