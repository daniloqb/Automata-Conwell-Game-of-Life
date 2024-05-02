import Grid from "./components/Grid.mjs";


export default class GameOfLife {
  #container;

  constructor(params) {
    this.#container = params && params.container ? params.container : "";

    this.sketch = function (p) {
      let pause = false;
      const size = 60;
      const rows = 600;
      const cols = 600;
      const live = 1;
      const dead = 0;
      /*       const rows = 600;
      const cols = 600; */

      const cellConfig = (x, y, index) => ({
        index: index,
        pos_i: x,
        pos_j: y,
        size,
        stateList: [
          { key: dead, color: "blue", value: 0 },
          { key: live, color: "orange", value: 1 },
          { key: 2, color: "gray", value: 0 },
        ],
      });

   

      let grid = new Grid(
        p,
        Math.floor(rows / size),
        Math.floor(cols / size),
        cellConfig
      );

      p.setup = function () {
        p.frameRate(10);
        p.createCanvas(cols, rows);
        p.noLoop();
        //p.background("cyan");
        grid.initGrid();
      };

      p.draw = function () {
        grid.updateGrid();
        this.applyRules();
      };

      p.mousePressed = function () {
        var index = grid.selectCell(p.mouseX, p.mouseY);

      };

      p.keyPressed = function () {
        if (p.key === "p") {
          pause = !pause;

          pause ? p.loop() : p.noLoop();
        }

        if (p.keyCode == 32) {
          !pause ? p.redraw() : null;
        }
      };

      p.applyRules = function (p) {
        let deadNeighborsToCheck = new Set();
        let neighborsCountCache = new Map();

        const getAliveNeighborsCount = (neighborsIndex) => {
          let aliveNeighborsCount = 0;

          for (const index of neighborsIndex) {
            aliveNeighborsCount += grid.getCellValue(index);
            
          }
        

          return aliveNeighborsCount;
        };

        const selectCellsToCheck = (index, neighbors) => {
          let aliveNeighborsCount = neighborsCountCache.get(index);

          if (aliveNeighborsCount === undefined) {
            aliveNeighborsCount = getAliveNeighborsCount(neighbors);
            neighborsCountCache.set(index, aliveNeighborsCount);
          }
        };

        const applyRulesForLiveCells = (neighborsCountCache) => {
          for (let index of neighborsCountCache.keys()) {
            let aliveNeighborsCount = neighborsCountCache.get(index);
            if (aliveNeighborsCount < 2 || aliveNeighborsCount > 3) {
              grid.setCellStatus(index,dead);
            }
          }
        };

        const applyRulesForDeadCells = (
          neighborsCountCache,
          deadNeighborsToCheck
        ) => {
          for (let index of deadNeighborsToCheck) {
            let aliveNeighborsCount = neighborsCountCache.get(index);
            if (aliveNeighborsCount === 3) {
              grid.setCellStatus(index, live);
              grid.addActiveCell(index);
            }
          }
        };

        grid.activeCells.forEach((element) => {
          let index = element.index;
          let neighbors = element.neighbors;

          selectCellsToCheck(index, neighbors);

          neighbors
            .filter((index) => grid.getCellStatus(index) == dead)
            .forEach((index) => {
              deadNeighborsToCheck.add(index);
            });
        });

        deadNeighborsToCheck.forEach((index) => {
          let neighbors = grid.cells[index].neighbors;
          selectCellsToCheck(index, neighbors);
        });

        applyRulesForLiveCells(neighborsCountCache);
        applyRulesForDeadCells(neighborsCountCache, deadNeighborsToCheck);
      };
    };
  }

  execute() {
    this.p5_2 = new p5(this.sketch, this.#container);
  }
}
