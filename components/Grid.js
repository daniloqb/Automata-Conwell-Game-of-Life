import Tile from "./Tile.js";

export default class Grid {
  constructor(p, h, w, s) {
    this.p = p;
    this.gridWidth = w;
    this.gridHeight = h;
    this.cellSize = s;
    this.logFPS = false;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.mult_select = true;
    this.cells = Array();
    this.activeCells = new Set();

    this.tileConfig = (x, y, index) => ({
      index: index,
      pos_i: x,
      pos_j: y,
      size: this.cellSize,
      // border_width: [0.6, 0.6, 0.6, 0.6],
      border_color: ["gray", "gray", "gray", "gray"],
      //vertex_width: [0, 0, 0, 0],
      vertex_color: ["black", "black", "black", "black"],
      color: "blue",
      color_select: "orange",
    });
  }

  initGrid() {
    this.#fillGrid();
    this.#displayItems(this.cells);
  }

  updateGrid() {
    //this.logFPS && this.calcFPS();
    this.#displayItems(this.activeCells);
    this.#clearUnselectedCells();
  }

  selectCell(mx, my) {
    const [x, y] = this.#transformMouseToPosition(mx, my);

    if (this.#outOfBoundaries(x, y)) return;

    const index = this.#transformXandYtoIndex(x, y);
    const found = this.activeCells.has(this.cells[index]);

    this.cells[index].select(!found);
    !found && this.activeCells.add(this.cells[index]);

    return index;
  }

  getCellStatus(index) {
    return this.cells[index].selected;
  }

  setCellStatus(index, status) {
    this.cells[index].select(status);
    return this.cells[index].selected;
  }

  addActiveCell(index){
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

        this.cells.push(new Tile(this.p, this.tileConfig(x, y, index)));
        let neighbors = this.getNeighborsIndex(index);
        this.cells[index].setNeighbors(neighbors);

        if (Math.random() < percentage) {
          this.cells[index].select(true);
        }
      }
    }
    this.activeCells = new Set(
      this.cells.filter((element) => element.selected == true)
    );
  }

  #displayItems(elementColletion) {
    elementColletion.forEach((element) => element.show());
  }

  #clearUnselectedCells() {
    this.activeCells.forEach((item) => {
      if (!item.selected) {
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
