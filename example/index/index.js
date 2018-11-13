import Component, {defineComponent} from '../../lib/Component';
import '../../lib/xList';
import './common.css';

const template = `
<input x-model="name" />
<button x-click="add">+ Add todo</button>
<h1> todo list </h1>
<x-list list="todoList" x-key="id">
  <li x-click="check">
    <span class="va-m checkbox"></span>
    <span class="va-m" x-bind="item.text"></span>
    <span class="va-m remove" x-click="remove">x</span>
  </li>
  <link href="/common.css" rel="stylesheet"/>
  <style>
    .checkbox {
      display: inline-block;
      border: 1px solid #ccc;
      width: 15px;
      height: 15px;
    }
    .remove {
      margin-left: 20px;
      cursor: pointer;
      color: red;
    }
  </style>
</x-list>
</x-list>
<h1> done list </h1>
<x-list list="doneList" x-key="id">
  <li x-click="uncheck">
    <span class="va-m checkbox"></span>
    <del class="va-m" x-bind="item.text"></del>
    <span class="va-m remove" x-click="remove">x</span>
  </li>
  <link href="/common.css" rel="stylesheet"/>
  <style>
    .remove {
      margin-left: 20px;
      cursor: pointer;
      color: red;
    }
    .checkbox {
      background-color: #666;
      display: inline-block;
      border: 1px solid #ccc;
      width: 15px;
      height: 15px;
    }
  </style>
</x-list>
`;

class RootComponent extends Component {
  constructor() {
    super(template, {}, {
      list: value => {
        this.state.todoList = value.filter(item => !item.isDone);
        this.state.doneList = value.filter(item => item.isDone);
        console.log('todoList:', this.state.todoList, 'doneList:', this.state.doneList);
      }
    });
  }
  add() {
    const { list = [] } = this.state;
    this.state.list = [...list, {id: Math.random(), text: this.state.name}];
    this.state.name = '';
  }
  check(item) {
    const { list } = this.state;
    this.state.list = list.map(it => {
      it.id === item.id ? it.isDone = true : void 0;
      return it;
    });
  }
  uncheck(item) {
    const { list } = this.state;
    this.state.list = list.map(it => {
      it.id === item.id ? it.isDone = false : void 0;
      return it;
    });
  }
  remove(item, e) {
    e.stopPropagation();
    const list = [...this.state.list];
    const index = list.findIndex(it => it.id === item.id);
    list.splice(index, 1);
    this.state.list = list;
  }
}

defineComponent('root-component', RootComponent);