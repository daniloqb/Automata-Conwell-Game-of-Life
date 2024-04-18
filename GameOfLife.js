import Grid from "./components/Grid.js";

export default class GameOfLife {
  #container;

  constructor(params) {
    this.#container = params && params.container ? params.container : "";

    this.sketch = function (p) {
      const rows = 400;
      const cols = 400;
      const size = 40;
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
        grid.init();
      };

      p.draw = function () {
        grid.show();
      };

      p.mousePressed = function () {
        var index = grid.selectCell(p.mouseX, p.mouseY);
       // p.redraw();
        console.log(index)
      };
    };
  }

  execute() {
    this.p5_2 = new p5(this.sketch, this.#container);
  }
}
