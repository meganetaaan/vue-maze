<template>
  <div id="app">
    <div class="maze-container">
      <select v-model="difficulty">
        <option value="easy">Easy</option>
        <option value="normal">Normal</option>
        <option value="hard">Hard</option>
      </select>
      <select v-model="strategy">
        <option value="cluster">cluster</option>
        <option value="dig">dig</option>
      </select>
      <div class="time">{{ time }}ms</div>
      <maze
        :strategy="strategy"
        :difficulty="difficulty"
        @start="onStart"
        @finish="onFinish"
        @init="onInit"
        :style="mazeStyle"
      ></maze>
    </div>
    `,
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Maze from "./components/Maze.vue";

type Difficulty = "easy" | "normal" | "hard";

type Strategy = "cluster" | "dig";

@Component({
  components: {
    Maze
  }
})
export default class App extends Vue {
  mazeStyle = {
    width: "100%",
    height: "100%"
  };
  startTime = 0;
  time = 0;
  difficulty: Difficulty = "normal";
  strategy: Strategy = "cluster";
  onStart() {
    this.startTime = Date.now();
  }
  onFinish() {
    this.time = Date.now() - this.startTime;
  }
  onInit() {
    this.startTime = 0;
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.maze-container {
  position: absolute;
  width: 90%;
  height: 90%;
  margin: auto;
}
.maze {
  width: 100%;
  height: 100%;
}
</style>
