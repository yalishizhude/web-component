
/**
 * functions to handle Date
 */
const now = () => new Date();

export const format = (ts, fmt) => {
  let date;
  let result = fmt;
  const timestamp = parseInt(ts);
  if(timestamp.toString().length === now().getTime().toString().length) {
    date = new Date(timestamp);
  } else if(timestamp.toString().length + 3 === now().getTime().toString().length) {
    date = new Date(timestamp * 1000);
  } else {
    console.error('时间戳格式错误');
    return;
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  result = result.replace('YYYY', year);
  result = result.replace('MM', month.toString().padStart(2, '0'));
  result = result.replace('DD', day.toString().padStart(2, '0'));
  result = result.replace('hh', hour.toString().padStart(2, '0'));
  result = result.replace('mm', minute.toString().padStart(2, '0'));
  result = result.replace('ss', second.toString().padStart(2, '0'));
  return result;
};