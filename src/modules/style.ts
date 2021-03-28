import { VNode, VNodeData } from "../vnode";
import { Module } from "./module";

export type VNodeStyle = Record<string, string> & {
  delayed?: Record<string, string>;
  remove?: Record<string, string>;
};

// Bindig `requestAnimationFrame` like this fixes a bug in IE/Edge. See #360 and #409.
const raf =
  (typeof window !== "undefined" &&
    window.requestAnimationFrame.bind(window)) ||
  setTimeout;
const nextFrame = function (fn: any) {
  raf(function () {
    raf(fn);
  });
};
let reflowForced = false;

function setNextFrame(obj: any, prop: string, val: any): void {
  nextFrame(function () {
    obj[prop] = val;
  });
}

function updateStyle(oldVnode: VNode, vnode: VNode): void {
  let cur: any;
  let name: string;
  const elm = vnode.elm;
  let oldStyle = (oldVnode.data as VNodeData).style;
  let style = (vnode.data as VNodeData).style;

  if (!oldStyle && !style) return;
  if (oldStyle === style) return;
  oldStyle = oldStyle || {};
  style = style || {};
  const oldHasDel = "delayed" in oldStyle;

  for (name in oldStyle) {
    if (!style[name]) {
      if (name[0] === "-" && name[1] === "-") {
        (elm as any).style.removeProperty(name);
      } else {
        (elm as any).style[name] = "";
      }
    }
  }
  for (name in style) {
    cur = style[name];
    if (name === "delayed" && style.delayed) {
      for (const name2 in style.delayed) {
        cur = style.delayed[name2];
        if (!oldHasDel || cur !== (oldStyle.delayed as any)[name2]) {
          setNextFrame((elm as any).style, name2, cur);
        }
      }
    } else if (name !== "remove" && cur !== oldStyle[name]) {
      if (name[0] === "-" && name[1] === "-") {
        (elm as any).style.setProperty(name, cur);
      } else {
        (elm as any).style[name] = cur;
      }
    }
  }
}

function applyDestroyStyle(vnode: VNode): void {
  let style: any;
  let name: string;
  const elm = vnode.elm;
  const s = (vnode.data as VNodeData).style;
  if (!s || !(style = s.destroy)) return;
  for (name in style) {
    (elm as any).style[name] = style[name];
  }
}

function applyRemoveStyle(vnode: VNode, rm: () => void): void {
  const s = (vnode.data as VNodeData).style;
  if (!s || !s.remove) {
    rm();
    return;
  }
  if (!reflowForced) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (vnode.elm as any).offsetLeft;
    reflowForced = true;
  }
  let name: string;
  const elm = vnode.elm;
  let i = 0;
  const style = s.remove;
  let amount = 0;
  const applied: string[] = [];
  for (name in style) {
    applied.push(name);
    (elm as any).style[name] = style[name];
  }
  const compStyle = getComputedStyle(elm as Element);
  const props = (compStyle as any)["transition-property"].split(", ");
  for (; i < props.length; ++i) {
    if (applied.indexOf(props[i]) !== -1) amount++;
  }
  (elm as Element).addEventListener(
    "transitionend",
    function (ev: TransitionEvent) {
      if (ev.target === elm) --amount;
      if (amount === 0) rm();
    }
  );
}

function forceReflow() {
  reflowForced = false;
}

export const styleModule: Module = {
  pre: forceReflow,
  create: updateStyle,
  update: updateStyle,
  destroy: applyDestroyStyle,
  remove: applyRemoveStyle,
};
