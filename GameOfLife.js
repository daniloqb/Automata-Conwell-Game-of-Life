import Grid from "./components/Grid.js";

export default class GameOfLife {
  #container;

  constructor(params) {
    this.#container = params && params.container ? params.container : "";

    this.sketch = function (p) {
      let pause = false;
      const rows = p.windowHeight;
      const cols = p.windowWidth;
      const size = 3;
      let grid = new Grid(
        p,
        Math.floor(rows / size),
        Math.floor(cols / size),
        size
      );

      p.setup = function () {
       // p.frameRate(10);
        p.createCanvas(cols, rows);
        p.noLoop();
        //p.background("cyan");
        grid.initGrid();
      };

      p.draw = function () {
        grid.updateGrid();
      };

      p.mousePressed = function () {
        var index = grid.selectCell(p.mouseX, p.mouseY);
        // p.redraw();
        // if(index >= 0) grid.selectNeighbors(index);
      };

      p.keyPressed = function () {
        if (p.key === "p") {
          pause = !pause;

          pause ? p.loop() : p.noLoop();
        }

        if (p.keyCode == 32) { 
          !pause?p.redraw():null
        }
      };
    };
  }

  execute() {
    this.p5_2 = new p5(this.sketch, this.#container);
  }
}
