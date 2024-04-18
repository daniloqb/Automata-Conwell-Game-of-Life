import Grid from "./components/Grid.js";

export default class Sketch {
  #container;

  constructor(params) {
    this.#container = params && params.container ? params.container : "";

    this.sketch = function (p) {
      const rows = 10;
      const cols = 10;
      const size = 40;
      let grid = new Grid(p,rows, cols, size);

      p.setup = function () {
        p.createCanvas(cols * size , rows * size);
        p.noLoop();
        p.background(220);
        grid.init();
        
      };

      p.draw = function () {
      
        grid.show();
      };

      p.mousePressed = function(){

        var cell = grid.selectCell(p.mouseX,p.mouseY);
        p.redraw();
        
       
      }
    };
  }

  execute() {
    this.p5_2 = new p5(this.sketch, this.#container);
  }
}
