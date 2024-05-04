import Tile from "./Tile.js";

export default class Grid {
  constructor(p, rows, cols, cellConfig) {
    this.p = p;
    this.gridWidth = cols;
    this.gridHeight = rows;

    this.cells = Array();
    this.activeCells = new Set();

    const cellConfigDefault = (x, y, index) => ({
      index: index,
      pos_i: x,
      pos_j: y,
      size: 3,
      gap: 0,
      zoom: 1,
      dx: 0,
      dy: 0,
      cols: 500,
      rows: 500,
      stateList: [
        { key: 0, color: "black", value: 0 },
        { key: 1, color: "white", value: 1 },
      ],
    });

    this.cellConfig = cellConfig ? cellConfig : cellConfigDefault;
    this.cellSize = this.cellConfig().size;
    this.stateList = this.cellConfig().stateList;

    this.zoom = this.cellConfig().zoom;
    this.dx = this.cellConfig().dx;
    this.dy = this.cellConfig().dy;

    this.gridPosx = 0;
    this.gridPosy = 0;
    this.gridMaxX = this.gridWidth * this.zoom;
    this.gridMaxY = this.gridHeight * this.zoom;
  }

  initGrid() {
    this.#fillGrid();
  }

  updateGrid() {
    this.#clearUnselectedCells();
  }

  #fillGrid() {
    let percentage = Math.random();

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        let index = x + y * this.gridWidth;

        this.cells.push(new Tile(this.p, this.cellConfig(x, y, index)));
        let neighbors = this.getNeighborsIndex(index);
        this.cells[index].setNeighbors(neighbors);

        let state =
          Math.random() < 0
            ? this.stateList[1].key
            : this.stateList[0].key;
        this.cells[index].setState(state);
      }
    }

    this.cells.forEach((element) => {
      let value = element.getValue();
      if (value == 1) {
        this.activeCells.add(element.index);
      }
    });
  }
  #clearUnselectedCells() {
    this.activeCells.forEach((index) => {
      if (this.cells[index].getValue() == 0) {
        this.activeCells.delete(index);
      }
    });
  }

  getCellStatus(index) {
    return this.cells[index].getState();
  }
  getCellValue(index) {
    return this.cells[index].getValue();
  }
  getCellNeighbors(index) {
    return this.cells[index].getNeighbors();
  }
  setCellStatus(index, status) {
    +this.cells[index].setState(status);
    return this.cells[index].getState();
  }

  addActiveCell(index) {
    this.activeCells.add(index);
  }

  selectCell(mx, my) {
    const [x, y] = this.#transformMouseToPosition(mx, my);

    if (this.#outOfBoundaries(x, y)) return;

    const index = this.#transformXandYtoIndex(x, y);
    const found = this.activeCells.has(index);

    if (found) {
      this.cells[index].setState(this.stateList[0].key);
      this.activeCells.delete(index);
    } else {
      this.cells[index].setState(this.stateList[1].key);
      this.activeCells.add(index);
    }
  }


  updatePosition(zoom, dx, dy) {
    // Validar e ajustar os limites do zoom
    if (zoom < 1) {
      zoom = 1;
    } else if (zoom > 100) {
      zoom = 100;
    }

    // Atualizar zoom apenas se ele mudar
    if (zoom !== this.zoom) {
      let centerX = Math.floor(this.gridWidth / 2);
      let centerY = Math.floor(this.gridHeight / 2);

      dx = Math.floor(centerX - ((centerX - this.dx) * zoom) / this.zoom);
      dy = Math.floor(centerY - ((centerY - this.dy) * zoom) / this.zoom);

      this.zoom = zoom;
      this.gridMaxX = this.gridWidth * this.zoom;
      this.gridMaxY = this.gridHeight * this.zoom;
    }

    // Condicional para centralizar o grid quando zoom é 1
    if (this.zoom === 1) {
      dx = 0;
      dy = 0;
    } else {
      // Ajustar deslocamentos para evitar que a grid saia da área visível
      dx = Math.min(Math.max(dx, this.gridWidth - this.gridMaxX), 0);
      dy = Math.min(Math.max(dy, this.gridHeight - this.gridMaxY), 0);
    }

    // Aplicar o novo deslocamento
    this.dx = dx;
    this.dy = dy;

    // Atualizar a posição de cada célula
    this.cells.forEach((cell) => {
      cell.updatePosition(this.zoom, this.dx, this.dy);
    });

    return [this.zoom, this.dx, this.dy];
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
    return (x + this.gridWidth) % this.gridWidth;
  }

  #wrapY(y) {
    return (y + this.gridHeight) % this.gridHeight;
  }

  #transformMouseToPosition(mx, my) {
    let x = Math.floor((mx - this.dx) / this.zoom);
    let y = Math.floor((my - this.dy) / this.zoom);
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
}
