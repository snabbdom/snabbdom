(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.snabbdom_eventlisteners = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  array: Array.isArray,
  primitive: function(s) { return typeof s === 'string' || typeof s === 'number'; },
};

},{}],2:[function(require,module,exports){
var is = require('../is');

function arrInvoker(arr) {
  return function() {
    if (!arr.length) return;
    // Special case when length is two, for performance
    arr.length === 2 ? arr[0](arr[1]) : arr[0].apply(undefined, arr.slice(1));
  };
}

function fnInvoker(o) {
  return function(ev) { 
    if (o.fn === null) return;
    o.fn(ev); 
  };
}

function updateEventListeners(oldVnode, vnode) {
  var name, cur, old, elm = vnode.elm,
      oldOn = oldVnode.data.on, on = vnode.data.on;

  if (!on && !oldOn) return;
  on = on || {};
  oldOn = oldOn || {};

  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    if (old === undefined) {
      if (is.array(cur)) {
        elm.addEventListener(name, arrInvoker(cur));
      } else {
        cur = {fn: cur};
        on[name] = cur;
        elm.addEventListener(name, fnInvoker(cur));
      }
    } else if (is.array(old)) {
      // Deliberately modify old array since it's captured in closure created with `arrInvoker`
      old.length = cur.length;
      for (var i = 0; i < old.length; ++i) old[i] = cur[i];
      on[name]  = old;
    } else {
      old.fn = cur;
      on[name] = old;
    }
  }
  if (oldOn) {
    for (name in oldOn) {
      if (on[name] === undefined) {
        var old = oldOn[name];
        if (is.array(old)) {
          old.length = 0;
        }
        else {
          old.fn = null;
        }
      }
    }
  }
}

module.exports = {create: updateEventListeners, update: updateEventListeners};

},{"../is":1}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpcy5qcyIsIm1vZHVsZXMvZXZlbnRsaXN0ZW5lcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXJyYXk6IEFycmF5LmlzQXJyYXksXG4gIHByaW1pdGl2ZTogZnVuY3Rpb24ocykgeyByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJzsgfSxcbn07XG4iLCJ2YXIgaXMgPSByZXF1aXJlKCcuLi9pcycpO1xuXG5mdW5jdGlvbiBhcnJJbnZva2VyKGFycikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFhcnIubGVuZ3RoKSByZXR1cm47XG4gICAgLy8gU3BlY2lhbCBjYXNlIHdoZW4gbGVuZ3RoIGlzIHR3bywgZm9yIHBlcmZvcm1hbmNlXG4gICAgYXJyLmxlbmd0aCA9PT0gMiA/IGFyclswXShhcnJbMV0pIDogYXJyWzBdLmFwcGx5KHVuZGVmaW5lZCwgYXJyLnNsaWNlKDEpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZm5JbnZva2VyKG8pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGV2KSB7IFxuICAgIGlmIChvLmZuID09PSBudWxsKSByZXR1cm47XG4gICAgby5mbihldik7IFxuICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVFdmVudExpc3RlbmVycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIG5hbWUsIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXG4gICAgICBvbGRPbiA9IG9sZFZub2RlLmRhdGEub24sIG9uID0gdm5vZGUuZGF0YS5vbjtcblxuICBpZiAoIW9uICYmICFvbGRPbikgcmV0dXJuO1xuICBvbiA9IG9uIHx8IHt9O1xuICBvbGRPbiA9IG9sZE9uIHx8IHt9O1xuXG4gIGZvciAobmFtZSBpbiBvbikge1xuICAgIGN1ciA9IG9uW25hbWVdO1xuICAgIG9sZCA9IG9sZE9uW25hbWVdO1xuICAgIGlmIChvbGQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGlzLmFycmF5KGN1cikpIHtcbiAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgYXJySW52b2tlcihjdXIpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1ciA9IHtmbjogY3VyfTtcbiAgICAgICAgb25bbmFtZV0gPSBjdXI7XG4gICAgICAgIGVsbS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGZuSW52b2tlcihjdXIpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzLmFycmF5KG9sZCkpIHtcbiAgICAgIC8vIERlbGliZXJhdGVseSBtb2RpZnkgb2xkIGFycmF5IHNpbmNlIGl0J3MgY2FwdHVyZWQgaW4gY2xvc3VyZSBjcmVhdGVkIHdpdGggYGFyckludm9rZXJgXG4gICAgICBvbGQubGVuZ3RoID0gY3VyLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2xkLmxlbmd0aDsgKytpKSBvbGRbaV0gPSBjdXJbaV07XG4gICAgICBvbltuYW1lXSAgPSBvbGQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZC5mbiA9IGN1cjtcbiAgICAgIG9uW25hbWVdID0gb2xkO1xuICAgIH1cbiAgfVxuICBpZiAob2xkT24pIHtcbiAgICBmb3IgKG5hbWUgaW4gb2xkT24pIHtcbiAgICAgIGlmIChvbltuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBvbGQgPSBvbGRPbltuYW1lXTtcbiAgICAgICAgaWYgKGlzLmFycmF5KG9sZCkpIHtcbiAgICAgICAgICBvbGQubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBvbGQuZm4gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2NyZWF0ZTogdXBkYXRlRXZlbnRMaXN0ZW5lcnMsIHVwZGF0ZTogdXBkYXRlRXZlbnRMaXN0ZW5lcnN9O1xuIl19
