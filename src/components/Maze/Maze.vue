<template>
  <div class="maze">
    <canvas ref="mazeCanvas" :width="width" :height="height"></canvas>
    <canvas ref="playerCanvas"
    @touchmove="onTouchMove"
    @mousemove="onMouseMove"
    :width="width" :height="height"></canvas>
  </div>
</template>

<script>
import imagePath from './tori.png'
import _ from 'lodash'

class Renderer {
  constructor (ctx, unitWidth, unitHeight, offset) {
    this.ctx = ctx
    this.unitWidth = unitWidth
    this.unitHeight = unitHeight
    this.offset = offset
    this.wallWidth = 2
  }

  // TODO: 境界を見直す
  clear (w, h) {
    this.ctx.clearRect(0, 0, w, h)
  }

  setColor (fill, stroke) {
    this.ctx.fillStyle = fill
    this.ctx.strokeStyle = stroke
  }

  beginPath () {
    this.ctx.beginPath()
  }

  stroke () {
    this.ctx.stroke()
  }

  drawImage (x, y, image) {
    const cx = x * this.unitWidth + this.offset
    const cy = y * this.unitHeight + this.offset
    this.ctx.drawImage(image, cx, cy)
  }

  drawCircle (x, y) {
    this.ctx.beginPath()
    const cx = x * this.unitWidth + this.unitWidth / 2 + this.offset
    const cy = y * this.unitHeight + this.unitHeight / 2 + this.offset
    const r = Math.min(this.unitWidth, this.unitHeight) / 2 - this.wallWidth
    this.ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    this.ctx.fill()
  }

  drawLine (x1, y1, x2, y2) {
    const fromX = this.offset + x1 * this.unitWidth
    const fromY = this.offset + y1 * this.unitHeight
    const toX = this.offset + x2 * this.unitWidth
    const toY = this.offset + y2 * this.unitHeight
    this.ctx.moveTo(fromX, fromY)
    this.ctx.lineTo(toX, toY)
  }
}

export default {
  name: 'maze',
  data () {
    return {
      renderer: null,
      width: null,
      height: null,
      cellWidth: 20,
      cellHeight: 20,
      margin: 5,
      image: null
    }
  },
  mounted (vm) {
    this.height = this.$el.offsetHeight
    this.width = this.$el.offsetWidth
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
  computed: {
    ready () {
      return this.bondH.length > 0 || this.bondV.length > 0
    },
    lx () {
      return Math.max(1, Math.floor((this.width - this.margin * 2) / this.cellWidth))
    },
    ly () {
      return Math.max(1, Math.floor((this.height - this.margin * 2) / this.cellHeight))
    },
    bondH () {
      return this.$store.getters.getBondH()
    },
    bondV () {
      return this.$store.getters.getBondV()
    },
    player () {
      return this.$store.state.player
    }
  },
  watch: {
    lx () {
      this.updateMaze()
    },
    ly () {
      this.updateMaze()
    },
    bondH () {
      this.renderMaze()
    },
    bondV () {
      this.renderMaze()
    },
    image () {
      this.renderPlayer()
    },
    'player.x' () {
      this.renderPlayer()
    },
    'player.y' () {
      this.renderPlayer()
    }
  },
  methods: {
    onTouchMove (event) {
      console.log('mousemove')
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
      const dx = this.player.x - x
      const dy = this.player.y - y
      if (Math.abs(dx * dy) <= 1) {
        console.log()
        this.moveTo(x, y)
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
      this.moveTo(this.player.x, this.player.y - 1)
    },
    goDown () {
      this.moveTo(this.player.x, this.player.y + 1)
    },
    goLeft () {
      this.moveTo(this.player.x - 1, this.player.y)
    },
    goRight () {
      this.moveTo(this.player.x + 1, this.player.y)
    },
    moveTo (x, y) {
      this.$store.dispatch('movePlayerTo', {x, y})
    },
    updateMaze: _.debounce(function () {
      if (this.lx > 0 && this.ly > 0) {
        this.$store.dispatch('update', {
          lx: this.lx,
          ly: this.ly
        })
      }
    }, 300),
    renderPlayer: function () {
      const {playerRenderer, player} = this
      playerRenderer.clear(this.width, this.height)
      playerRenderer.ctx = this.$refs.playerCanvas.getContext('2d')
      playerRenderer.setColor('#FF9800', '#222')
      if (this.image != null) {
        playerRenderer.drawImage(player.x, player.y, this.image)
      } else {
        playerRenderer.drawCircle(player.x, player.y)
      }
    },
    // TODO: make more declarative
    renderMaze: _.debounce(function () {
      const {renderer, lx, ly, bondH, bondV} = this

      this.renderPlayer()
      renderer.clear(this.width, this.height)
      renderer.ctx = this.$refs.mazeCanvas.getContext('2d')
      renderer.setColor('#4CAF50', '#222')
      renderer.drawCircle(lx - 1, ly - 1)
      renderer.setColor(null, '#222')

      // 縦線の描画
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
    }, 300)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .maze {
    position: absolute;
    width: 100%;
    height: 100%;
    min-height: 50px;
    min-width: 50px;
    overflow: hidden;
  }
  canvas {
    position: absolute;
    top: 0;
    right: 0;
  }
</style>
