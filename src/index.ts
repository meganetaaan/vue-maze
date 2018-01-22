// src/index.ts
import Vue, { ComponentOptions } from 'vue'
import Maze from './components/Maze/Maze.vue'

// コンポーネントの型を宣言
interface App extends Vue {
  startTime: number
  time: number
  onStart (): void
  onFinish (): void
  onInit (): void
}

const app = {
  name: 'World',
  el: '#app',
  template: `
    <app :style="appStyle">
      <select v-model="difficulty">
        <option value="easy">Easy</option>
        <option value="normal">Normal</option>
        <option value="hard">Hard</option>
      </select>
      <div class="time" >{{time}}ms</div>
      <maze :difficulty="difficulty" @start="onStart" @finish="onFinish" @init="onInit" :style="mazeStyle"></maze>
    </app>`,
  data: {
    appStyle: {
      position: 'absolute',
      width: '90%',
      height: '90%',
      margin: 'auto'
    },
    mazeStyle: {
      width: '100%',
      height: '100%'
    },
    startTime: 0,
    time: 0,
    difficulty: 'normal'
  },
  components: {
    Maze
  },
  methods: {
    onStart: function () {
      this.startTime = Date.now()
    },
    onFinish: function () {
      this.time = Date.now() - this.startTime
    },
    onInit: function () {
      this.startTime = 0
    }
  }
} as ComponentOptions<App>
let v = new Vue(app)
