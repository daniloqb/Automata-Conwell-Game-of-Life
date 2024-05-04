export default class Tile {
  #p;

  constructor(p, params = {}) {
    const {
      pos_i = 0,
      pos_j = 0,
      size = 0,
      index = 0,
      gap = 0,
      zoom = 1,
      dx = 0,
      dy = 0,
      rows = 500,
      cols = 500,
      stateList = [
        { key: 0, color: "blue", value: 0 },
        { key: 1, color: "orange", value: 1 },
      ],
    } = params;
    this.#p = p;

    this.x = pos_i * size;
    this.y = pos_j * size;
    this.gap = gap;

    this.index = index;
    this.neighbors = [];

    this.size = size;
    this.zoom = zoom;
    this.dx = dx;
    this.dy = dy;
    this.rows = rows;
    this.cols = cols;
    this.new_x = this.x * this.zoom;
    this.new_y = this.y * this.zoom;
    this.new_size = this.size * this.zoom;

    this.state = 999;
    this.color = 999;
    this.value = 999;

    this.mapStateColor = new Map();
    this.mapStateValue = new Map();
    this.stateList = stateList;

    this.stateList.forEach(({ key, color, value }) => {
      this.mapStateColor.set(key, color);
      this.mapStateValue.set(key, value);
    });

    this.#init();
  }

  #init() {
    this.state = this.stateList[0].key;
    this.value = this.mapStateValue.get(this.state);
    this.color = this.mapStateColor.get(this.state);
    this.show();
  }

  show() {
    //melhorar a leitura

    if (
      this.new_x >= 0 &&
      this.new_x <= this.cols &&
      this.new_y >= 0 &&
      this.new_y <= this.rows
    ) {
      this.drawShape();
    }
  }

  drawShape() {
    // desenha o tile
    const p = this.#p;
    const size = this.new_size;
    const x = this.new_x;
    const y = this.new_y;
    const gap = this.gap;
    const color = this.color;

    p.noStroke();

    color ? p.fill(p.color(color)) : p.noFill();

    size > 0 && p.rect(x, y, size - gap, size - gap);
  }

  setZoom(zoom) {
    this.zoom = zoom;
    this.new_size = this.size * zoom;
    this.new_x = this.x * zoom + this.dx;
    this.new_y = this.y * zoom + this.dy;
  }

  setDisplacement(dx, dy) {
    (this.dx = dx), (this.dy = dy);

    this.new_x = (this.x * this.zoom)  + this.dx;
    this.new_y = (this.y  * this.zoom) + this.dy;
  }

  setState(state) {
    if (state != this.state) {
      this.state = state;
      this.color = this.mapStateColor.get(state);
      this.value = this.mapStateValue.get(state);
      this.show();
    }
  }
  getState() {
    return this.state;
  }
  getValue() {
    return this.value;
  }

  getCellIndex() {
    return this.index;
  }
  setNeighbors(neighbors) {
    this.neighbors = neighbors;
  }
  getNeighbors() {
    return this.neighbors;
  }
}
