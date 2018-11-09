/**
 * list component
 * it can help repeat elements and components.
 */
import { attr, on } from './dom';
import { forEach } from './tool';
import Component, { defineComponent } from './Component';

const template = `
<ul>
  <slot style="display:none"></slot>
</ul>
`;
/**
 * to render repeat components and elements
 * 
 * x-key: to identify list item which must be unique.
 * list:  parent component's state property name which must be an array.
 * x-bind: bind item's property.
 * x-class: bind element's class by item's property.
 * x-click: bind parent's state method.
 * 
 * example:
 * <x-list x-key="id" list="myList">
 *   <li x-class="item.className" x-bind="item.name" x-click="fun"></li>
 * </x-list>
 */
class XList extends Component {
  constructor() {
    super(template, {
      list: (value = []) => {
        const key = attr(this, 'x-key');
        const _list = this._p_list || [];
        forEach(value, item => {
          const existItem = _list.filter(obj => key === 'item' ? obj === item : obj[key] === item[key]);
          if (existItem.length > 1) {
            console.error('duplicate item:%s', JSON.stringify(existItem));
          } else if (existItem.length === 1) {
            this.updateNode(existItem[0], this.qs(`[x-key="${key==='item' ? item : item[key]}"]`));
          } else {
            this.addNode(item);
          }
        });
        forEach(_list, item => {
          const items = value.filter(obj => key === 'item' ? obj === item : obj[key] === item[key]);
          if (items.length === 0) this.deleteNode(this.qs(`[x-key="${key==='item' ? item : item[key]}"]`));
        });
        this.qs('ul').appendChild(this._style);
      }
    });
    if (this.qs('slot').assignedNodes().length > 0) {
      const contentNode = this.qs('slot').assignedNodes()[1];
      this._content = contentNode.cloneNode(true);
      this._style = document.createDocumentFragment();
      contentNode.parentElement.removeChild(contentNode);
      forEach(this.qs('slot').assignedNodes(), node => {
        node.tagName === 'LINK' ? this.appendChild(node.cloneNode(true)) : void 0;
        node.tagName === 'STYLE' ? this._style = node : void 0;
      });
      this.qs('ul').classList = this.classList;
    } else {
      console.warn('This is an empty list!');
    }
  }
  updateNode(item, wrapper, isFragment) {
    if (wrapper) {
      let xClass = wrapper.querySelectorAll('[x-class]');
      let xBind = wrapper.querySelectorAll('[x-bind]');
      const components = wrapper.querySelectorAll(this.getComponentsName().join(',')) || [];
      if (!isFragment && wrapper.getAttribute('x-class')) {
        xClass = [...xClass, wrapper];
      }
      forEach(xBind, dom => {
        const property = attr(dom, 'x-bind');
        dom.textContent = property === 'item' ? item : item[property.split('.').pop()];
      });
      forEach(xClass, dom => {
        console.log(dom.initClass, dom.classList);
        dom.initClass = dom.initClass || Array.prototype.join.call(dom.classList, ' ');
        const property = attr(dom, 'x-class');
        const className = property === 'item' ? item : item[property.split('.').pop()] || '';
        dom.setAttribute('class', dom.initClass + ' ' + className);
      });
      forEach(components, cmp => {
        const props = this.getComponentProps(cmp.tagName.toLowerCase());
        forEach(props, p => {
          const property = attr(cmp, p);
          cmp.props[p] = item[property.replace('item.', '')];
        });
      });
    } else {
      console.error('no wrapper:', wrapper);
    }
  }
  deleteNode(node) {
    if (node) {
      node.parentElement.removeChild(node);
    } else {
      console.error('Cannot delete node', node);
    }
  }
  addNode(item, index) {
    const key = attr(this, 'x-key');
    const fragment = document.createDocumentFragment();
    const li = this._content.cloneNode(true);
    fragment.appendChild(li);
    attr(li, 'x-key', key==='item' ? item : item[key] || index);
    // bind event
    forEach(fragment.querySelectorAll('[x-click]'), dom => {
      const property = attr(dom, 'x-click');
      on('click', dom, event => {
        this.parent[property] && this.parent[property].call(this.parent, item, event, index);
      });
    });
    this.updateNode(item, fragment, true);
    this.qs('ul').appendChild(fragment);
  }
}

defineComponent('x-list', XList);