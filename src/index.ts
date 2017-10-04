// src/index.ts

import Vue from 'vue'
import Maze from './components/Maze/Maze.vue'
import store from './components/Maze/store.js'

let v = new Vue({
  el: '#app',
  template: `
    <div>
        <maze></maze>
    </div>`,
  data: {
    name: 'World'
  },
  components: {
    Maze
  },
  store
})
