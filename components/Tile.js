export default class Tile {
  #p;

  constructor(p, params = {}) {
    const {
      x = 0,
      y = 0,
      size = 0,
      index = 0,
      gap = 0,
      stateList = [
        { key: 0, color: "black", value: 0 },
        { key: 1, color: "white", value: 1 },
      ],
    } = params;
    this.#p = p;

    this.x = x * size;
    this.y = y * size;
    this.gap = gap;

    this.index = index;
    this.neighbors = [];

    this.size = size;

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
  }

  show(x, y, size) {
    //melhorar a leitura

    if (
      x >= 0 &&
      x <= this.#p.windowWidth &&
      y >= 0 &&
      y <= this.#p.windowHeight
    ) {
      this.drawShape(x, y, size);
    }
  }

  drawShape(x, y, size) {
    // desenha o tile
    const p = this.#p;
    const gap = this.gap;
    const color = this.color;

    p.noStroke();

    color ? p.fill(p.color(color)) : p.noFill();

    size > 0 && p.rect(x, y, size - gap, size - gap);
  }

  setState(state) {
    if (state != this.state) {
      this.state = state;
      this.color = this.mapStateColor.get(state);
      this.value = this.mapStateValue.get(state);
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
