// src/index.ts

import Vue from 'vue'
import Maze from './components/Maze/Maze.vue'

let v = new Vue({
  el: '#app',
  template: `
    <app :style="appStyle">
        <maze :style="mazeStyle"></maze>
    </app>`,
  data: {
    name: 'World',
    appStyle: {
      position: 'absolute',
      width: '90%',
      height: '90%',
      margin: 'auto'
    },
    mazeStyle: {
      width: '100%',
      height: '100%'
    }
  },
  components: {
    Maze
  }
})
