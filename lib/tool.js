/**
 * tool functions to handle data,like array
 */

export const forEach = (domList, cb) => {
  if (domList) {
    Array.prototype.forEach.call(domList, cb);
  } else {
    console.warn('%s is not a array!', domList);
  }
};

export const pluck = (list = [], property) => {
  const result = [];
  forEach(list, item => {
    result.push(item[property]);
  });
  return result;
};