import { VNode, VNodeData } from "../vnode";
import { Module } from "./module";

export type StyleObject = Partial<Record<string, string>>;

export type VNodeStyle = {
  base?: StyleObject;
  delayed?: StyleObject;
  remove?: StyleObject;
};

const BASE = "base";
const DELAYED = "delayed";
const REMOVE = "remove";

// Bindig `requestAnimationFrame` like this fixes a bug in IE/Edge. See #360 and #409.
const raf =
  (typeof window !== "undefined" &&
    window.requestAnimationFrame.bind(window)) ||
  setTimeout;

const nextFrame = function (fn: () => void): void {
  raf(function () {
    raf(fn);
  });
};

const addStyle = (elm: HTMLElement, key: string, value: string): void => {
  if (key[0] === "-" && key[1] === "-") {
    elm.style.setProperty(key, value);
  } else {
    elm.style[key as any] = value;
  }
};

const removeStyle = (elm: HTMLElement, key: string): void => {
  if (key[0] === "-" && key[1] === "-") {
    elm.style.removeProperty(key);
  } else {
    elm.style[key as any] = "";
  }
};

const areObjectsDifferent = (a: StyleObject, b: StyleObject): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return (
    aKeys.length !== bKeys.length || aKeys.some((key) => a[key] !== b[key])
  );
};

const selectBaseStyles = (input: VNodeStyle): StyleObject => {
  const newStyles: StyleObject = {};
  // backwards compat. the root object can also be `base`
  Object.keys(input as StyleObject).forEach((key) => {
    if (key === DELAYED || key === REMOVE || key === BASE) return;
    newStyles[key] = (input as StyleObject)[key]!;
  });

  // but anything on an actual `base` property takes priority
  const base = input.base || {}
  Object.keys(base || {}).forEach((key) => {
    newStyles[key] = base[key]!;
  });

  return newStyles;
};

const find = <T>(
  input: T[],
  callback: (value: T) => boolean
): T | undefined => {
  let res: T | undefined = undefined;
  input.some((value) => {
    if (callback(value)) {
      res = value;
      return true;
    }
    return false;
  });
  return res;
};

let delayedStylesByElement: {
  elm: HTMLElement;
  queued: StyleObject;
  active: StyleObject;
}[] = [];

let frameScheduled = false;

const scheduleNextFrame = (): void => {
  if (frameScheduled) return;

  frameScheduled = true;
  nextFrame(function () {
    frameScheduled = false;

    delayedStylesByElement.forEach((stylesForElement) => {
      const { elm, queued } = stylesForElement;
      // update the active styles to match the queued ones
      // note removing styles is done synchronously
      Object.keys(queued).forEach((key) => addStyle(elm, key, queued[key]!));

      stylesForElement.active = stylesForElement.queued;
    });
  });
};

let reflowForced = false;

const updateStyle = (oldVnode: VNode, vnode: VNode): void => {
  const elm: Node | HTMLElement | undefined = vnode.elm;

  let _oldStyle = (oldVnode.data as VNodeData).style;
  let _style = (vnode.data as VNodeData).style;

  if (!elm || !(elm instanceof HTMLElement)) return;
  if (_oldStyle === _style) return;

  _oldStyle = _oldStyle || {};
  _style = _style || {};

  const style = _style || {};
  const oldStyle = _oldStyle || {};
  const newBaseStyles = selectBaseStyles(style);
  const oldBaseStyles = selectBaseStyles(oldStyle);
  const delayed = _style.delayed || {};
  const oldDelayed = _oldStyle.delayed || {};

  let _delayedStylesForElement = find(
    delayedStylesByElement,
    ({ elm: _elm }) => _elm === elm
  );
  if (!_delayedStylesForElement) {
    _delayedStylesForElement = { elm, queued: {}, active: {} };
    delayedStylesByElement.push(_delayedStylesForElement);
  }
  const delayedStylesForElement = _delayedStylesForElement;

  const stylesToAdd: StyleObject = {};
  Object.keys(newBaseStyles).forEach((key) => {
    if (newBaseStyles[key] !== oldBaseStyles[key]) {
      stylesToAdd[key] = newBaseStyles[key];
    }
  });

  // if any delayed styles are in `stylesToAdd` schedule frame so they get reset in the next frame
  Object.keys(stylesToAdd).forEach((key) => {
    if (
      delayedStylesForElement.active[key] &&
      stylesToAdd[key] !== delayedStylesForElement.active[key]
    ) {
      scheduleNextFrame();
    }
  });

  if (areObjectsDifferent(delayed, delayedStylesForElement.queued)) {
    delayedStylesForElement.queued = delayed;
    scheduleNextFrame();
  }

  const stylesToRemove: string[] = [];
  Object.keys(oldDelayed).forEach((key) => {
    if (!delayed[key]) {
      if (!newBaseStyles[key]) {
        // styles being removed from `delayed` are removed synchronously
        stylesToRemove.push(key);
      } else {
        // revert back to the base style
        stylesToAdd[key] = newBaseStyles[key];
      }
    }
  });
  Object.keys(oldBaseStyles).forEach((key) => {
    if (!newBaseStyles[key] && !delayedStylesForElement.active[key]) {
      stylesToRemove.push(key);
    }
  });

  Object.keys(stylesToAdd).forEach((key) =>
    addStyle(elm, key, stylesToAdd[key]!)
  );

  stylesToRemove.forEach((key) => removeStyle(elm, key));
};

function onDestroy(vnode: VNode): void {
  delayedStylesByElement = delayedStylesByElement.filter(
    ({ elm }) => elm !== vnode.elm
  );
}

function applyRemoveStyle(vnode: VNode, rm: () => void): void {
  const s = vnode.data?.style;
  if (!s || !s.remove || !(vnode.elm instanceof HTMLElement)) {
    rm();
    return;
  }
  if (!reflowForced) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    vnode.elm.offsetLeft;
    reflowForced = true;
  }
  const elm = vnode.elm;
  const style = s.remove;
  let amount = 0;
  const applied: string[] = [];
  Object.keys(style).forEach((key) => {
    applied.push(key);
    elm.style[key as any] = style[key]!;
  });
  const compStyle = getComputedStyle(elm);
  const props = compStyle.transitionProperty.split(", ");
  for (let i = 0; i < props.length; ++i) {
    if (applied.indexOf(props[i]) !== -1) amount++;
  }
  elm.addEventListener("transitionend", function (ev: TransitionEvent) {
    if (ev.target === elm) --amount;
    if (amount === 0) rm();
  });
}

function forceReflow() {
  reflowForced = false;
}

export const styleModule: Module = {
  pre: forceReflow,
  create: updateStyle,
  update: updateStyle,
  destroy: onDestroy,
  remove: applyRemoveStyle,
};
