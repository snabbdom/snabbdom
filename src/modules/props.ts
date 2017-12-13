import {VNode, VNodeData} from '../vnode';
import {Module} from './module';

export type Props = Record<string, any>;

function updateProps(oldVnode: VNode, vnode: VNode): void {
  var key: string, cur: any, old: any, elm = vnode.elm,
      oldProps = (oldVnode.data as VNodeData).props,
      props = (vnode.data as VNodeData).props;

  if (!oldProps && !props) return;
  if (oldProps === props) return;
  oldProps = oldProps || {};
  props = props || {};

  for (key in oldProps) {
    if (!props[key]) {
      delete (elm as any)[key];
    }
  }
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== 'value' || (elm as any)[key] !== cur)) {
      if(key === 'className') {
        var oldClasses = old ? old.split(' ').sort() : [];
        var classes = cur ? cur.split(' ').sort() : [];
        var i1 = 0, i2 = 0;
        for(var i = 0; i < Math.max(oldClasses.length, classes.length); i++) {
          var c1 = oldClasses[i1], c2 = classes[i2];
          if(c1 !== c2) {
            if(c1 < c2) {
              (elm as any).classList.remove(c1);
              i1++;
            } else {
              (elm as any).classList.add(c2);
              i2++;
            }
          } else {
            i1++;
            i2++;
          }
        }
      } else {
        (elm as any)[key] = cur;
      }
    }
  }
}

export const propsModule = {create: updateProps, update: updateProps} as Module;
export default propsModule;
