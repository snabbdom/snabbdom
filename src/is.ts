export const array = Array.isArray;
export function primitive(s: any): boolean {
  return typeof s === 'string' || typeof s === 'number';
};
