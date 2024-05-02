import Grid from "./components/Tile.mjs";

export default class Experimental {
  #container;

  constructor(params) {
    this.#container = params && params.container ? params.container : "";

    this.sketch = function (p) {
     

      p.setup = function () {
        p.createCanvas(400,400);
        p.background(0)
      };

      p.draw = function () {
      
 
      };

      p.mousePressed = function(){ 
       
      }
    };
  }

  execute() {
    this.p5_2 = new p5(this.sketch, this.#container);
  }
}
