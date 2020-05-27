class Maze {
  lx: number;
  ly: number;
  bondH: Array<boolean>;
  bondV: Array<boolean>;
  point: Array<number>;
  goal: { x: number; y: number };

  constructor(lx: number, ly: number) {
    const bondHSize = (lx + 1) * ly;
    const bondVSize = lx * (ly + 1);
    const pointSize = lx * ly;

    const bondH = new Array(bondHSize);
    for (let i = 0; i < bondH.length; i++) {
      bondH[i] = false;
    }
    const bondV = new Array(bondVSize);
    for (let i = 0; i < bondV.length; i++) {
      bondV[i] = false;
    }
    const point = new Array(pointSize);
    for (let i = 0; i < point.length; i++) {
      point[i] = i;
    }

    this.lx = lx;
    this.ly = ly;
    this.bondH = bondH;
    this.bondV = bondV;
    this.point = point;
    this.goal = {
      x: this.lx - 1,
      y: this.ly - 1
    };

    this.makeMaze();
  }

  getClusterIndex(x: number, y: number): number {
    let index = this.lx * y + x;
    while (index !== this.point[index]) {
      index = this.point[index];
    }
    return index;
  }

  connect(ix1: number, iy1: number, ix2: number, iy2: number) {
    const i1 = this.getClusterIndex(ix1, iy1);
    const i2 = this.getClusterIndex(ix2, iy2);
    if (i1 < i2) {
      this.point[i2] = i1;
    } else {
      this.point[i1] = i2;
    }
  }

  makeMazeSub(rate: number): void {
    // make path horizontally
    for (let iy = 0; iy < this.ly; iy++) {
      for (let ix = 0; ix < this.lx - 1; ix++) {
        const rand = Math.random();
        if (
          rand < rate ||
          this.getClusterIndex(ix, iy) === this.getClusterIndex(ix + 1, iy)
        ) {
          continue;
        }
        this.bondH[this.lx * iy + iy + ix + 1] = true;
        this.connect(ix, iy, ix + 1, iy);
      }
    }

    // make path vertically
    for (let iy = 0; iy < this.ly - 1; iy++) {
      for (let ix = 0; ix < this.lx; ix++) {
        const rand = Math.random();
        if (
          rand < rate ||
          this.getClusterIndex(ix, iy) === this.getClusterIndex(ix, iy + 1)
        ) {
          continue;
        }
        this.bondV[(iy + 1) * this.lx + ix] = true;
        this.connect(ix, iy, ix, iy + 1);
      }
    }
    return;
  }

  makeMaze(): void {
    for (let i = 0; i < 10; i++) {
      this.makeMazeSub(0.8);
    }

    // definitely connect unconnected clusters
    this.makeMazeSub(1.0);

    // open start and goal
    this.bondH[0] = true;
    this.bondH[(this.lx + 1) * this.ly - 1] = true;
    this.goal = {
      x: this.lx - 1,
      y: this.ly - 1
    };
    return;
  }
}

export default Maze;
