import {VNode, VNodeData} from '../vnode';
import {Module} from './module';

function updateDataset(oldVnode: VNode, vnode: VNode): void {
  var elm: HTMLElement = vnode.elm as HTMLElement,
    oldDataset = (oldVnode.data as VNodeData).dataset,
    dataset = (vnode.data as VNodeData).dataset,
    key: string;

  if (!oldDataset && !dataset) return;
  oldDataset = oldDataset || {};
  dataset = dataset || {};

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

export const datasetModule = {create: updateDataset, update: updateDataset} as Module;
export default datasetModule;