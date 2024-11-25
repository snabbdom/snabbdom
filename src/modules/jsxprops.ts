import { VNode, VNodeData } from "../vnode";
import { Module } from "./module";

const kebabToCamel = (value: string) =>
  value
    .split("-")
    .map((word, i) =>
      i > 0
        ? word[0].toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase()
    )
    .join("");

const DATASET = "dataset";
const ATTRS = "attrs";
const PROPS = "props";
const DATA = "data";
const HYPHEN_CHAR = "-";
const SHORTHAND_MODULE_PROPS = new Set(["hook", "on", ATTRS, PROPS, DATASET]);
export const DOM_PROPS = new Set(["className", "tabIndex", "id"]);

// See: https://github.com/snabbdom/snabbdom/blob/master/src/vnode.ts#L21
const IGNORE_PROPS = new Set([
  "key",
  "style",
  "class",
  "fn",
  "attachData",
  "ns",
  "args",
  "is",
  ...SHORTHAND_MODULE_PROPS
]);

const prefixToModule: Record<string, string> = {
  [DATA]: DATASET,
  hook: "hook",
  on: "on",
  attrs: ATTRS,
  props: PROPS,
  dataset: DATASET
};

const forwardProp = (
  data: VNodeData,
  moduleName: string,
  key: string,
  value: any,
  prefixedKey?: string
) => {
  if (data[moduleName]) {
    data[moduleName][key] = value;
  } else {
    data[moduleName] = { [key]: value };
  }
  delete data[prefixedKey || key];
};

const forwardJsxProps = (oldVNode: VNode, _vnode: VNode) => {
  const vnode = _vnode || oldVNode;

  if (!vnode.data) return;

  for (const propKey in vnode.data) {
    if (IGNORE_PROPS.has(propKey)) {
      continue;
    }

    const propValue = vnode.data[propKey];

    // forward dom properties to props module
    if (DOM_PROPS.has(propKey)) {
      forwardProp(vnode.data, PROPS, propKey, propValue);
      continue;
    }

    // forward module-prefixed props to the correct object
    // e.g., `vnode.data['attrs-value']` --> `vnode.data.attrs.value`
    const hyphenIdx = propKey.indexOf(HYPHEN_CHAR);
    if (hyphenIdx > 0) {
      const prefix = propKey.slice(0, hyphenIdx);
      const moduleTarget = prefixToModule[prefix];

      if (moduleTarget) {
        const propName = propKey.slice(hyphenIdx + 1);
        forwardProp(
          vnode.data,
          moduleTarget,
          moduleTarget === DATASET ? kebabToCamel(propName) : propName,
          propValue,
          propKey
        );

        continue;
      }
    }

    // everything else treated as an attribute
    forwardProp(vnode.data, ATTRS, propKey, propValue);
  }
};

export const jsxPropsModule: Module = {
  create: forwardJsxProps,
  update: forwardJsxProps
};
