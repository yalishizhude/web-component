const dispatcher = {};

export const on = (name, cb) => {
  dispatcher[name] = dispatcher[name] || [];
  const key = Math.random().toString(26).substring(2, 10);
  dispatcher[name].push({
    key,
    fn: cb
  });
  return key;
};

export const emit = function(name, data) {
  const dispatchers = dispatcher[name] || [];
  dispatchers.forEach(dp => {
    dp.fn(data, this);
  });
};

export const un = (name, key) => {
  const list = dispatcher[name] || [];
  const index = list.findIndex(item => item.key === key);
  if(index > -1) {
    list.splice(index, 1);
    return true;
  } else {
    return false;
  }
};