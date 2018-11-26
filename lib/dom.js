/**
 * functions to handle dom
 */

export const qs = (selector, dom = document) => {
  return dom.querySelector(selector);
};
export const qsa = (selector, dom = document) => {
  return dom.querySelectorAll(selector);
};
export const qsl = (dom = document, ...selector) => {
  const domList = [];
  selector.forEach(s => {
    domList.push(dom.querySelector(s));
  });
  return domList;
};

export const on = (eventName, dom, cb) => {
  let dm = dom;
  const event = 'string' === typeof eventName ? [eventName] : eventName;
  if (typeof dom === 'string') {
    dm = qsa(dom);
  }
  if (dm.length) {
    dm.forEach(d => {
      event.forEach(e => {
        d.addEventListener(e, cb);
      });
    });
  } else {
    event.forEach(e => {
      dm.addEventListener(e, cb);
    });
  }
};

export const ce = (tagName, attr = {}, dom = document) => {
  const element = dom.createElement(tagName);
  for (const p in attr) {
    element.setAttribute(p, attr[p]);
  }
  return element;
};

export const attr = (dom, propertyName, value) => {
  if (undefined !== value) {
    dom.setAttribute && dom.setAttribute(propertyName, value);
  } else {
    return dom.getAttribute(propertyName);
  }
};

export const cc = (tagName, props = {}) => {
  const component = ce(tagName);
  for (const p in props) {
    component.props[p] = props[p];
  }
  return component;
};