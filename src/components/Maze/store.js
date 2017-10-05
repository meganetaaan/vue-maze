import Vue from 'vue'
import Vuex from 'vuex'
import getMaze from './getMaze'

let seed = Date.now()

Vue.use(Vuex)
const OPERATION = {
  SET_MAZE: 'setMaze',
  SET_PLAYER: 'setPlayer'
}

const store = new Vuex.Store({
  state: {
    lx: null,
    ly: null,
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
    }
  },
  getters: {
    getBondH: state => () => {
      return state.maze.bondH
    },
    getBondV: state => () => {
      return state.maze.bondV
    }
  },
  actions: {
    async movePlayerBy (arg, payload) {
      const param = { x: this.state.player.x + payload.dx, y: this.state.player.y + payload.dy }
      await this.dispatch('movePlayerTo', param)
    },
    async movePlayerTo ({ commit }, payload) {
      const id = payload.id
      const toX = payload.x
      const toY = payload.y

      const fromX = this.state.player.x
      const fromY = this.state.player.y
      const bondH = this.getters.getBondH()
      const bondV = this.getters.getBondV()

      for (let i = Math.min(fromX, toX); i < Math.max(fromX, toX); i++) {
        // 例： from(0, 0) to(1, 0)
        let idx = ((this.state.lx + 1) * fromY) + i + 1

        console.debug(`scanningX: (${i}, ${fromY}) to (${i + 1}, ${fromY})`)
        console.debug(`${idx}=>${bondH[idx]}`)
        if (!bondH[idx]) {
          return
        }
      }
      for (let j = Math.min(fromY, toY); j < Math.max(fromY, toY); j++) {
        let idx = (this.state.lx * (j + 1) + fromX)

        console.debug(`scanningY: (${fromX}, ${j}) to (${fromX}, ${j + 1})`)
        console.debug(`${idx}=>${bondV[idx]}`)
        if (!bondV[idx]) {
          return
        }
      }
      commit(OPERATION.SET_PLAYER, {id, x: toX, y: toY})
    },
    async update ({ commit }, payload) {
      const lx = payload.lx
      const ly = payload.ly
      const maze = getMaze(lx, ly, seed++)
      commit(OPERATION.SET_MAZE, { lx, ly, maze})
      commit(OPERATION.SET_PLAYER, {x: 0, y: 0})
    }
  },
  mutations: {
    setMaze (state, payload) {
      state.lx = payload.lx
      state.ly = payload.ly
      const bondHSize = payload.maze.bondH.length
      state.maze.bondH.splice(bondHSize)
      for (let i = 0; i < bondHSize; i++) {
        Vue.set(state.maze.bondH, i, payload.maze.bondH[i])
      }
      const bondVSize = payload.maze.bondV.length
      state.maze.bondV.splice(bondVSize)
      for (let i = 0; i < bondVSize; i++) {
        Vue.set(state.maze.bondV, i, payload.maze.bondV[i])
      }
      state.maze.goal.x = payload.maze.goal.x
      state.maze.goal.y = payload.maze.goal.y
    },
    setPlayer (state, payload) {
      state.player.x = payload.x
      state.player.y = payload.y
    }
  }
})

export default store
