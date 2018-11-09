
# 项目背景
gtx.one 一体机项目前端代码。
该项目以混合桌面应用的形式运行于qt软件中，同时需要启动web服务器提供服务。
qt的作用相当于精简版的浏览器，它取消了很多功能（前进、后退、收藏、多标签等），同时又提供了一些访问系统资源的API函数（本地文件夹等）。

# 如何上手

## 如何启动项目

确保已全局安装`yarn`模块。

`yarn install --check-files`

开发模式，访问端口 33207，API接口转发到mock服务器:

`yarn dev`

测试模式，访问端口 3326，API接口转发到10.0.0.26:8080：

`yarn test`

生产模式，访问端口 3328，API接口转发到10.0.0.28:8080：

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
      }
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


# 架构思想

## 放弃第三方框架、库
之所以放弃脚手架和比较成熟的第三方框架、库（以下简称三方库），出于以下几个因素考虑：
### 体积负担
很多时候，项目开发完成编译的时候，发现体积比预期的要大很多，其中大部分体积来源于三方库。
这种情况不但没法优化（gzip是治标不治本，tree shaking取决于三方库代码结构，很多时候会无效），而且会随着功能的增加而不断引入新的三方库（通常它们是基于已使用的三方库），这对于项目的性能而言是一笔不小的负担。
放弃第三方库之后能保证所有被编译的代码都是业务所需的代码，不会额外引入其它垃圾代码，项目体积大大减小。
### 开发依赖
我们在享受三方库带来的便利时，同时也在承受其后果。那就是对原生js越来越陌生，对三方库的API依赖程度越来越高。
也就是说，开发者与三方库耦合度越来越高。
一方面会降低思维能力，因为你锤子用得越遛，越容易把很多东西看成是钉子。
另一方面底层编码能力会变低，永远只能依赖三方库来进行开发。
所以为了打破这种状况，偶尔适时的自己造造轮子是有必要的。
### 理解精髓
学会一样东西不单单是使用它，而是应该掌握其原理，可以再造它甚至修补它、超越它（很可能当时尤雨溪就是这么开发VueJS的）。
该项目的很多代码其实参考已有的三方库，比如双向数据绑定机制参考了VueJS，组件设计结构参考了ReactJS。
### 遵循标准
我们不应该被三方库的API所绑定，因为各个库的API是变化的、是不一样的。
我们开发者真正应该追寻的是web标准。MDN的web component标准就是本项目遵循的标准基础。

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