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
    const isOpenArr = new Array(pointSize)
    for (let i = 0; i < pointSize; i++) {
      isOpenArr[i] = false
    }

    this.lx = lx
    this.ly = ly
    this.bondH = bondH
    this.bondV = bondV
    this.isOpenArr = isOpenArr

    this.makeMaze()
    this.goal = {
      x: this.lx - 1,
      y: this.ly - 1
    }
  }

  makeMaze (): void {
    // 座標の配列を用意
    const cells: Array<number> = []
    cells.push(Math.floor(Math.random() * this.isOpenArr.length))

    // 既存の通路以外で穴を掘る方向をランダムに選択してスタックにプッシュ
    while (cells.length > 0) {
      // debugger
      const c = cells.pop()
      if (c == null) {
        break
      }
      const ix = c % this.lx
      const iy = Math.floor(c / this.lx)
      this.isOpenArr[c] = true
      const direction = this.getDirectionCandidate(ix, iy)
      if (this.isDeadEnd(direction)) {
        continue
      }
      cells.push(c)
      const dest = this.getNeighbor(ix, iy, this.getRandomDirection(direction))
      cells.push(dest.iy * this.lx + dest.ix)
    }

    // 行き止まりの場合スタックからランダムに選ぶ
    // スタックが無くなったらスタート、ゴールを開けて探索完了
    this.bondH[0] = true
    this.bondH[(this.lx + 1) * this.ly - 1] = true
    return
  }

  private isDeadEnd (direction: DirectionCandidate): boolean {
    // 進める方向がなければ行き止まり
    return direction.north === 0 &&
    direction.south === 0 &&
    direction.west === 0 &&
    direction.east === 0
  }

  private isOpen = (x: number, y: number): boolean => {
    return this.isOpenArr[y * this.lx + x]
  }

  private getDirectionCandidate (ix: number, iy: number): DirectionCandidate {
    const north = iy > 0 && !this.isOpen(ix, iy - 1)
    const south = iy < (this.ly - 1) && !this.isOpen(ix, iy + 1)
    const west = ix > 0 && !this.isOpen(ix - 1, iy)
    const east = ix < (this.lx - 1) && !this.isOpen(ix + 1, iy)
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
    const sum = direction.north + direction.south + direction.west + direction.east
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

  private getNeighbor (ix: number, iy: number, direction: string) {
    const dest = { ix, iy }
    // TODO: separate dig method
    switch (direction) {
      case 'north':
        dest.iy -= 1
        this.bondV[iy * this.lx + ix] = true
        break
      case 'south':
        dest.iy += 1
        this.bondV[(iy + 1) * this.lx + ix] = true
        break
      case 'east':
        dest.ix += 1
        this.bondH[iy * (this.lx + 1) + ix + 1] = true
        break
      case 'west':
        dest.ix -= 1
        this.bondH[iy * (this.lx + 1) + ix] = true
        break
      default:
        throw new Error('Something wrong')
    }
    return dest
  }
}

export default Maze
