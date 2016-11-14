export interface DOMAPI {
  createElement: (tagName: any) => HTMLElement;
  createElementNS: (namespaceURI: string, qualifiedName: string) => Element;
  createTextNode: (text: string) => Text;
  insertBefore: (parentNode: Node, newNode: Node, referenceNode: Node | null) => void;
  removeChild: (node: Node, child: Node) => void;
  appendChild: (node: Node, child: Node) => void;
  parentNode: (node: Node) => HTMLElement;
  nextSibling: (node: Node) => Node;
  tagName: (elm: Element) => string;
  setTextContent: (node: Node, text: string | null) => void;
}

function createElement(tagName: any): HTMLElement {
  return document.createElement(tagName);
}

function createElementNS(namespaceURI: string, qualifiedName: string): Element {
  return document.createElementNS(namespaceURI, qualifiedName);
}

function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

function insertBefore(parentNode: Node, newNode: Node, referenceNode: Node | null): void {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild(node: Node, child: Node): void {
  node.removeChild(child);
}

function appendChild(node: Node, child: Node): void {
  node.appendChild(child);
}

function parentNode(node: Node): HTMLElement {
  return node.parentElement;
}

function nextSibling(node: Node): Node {
  return node.nextSibling;
}

function tagName(elm: Element): string {
  return elm.tagName;
}

function setTextContent(node: Node, text: string | null): void {
  node.textContent = text;
}

export const htmlDomApi = {
  createElement,
  createElementNS,
  createTextNode,
  insertBefore,
  removeChild,
  appendChild,
  parentNode,
  nextSibling,
  tagName,
  setTextContent,
} as DOMAPI;
export default htmlDomApi;