export default class Tile {
  #p;

  constructor(p, params = {}) {
    const {
      vertex_width = [0, 0, 0, 0],
      vertex_color = [0, 0, 0, 0],
      border_width = [0, 0, 0, 0],
      border_color = [0, 0, 0, 0],
      pos_i = 0,
      pos_j = 0,
      size = 0,
      index = 0,
      stateList = [
        { key: false, color: "blue", value: 0 },
        { key: true, color: "orange", value: 1 },
      ],
    } = params;
    this.#p = p;

    this.vertex_width = vertex_width;
    this.vertex_color = vertex_color;
    this.border_width = border_width;
    this.border_color = border_color;
    this.x = pos_i * size;
    this.y = pos_j * size;

    this.index = index;
    this.neighbors = [];

    this.size = size;

    this.isVertex = this.vertex_width.find((value) => value > 0) ? true : false;
    this.isBorder = this.border_width.find((value) => value > 0) ? true : false;

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
    this.state = this.setState(0);
    this.value = this.mapStateValue.get(this.state);
    this.color = this.mapStateColor.get(this.state);
  }

  show() {
    //melhorar a leitura

    this.drawShape();
    this.drawPerimeter(this.isBorder);
    this.drawVertices(this.isVertex);
  }

  drawShape() {
    // desenha o tile
    const p = this.#p;
    const size = this.size;
    const x = this.x;
    const y = this.y;
    const color = this.color;

    p.fill(p.color(this.vertex_color[0]));
    p.noStroke();

    color ? p.fill(p.color(color)) : p.noFill();

    size > 0 && p.rect(x, y, size, size);
  }

  drawPerimeter(status) {
    // melhorar a leitura
    if (status) {
      const p = this.#p;
      const border_color = this.border_color;
      const border_width = this.border_width;
      const x_left = this.x;
      const x_right = this.x + this.size;
      const y_up = this.y;
      const y_bottom = this.y + this.size;

      //TOP
      if (border_width[0] > 0.0) {
        p.strokeWeight(border_width[0]);
        p.stroke(p.color(border_color[0]));
        p.line(x_left, y_up, x_right, y_up);
      }

      if (border_width[1] > 0.0) {
        //RIGHT
        p.strokeWeight(border_width[1]);
        p.stroke(p.color(border_color[1]));
        p.line(x_right, y_up, x_right, y_bottom);
      }
      //BOTTOM
      if (border_width[2] > 0.0) {
        p.strokeWeight(border_width[2]);
        p.stroke(p.color(border_color[2]));
        p.line(x_right, y_bottom, x_left, y_bottom);
      }

      //LEFT
      if (border_width[3] > 0.0) {
        p.strokeWeight(border_width[3]);
        p.stroke(p.color(border_color[3]));
        p.line(x_left, y_bottom, x_left, y_up);
      }
    }
  }

  drawVertices(status) {
    //VERTICES

    if (status) {
      const p = this.#p;
      const vertex_width = this.vertex_width;
      const vertex_color = this.vertex_color;
      const x_left = this.x;
      const x_right = this.x + this.size;
      const y_up = this.y;
      const y_bottom = this.y + this.size;

      if (vertex_width[0] > 0) {
        p.beginShape(p.POINTS);
        p.stroke(p.color(vertex_color[0]));
        p.strokeWeight(vertex_width[0]);
        p.vertex(x_left, y_up);
        p.endShape();
      }
      if (vertex_width[1] > 0) {
        p.beginShape(p.POINTS);
        p.stroke(p.color(vertex_color[1]));
        p.strokeWeight(vertex_width[1]);
        p.vertex(x_right, y_up);
        p.endShape();
      }
      if (vertex_width[2] > 0) {
        p.beginShape(p.POINTS);
        p.stroke(p.color(vertex_color[2]));
        p.strokeWeight(vertex_width[2]);
        p.vertex(x_right, y_bottom);
        p.endShape();
      }
      if (vertex_width[3] > 0) {
        p.beginShape(p.POINTS);
        p.stroke(p.color(vertex_color[3]));
        p.strokeWeight(vertex_width[3]);
        p.vertex(x_left, y_bottom);
        p.endShape();
      }
    }
  }

  setState(state) {
    if (state != this.state) {
      this.state = state;
      this.color = this.mapStateColor.get(state);
      this.value = this.mapStateValue.get(state);
      this.show();
      //console.log(this.state, this.color, this.value)
    }
  }
  getState() {
    return this.state;
  }
  getValue() {
    return this.mapStateValue.get(this.state);
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
