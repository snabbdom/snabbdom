var assert = require('assert');

var snabbdom = require('../snabbdom');
var createElm = snabbdom.createElm;
var patchElm = snabbdom.patchElm;
var h = snabbdom.h;

describe('snabbdom', function() {
  describe('hyperscript', function() {
    it('can create vnode with proper tag', function() {
      assert.equal(h('div').tag, 'div');
      assert.equal(h('a').tag, 'a');
    });
    it('can create vnode with id from selector', function() {
      var vnode = h('span#foo');
      assert.equal(vnode.tag, 'span');
      assert.equal(vnode.props.id, 'foo');
    });
    it('can create vnode with classes from selector', function() {
      var vnode = h('span.foo.bar');
      assert.equal(vnode.tag, 'span');
      assert.deepEqual(vnode.props.className, 'foo bar');
    });
    it('can create vnode with id and classes from selector', function() {
      var vnode = h('span#horse.rabbit.cow');
      assert.equal(vnode.tag, 'span');
      assert.equal(vnode.props.id, 'horse');
      assert.deepEqual(vnode.tag, 'span');
      assert.deepEqual(vnode.props.className, 'rabbit cow');
    });
    it('can create vnode with children', function() {
      var vnode = h('div', [h('span#hello'), h('b.world')]);
      assert.equal(vnode.tag, 'div');
      assert.equal(vnode.children[0].tag, 'span');
      assert.equal(vnode.children[0].props.id, 'hello');
      assert.equal(vnode.children[1].tag, 'b');
      assert.equal(vnode.children[1].props.className, 'world');
    });
    it('can create vnode with text content', function() {
      var vnode = h('a', ['I am a string']);
      assert.equal(vnode.children[0].text, 'I am a string');
    });
    it('can create vnode with text content in string', function() {
      var vnode = h('a', 'I am a string');
      assert.equal(vnode.children[0].text, 'I am a string');
    });
    it('can create vnode with props and text content in string', function() {
      var vnode = h('a', {}, 'I am a string');
      assert.equal(vnode.children[0].text, 'I am a string');
    });
  });
  describe('created element', function() {
    it('has tag', function() {
      var elm = createElm(h('div'));
      assert.equal(elm.tagName, 'DIV');
    });
    it('has id', function() {
      var elm = createElm(h('span#unique'));
      assert.equal(elm.tagName, 'SPAN');
      assert.equal(elm.id, 'unique');
    });
    it('is being styled', function() {
      var elm = createElm(h('span#unique', {style: {fontSize: '12px'}}));
      assert.equal(elm.style.fontSize, '12px');
    });
    it('is recieves classes in selector', function() {
      var elm = createElm(h('i.am.a.class'));
      assert(elm.classList.contains('am'));
      assert(elm.classList.contains('a'));
      assert(elm.classList.contains('class'));
    });
    it('is recieves classes in class property', function() {
      var elm = createElm(h('i', {class: {am: true, a: true, class: true, not: false}}));
      assert(elm.classList.contains('am'));
      assert(elm.classList.contains('a'));
      assert(elm.classList.contains('class'));
      assert(!elm.classList.contains('not'));
    });
    it('can create elements with text content', function() {
      var elm = createElm(h('a', ['I am a string']));
      //console.log(elm.innerHTML);
    });
  });
  describe('pathing an element', function() {
    it('changes the elements classes', function() {
      var vnode1 = h('i', {class: {i: true, am: true, horse: true}});
      var vnode2 = h('i', {class: {i: true, am: true, horse: false}});
      var elm = createElm(vnode1);
      patchElm(vnode1, vnode2);
      assert(elm.classList.contains('i'));
      assert(elm.classList.contains('am'));
      assert(!elm.classList.contains('horse'));
    });
    it('changes classes in selector', function() {
      var vnode1 = h('i', {class: {i: true, am: true, horse: true}});
      var vnode2 = h('i', {class: {i: true, am: true, horse: false}});
      var elm = createElm(vnode1);
      patchElm(vnode1, vnode2);
      assert(elm.classList.contains('i'));
      assert(elm.classList.contains('am'));
      assert(!elm.classList.contains('horse'));
    });
    it('updates styles', function() {
      var vnode1 = h('i', {style: {fontSize: '14px', display: 'inline'}});
      var vnode2 = h('i', {style: {fontSize: '12px', display: 'block'}});
      var elm = createElm(vnode1);
      assert.equal(elm.style.fontSize, '14px');
      assert.equal(elm.style.display, 'inline');
      patchElm(vnode1, vnode2);
      assert.equal(elm.style.fontSize, '12px');
      assert.equal(elm.style.display, 'block');
    });
    describe('updating children with keys', function() {
      function spanNum(n) { return h('span', {key: n}, n.toString()); }
      describe('addition of elements', function() {
        it('appends elements', function() {
          var vnode1 = h('span', [1].map(spanNum));
          var vnode2 = h('span', [1, 2, 3].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 1);
          patchElm(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[1].innerHTML, '2');
          assert.equal(elm.children[2].innerHTML, '3');
        });
        it('prepends elements', function() {
          var vnode1 = h('span', [3].map(spanNum));
          var vnode2 = h('span', [1, 2, 3].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 1);
          patchElm(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          console.log(elm.children);
          assert.equal(elm.children[1].innerHTML, '2');
          assert.equal(elm.children[2].innerHTML, '3');
        });
        it('add elements in the middle', function() {
          var vnode1 = h('span', [1, 2, 4, 5].map(spanNum));
          var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 4);
          patchElm(vnode1, vnode2);
          assert.equal(elm.children.length, 5);
          assert.equal(elm.children[0].innerHTML, '1');
          assert.equal(elm.children[1].innerHTML, '2');
          assert.equal(elm.children[2].innerHTML, '3');
          assert.equal(elm.children[3].innerHTML, '4');
          assert.equal(elm.children[4].innerHTML, '5');
        });
      });
      describe('removal of elements', function() {
        it('removes elements from the beginning', function() {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var vnode2 = h('span', [3, 4, 5].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 5);
          patchElm(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[0].innerHTML, '3');
          assert.equal(elm.children[1].innerHTML, '4');
          assert.equal(elm.children[2].innerHTML, '5');
        });
        it('removes elements from the end', function() {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var vnode2 = h('span', [1, 2, 3].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 5);
          patchElm(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[0].innerHTML, '1');
          assert.equal(elm.children[1].innerHTML, '2');
          assert.equal(elm.children[2].innerHTML, '3');
        });
        it('removes elements from the middle', function() {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var vnode2 = h('span', [1, 2, 4, 5].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 5);
          patchElm(vnode1, vnode2);
          assert.equal(elm.children.length, 4);
          assert.equal(elm.children[0].innerHTML, '1');
          assert.equal(elm.children[1].innerHTML, '2');
          assert.equal(elm.children[2].innerHTML, '4');
          assert.equal(elm.children[3].innerHTML, '5');
        });
      });
      describe('element reordering', function() {
        it('moves element forward', function() {
          var vnode1 = h('span', [1, 2, 3, 4].map(spanNum));
          var vnode2 = h('span', [2, 3, 1, 4].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 4);
          patchElm(vnode1, vnode2);
          assert.equal(elm.children.length, 4);
          assert.equal(elm.children[0].innerHTML, '2');
          assert.equal(elm.children[1].innerHTML, '3');
          assert.equal(elm.children[2].innerHTML, '1');
          assert.equal(elm.children[3].innerHTML, '4');
        });
        it('moves element to end', function() {
          var vnode1 = h('span', [1, 2, 3].map(spanNum));
          var vnode2 = h('span', [2, 3, 1].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 3);
          patchElm(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[0].innerHTML, '2');
          assert.equal(elm.children[1].innerHTML, '3');
          assert.equal(elm.children[2].innerHTML, '1');
        });
      });
      it('reverses elements');
    });
    describe('updating children without keys', function() {
      it('appends elements');
      it('prepends elements');
      it('removes elements');
      it('reorders elements');
      it('reverses elements');
    });
  });
});
