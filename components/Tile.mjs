export default class Tile {
  #p;

  constructor(p, params = {}) {
    const {
      pos_i = 0,
      pos_j = 0,
      size = 0,
      index = 0,
      stateList = [
        { key: 0, color: "blue", value: 0 },
        { key: 1, color: "orange", value: 1 },
        { key: 2, color: "green", value: 0 },
      ],
    } = params;
    
    this.#p = p;

    this.x = pos_i * size;
    this.y = pos_j * size;

    this.index = index;
    this.neighbors = [];

    this.size = size;

    this.state = 999;
    this.value = 999;
    this.color = 999;

    this.mapStateColor = new Map();
    this.mapStateValue = new Map();
    this.stateList = stateList;

    this.stateList.forEach(({ key, color, value }) => {
      this.mapStateColor.set(key, color);
      this.mapStateValue.set(key, value);
    });


   this.init();
    
  }

  init(){

    this.state = this.stateList[2].key;
    this.value = this.mapStateValue.get(this.state);
    this.color = this.mapStateColor.get(this.state);

  }
  show() {
    //melhorar a leitura

    this.drawShape();
  }

  drawShape() {
    // desenha o tile
    const p = this.#p;
    const size = this.size;
    const x = this.x;
    const y = this.y;
    const color = this.color;

    p.noStroke();
    color ? p.fill(p.color(color)) : p.noFill();
    size > 0 && p.rect(x, y, size, size);
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
   
    return  this.mapStateValue.get(this.state);

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
