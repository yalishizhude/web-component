/**
 * simple function to send HTTP request
 */
const send = (method, url, data = {}, config = {}) => {
  const req = new XMLHttpRequest();
  return new Promise((res, rej) => {
    req.onreadystatechange = () => {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status === 200) {
          try {
            const result = JSON.parse(req.response);
            res(result.data);
          } catch (e) {
            console.error(e);
            res(req.response);
          }
        } else {
          try {
            const obj = JSON.parse(req.response);
            const {
              data = {}
            } = obj;
            rej(data.msg || obj.msg);
          } catch (e) {
            rej(req.responseText);
          }
        }
      }
    };
    req.open(method, url);
    const { header = {} } = config;
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    for (const p in header) {
      req.setRequestHeader(p, header[p]);
    }
    req.send(JSON.stringify(data));
  });
};

export const get = (url, config) => send('GET', url, null, config);
export const post = (url, data, config) => send('POST', url, data, config);
export const put = (url, data, config) => send('PUT', url, data, config);
export const del = (url, config) => send('DELETE', url, config);