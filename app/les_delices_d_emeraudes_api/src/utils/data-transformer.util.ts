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
      ? key.replace(/_([0-9a-zA-Z])/g, (_, c) => {
          // if the captured char is a digit, keep it as-is (remove underscore);
          // if it's a letter, uppercase it to form camelCase.
          return /[0-9]/.test(c) ? c : c.toUpperCase();
        })
      : key;

    newObj[camelKey] = toCamel(obj[key]);
  }

  return newObj;
}

/* transforms camelCase keys to snake_case recursively in an object or array. Leaves non-object values unchanged.
*/
export function toSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => toSnake(item));
  }

  const newObj: any = {};

  for (const key in obj) {
    // Preserve digits and insert underscores before uppercase letters.
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = toSnake(obj[key]);
  }

  return newObj;
}