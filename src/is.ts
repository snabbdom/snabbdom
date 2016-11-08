export = {
  array: Array.isArray,
  primitive: function primitive(s: any): boolean {
    return typeof s === 'string' || typeof s === 'number';
  },
};
