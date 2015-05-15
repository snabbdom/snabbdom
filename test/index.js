var assert = require('assert');
var shuffle = require('knuth-shuffle').knuthShuffle;

var snabbdom = require('../snabbdom');
var createElm = snabbdom.createElm;
var patch = snabbdom.patch;
var h = snabbdom.h;

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
      assert.equal(vnode.text, 'I am a string');
    });
    it('can create vnode with props and text content in string', function() {
      var vnode = h('a', {}, 'I am a string');
      assert.equal(vnode.text, 'I am a string');
    });
    it('can create empty vnode at element', function() {
      var elm = document.createElement('div');
      var vnode = snabbdom.emptyNodeAt(elm);
      assert.equal(vnode.elm, elm);
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
      assert.equal(elm.innerHTML, 'I am a string');
    });
    it('can create elements with span and text content', function() {
      var elm = createElm(h('a', [h('span'), 'I am a string']));
      assert.equal(elm.childNodes[0].tagName, 'SPAN');
      assert.equal(elm.childNodes[1].textContent, 'I am a string');
    });
  });
  describe('pathing an element', function() {
    it('changes the elements classes', function() {
      var vnode1 = h('i', {class: {i: true, am: true, horse: true}});
      var vnode2 = h('i', {class: {i: true, am: true, horse: false}});
      var elm = createElm(vnode1);
      patch(vnode1, vnode2);
      assert(elm.classList.contains('i'));
      assert(elm.classList.contains('am'));
      assert(!elm.classList.contains('horse'));
    });
    it('changes classes in selector', function() {
      var vnode1 = h('i', {class: {i: true, am: true, horse: true}});
      var vnode2 = h('i', {class: {i: true, am: true, horse: false}});
      var elm = createElm(vnode1);
      patch(vnode1, vnode2);
      assert(elm.classList.contains('i'));
      assert(elm.classList.contains('am'));
      assert(!elm.classList.contains('horse'));
    });
    it('updates styles', function() {
      var vnode1 = h('i', {style: {fontSize: '14px', display: 'inline'}});
      var vnode2 = h('i', {style: {fontSize: '12px', display: 'block'}});
      var vnode3 = h('i', {style: {fontSize: '10px', display: 'block'}});
      var elm = createElm(vnode1);
      assert.equal(elm.style.fontSize, '14px');
      assert.equal(elm.style.display, 'inline');
      patch(vnode1, vnode2);
      assert.equal(elm.style.fontSize, '12px');
      assert.equal(elm.style.display, 'block');
      patch(vnode2, vnode3);
      assert.equal(elm.style.fontSize, '10px');
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
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[1].innerHTML, '2');
          assert.equal(elm.children[2].innerHTML, '3');
        });
        it('prepends elements', function() {
          var vnode1 = h('span', [4, 5].map(spanNum));
          var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 2);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5']);
        });
        it('add elements in the middle', function() {
          var vnode1 = h('span', [1, 2, 4, 5].map(spanNum));
          var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 4);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5']);
        });
        it('add elements at begin and end', function() {
          var vnode1 = h('span', [2, 3, 4].map(spanNum));
          var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 3);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5']);
        });
        it('adds children to parent with no children', function() {
          var vnode1 = h('span', {key: 'span'});
          var vnode2 = h('span', {key: 'span'}, [1, 2, 3].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 0);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3']);
        });
        it('removes all children from parent', function() {
          var vnode1 = h('span', {key: 'span'}, [1, 2, 3].map(spanNum));
          var vnode2 = h('span', {key: 'span'});
          var elm = createElm(vnode1);
          assert.deepEqual(map(inner, elm.children), ['1', '2', '3']);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 0);
        });
      });
      describe('removal of elements', function() {
        it('removes elements from the beginning', function() {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var vnode2 = h('span', [3, 4, 5].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 5);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['3', '4', '5']);
        });
        it('removes elements from the end', function() {
          var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
          var vnode2 = h('span', [1, 2, 3].map(spanNum));
          var elm = createElm(vnode1);
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
          var elm = createElm(vnode1);
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
          var elm = createElm(vnode1);
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
          var elm = createElm(vnode1);
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
          var elm = createElm(vnode1);
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
          var elm = createElm(vnode1);
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
          var elm = createElm(vnode1);
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
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 3);
          patch(vnode1, vnode2);
          assert.deepEqual(map(inner, elm.children), ['4', '6']);
        });
        it('handles moved and set to undefined element ending at the end', function() {
          var vnode1 = h('span', [2, 4, 5].map(spanNum));
          var vnode2 = h('span', [4, 5, 3].map(spanNum));
          var elm = createElm(vnode1);
          assert.equal(elm.children.length, 3);
          patch(vnode1, vnode2);
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[0].innerHTML, '4');
          assert.equal(elm.children[1].innerHTML, '5');
          assert.equal(elm.children[2].innerHTML, '3');
        });
      });
      it('reverses elements', function() {
        var vnode1 = h('span', [1, 2, 3, 4, 5, 6, 7, 8].map(spanNum));
        var vnode2 = h('span', [8, 7, 6, 5, 4, 3, 2, 1].map(spanNum));
        var elm = createElm(vnode1);
        assert.equal(elm.children.length, 8);
        patch(vnode1, vnode2);
        assert.deepEqual(map(inner, elm.children), ['8', '7', '6', '5', '4', '3', '2', '1']);
      });
      it('something', function() {
        var vnode1 = h('span', [0, 1, 2, 3, 4, 5].map(spanNum));
        var vnode2 = h('span', [4, 3, 2, 1, 5, 0].map(spanNum));
        var elm = createElm(vnode1);
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
          var elm = createElm(vnode1);
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
        var elm = createElm(vnode1);
        assert.deepEqual(map(inner, elm.children), ['Hello']);
        patch(vnode1, vnode2);
        assert.deepEqual(map(inner, elm.children), ['Hello', 'World']);
      });
      it('handles unmoved text nodes', function() {
        var vnode1 = h('div', ['Text', h('span', 'Span')]);
        var vnode2 = h('div', ['Text', h('span', 'Span')]);
        var elm = createElm(vnode1);
        assert.equal(elm.childNodes[0].textContent, 'Text');
        patch(vnode1, vnode2);
        assert.equal(elm.childNodes[0].textContent, 'Text');
      });
      it('prepends element', function() {
        var vnode1 = h('div', [h('span', 'World')]);
        var vnode2 = h('div', [h('span', 'Hello'), h('span', 'World')]);
        var elm = createElm(vnode1);
        assert.deepEqual(map(inner, elm.children), ['World']);
        patch(vnode1, vnode2);
        assert.deepEqual(map(inner, elm.children), ['Hello', 'World']);
      });
      it('prepends element of different tag type', function() {
        var vnode1 = h('div', [h('span', 'World')]);
        var vnode2 = h('div', [h('div', 'Hello'), h('span', 'World')]);
        var elm = createElm(vnode1);
        assert.deepEqual(map(inner, elm.children), ['World']);
        patch(vnode1, vnode2);
        assert.deepEqual(map(prop('tagName'), elm.children), ['DIV', 'SPAN']);
        assert.deepEqual(map(inner, elm.children), ['Hello', 'World']);
      });
      it('removes elements', function() {
        var vnode1 = h('div', [h('span', 'One'), h('span', 'Two'), h('span', 'Three')]);
        var vnode2 = h('div', [h('span', 'One'), h('span', 'Three')]);
        var elm = createElm(vnode1);
        assert.deepEqual(map(inner, elm.children), ['One', 'Two', 'Three']);
        patch(vnode1, vnode2);
        assert.deepEqual(map(inner, elm.children), ['One', 'Three']);
      });
      it('reorders elements', function() {
        var vnode1 = h('div', [h('span', 'One'), h('div', 'Two'), h('b', 'Three')]);
        var vnode2 = h('div', [h('b', 'Three'), h('span', 'One'), h('div', 'Two')]);
        var elm = createElm(vnode1);
        assert.deepEqual(map(inner, elm.children), ['One', 'Two', 'Three']);
        patch(vnode1, vnode2);
        assert.deepEqual(map(prop('tagName'), elm.children), ['B', 'SPAN', 'DIV']);
        assert.deepEqual(map(inner, elm.children), ['Three', 'One', 'Two']);
      });
    });
    describe('event handling', function() {
      it('attaches click event handler to element', function() {
        var result = [];
        function clicked(ev) { result.push(ev); }
        var vnode = h('div', {onclick: clicked}, [
          h('a', 'Click my parent'),
        ]);
        var elm = createElm(vnode);
        elm.click();
        assert.equal(1, result.length);
      });
      it('does not attach new listener', function() {
        var result = [];
        //function clicked(ev) { result.push(ev); }
        var vnode1 = h('div', {onclick: function(ev) { result.push(ev); }}, [
          h('a', 'Click my parent'),
        ]);
        var vnode2 = h('div', {onclick: function(ev) { result.push(ev); }}, [
          h('a', 'Click my parent'),
        ]);
        var elm = createElm(vnode1);
        patch(vnode1, vnode2);
        elm.click();
        assert.equal(1, result.length);
      });
      it('does calls handler for function in array', function() {
        var result = [];
        function clicked(ev) { result.push(ev); }
        var vnode = h('div', {onclick: [clicked, 1]}, [
          h('a', 'Click my parent'),
        ]);
        var elm = createElm(vnode);
        elm.click();
        assert.deepEqual(result, [1]);
      });
      it('handles changed value in array', function() {
        var result = [];
        function clicked(ev) { result.push(ev); }
        var vnode1 = h('div', {onclick: [clicked, 1]}, [
          h('a', 'Click my parent'),
        ]);
        var vnode2 = h('div', {onclick: [clicked, 2]}, [
          h('a', 'Click my parent'),
        ]);
        var elm = createElm(vnode1);
        elm.click();
        patch(vnode1, vnode2);
        elm.click();
        assert.deepEqual(result, [1, 2]);
      });
    });
    describe('custom events', function() {
      it('calls `insert` listener', function() {
        var result = [];
        function cb(vnode) {
          assert(vnode.elm instanceof Element);
          assert.equal(vnode.elm.children.length, 2);
          result.push(vnode);
        }
        var vnode1 = h('div', [
          h('span', 'First sibling'),
          h('div', {oninsert: cb}, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
          h('span', 'Can\'t touch me'),
        ]);
        var elm = createElm(vnode1);
        assert.equal(1, result.length);
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
          h('div', {onremove: cb}, [
            h('span', 'Child 1'),
            h('span', 'Child 2'),
          ]),
        ]);
        var vnode2 = h('div', [
          h('span', 'First sibling'),
        ]);
        var elm = createElm(vnode1);
        patch(vnode1, vnode2);
        assert.equal(1, result.length);
      });
    });
  });
});
