import Grid from "./components/Grid.js";

export default class GameOfLife {
  #container;

  constructor(params) {
    this.#container = params && params.container ? params.container : "";

    this.sketch = function (p) {
      let pause = true;
      let zoom = 5;
      let zoom_resolution = 2;
      let displacement_resolution = 20;
      let dx = 0;
      let dy = 0;
      const size = 1;
      const rows = p.windowHeight;
      const cols = p.windowWidth;
      /*     const rows = 500;
      const cols = 500; */
      const live = Symbol();
      const dead = Symbol();
      const zumbi = Symbol();

      const cellConfig = (x, y, index) => ({
        index: index,
        pos_i: x,
        pos_j: y,
        rows: Math.floor(rows / size),
        cols: Math.floor(cols / size),
        size,
        gap: 0,
        zoom,
        dx,
        dy,
        stateList: [
          { key: dead, color: "blue", value: 0 },
          { key: live, color: "orange", value: 1 },
          { key: zumbi, color: "gray", value: 1 },
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
        p.background("black");
        grid.initGrid();
      };

      p.draw = function () {
        //+  p.background("black");
        grid.updateGrid();
        this.applyRules();

        p.checkKeysDown();
      };

      p.mousePressed = function () {
        var index = grid.selectCell(p.mouseX, p.mouseY);
      };

      p.keyPressed = function () {
        switch (p.keyCode) {
          case 80: {
            pause = !pause;

            pause ? p.loop() : p.noLoop();
            break;
          }
          case 32: {
            !pause ? p.redraw() : null;
            break;
          }
          case 107: {
            p.zoomIn();
            break;
          }
          case 109: {
            p.zoomOut();

            break;
          }
          case 37: {
            p.moveLeft();

            break;
          }
          case 39: {
            p.moveRigh();
            break;
          }
          case 38: {
            p.moveUp();

            break;
          }
          case 40: {
            p.moveDown();

            break;
          }
        }
      };

      p.zoomIn = function () {
        zoom += zoom_resolution;

        [zoom, dx, dy] = grid.updatePosition(zoom, dx, dy);
      };
      p.zoomOut = function () {
        zoom -= zoom_resolution;
        [zoom, dx, dy] = grid.updatePosition(zoom, dx, dy);
      };

      p.moveRigh = function () {
        dx -= displacement_resolution;
        [zoom, dx, dy] = grid.updatePosition(zoom, dx, dy);
      };

      p.moveLeft = function () {
        dx += displacement_resolution;
        [zoom, dx, dy] = grid.updatePosition(zoom, dx, dy);
      };

      p.moveUp = function () {
        dy += displacement_resolution;
        [zoom, dx, dy] = grid.updatePosition(zoom, dx, dy);
      };

      p.moveDown = function () {
        dy -= displacement_resolution;
        [zoom, dx, dy] = grid.updatePosition(zoom, dx, dy);
      };

      p.checkKeysDown = function () {
        if (p.keyIsDown(37) === true) {
          p.moveLeft();
        }
        if (p.keyIsDown(39) === true) {
          p.moveRigh();
        }
        if (p.keyIsDown(38) === true) {
          p.moveUp();
        }
        if (p.keyIsDown(40) === true) {
          p.moveDown();
        }
      };

      p.applyRules = function (p) {
        let deadNeighborsToCheck = new Set();
        let neighborsCountCache = new Map();

        const getAliveNeighborsCount = (neighborsIndex) => {
          let aliveNeighborsCount = 0;

          for (const index of neighborsIndex) {
            if (grid.getCellStatus(index) == live) {
              aliveNeighborsCount++;
            }
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
              grid.setCellStatus(index, dead);
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

        grid.activeCells.forEach((index) => {
          let neighbors = grid.getCellNeighbors(index);

          selectCellsToCheck(index, neighbors);

          neighbors
            .filter((index) => grid.getCellValue(index) == 0)
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
