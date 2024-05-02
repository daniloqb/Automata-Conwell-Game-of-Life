import Tile from "./Tile.mjs";

export default class Grid {
  constructor(p, rows, cols, cellConfig) {
    this.p = p;
    this.gridWidth = cols;
    this.gridHeight = rows;
    this.logFPS = false;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.mult_select = true;
    this.cells = Array();
    this.activeCells = new Set();

    const cellConfigDefault = (x, y, index) => ({
      index: index,
      pos_i: x,
      pos_j: y,
      size: 3,
      // border_width: [0.6, 0.6, 0.6, 0.6],
      border_color: ["gray", "gray", "gray", "gray"],
      //vertex_width: [0, 0, 0, 0],
      vertex_color: ["black", "black", "black", "black"],
      color: "blue",
      color_select: "orange",
      stateList: [
        { key: 0, color: "black", value: 0 },
        { key: 1, color: "white", value: 1 },
      ],
    });

    this.cellConfig = cellConfig ? cellConfig : cellConfigDefault;
    this.cellSize = this.cellConfig().size;
    this.stateList = this.cellConfig().stateList;
  }

  initGrid() {
    this.#fillGrid();
    // this.#displayItems(this.cells);
  }

  updateGrid() {
    //this.logFPS && this.calcFPS();
    // this.#displayItems(this.activeCells);
    this.#clearUnselectedCells();
  }

  selectCell(mx, my) {
    const [x, y] = this.#transformMouseToPosition(mx, my);

    if (this.#outOfBoundaries(x, y)) return;

    const index = this.#transformXandYtoIndex(x, y);
    const found = this.activeCells.has(this.cells[index]);

    if (found) {
      this.cells[index].setState(this.stateList[0].key);
      this.activeCells.delete(this.cells[index]);
    } else {
      this.cells[index].setState(this.stateList[1].key);
      this.activeCells.add(this.cells[index]);
    }
  }

  getCellStatus(index) {
    return this.cells[index].getState();
  }
  getCellValue(index) {
    return this.cells[index].getValue();
  }

  setCellStatus(index, status) {
    this.cells[index].setState(status);
    return this.cells[index].getState();
  }

  addActiveCell(index) {
    this.activeCells.add(this.cells[index]);
  }

  getNeighborsIndex(index) {
    let neighbors = [];
    const [col, row] = this.#transformIndexToPosition(index);

    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      let new_y = this.#wrapY(row + yOffset);
      for (let xOffset = -1; xOffset <= 1; xOffset++) {
        let new_x = this.#wrapX(col + xOffset);

        let neighborsIndex = this.#transformXandYtoIndex(new_x, new_y);
        if (neighborsIndex !== index) {
          neighbors.push(neighborsIndex);
        }
      }
    }
    return neighbors;
  }

  #fillGrid() {
    let percentage = Math.random();
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        let index = x + y * this.gridWidth;

        this.cells.push(new Tile(this.p, this.cellConfig(x, y, index)));
        let neighbors = this.getNeighborsIndex(index);
        this.cells[index].setNeighbors(neighbors);

        if (Math.random() < 0.1) {
          this.cells[index].setState(1);
        } else {
          this.cells[index].setState(0);
        }
      }
    }
    this.activeCells.clear();

    this.cells.forEach((item) => {
      let val = item.getValue();
      if (val == 1) {
        console.log(item,"Val: ",val);
        this.activeCells.add(item);
      }
    });

    this.activeCells.forEach((element) => {
     // console.log(element);
    });
  }

  #displayItems(elementColletion) {
    elementColletion.forEach((element) => element.show());
  }

  #clearUnselectedCells() {
    this.activeCells.forEach((item) => {
      if (item.getValue() === 0) {
        this.activeCells.delete(item);
      }
    });
  }

  #wrapX(x) {
    return (x + this.gridWidth) % this.gridWidth;
  }

  #wrapY(y) {
    return (y + this.gridHeight) % this.gridHeight;
  }

  #transformMouseToPosition(mx, my) {
    let x = Math.floor(mx / this.cellSize);
    let y = Math.floor(my / this.cellSize);

    return [x, y];
  }

  #transformIndexToPosition(index) {
    let x = index % this.gridWidth;
    let y = Math.floor(index / this.gridWidth);

    return [x, y];
  }

  #transformXandYtoIndex(x, y) {
    return x + y * this.gridWidth;
  }

  #outOfBoundaries(x, y) {
    if (x > -1 && x < this.gridWidth && y > -1 && y < this.gridHeight)
      return false;

    return true;
  }

  calcFPS() {
    const currentNeighborrent_time = performance.now();
    const deltaTime = currentNeighborrent_time - this.lastFrameTime;
    this.frameCount++;
    if (deltaTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / deltaTime);
      console.log(`FPS: ${fps}`);
      this.frameCount = 0;
      this.lastFrameTime = currentNeighborrent_time;
    }
  }
}
