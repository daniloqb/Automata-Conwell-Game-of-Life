import Tile from "./Tile.js";

export default class Grid {
  constructor(p, rows, cols, cellConfig) {
    this.p = p;
    this.gridWidth = cols;
    this.gridHeight = rows;
    this.zoom = 5;
    this.zoomResolution = 2;
    this.displacementResolution = 20;
    this.dx = 0;
    this.dy = 0;

    this.cells = Array();
    this.activeCells = new Set();

    const cellConfigDefault = (x, y, index) => ({
      index: index,
      x,
      y,
      size: 3,
      stateList: [
        { key: 0, color: "black", value: 0 },
        { key: 1, color: "white", value: 1 },
      ],
    });

    this.cellConfig = cellConfig ? cellConfig : cellConfigDefault;
    this.cellSize = this.cellConfig().size;

    this.gridMaxX = this.gridWidth * this.zoom;
    this.gridMaxY = this.gridHeight * this.zoom;
  }

  initGrid() {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        let index = x + y * this.gridWidth;

        this.cells.push(new Tile(this.p, this.cellConfig(x, y, index)));
        let neighbors = this.getNeighborsIndex(index);
        this.cells[index].setNeighbors(neighbors);
      }
    }
  }

  updateGrid() {
    this.#showActiveCells();
    this.#clearUnselectedCells();
  }

  showAllCells() {
    this.cells.forEach((cell) => {
      let adjustedX = cell.x * this.zoom + this.dx;
      let adjustedY = cell.y * this.zoom + this.dy;
      let adjustedSize = cell.size * this.zoom;
      cell.show(adjustedX, adjustedY, adjustedSize);
    });
  }

  #showActiveCells() {
    this.activeCells.forEach((index) => {
      let adjustedX = this.cells[index].x * this.zoom + this.dx;
      let adjustedY = this.cells[index].y * this.zoom + this.dy;
      let adjustedSize = this.cells[index].size * this.zoom;
      this.cells[index].show(adjustedX, adjustedY, adjustedSize);
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
  setCellState(index, status) {
    this.cells[index].setState(status);
    return this.cells[index].getState();
  }

  showCell(index) {
    let adjustedX = this.cells[index].x * this.zoom + this.dx;
    let adjustedY = this.cells[index].y * this.zoom + this.dy;
    let adjustedSize = this.cells[index].size * this.zoom;
    this.cells[index].show(adjustedX, adjustedY, adjustedSize);
  }
  deleteActiveCell(index) {
    this.activeCells.delete(index);
  }

  addActiveCell(index) {
    this.activeCells.add(index);
  }

  selectCell(mx, my) {
    const [x, y] = this.#transformMouseToPosition(mx, my);
    if (this.#outOfBoundaries(x, y)) return;
    const index = this.#transformXandYtoIndex(x, y);
    const found = this.activeCells.has(index);

    return [index, found];
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

    this.showAllCells();
  }

  zoomIn() {
    let zoom = this.zoom + this.zoomResolution;
    this.updatePosition(zoom, this.dx, this.dy);
  }

  zoomOut() {
    let zoom = this.zoom - this.zoomResolution;
    this.updatePosition(zoom, this.dx, this.dy);
  }

  moveRight() {
    let dx = this.dx - this.displacementResolution;
    this.updatePosition(this.zoom, dx, this.dy);
  }

  moveLeft() {
    let dx = this.dx + this.displacementResolution;
    this.updatePosition(this.zoom, dx, this.dy);
  }

  moveUp() {
    let dy = this.dy + this.displacementResolution;
    this.updatePosition(this.zoom, this.dx, dy);
  }

  moveDown() {
    let dy = this.dy - this.displacementResolution;
    this.updatePosition(this.zoom, this.dx, dy);
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
