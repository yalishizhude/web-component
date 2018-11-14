基于**web components**`shadow dom`、`template`、`custom element`三大技术实现的**无模块依赖**demo。

# 实现功能

## 零依赖
源代码不依赖任何第三方库。

![package.json](,/image/node_modules.png)

## 数据绑定

单向绑定
```
// 模板
<p x-bind="a"></p>

// 组件
this.state.a = 'abc'; // => <p x-bind="a">abc</p>
```

双向绑定
```
<input x-model="ipt" />
<p x-bind="ipt"></p>
```

## 事件绑定

```
// 模板
<button x-click="done">done</button>

// 组件
class extends Component {
  done() {
    ...
  }
}
```

## 父子组件传参

父组件 => 子组件
```
// 父组件模板
<child-component create-time="time"></child-component>
// 父组件
class extends Component {
  constructor() {
    this.state.time = new Date();
  }
}

// 子组件
class extends Component {
  constructor(){
    super(template, {
      createTime: ''
    });
  }
}
```

子组件 => 父组件
```
// 父组件模板
<child-component on-select="select"></child-component>
// 父组件
class extends Component {
  select(data) {
    ...
  }
}

// 子组件
class extends Component {
  constructor(){
    super(template, {
      onSelecet: '&'
    });
    ...
    this.props.onSelect(data);
  }
}
```

## 事件总线

```
// component a

emit('eventName', data);

// component b
on('eventName', data => {
  ...
});
```

## 列表

```
// 组件模板
<x-list list="projects" x-key="item.id">
  <li class="a" x-click="click" x-bind="item.name">
  </li>
  <style>
    .a {
      color: red;
    }
  </style>
</x-list>

// 组件
class extends Component {
  constuctor() {
    super(template, {}, {
      projects: [{id: 1, name: 'ysl'}]
    });
  }
  click(item) {
    ...
  }
}
```

# 如何上手

## 如何启动项目

确保已全局安装`yarn`模块。

`yarn install --check-files`

开发模式，访问端口 3388:

`yarn start`

编译代码，生成代码在dist目录下：

`yarn build`

## 如何开发组件

组件编写示例如下：

```
import Component, { defineComponent } from '../lib/Component';
const template = `
// 当元素被点击时调用 this.click 函数
// this.state.text 变化时自动填充到div文本中
<div x-click="click" x-bind="text"></div>
// 双向数据绑定，this.state.ipt
<input x-model="ipt"></input>
// 列表组件，列表值为 this.state.dataList，主键为列表元素的id属性
<x-list list="dataList" x-key="item.id">
  // 样式为列表元素的className属性，标签内容绑定列表元素的name属性，并绑定点击事件 this.itemClick
  <li x-class="item.className" x-bind="item.name" x-click="itemClick">
  </li>
</x-list>
<style>
...
</style>
`;
class xx extends Component {
  constructor() {
    super(
      template, // 组件模板，包括元素和样式
      { // 组件属性
        a: '=', // a 属性接收父组件传来的参数，并与 this.state.a 保持同步。
        b: value => { // 当a属性值发生变化时触发该函数，value 为传来的最新值。
          ...
        },
        c: '&' // c 属性接收父组件传来的回调函数名称
      }, { // 组件状态
        c: 1,  // this.state.c 的初始值为 1
        d: value => {  // 当 this.state.d 被赋值时调用该函数
          ... 
        }
      }
    )
  }
  click(event) {
    ...
  }
  itemClick(item) {
    ...
  }
}
```

## 如何扩展功能

如果是扩展工具函数，应该是在tool.js中修改代码，如果是组件的修改是Component.js。
其中比较复杂的是`Component.js`和`xList.js`。

**Component.js说明**
web component是基于shadow dom实现的，所以Component类首先是初始化shadowRoot，并在此之上构建操作dom。
通过传入的组件模板字符串，构建生成组件内容。
之后对组件本身进行初始化，比如将组件根元素属性添加到`this.attr`属性（主要是为了访问父组件对应的函数）。
初始化props属性。通过`Object.defineProperty`来监听`this.props`对象属性值的变化来进行操作。
初始化state属性。遍历组件元素，将元素内容与`this.state`对象属性进行绑定。
初始化事件绑定。遍历组件元素，将元素事件与组件方法绑定。


**xList.js说明**
 
 xList是一个公用组件，原理是通过slot标签动态插入元素（组件），并根据传入的数组内容将这些元素（组件）进行复制和更新。*注意：数组的push操作不会触发更新，同时也不支持元素调换顺序这种操作。*

 由于xList拥有独立的作用域，和其它组件的编译方式会不一样，所以内部含有大量的dom操作，并且对数据/事件绑定操作有自己的实现逻辑。而其它自定义组件不需要操作dom。


# 代码结构

```
- dist                      // 编译后生成的可部署代码，包含map文件
- node_modules              // 编译时所依赖的node模块
- src                       // 源代码
  - lib                     // 公用代码
    - bus.js                // 事件总线，事件模式跨组件、全局传递数据
    - Component.js          // 所有组件基类
    - date.js               // 时间工具函数
    - dom.js                // dom工具函数
    - qwebchannel.js        // qt库，为了解决文件上传时不能读取本地路径的问题
    - request.js            // 用来发送http请求
    - tool.js               // 一些用来操作数据的工具函数
    - xList.js              // 列表组件
  - index                   // index页面所有组件以及图片
  - common.css              // 公用样式
  - index.html              // index页面
  ...
- docker-compose.yaml       // docker-compose 配置文件
- package.json              // npm配置文件
- readme.md                 // 项目说明文档
- webpack.common.js         // webpack公共配置文件
- webpack.dev.js            // webpack开发环境配置文件
- webpack.prod.js           // webpack生产环境配置文件
- yarn.lock                 // yarn配置文件
- package-shrinkwrap.json   // npm配置文件
```

# 架构思想

[《抛开 Vue、React、JQuery 这类第三方js，我们该怎么写代码？》](https://yalishizhude.github.io/2018/11/14/web-components/)