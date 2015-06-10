function insert(vnode) {
  // Placeholder has been inserted, reset the vnodes
  // element to the actual element so that updates will
  // be made to the proper element
  var attach = vnode.data.attachTo;
  vnode.elm = attach.elm;
}

function attach(_, vnode) {
  var data = vnode.data, target = data.attachTo;
  if (target === undefined) return;
  var elm = vnode.elm;
  var placeholder = document.createElement('span');
  // Replace actual element with dummy placeholder
  // Snabbdom will then insert placeholder instead
  vnode.elm = placeholder;
  target.appendChild(elm);
  if (vnode.data.hook === undefined) vnode.data.hook = {};
  data.attachTo = {target: target, placeholder: placeholder, elm: elm};
  var hook = vnode.data.hook;
  hook.insert = insert;
}

function destroy(vnode) {
  var attach = vnode.data.attachTo;
  if (attach === undefined) return;
  // Manually remove the actual element from where it was inserted
  attach.target.removeChild(attach.elm);
  // Replace actual element with the dummy
  // placeholder so that Snabbdom removes it
  vnode.elm = attach.placeholder;
}

module.exports = {create: attach, destroy: destroy};
