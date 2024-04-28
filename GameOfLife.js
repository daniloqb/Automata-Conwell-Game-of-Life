import Grid from "./components/Grid.js";

export default class GameOfLife {
  #container;

  constructor(params) {
    this.#container = params && params.container ? params.container : "";

    this.sketch = function (p) {
      const rows = 500;
      const cols = 500;
      const size = 25;
      let grid = new Grid(
        p,
        Math.floor(rows / size),
        Math.floor(cols / size),
        size
      );

      p.setup = function () {
        p.createCanvas(cols, rows);
        // p.noLoop();
        //p.background("cyan");
        grid.initGrid();
      };

      p.draw = function () {
        grid.updateGrid();
      };

      p.mousePressed = function () {
        var index = grid.selectCell(p.mouseX, p.mouseY);
        // p.redraw();
        if(index >= 0) grid.selectNeighbors(index);
      };
    };
  }

  execute() {
    this.p5_2 = new p5(this.sketch, this.#container);
  }
}
