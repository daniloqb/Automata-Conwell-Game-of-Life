import Tile from "./Tile.js";

export default class Grid {
  constructor(p, h, w, s) {
    this.p = p;
    this.g_width = w;
    this.g_height = h;
    this.scl = s;
    this.logFPS = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.mult_select = true;
    this.cells = Array();
    this.current_cell = Array();
    this.need_update = false;
    this.need_full_update = true;

    for (var y = 0; y < this.g_height; y++) {
      for (var x = 0; x < this.g_width; x++) {
        this.cells.push(
          new Tile(p, {
            pos_i: x,
            pos_j: y,
            size: this.scl,
           // border_width: [0.6, 0.6, 0.6, 0.6],
            border_color: ["gray", "gray", "gray", "gray"],
            //vertex_width: [0, 0, 0, 0],
            vertex_color: ["black", "black", "black", "black"],
            color: "blue",
            color_select: "orange",
          })
        );
      }
    }
  }

  init() {
    //ESTE CÓDIGO FICOU COM 46 FPS
    this.cells.forEach((element) => {
      element.show();
    });
  }

  show() {
    //this.logFPS && this.calcFPS();

    this.current_cell.forEach((element) => {
      element.show();
    });

    // Using filter that creates another array and reasign to the same variable name
    //this.current_cell = this.current_cell.filter((element) => element.selected === true);

    // using splice direct to the original array and not creating new one
    for (let i = this.current_cell.length - 1; i >= 0; i--) {
      if (this.current_cell[i].selected === false) {
        this.current_cell.splice(i, 1);
      }
    }

    //console.log(this.current_cell.length);

    /* 
 ESTE FICOU COM 40 FPS

this.cells.map((element) => element.show())
 
*/

    /* 
   ESTE CÓDIGO FICOU COM 46 FPS 

    this.cells.forEach(element => {
      element.show();
    }); 

/*     

ESTE CÓDIGO FICOU COM 46 PFS
for (var i = 0; i < this.cells.length; i++) {


      var cell = this.cells[i];
      cell.show();
    } */
  }
  selectCell(mx, my) {
    const p = this.p;

    let x = Math.floor(mx / this.scl);
    let y = Math.floor(my / this.scl);
    if (x > -1 && x < this.g_width) {
      if (y > -1 && y < this.g_height) {
        //cell inside canvas
        let index = x + y * this.g_width;
        let found = false;

        this.current_cell.forEach((element) => {
          this.mult_select === false && element.select(false);
          if (element === this.cells[index]) {
            found = true;
            element.select(false);
          }
        });

        if (!found) {
          
          this.cells[index].select(true);
          this.current_cell.push(this.cells[index]);

          index = x + (y+1) * this.g_width;
          this.cells[index].select(true);
          this.cells[index].cor("red")          
          this.current_cell.push(this.cells[index]);

          index = x+1 + (y+1) * this.g_width;
          this.cells[index].select(true);
          this.cells[index].cor("red")          
          this.current_cell.push(this.cells[index]);
          index = x-1 + (y+1) * this.g_width;
          this.cells[index].select(true);
          this.cells[index].cor("red")          
          this.current_cell.push(this.cells[index]);
        }
 
        console.log(`X: ${x}, Y: ${y}, index: ${index}`)
        let line = Math.floor(index/this.g_width)
        let row = index - (line*this.g_width);
        console.log(`row: ${row}, line: ${line}`) 
        return index;

      }
    }
  }

  selectByIndex(index) {
    const p = this.p;
    let found = false;

        //cell inside canvas

        this.current_cell.forEach((element) => {
          this.mult_select === false && element.select(false);
          if (element === this.cells[index]) {
            found = true;
            element.select(false);
          }
        });

        if (!found) {
          this.cells[index].select(true);
          this.current_cell.push(this.cells[index]);
        }

           
    
  }

  selectNeighbors(index){
    let line = Math.floor(index/this.g_width)
    let row = index - (line*this.g_width);
  }

  calcFPS() {
    const current_time = performance.now();
    const deltaTime = current_time - this.lastFrameTime;
    console.log(`Delta: ${deltaTime}`);
    this.frameCount++;
    if (deltaTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / deltaTime);
      console.log(`FPS: ${fps}`);
      this.frameCount = 0;
      this.lastFrameTime = current_time;
    }
  }
}
