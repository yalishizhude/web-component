'use strict';
import { attr, ce, on } from './dom.js';
import { forEach } from './tool';

/**
 * Component base class
 * Every component must extend this
 * props: component props to receive param, support object and array, function.
 *   eg:
 *   // parent-component
 *   ...
 *   this.state.name = 'xxx';
 *   <!-- parent-component>
 *   <child-component hello="name">
 *   ...
 *   // child-component
 *   this.props.hello; // 'xxx'
 * 
 * state: to bind data and event for component.support directives:
 *   x-bind  auto fill element's textContent.
 *   x-model auto fill element's value and sync value to state.
 *   x-show  element is visible when state's param value is true.
 *   x-hide  element is invisible when state's param value is true.
 *   x-class auto fill element's class.
 *   x-src   auto fill element's 'src' attribute
 *   eg:
 *   // component-a
 *   this.state.name = 'xxx';
 *   <!-- component-a -->
 *   <p x-bind="name"></p> // <p x-bind="name">xxx</p>
 */
export default class Component extends HTMLElement {
  constructor(template, props = {}, state = {}) {
    super();
    if (!template) {
      console.warn("Template can't be null!");
    }
    const shadow = this.attachShadow({
      mode: 'open'
    });
    let tmp;
    tmp = ce('template');
    tmp.innerHTML = template;
    tmp.innerHTML = '<link href="common.css" rel="stylesheet"/>' + tmp.innerHTML;
    const node = tmp.content.cloneNode(true);
    shadow.appendChild(node);
    this._initAttr();
    this._initProps(props);
    this._initState(state);
    this._xEventBinding();
  }
  // tool functions
  appendChild(dom) {
    this.shadowRoot.appendChild(dom);
  }
  qs(selector) {
    return this.shadowRoot.querySelector(selector);
  }
  qsa(selector) {
    return this.shadowRoot.querySelectorAll(selector) || [];
  }
  on(eventName, selector, cb) {
    on(eventName, this.shadowRoot.querySelector(selector), cb);
  }
  onPropsChange(newProps, oldProps) {
    // Implemented method if your component need it
  }
  /**
   * watch a prop when changed to be called
   * @param {string} property prop name
   * @param {function(newProp)} cb callback function
   */
  watch(property, cb) {
    this.dispatcher[property] = this.dispatcher[property] || [];
    this.dispatcher[property].push(cb);
  }
  // to get component tag name
  getComponentProps(name) {
    return components[name];
  }
  getComponentsName() {
    return Object.keys(components);
  }
  // initial attribute
  _initAttr() {
    this.attr = {};
    this.getAttributeNames().forEach(name => {
      this.attr[name] = this.getAttribute(name);
    });
  }
  // initial functions
  _initProps(props = {}) {
    this._props = props;
    this.props = {};
    const prefix = '_p_';
    for (const p in props) {
      if(props[p] !== '&') {
        Object.defineProperty(this.props, p, {
          get: () => {
            return this[prefix + p];
          },
          set: value => {
            if (props[p] === '=') {
              this.state[p] = value;
            } else if ('function' === typeof props[p]) {
              props[p](value);
            }
            const oldProps = { ...this.props };
            this[prefix + p] = value;
            this.onPropsChange(this.props, oldProps);
          }
        });
      }
    }
  }
  _initState(state) {
    this.state = {};
    this.dispatcher = {};
    const dataBinding = dom => {
      if (['INPUT', 'TEXTAREA'].indexOf(dom.tagName) > -1) {
        dom.addEventListener('input', e => {
          this.state[attr(dom, 'x-model')] = e.target.value;
        });
      } else if (['SELECT'].indexOf(dom.tagName) > -1) {
        dom.addEventListener('change', e => {
          this.state[attr(dom, 'x-model')] = e.target.value;
        });
      }
    };
    const defineProperty = p => {
      const prefix = '_s_';
      Object.defineProperty(this.state, p, {
        get: () => {
          return this[prefix + p];
        },
        set: value => {
          if(this[prefix + p] !== value) {
            this.dispatcher[p].forEach(fun => fun(value, this[prefix + p]));
            this[prefix + p] = value;
          }
        }
      });
    };
    const map = {
      'x-hide'(value) {
        this.style.display = value ? 'none' : '';
      },
      'x-show'(value) {
        this.style.display = value ? '' : 'none';
      },
      'x-bind'(value) {
        this.textContent = undefined === value ? '' : value;
      },
      'x-model'(value) {
        this.value = undefined === value ? '' : value;
      },
      'x-class'(value) {
        this.classList.add(value);
      },
      'x-src'(value) {
        this.setAttribute('src', value);
      }
    };
    // get component props bind state
    const componentSelector = this.getComponentsName();
    componentSelector.forEach(sel => {
      forEach(this.qsa(sel), cmp => {
        const props = this.getComponentProps(sel);
        // for x-list
        cmp.parent = this;
        for(const p in props) {
          const prop = p.replace(/[A-Z]/g, s => '-' + s.toLowerCase());
          const property = attr(cmp, prop);
          if(props[p] === '&') {
            // callback
            if(cmp.props && this[property]) {
              cmp.props[p] = this[property].bind(this);
            }
          } else {
            // property value
            this.dispatcher[property] = this.dispatcher[property] || [];
            this.dispatcher[property].push(value => cmp.props ? cmp.props[p] = value : void 0);
          }
        }
      });
    });
    for (const p in map) {
      forEach(this.qsa(`[${p}]`), dom => {
        const property = attr(dom, p).split('.').shift();
        this.dispatcher[property] = this.dispatcher[property] || [];
        const fn = map[p].bind(dom);
        fn(this.state[property]);
        this.dispatcher[property].push(fn);
        if (p === 'x-model') {
          dataBinding(dom);
        }
      });
    }
    for (const property in this.dispatcher) {
      defineProperty(property);
    }
    for (const p in state) {
      if(typeof state[p] === 'function') {
        Object.getOwnPropertyNames(this.state).indexOf(p) < 0 && defineProperty(p);
        this.dispatcher[p] = this.dispatcher[p] || [];
        this.dispatcher[p].push(state[p]);
      } else {
        this.state[p] = state[p];
      }
    }
  }
  _xEventBinding() {
    const map = ['x-click', 'x-keyup', 'x-change'];
    map.forEach(event => {
      forEach(this.qsa(`[${event}]`), dom => {
        const property = attr(dom, event);
        const fnName = property.split('(')[0];
        const params = property.indexOf('(') > 0 ? property.replace(/.*\((.*)\)/, '$1').split(',') : [];
        let args = [];
        params.forEach(param => {
          const p = param.trim();
          const str = p.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');
          if (str !== p) { // string
            args.push(str);
          } else if (p === 'true' || p === 'false') { // boolean
            args.push(p === 'true');
          } else if (!isNaN(p)) {
            args.push(p * 1);
          } else {
            args.push(this.state[p]);
          }
        });
        on(event.replace('x-', ''), dom, e => {
          this[fnName](...params, e);
        });
      });
    });
  }
}
const components = {};
/**
 * register a component
 * @param {string} name tag name
 * @param {class} componentClass extends Component class
 */
export const defineComponent = (name, componentClass) => {
  customElements.define(name, componentClass);
  const cmp = new componentClass();
  components[name] = cmp._props || {};
};