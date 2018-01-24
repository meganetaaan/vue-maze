interface DirectionCandidate {
  north: number
  south: number
  west: number
  east: number
  [key: string]: number
}

class Maze {
  lx: number
  ly: number
  bondH: Array<boolean>
  bondV: Array<boolean>
  isOpenArr: Array<boolean>
  point: Array<number>
  stack: Array<number>
  goal: {x: number, y: number}

  constructor (lx: number, ly: number, seed: number) {
    const bondHSize = (lx + 1) * ly
    const bondVSize = lx * (ly + 1)
    const pointSize = lx * ly

    const bondH = new Array(bondHSize)
    for (let i = 0; i < bondH.length; i++) {
      bondH[i] = false
    }
    const bondV = new Array(bondVSize)
    for (let i = 0; i < bondV.length; i++) {
      bondV[i] = false
    }
    const point = new Array(pointSize)
    for (let i = 0; i < point.length; i++) {
      point[i] = i
    }

    this.lx = lx
    this.ly = ly
    this.bondH = bondH
    this.bondV = bondV
    this.point = point
    this.stack = []

    this.makeMaze()
  }

  makeMaze (): void {
    // 座標の配列を用意
    const cells: Array<number> = []
    for (let p of this.point) {
      this.stack.push(p)
    }

    // ランダムに並べ替え
    this.shuffle(cells)

    // 既存の通路以外で穴を掘る方向をランダムに選択してスタックにプッシュ
    while (cells.length > 0) {
      const c = cells.pop()
      if (c == null) {
        break
      }
      const ix = c % this.lx
      const iy = c / this.lx
      const direction = this.getDirectionCandidate(ix, iy)
      if (this.isDeadEnd(direction)) {
        continue
      }
      this.dig(ix, iy, this.getRandomDirection(direction))
    }

    // 行き止まりの場合スタックからランダムに選ぶ
    // スタックが無くなったら探索完了
    return
  }

  private isDeadEnd (direction: DirectionCandidate): boolean {
    // 進める方向がなければ行き止まり
    return direction.north === 0 &&
    direction.south === 0 &&
    direction.west === 0 &&
    direction.east === 0
  }

  private getDirectionCandidate (ix: number, iy: number): DirectionCandidate {
    const isOpen = (x: number, y: number) => {
      return this.isOpenArr[y * this.lx + x]
    }
    const north = iy > 0 && isOpen(ix, iy - 1)
    const south = iy < this.ly && isOpen(ix, iy + 1)
    const west = ix > 0 && isOpen(ix - 1, iy)
    const east = ix < this.lx && isOpen(ix + 1, iy)
    const directionNo = [north, south, west, east].filter(i => i).length
    const probability = directionNo > 0 ? 1.0 / directionNo : 0
    return {
      north: north ? probability : 0,
      south: south ? probability : 0,
      west: west ? probability : 0,
      east: east ? probability : 0
    }
  }

  private shuffle (arr: Array<any>): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const r = Math.floor(Math.random() * (i + 1))
      const tmp = arr[i]
      arr[i] = arr[r]
      arr[r] = tmp
    }
  }

  private getRandomDirection (direction: DirectionCandidate): string {
    const sum = direction.east + direction.north + direction.west + direction.east
    if (sum === 0) {
      throw new Error('No direction available')
    }
    const i = Math.random() * sum
    let n = 0
    for (let k in direction) {
      const p = direction[k]
      n += p
      if (i < n) {
        return k
      }
    }
    throw new Error('Something wrong')
  }

  private isSameCluster (ix1: number, iy1: number, ix2: number, iy2: number): boolean {
    return this.getClusterIndex(ix1, iy1) === this.getClusterIndex(ix2, iy2)
  }

  private getClusterIndex (x: number, y: number): number {
    let index = this.lx * y + x
    while (index !== this.point[index]) {
      index = this.point[index]
    }
    return index
  }

  private dig (ix: number, iy: number, direction: string) {
    const dest = { ix, iy }
    switch (direction) {
      case 'north':
        dest.iy -= 1
        break
      case 'south':
        dest.iy += 1
        break
      case 'east':
        dest.ix += 1
        break
      case 'west':
        dest.ix -= 1
        break
      default:
        throw new Error('Something wrong')
    }
    this.connect(ix, iy, dest.ix, dest.iy)
  }

  private connect (ix1: number, iy1: number, ix2: number, iy2: number) {
    let i1 = this.getClusterIndex(ix1, iy1)
    let i2 = this.getClusterIndex(ix2, iy2)
    if (i1 < i2) {
      this.point[i2] = i1
    } else {
      this.point[i1] = i2
    }
  }

  private makeMazeSub (rate: number): void {
    // make path horizontally
    for (let iy = 0; iy < this.ly; iy++) {
      for (let ix = 0; ix < this.lx - 1; ix++) {
        let rand = Math.random()
        if (rand < rate ||
          this.getClusterIndex(ix, iy) === this.getClusterIndex(ix + 1, iy)) {
          continue
        }
        this.bondH[this.lx * iy + iy + ix + 1] = true
        this.connect(ix, iy, ix + 1, iy)
      }
    }

    // make path vertically
    for (let iy = 0; iy < this.ly - 1; iy++) {
      for (let ix = 0; ix < this.lx; ix++) {
        let rand = Math.random()
        if (rand < rate ||
          this.getClusterIndex(ix, iy) === this.getClusterIndex(ix, iy + 1)) {
          continue
        }
        this.bondV[(iy + 1) * this.lx + ix] = true
        this.connect(ix, iy, ix, iy + 1)
      }
    }
    return
  }
}

export default Maze
