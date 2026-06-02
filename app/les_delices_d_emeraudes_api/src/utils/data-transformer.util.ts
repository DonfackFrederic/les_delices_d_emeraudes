/* transforms snake_case keys to camelCase recursively in an object or array. Leaves non-object values unchanged. 
*/
export function toCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    const result = new Array(obj.length);
    for (let i = 0; i < obj.length; i++) {
      result[i] = toCamel(obj[i]);
    }
    return result;
  }

  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.indexOf('_') > -1
      ? key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
      : key;

    newObj[camelKey] = obj[key];
  }

  return newObj;
}

/* transforms camelCase keys to snake_case recursively in an object or array. Leaves non-object values unchanged.
*/
export function toSnake(obj: any): any {
  const newObj: any = {};

  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }

  return newObj;
}