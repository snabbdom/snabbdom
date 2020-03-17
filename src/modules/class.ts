import { VNode, VNodeData } from '../vnode';
import { Module } from './module';

export type Classes = Record<string, boolean>;

function updateClass (oldVnode: VNode, vnode: VNode): void {
  var cur: any;
  var name: string;
  var elm: Element = vnode.elm as Element;
  var oldClass = (oldVnode.data as VNodeData).class;
  var klass = (vnode.data as VNodeData).class;

  if (!oldClass && !klass) return;
  if (oldClass === klass) return;
  oldClass = oldClass || {};
  klass = klass || {};

  for (name in oldClass) {
    if (!klass[name]) {
      elm.classList.remove(name);
    }
  }
  for (name in klass) {
    cur = klass[name];
    if (cur !== oldClass[name]) {
      (elm.classList as any)[cur ? 'add' : 'remove'](name);
    }
  }
}

export const classModule: Module = { create: updateClass, update: updateClass };
export default classModule;
