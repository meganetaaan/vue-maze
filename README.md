Vue-maze
===

An itty-bitty maze game made as Vue.js component

[DEMO](https://meganetaaan.github.io/maze/)

* Generate maze that automatically fit to the component size

![maze-vue](doc/maze-vue.png)

* Mousemove/ArrowKey to move the player

![maze-vue2](doc/maze-vue2.gif)

* Resize component to regenerate the maze

![maze-vue-resize](doc/maze-resize.gif)

## Install

```bash
$ npm install maze vue-maze
```

```JavaScript
import Vue from 'vue'
import Maze from 'vue-maze'

let v = new Vue({
  el: '#app',
  template: `
    <app>
        <maze></maze>
    </app>`,
  components: {
    Maze
  }
})

```
