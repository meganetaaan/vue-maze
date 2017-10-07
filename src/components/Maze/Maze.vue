<template>
  <div class="maze">
    <canvas ref="mazeCanvas" :width="width" :height="height"></canvas>
    <canvas ref="effectCanvas" :style="effectStyle" :width="width" :height="height"></canvas>
    <canvas ref="playerCanvas" @touchmove="onTouchMove" @mousemove="onMouseMove" :width="width" :height="height"></canvas>
  </div>
</template>

<script>
import _ from 'lodash'
import Vue from 'vue'
import Maze from './getMaze'
import imagePath from './tori.png'
import Renderer from './Renderer'

export default {
  name: 'maze',
  data () {
    return {
      width: null,
      height: null,
      cellWidth: 20,
      cellHeight: 20,
      margin: 5,
      image: null,
      maze: {
        bondH: [],
        bondV: [],
        goal: {
          x: null,
          y: null
        }
      },
      player: {
        id: '00',
        x: 0,
        y: 0
      },
      isFinished: false,
      seed: Date.now()
    }
  },
  computed: {
    lx() {
      return Math.max(1, Math.floor((this.width - this.margin * 2) / this.cellWidth))
    },
    ly() {
      return Math.max(1, Math.floor((this.height - this.margin * 2) / this.cellHeight))
    },
    effectStyle() {
      if (this.isFinished) {
        return {
          display: 'inline'
        }
      }
      return {
        display: 'none'
      }
    }
  },
  mounted(vm) {
    this.height = this.$el.offsetHeight - this.margin
    this.width = this.$el.offsetWidth - this.margin
    this.renderer = new Renderer(
      this.$refs.mazeCanvas.getContext('2d'),
      this.cellWidth,
      this.cellHeight,
      this.margin
    )
    this.playerRenderer = new Renderer(
      this.$refs.playerCanvas.getContext('2d'),
      this.cellWidth,
      this.cellHeight,
      this.margin
    )
    // アバター画像の読み込み
    const image = new Image()
    image.addEventListener('load', () => {
      this.image = image
    })
    image.src = imagePath

    // キーイベントハンドラはグローバルに仕掛ける必要がある。
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('resize', () => {
      this.height = this.$el.offsetHeight
      this.width = this.$el.offsetWidth
    })
  },
  watch: {
    height () {
      this.renderMaze()
    },
    width () {
      this.renderMaze()
    },
    lx () {
      this.resetMaze()
    },
    ly () {
      this.resetMaze()
    },
    maze () {
      this.renderMaze()
    },
    player () {
      this.renderPlayer()
    },
    image () {
      this.renderPlayer()
    },
    isFinished () {
      if (this.isFinished) {
        this.renderConguraturations()
        setTimeout(this.resetMaze, 800)
      }
    }
  },
  methods: {
    onTouchMove (event) {
      event.stopPropagation()
      event.preventDefault()

      const touch = event.touches[0]
      const rect = touch.target.getBoundingClientRect()
      const pos = {
        offsetX: touch.clientX - rect.x,
        offsetY: touch.clientY - rect.y
      }
      this.handleMove(pos)
    },
    onMouseMove (event) {
      this.handleMove(event)
    },
    handleMove (pos) {
      const offsetX = pos.offsetX
      const offsetY = pos.offsetY
      const x = Math.floor((offsetX - this.margin) / this.cellWidth)
      const y = Math.floor((offsetY - this.margin) / this.cellHeight)
      console.log(`(${x}, ${y})`)
      const dx = x - this.player.x
      const dy = y - this.player.y
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
        this.moveBy(dx, dy)
      }
    },
    onKeyUp (event) {
      switch (event.keyCode) {
        case 37:
          this.goLeft()
          break
        case 38:
          this.goUp()
          break
        case 39:
          this.goRight()
          break
        case 40:
          this.goDown()
      }
    },
    goUp () {
      this.moveBy(0, -1)
    },
    goDown () {
      this.moveBy(0, 1)
    },
    goLeft () {
      this.moveBy(-1, 0)
    },
    goRight () {
      this.moveBy(1, 0)
    },
    moveBy (dx, dy) {
      const x = this.player.x + dx
      const y = this.player.y + dy
      this.moveTo(x, y)
    },
    moveTo (toX, toY) {
      console.log(`moveTo: ${toX}, ${toY}`)

      const fromX = this.player.x
      const fromY = this.player.y
      const bondH = this.maze.bondH
      const bondV = this.maze.bondV

      // Check if player can move
      if (toX < 0 || toX >= this.lx || toY < 0 || toY >= this.ly) {
        return
      }
      for (let i = Math.min(fromX, toX); i < Math.max(fromX, toX); i++) {
        // 例： from(0, 0) to(1, 0)
        let idx = ((this.lx + 1) * fromY) + i + 1
        if (!bondH[idx]) {
          return
        }
      }
      for (let j = Math.min(fromY, toY); j < Math.max(fromY, toY); j++) {
        let idx = (this.lx * (j + 1) + fromX)
        if (!bondV[idx]) {
          return
        }
      }
      Vue.set(this, 'player', { x: toX, y: toY })
      if (toX === this.maze.goal.x &&
        toY === this.maze.goal.y) {
        this.isFinished = true
      }
    },
    resetMaze () {
      const lx = this.lx
      const ly = this.ly
      const seed = this.seed++
      if (lx > 0 && ly > 0) {
        const maze = new Maze(lx, ly, seed)
        Vue.set(this, 'maze', maze)
        Vue.set(this, 'player', { x: 0, y: 0 })
        this.isFinished = false
      }
    },
    renderPlayer () {
      const { playerRenderer, player } = this
      playerRenderer.clear(this.width, this.height)
      playerRenderer.ctx = this.$refs.playerCanvas.getContext('2d')
      playerRenderer.setColor('#FF9800', '#222')
      if (this.image != null) {
        playerRenderer.drawImage(player.x, player.y, this.image)
      } else {
        playerRenderer.drawCircle(player.x, player.y)
      }
    },
    renderGoal () {
      const { renderer, maze } = this
      const goal = maze.goal
      renderer.ctx = this.$refs.mazeCanvas.getContext('2d')
      renderer.setColor('#4CAF50', '#222')
      renderer.drawCircle(goal.x, goal.y)
    },
    renderConguraturations () {
      this.effectRenderer = new Renderer(
        this.$refs.effectCanvas.getContext('2d'),
        this.cellWidth,
        this.cellHeight,
        this.margin
      )
      this.effectRenderer.clear(this.width, this.height)
      // TODO: data
      const texts = [
        'BooYah!',
        'Wow!',
        'I did it!',
        'Woohoo!'
      ]
      const text = texts[Math.floor(texts.length * Math.random())]
      this.effectRenderer.drawText(text, this.player.x, this.player.y)
      /*
      this.effectRenderer.setColor('rgba(192, 80, 77, 0.2)', '#FF0000')
      this.effectRenderer.drawCircle(this.player.x, this.player.y, 50)
      setTimeout(function() {
        this.effectRenderer.clear(this.width, this.height)
      }.bind(this), 300)
      */
    },
    renderMaze () {
      this.$nextTick(() => {
        const { renderer, lx, ly, maze } = this
        const bondH = maze.bondH
        const bondV = maze.bondV
        console.log(`bondH: ${bondH.length}, bondV: ${bondV.length}`)

        renderer.clear(this.width, this.height)

        // 縦線の描画
        renderer.setColor(null, '#222')
        renderer.beginPath()
        for (let i = 0; i < bondH.length; i++) {
          if (bondH[i]) {
            continue
          }
          const x1 = i % (lx + 1)
          const y1 = Math.floor(i / (lx + 1))
          const x2 = x1
          const y2 = y1 + 1
          renderer.drawLine(x1, y1, x2, y2)
        }

        // 横線の描画
        for (let j = 0; j < bondV.length; j++) {
          if (bondV[j]) {
            continue
          }
          const x1 = j % lx
          const y1 = Math.floor(j / lx)
          const x2 = x1 + 1
          const y2 = y1
          renderer.drawLine(x1, y1, x2, y2)
        }
        renderer.stroke()
        this.renderPlayer()
        this.renderGoal()
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.maze {
  position: absolute;
  width: 95%;
  height: 95%;
  margin: auto;
  min-height: 50px;
  min-width: 50px;
  overflow: hidden;
}

canvas {
  position: absolute;
  margin: auto;
}
</style>
