export const array = Array.isArray;
export function primitive(s: any): s is (string | number) {
  return typeof s === 'string' || typeof s === 'number';
}
