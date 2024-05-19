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
const KEY = "key";
const HYPHEN_CHAR = "-";
const MODULE_PROPS: string[] = ["hook", "on", ATTRS, PROPS, DATASET];
const DOM_PROPS: string[] = ["className", "tabIndex", "id"];

const forwardProp = (
  data: VNodeData,
  moduleName: string,
  key: string,
  value: any
): void => {
  if (data[moduleName]) {
    data[moduleName]![key] = value;
  } else {
    data[moduleName] = { [key]: value };
  }
};

const forwardJsxProps = (oldVNode: VNode, _vnode: VNode): void => {
  const vnode: VNode = _vnode || oldVNode;
  if (!vnode.data) return;

  const data: Record<string, any> = {},
    propKeys = [];
  // preserve module values
  for (const key in vnode.data) {
    if (MODULE_PROPS.indexOf(key) > -1) {
      data[key] = vnode.data[key];
    } else {
      propKeys.push(key);
    }
  }
  for (const propKey of propKeys) {
    const propValue = vnode.data[propKey];
    // leave key unchanged
    if (propKey === KEY) continue;
    const propertyIndex = DOM_PROPS.indexOf(propKey);
    if (propertyIndex > -1) {
      forwardProp(data, PROPS, DOM_PROPS[propertyIndex], propValue);
      continue;
    }
    // check if prop instructs a module (using prefix)
    const hyphenIdx = propKey.indexOf(HYPHEN_CHAR);
    if (hyphenIdx > 0) {
      const prefix = propKey.slice(0, hyphenIdx);
      const instructedModule =
        prefix === DATA
          ? DATA
          : MODULE_PROPS.find((moduleName) => moduleName === prefix);
      if (instructedModule) {
        const postfix: string = propKey.slice(hyphenIdx + 1);
        if (instructedModule === DATA) {
          forwardProp(data, DATASET, kebabToCamel(postfix), propValue);
        } else {
          forwardProp(data, instructedModule, postfix, propValue);
        }
        continue;
      }
    }
    forwardProp(data, ATTRS, propKey, propValue);
  }

  vnode.data = data;
};

export const jsxPropsModule: Module = {
  create: forwardJsxProps,
  update: forwardJsxProps
};
