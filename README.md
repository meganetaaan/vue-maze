Vue-maze
===

An itty-bitty maze game made as Vue.js component

[PLAY DEMO](https://meganetaaan.github.io/maze/)

![maze-vue](doc/maze-vue.png)

* Fit to the component size automatically

![maze-vue-resize](doc/maze-resize.gif)

* Mousemove/Touchmove/ArrowKey to move the player

![maze-vue2](doc/maze-vue2.gif)

* Choose difficulty

![maze-vue-resize](doc/maze-difficulty.gif)


## Install

```bash
$ npm install maze vue-maze --save
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

## Props

Props      | Type   | Description                  | Default
-----------|--------|------------------------------|--------
difficulty | string | difficulty(easy/normal/hard) | normal

## Events

Event    | Payload | Description
---------|---------|------------------------------------
init     | none    | the maze is initialized
start    | none    | the player starts to move
finish   | none    | the player has arrived at the goal
