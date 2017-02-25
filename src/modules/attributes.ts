import {VNode, VNodeData} from '../vnode';
import {Module} from './module';

const NamespaceURIs = {
  "xlink": "http://www.w3.org/1999/xlink"
};

/* Boolean attributes regexp generator (elisp)
   You can edit list of properties and re-evaluate expression

   (replace-regexp "\\(booleanAttrsRegex = \\)[^;]*;"
   (concat "\\1/^" (replace-regexp-in-string "\\\\" "" (regexp-opt '(
   "allowfullscreen" "async" "autofocus" "autoplay" "checked" "compact" "controls" "declare"
   "default" "defaultchecked" "defaultmuted" "defaultselected" "defer" "disabled" "draggable"
   "enabled" "formnovalidate" "hidden" "indeterminate" "inert" "ismap" "itemscope" "loop" "multiple"
   "muted" "nohref" "noresize" "noshade" "novalidate" "nowrap" "open" "pauseonexit" "readonly"
   "required" "reversed" "scoped" "seamless" "selected" "sortable" "spellcheck" "translate"
   "truespeed" "typemustmatch" "visible"
   ))) "$/;"))
*/

export const booleanAttrsRegex = /^(?:a(?:llowfullscreen|sync|uto(?:focus|play))|c(?:hecked|o(?:mpact|ntrols))|d(?:e(?:clare|f(?:ault(?:(?:check|(?:mu|selec)t)ed)?|er))|isabled|raggable)|enabled|formnovalidate|hidden|i(?:n(?:determinate|ert)|smap|temscope)|loop|mu(?:ltiple|ted)|no(?:href|resize|shade|validate|wrap)|open|pauseonexit|re(?:adonly|(?:quir|vers)ed)|s(?:coped|e(?:amless|lected)|ortable|pellcheck)|t(?:r(?:anslate|uespeed)|ypemustmatch)|visible)$/;

function updateAttrs(oldVnode: VNode, vnode: VNode): void {
  var key: string, cur: any, old: any, elm: Element = vnode.elm as Element,
      oldAttrs = (oldVnode.data as VNodeData).attrs,
      attrs = (vnode.data as VNodeData).attrs, namespaceSplit: Array<string>;

  if (!oldAttrs && !attrs) return;
  if (oldAttrs === attrs) return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};

  // update modified attributes, add new attributes
  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      if (!cur && booleanAttrsRegex.test(key))
        elm.removeAttribute(key);
      else {
        namespaceSplit = key.split(":");
        if (namespaceSplit.length > 1 && NamespaceURIs.hasOwnProperty(namespaceSplit[0]))
          elm.setAttributeNS((NamespaceURIs as any)[namespaceSplit[0]], key, cur);
        else
          elm.setAttribute(key, cur);
      }
    }
  }
  //remove removed attributes
  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}

export const attributesModule = {create: updateAttrs, update: updateAttrs} as Module;
export default attributesModule;
