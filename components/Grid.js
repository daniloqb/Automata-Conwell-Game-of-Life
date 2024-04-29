import Tile from "./Tile.js";

export default class Grid {
  constructor(p, h, w, s) {
    this.p = p;
    this.g_width = w;
    this.g_height = h;
    this.scl = s;
    this.logFPS = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.mult_select = true;
    this.cells = Array();
    this.activeCells = new Set();

    this.tileConfig = (x, y, index) => ({
      index: index,
      pos_i: x,
      pos_j: y,
      size: this.scl,
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
    this.logFPS && this.calcFPS();
    this.#displayItems(this.activeCells);
    this.#clearUnselectedCells();
    this.#applyRules();
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

  #applyRules() {

    let markCellsToBorn = new Set();
    let deadNeighborsToCheck = new Set();

    let aliveNeighborsCountCache = new Map();

    this.activeCells.forEach((element) => {
      let index = element.index;
      let neighbors = element.neighbors;

      let count = aliveNeighborsCountCache.get(index);

      if (count === undefined) {
        count = this.getAliveNeighborsCount(neighbors);
        aliveNeighborsCountCache.set(index, count);
      }

      neighbors
        .filter((element) => this.getTileStatus(element) == false)
        .forEach((element) => {
          deadNeighborsToCheck.add(element);
        });

    });

    deadNeighborsToCheck.forEach((index) => {
      let neighbors = this.cells[index].neighbors;
      let aliveNeighborsCount = this.getAliveNeighborsCount(neighbors);

      if (aliveNeighborsCount === 3) {
        markCellsToBorn.add(index);
      }
    });

    for (let index of aliveNeighborsCountCache.keys()) {
      let count = aliveNeighborsCountCache.get(index);
      if (count < 2 || count > 3) {
        this.cells[index].select(false);
      }
    }

    markCellsToBorn.forEach((element) => {
      this.cells[element].select(true);
      this.activeCells.add(this.cells[element]);
    });
  }

  /*   #applyRules() {
    let markCellsToDie = new Set();
    let markCellsToBorn = new Set();
    let deadNeighborsToCheck = new Set();

    this.activeCells.forEach((element) => {
      let index = element.index;
      let neighbors = element.neighbors;

      neighbors
        .filter((element) => this.getTileStatus(element) == false)
        .forEach((element) => {
          deadNeighborsToCheck.add(element);
        });

      let aliveNeighborsCount = this.getAliveNeighborsCount(neighbors);

      if (aliveNeighborsCount < 2 || aliveNeighborsCount > 3) {
        markCellsToDie.add(index);
      }
    });

    deadNeighborsToCheck.forEach((index) => {
      let neighbors = this.cells[index].neighbors;
      let aliveNeighborsCount = this.getAliveNeighborsCount(neighbors);
      
      if (aliveNeighborsCount === 3) {
        markCellsToBorn.add(index);
      }
    });

    // update Cells
    markCellsToDie.forEach((element) => {
      this.cells[element].select(false);
    });
    markCellsToBorn.forEach((element) => {
      this.cells[element].select(true);
      this.activeCells.add(this.cells[element]);
    });
  } */

  getAliveNeighborsCount(neighborsIndex) {
    let aliveNeighborsCount = neighborsIndex.reduce(
      (neighborsAlive, currentNeighbor) => {
        return neighborsAlive + this.getTileStatus(currentNeighbor);
      },
      0
    );

    return aliveNeighborsCount;
  }
  getTileStatus(index) {
    return this.cells[index].selected;
  }

  selectNeighbors(index) {
    const [col, row] = this.#transformIndexToPosition(index);

    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      let new_y = this.#wrapY(row + yOffset);
      for (let xOffset = -1; xOffset <= 1; xOffset++) {
        let new_x = this.#wrapX(col + xOffset);

        let neighborsIndex = this.#transformXandYtoIndex(new_x, new_y);
        if (neighborsIndex !== index) {
          let found = this.activeCells.has(this.cells[neighborsIndex]);
          this.cells[neighborsIndex].select(!found);
          if (!found) {
            this.cells[neighborsIndex].select(true);
            this.activeCells.add(this.cells[neighborsIndex]);
          }
        }
      }
    }
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

  #wrapX(x) {
    return (x + this.g_width) % this.g_width;
    // my code vs the Copilot optimized code
    /*     let result = x;
    if (x < 0) {
      result = this.g_width + x;
    } else if (x >= this.g_width) {
      result = x - this.g_width;
    }

    return result; */
  }

  #wrapY(y) {
    return (y + this.g_height) % this.g_height;
  }

  #displayItems(itemsCollection) {
    itemsCollection.forEach((item) => item.show());
  }

  #fillGrid() {
    let percentage = Math.random();
    for (let y = 0; y < this.g_height; y++) {
      for (let x = 0; x < this.g_width; x++) {
        let index = x + y * this.g_width;

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

  #clearUnselectedCells() {
    this.activeCells.forEach((item) => {
      if (!item.selected) {
        this.activeCells.delete(item);
      }
    });
  }
  #transformMouseToPosition(mx, my) {
    let x = Math.floor(mx / this.scl);
    let y = Math.floor(my / this.scl);

    return [x, y];
  }

  #transformIndexToPosition(index) {
    let x = index % this.g_width;
    let y = Math.floor(index / this.g_width);

    return [x, y];
  }

  #transformXandYtoIndex(x, y) {
    return x + y * this.g_width;
  }

  #outOfBoundaries(x, y) {
    if (x > -1 && x < this.g_width && y > -1 && y < this.g_height) return false;

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
