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
const SHORTHAND_MODULE_PROPS = ["hook", "on", ATTRS, PROPS, DATASET];
export const DOM_PROPS = ["className", "tabIndex", "id"];

// See: https://github.com/snabbdom/snabbdom/blob/master/src/vnode.ts#L21
const IGNORE_PROPS = [
  "key",
  "style",
  "class",
  "fn",
  "attachData",
  "ns",
  "args",
  "is",
  ...SHORTHAND_MODULE_PROPS
];

const forwardProp = (
  data: VNodeData,
  moduleName: string,
  key: string,
  value: any,
  prefixedKey?: string
) => {
  if (data[moduleName]) {
    data[moduleName]![key] = value;
  } else {
    data[moduleName] = { [key]: value };
  }

  // remove the old prop from vnode data
  delete data[prefixedKey || key];
};

const forwardJsxProps = (oldVNode: VNode, _vnode: VNode) => {
  const vnode = _vnode || oldVNode;

  if (!vnode.data) return;

  for (const propKey in vnode.data) {
    // ignore modules/props that don't need handling
    if (IGNORE_PROPS.includes(propKey)) {
      continue;
    }
    // forward all other props into modules
    else {
      const propValue = vnode.data[propKey];

      // forward DOM properties
      const propertyIndex = DOM_PROPS.indexOf(propKey);
      if (propertyIndex > -1) {
        forwardProp(vnode.data, PROPS, DOM_PROPS[propertyIndex], propValue);

        continue;
      }

      // check if prop instructs a module (using prefix)
      const hyphenIdx = propKey.indexOf(HYPHEN_CHAR);
      if (hyphenIdx > 0) {
        const prefix = propKey.slice(0, hyphenIdx);
        const moduleTarget =
          prefix === DATA
            ? DATA
            : SHORTHAND_MODULE_PROPS.find(
                (moduleName) => moduleName === prefix
              );

        if (moduleTarget) {
          const propName = propKey.slice(hyphenIdx + 1);

          if (moduleTarget === DATA) {
            forwardProp(
              vnode.data,
              DATASET,
              kebabToCamel(propName),
              propValue,
              propKey
            );
          } else {
            forwardProp(vnode.data, moduleTarget, propName, propValue, propKey);
          }

          continue;
        }
      }

      // forward any other props into attributes
      forwardProp(vnode.data, ATTRS, propKey, propValue);
    }
  }
};

export const jsxPropsModule: Module = {
  create: forwardJsxProps,
  update: forwardJsxProps
};
