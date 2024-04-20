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
    this.current_cell = Array();

    this.tileConfig = (x, y) => ({
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

  init() {
    this.#fillGrid();
    this.#displayItems(this.cells);
  }

  update() {
    //this.logFPS && this.calcFPS();

    this.#displayItems(this.current_cell);

    // Using filter that creates another array and reasign to the same variable name
    //this.current_cell = this.current_cell.filter((element) => element.selected === true);

    // using splice direct to the original array and not creating new one
    for (let i = this.current_cell.length - 1; i >= 0; i--) {
      if (this.current_cell[i].selected === false) {
        this.current_cell.splice(i, 1);
      }
    }
  }
  selectCell(mx, my) {
    const p = this.p;

    let x = Math.floor(mx / this.scl);
    let y = Math.floor(my / this.scl);
    if (x > -1 && x < this.g_width) {
      if (y > -1 && y < this.g_height) {
        //cell inside canvas
        let index = x + y * this.g_width;
        let found = false;

        this.current_cell.forEach((element) => {
          this.mult_select === false && element.select(false);
          if (element === this.cells[index]) {
            found = true;
            element.select(false);
          }
        });

        if (!found) {
          this.cells[index].select(true);
          this.current_cell.push(this.cells[index]);
        }

        return index;
      }
    }
  }

  selectByIndex(index) {
    const p = this.p;
    let found = false;

    //cell inside canvas

    this.current_cell.forEach((element) => {
      this.mult_select === false && element.select(false);
      if (element === this.cells[index]) {
        found = true;
        element.select(false);
      }
    });

    if (!found) {
      this.cells[index].select(true);
      this.current_cell.push(this.cells[index]);
    }
  }

  selectNeighbors(index) {
    let row = Math.floor(index / this.g_width);
    let col = index % this.g_width;

    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      let new_y = this.#wrapY(row + yOffset);
      for (let xOffset = -1; xOffset <= 1; xOffset++) {
        let new_x = this.#wrapX(col + xOffset);

        let neighborsIndex = new_x + new_y * this.g_width;
        if (neighborsIndex !== index) {
          this.selectByIndex(neighborsIndex);
        }
      }
    }
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
    for (let y = 0; y < this.g_height; y++) {
      for (let x = 0; x < this.g_width; x++) {
        this.cells.push(new Tile(this.p, this.tileConfig(x, y)));
      }
    }
  }

  calcFPS() {
    const current_time = performance.now();
    const deltaTime = current_time - this.lastFrameTime;
    console.log(`Delta: ${deltaTime}`);
    this.frameCount++;
    if (deltaTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / deltaTime);
      console.log(`FPS: ${fps}`);
      this.frameCount = 0;
      this.lastFrameTime = current_time;
    }
  }
}
