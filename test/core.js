var assert = require('assert');
var shuffle = require('knuth-shuffle').knuthShuffle;

var snabbdom = require('../snabbdom');
var patch = snabbdom.init([
  require('../modules/class'),
  require('../modules/props'),
  require('../modules/eventlisteners'),
]);
var h = require('../h');

function prop(name) {
  return function(obj) {
    return obj[name];
  };
}

function map(fn, list) {
  var ret = [];
  for (var i = 0; i < list.length; ++i) {
    ret[i] = fn(list[i]);
  }
  return ret;
}

var inner = prop('innerHTML');

describe('snabbdom', function() {
  var elm, vnode0;
  beforeEach(function() {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  describe('hyperscript', function() {
    it('can create vnode with proper tag', function() {
      assert.equal(h('div').sel, 'div');
      assert.equal(h('a').sel, 'a');
    });
    it('can create vnode with children', function() {
      var vnode = h('div', [h('span#hello'), h('b.world')]);
      assert.equal(vnode.sel, 'div');
      assert.equal(vnode.children[0].sel, 'span#hello');
      assert.equal(vnode.children[1].sel, 'b.world');
    });
    it('can create vnode with text content', function() {
      var vnode = h('a', ['I am a string']);
      assert.equal(vnode.children[0].text, 'I am a string');
    });
    it('can create vnode with text content in string', function() {
      var vnode = h('a', 'I am a string');
      assert.equal(vnode.text, 'I am a string');
    });
    it('can create vnode with props and text content in string', function() {
      var vnode = h('a', {}, 'I am a string');
      assert.equal(vnode.text, 'I am a string');
    });
  });
  describe('created element', function() {
    it('has tag', function() {
      patch(vnode0, h('div'));
      assert.equal(elm.tagName, 'DIV');
    });
    it('has different tag and id', function() {
      var elm = document.createElement('div');
      vnode0.appendChild(elm);
      var vnode1 = h('span#id');
      patch(elm, vnode1);
      assert.equal(vnode1.elm.tagName, 'SPAN');
      assert.equal(vnode1.elm.id, 'id');
    });
    it('has id', function() {
      patch(vnode0, h('div', [h('div#unique')]));
      assert.equal(elm.firstChild.id, 'unique');
    });
    it('has correct namespace', function() {
      patch(vnode0, h('div', [h('div', {ns: 'http://www.w3.org/2000/svg'})]));
      assert.equal(elm.firstChild.namespaceURI, 'http://www.w3.org/2000/svg');
    });
    it('is recieves classes in selector', function() {
      patch(vnode0, h('div', [h('i.am.a.class')]));
      assert(elm.firstChild.classList.contains('am'));
      assert(elm.firstChild.classList.contains('a'));
      assert(elm.firstChild.classList.contains('class'));
    });
    it('is recieves classes in class property', function() {
      patch(vnode0, h('i', {class: {am: true, a: true, class: true, not: false}}));
      assert(elm.classList.contains('am'));
      assert(elm.classList.contains('a'));
      assert(elm.classList.contains('class'));
      assert(!elm.classList.contains('not'));
    });
    it('handles classes from both selector and property', function() {
      patch(vnode0, h('div', [h('i.has', {class: {classes: true}})]));
      assert(elm.firstChild.classList.contains('has'));
      assert(elm.firstChild.classList.contains('classes'));
    });
    it('can create elements with text content', function() {
      patch(vnode0, h('div', ['I am a string']));
      assert.equal(elm.innerHTML, 'I am a string');
    });
    it('can create elements with span and text content', function() {
      patch(vnode0, h('a', [h('span'), 'I am a string']));
      assert.equal(elm.childNodes[0].tagName, 'SPAN');
      assert.equal(elm.childNodes[1].textContent, 'I am a string');
    });
  });
  describe('pathing an element', function() {
    it('changes the elements classes', function() {
      var vnode1 = h('i', {class: {i: true, am: true, horse: true}});
      var vnode2 = h('i', {class: {i: true, am: true, horse: false}});
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      assert(elm.classList.contains('i'));
      assert(elm.classList.contains('am'));
      assert(!elm.classList.contains('horse'));
    });
    it('changes classes in selector', function() {
      var vnode1 = h('i', {class: {i: true, am: true, horse: true}});
      var vnode2 = h('i', {class: {i: true, am: true, horse: false}});
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      assert(elm.classList.contains('i'));
      assert(elm.classList.contains('am'));
      assert(!elm.classList.contains('horse'));
    });
    describe('updating children with keys', function() {
      function spanNum(n) {
        if (typeof n === 'string') {
          return h('span', {}, n);
        } else {
          return h('span', {key: n}, n.toString());
        }
      }
      describe('addition of elements', function() {
        it('appends elements', function() {
          var vnode1 = h('span', [1].map(spanNum));
          var vnode2 = h('span', [1, 2, 3].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 1);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[1].innerHTML, '2');
          assert.equal(elm.children[2].innerHTML, '3');
        });
        it('prepends elements', function() {
          var vnode1 = h('span', [4, 5].map(spanNum));
          var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 2);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5']);
        });
        it('add elements in the middle', function() {
          var vnode1 = h('span', [1, 2, 4, 5].map(spanNum));
          var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 4);
          assert.equal(elm.children.length, 4);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5']);
        });
        it('add elements at begin and end', function() {
          var vnode1 = h('span', [2, 3, 4].map(spanNum));
          var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 3);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5']);
        });
        it('adds children to parent with no children', function() {
          var vnode1 = h('span', {key: 'span'});
          var vnode2 = h('span', {key: 'span'}, [1, 2, 3].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 0);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3']);
        });
        it('removes all children from parent', function() {
          var vnode1 = h('span', {key: 'span'}, [1, 2, 3].map(spanNum));
          var vnode2 = h('span', {key: 'span'});
          patch(vnode0, vnode1);
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3']);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 0);
        });
      });
      describe('removal of elements', function() {
        it('removes elements from the beginning', function() {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var vnode2 = h('span', [3, 4, 5].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 5);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['3', '4', '5']);
        });
        it('removes elements from the end', function() {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var vnode2 = h('span', [1, 2, 3].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 5);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[0].innerHTML, '1');
          assert.equal(elm.children[1].innerHTML, '2');
          assert.equal(elm.children[2].innerHTML, '3');
        });
        it('removes elements from the middle', function() {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var vnode2 = h('span', [1, 2, 4, 5].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 5);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 4);
          assert.deepEqual(elm.children[0].innerHTML, '1');
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
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 4);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 4);
          assert.equal(elm.children[0].innerHTML, '2');
          assert.equal(elm.children[1].innerHTML, '3');
          assert.equal(elm.children[2].innerHTML, '1');
          assert.equal(elm.children[3].innerHTML, '4');
        });
        it('moves element to end', function() {
          var vnode1 = h('span', [1, 2, 3].map(spanNum));
          var vnode2 = h('span', [2, 3, 1].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 3);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[0].innerHTML, '2');
          assert.equal(elm.children[1].innerHTML, '3');
          assert.equal(elm.children[2].innerHTML, '1');
        });
        it('moves element backwards', function() {
          var vnode1 = h('span', [1, 2, 3, 4].map(spanNum));
          var vnode2 = h('span', [1, 4, 2, 3].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 4);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 4);
          assert.equal(elm.children[0].innerHTML, '1');
          assert.equal(elm.children[1].innerHTML, '4');
          assert.equal(elm.children[2].innerHTML, '2');
          assert.equal(elm.children[3].innerHTML, '3');
        });
        it('swaps first and last', function() {
          var vnode1 = h('span', [1, 2, 3, 4].map(spanNum));
          var vnode2 = h('span', [4, 2, 3, 1].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 4);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 4);
          assert.equal(elm.children[0].innerHTML, '4');
          assert.equal(elm.children[1].innerHTML, '2');
          assert.equal(elm.children[2].innerHTML, '3');
          assert.equal(elm.children[3].innerHTML, '1');
        });
      });
      describe('combinations of additions, removals and reorderings', function() {
        it('move to left and replace', function() {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var vnode2 = h('span', [4, 1, 2, 3, 6].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 5);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 5);
          assert.equal(elm.children[0].innerHTML, '4');
          assert.equal(elm.children[1].innerHTML, '1');
          assert.equal(elm.children[2].innerHTML, '2');
          assert.equal(elm.children[3].innerHTML, '3');
          assert.equal(elm.children[4].innerHTML, '6');
        });
        it('moves to left and leaves hole', function() {
          var vnode1 = h('span', [1, 4, 5].map(spanNum));
          var vnode2 = h('span', [4, 6].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 3);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['4', '6']);
        });
        it('handles moved and set to undefined element ending at the end', function() {
          var vnode1 = h('span', [2, 4, 5].map(spanNum));
          var vnode2 = h('span', [4, 5, 3].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.children.length, 3);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[0].innerHTML, '4');
          assert.equal(elm.children[1].innerHTML, '5');
          assert.equal(elm.children[2].innerHTML, '3');
        });
        it('moves a key in non-keyed nodes with a size up', function() {
          var vnode1 = h('span', [1, 'a', 'b', 'c'].map(spanNum));
          var vnode2 = h('span', ['d', 'a', 'b', 'c', 1, 'e'].map(spanNum));
          patch(vnode0, vnode1);
          assert.equal(elm.childNodes.length, 4);
          assert.equal(elm.textContent, '1abc');
          patch(vnode1, vnode2);
          assert.equal(elm.childNodes.length, 6);
          assert.equal(elm.textContent, 'dabc1e');
        });
      });
      it('reverses elements', function() {
        var vnode1 = h('span', [1, 2, 3, 4, 5, 6, 7, 8].map(spanNum));
        var vnode2 = h('span', [8, 7, 6, 5, 4, 3, 2, 1].map(spanNum));
        patch(vnode0, vnode1);
        assert.equal(elm.children.length, 8);
        patch(vnode1, vnode2);
        assert.deepEqual(map(inner, elm.children), ['8', '7', '6', '5', '4', '3', '2', '1']);
      });
      it('something', function() {
        var vnode1 = h('span', [0, 1, 2, 3, 4, 5].map(spanNum));
        var vnode2 = h('span', [4, 3, 2, 1, 5, 0].map(spanNum));
        patch(vnode0, vnode1);
        assert.equal(elm.children.length, 6);
        patch(vnode1, vnode2);
        assert.deepEqual(map(inner, elm.children), ['4', '3', '2', '1', '5', '0']);
      });
      it('handles random shuffles', function() {
        var n, i, arr = [], opacities = [], elms = 14, samples = 5;
        function spanNumWithOpacity(n, o) {
          return h('span', {key: n, style: {opacity: o}}, n.toString());
        }
        for (n = 0; n < elms; ++n) { arr[n] = n; }
        for (n = 0; n < samples; ++n) {
          var vnode1 = h('span', arr.map(function(n) {
            return spanNumWithOpacity(n, '1');
          }));
          var shufArr = shuffle(arr.slice(0));
          var elm = document.createElement('div');
          patch(elm, vnode1);
          for (i = 0; i < elms; ++i) {
            assert.equal(elm.children[i].innerHTML, i.toString());
            opacities[i] = Math.random().toFixed(5).toString();
          }
          var vnode2 = h('span', arr.map(function(n) {
            return spanNumWithOpacity(shufArr[n], opacities[n]);
          }));
          patch(vnode1, vnode2);
          for (i = 0; i < elms; ++i) {
            assert.equal(elm.children[i].innerHTML, shufArr[i].toString());
            assert.equal(opacities[i].indexOf(elm.children[i].style.opacity), 0);
          }
        }
      });
    });
    describe('updating children without keys', function() {
      it('appends elements', function() {
        var vnode1 = h('div', [h('span', 'Hello')]);
        var vnode2 = h('div', [h('span', 'Hello'), h('span', 'World')]);
        patch(vnode0, vnode1);
        assert.deepEqual(map(inner, elm.children), ['Hello']);
        patch(vnode1, vnode2);
        assert.deepEqual(map(inner, elm.children), ['Hello', 'World']);
      });
      it('handles unmoved text nodes', function() {
        var vnode1 = h('div', ['Text', h('span', 'Span')]);
        var vnode2 = h('div', ['Text', h('span', 'Span')]);
        patch(vnode0, vnode1);
        assert.equal(elm.childNodes[0].textContent, 'Text');
        patch(vnode1, vnode2);
        assert.equal(elm.childNodes[0].textContent, 'Text');
      });
      it('handles changing text children', function() {
        var vnode1 = h('div', ['Text', h('span', 'Span')]);
        var vnode2 = h('div', ['Text2', h('span', 'Span')]);
        patch(vnode0, vnode1);
        assert.equal(elm.childNodes[0].textContent, 'Text');
        patch(vnode1, vnode2);
        assert.equal(elm.childNodes[0].textContent, 'Text2');
      });
      it('prepends element', function() {
        var vnode1 = h('div', [h('span', 'World')]);
        var vnode2 = h('div', [h('span', 'Hello'), h('span', 'World')]);
        patch(vnode0, vnode1);
        assert.deepEqual(map(inner, elm.children), ['World']);
        patch(vnode1, vnode2);
        assert.deepEqual(map(inner, elm.children), ['Hello', 'World']);
      });
      it('prepends element of different tag type', function() {
        var vnode1 = h('div', [h('span', 'World')]);
        var vnode2 = h('div', [h('div', 'Hello'), h('span', 'World')]);
        patch(vnode0, vnode1);
        assert.deepEqual(map(inner, elm.children), ['World']);
        patch(vnode1, vnode2);
        assert.deepEqual(map(prop('tagName'), elm.children), ['DIV', 'SPAN']);
        assert.deepEqual(map(inner, elm.children), ['Hello', 'World']);
      });
      it('removes elements', function() {
        var vnode1 = h('div', [h('span', 'One'), h('span', 'Two'), h('span', 'Three')]);
        var vnode2 = h('div', [h('span', 'One'), h('span', 'Three')]);
        patch(vnode0, vnode1);
        assert.deepEqual(map(inner, elm.children), ['One', 'Two', 'Three']);
        patch(vnode1, vnode2);
        assert.deepEqual(map(inner, elm.children), ['One', 'Three']);
      });
      it('reorders elements', function() {
        var vnode1 = h('div', [h('span', 'One'), h('div', 'Two'), h('b', 'Three')]);
        var vnode2 = h('div', [h('b', 'Three'), h('span', 'One'), h('div', 'Two')]);
        patch(vnode0, vnode1);
        assert.deepEqual(map(inner, elm.children), ['One', 'Two', 'Three']);
        patch(vnode1, vnode2);
        assert.deepEqual(map(prop('tagName'), elm.children), ['B', 'SPAN', 'DIV']);
        assert.deepEqual(map(inner, elm.children), ['Three', 'One', 'Two']);
      });
    });
  });
  describe('hooks', function() {
    describe('element hooks', function() {
      it('calls `create` listener before inserted into parent but after children', function() {
        var result = [];
        function cb(empty, vnode) {
          assert(vnode.elm instanceof Element);
          assert.equal(vnode.elm.children.length, 2);
          assert.strictEqual(vnode.elm.parentNode, null);
          result.push(vnode);
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', {hook: {create: cb}}, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
          h('span', 'Can\'t touch me'),
        ]);
        patch(vnode0, vnode1);
        assert.equal(1, result.length);
      });
      it('calls `insert` listener after both parents, siblings and children have been inserted', function() {
        var result = [];
        function cb(vnode) {
          assert(vnode.elm instanceof Element);
          assert.equal(vnode.elm.children.length, 2);
          assert.equal(vnode.elm.parentNode.children.length, 3);
          result.push(vnode);
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', {hook: {insert: cb}}, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
          h('span', 'Can touch me'),
        ]);
        patch(vnode0, vnode1);
        assert.equal(1, result.length);
      });
      it('calls `prepatch` listener', function() {
        var result = [];
        function cb(oldVnode, vnode) {
          assert.strictEqual(oldVnode, vnode1.children[1]);
          assert.strictEqual(vnode, vnode2.children[1]);
          result.push(vnode);
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', {hook: {prepatch: cb}}, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ]);
        var vnode2 = h('div', [
          h('span', 'First sibling'),
          h('div', {hook: {prepatch: cb}}, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.equal(result.length, 1);
      });
      it('calls `postpatch` after `prepatch` listener', function() {
        var pre = [], post = [];
        function preCb(oldVnode, vnode) {
          pre.push(pre);
        }
        function postCb(oldVnode, vnode) {
          assert.equal(pre.length, post.length + 1);
          post.push(post);
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', {hook: {prepatch: preCb, postpatch: postCb}}, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ]);
        var vnode2 = h('div', [
          h('span', 'First sibling'),
          h('div', {hook: {prepatch: preCb, postpatch: postCb}}, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.equal(pre.length, 1);
        assert.equal(post.length, 1);
      });
      it('calls `update` listener', function() {
        var result1 = [];
        var result2 = [];
        function cb(result, oldVnode, vnode) {
          if (result.length > 0) {
            console.log(result[result.length-1]);
            console.log(oldVnode);
            assert.strictEqual(result[result.length-1], oldVnode);
          }
          result.push(vnode);
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', {hook: {update: cb.bind(null, result1)}}, [
            h('span', 'Child 1'),
            h('span', {hook: {update: cb.bind(null, result2)}}, 'Child 2'),
          ]),
        ]);
        var vnode2 = h('div', [
          h('span', 'First sibling'),
          h('div', {hook: {update: cb.bind(null, result1)}}, [
            h('span', 'Child 1'),
            h('span', {hook: {update: cb.bind(null, result2)}}, 'Child 2'),
          ]),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.equal(result1.length, 1);
        assert.equal(result2.length, 1);
      });
      it('calls `remove` listener', function() {
        var result = [];
        function cb(vnode, rm) {
          var parent = vnode.elm.parentNode;
          assert(vnode.elm instanceof Element);
          assert.equal(vnode.elm.children.length, 2);
          assert.equal(parent.children.length, 2);
          result.push(vnode);
          rm();
          assert.equal(parent.children.length, 1);
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', {hook: {remove: cb}}, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ]);
        var vnode2 = h('div', [
          h('span', 'First sibling'),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.equal(1, result.length);
      });
      it('removes element when all remove listeners are done', function() {
        var rm1, rm2, rm3;
        var patch = snabbdom.init([
          {remove: function(_, rm) { rm1 = rm; }},
          {remove: function(_, rm) { rm2 = rm; }},
        ]);
        var vnode1 = h('div', [h('a', {hook: {remove: function(_, rm) { rm3 = rm; }}})]);
        patch(vnode0, vnode1);
        assert.equal(elm.children.length, 1);
        patch(vnode1, vnode0);
        assert.equal(elm.children.length, 1);
        rm1();
        assert.equal(elm.children.length, 1);
        rm3();
        assert.equal(elm.children.length, 1);
        rm2();
        assert.equal(elm.children.length, 0);
      });
    });
    describe('module hooks', function() {
      it('invokes `pre` and `post` hook', function() {
        var result = [];
        var patch = snabbdom.init([
          {pre: function() { result.push('pre'); }},
          {post: function() { result.push('post'); }},
        ]);
        var vnode1 = h('div');
        patch(vnode0, vnode1);
        assert.deepEqual(result, ['pre', 'post']);
      });
      it('invokes global `destroy` hook for all removed children', function() {
        var result = [];
        function cb(vnode) { result.push(vnode); }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', [
            h('span', {hook: {destroy: cb}}, 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode0);
        assert.equal(result.length, 1);
      });
      it('handles text vnodes with `undefined` `data` property', function() {
        var vnode1 = h('div', [
          ' '
        ]);
        var vnode2 = h('div', []);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
      });
      it('invokes `destroy` module hook for all removed children', function() {
        var created = 0;
        var destroyed = 0;
        var patch = snabbdom.init([
          {create: function() { created++; }},
          {destroy: function() { destroyed++; }},
        ]);
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode0);
        assert.equal(created, 4);
        assert.equal(destroyed, 4);
      });
      it('does not invoke `create` and `remove` module hook for text nodes', function() {
        var created = 0;
        var removed = 0;
        var patch = snabbdom.init([
          {create: function() { created++; }},
          {remove: function() { removed++; }},
        ]);
        var vnode1 = h('div', [
          h('span', 'First child'),
          '',
          h('span', 'Third child'),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode0);
        assert.equal(created, 2);
        assert.equal(removed, 2);
      });
      it('does not invoke `destroy` module hook for text nodes', function() {
        var created = 0;
        var destroyed = 0;
        var patch = snabbdom.init([
          {create: function() { created++; }},
          {destroy: function() { destroyed++; }},
        ]);
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', [
            h('span', 'Child 1'),
            h('span', ['Text 1', 'Text 2']),
          ]),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode0);
        assert.equal(created, 4);
        assert.equal(destroyed, 4);
      });
    });
  });
  describe('short circuiting', function() {
    it('does not update strictly equal vnodes', function() {
      var result = [];
      function cb(vnode) { result.push(vnode); }
      var vnode1 = h('div', [
        h('span', {hook: {update: cb}}, 'Hello'),
        h('span', 'there'),
      ]);
      patch(vnode0, vnode1);
      patch(vnode1, vnode1);
      assert.equal(result.length, 0);
    });
    it('does not update strictly equal children', function() {
      var result = [];
      function cb(vnode) { result.push(vnode); }
      var vnode1 = h('div', [
        h('span', {hook: {patch: cb}}, 'Hello'),
        h('span', 'there'),
      ]);
      var vnode2 = h('div');
      vnode2.children = vnode1.children;
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      assert.equal(result.length, 0);
    });
  });
});
