import Component, {defineComponent} from '../../lib/Component';

const template = `
  <h1>Todo Info</h1>
  <p x-bind="name"></p>
  <button x-click="remove">remove</button>
`;
class ChildDetail extends Component {
  constructor() {
    super(template, {
      id: '',
      name: '=',
      onRemove: '&'
    });
  }
  remove() {
    this.props.onRemove(this.props.id);
  }
}

defineComponent('child-detail', ChildDetail);