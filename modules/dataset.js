function updateDataset(oldVnode, vnode) {
  var elm = vnode.elm,
    oldDataset = oldVnode.data.dataset || {},
    dataset = vnode.data.dataset || {},
    key

  for (key in oldDataset) {
    if (!dataset[key]) {
      delete elm.dataset[key];
    }
  }
  for (key in dataset) {
    if (oldDataset[key] !== dataset[key]) {
      elm.dataset[key] = dataset[key];
    }
  }
}

module.exports = {create: updateDataset, update: updateDataset}
