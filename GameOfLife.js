import Grid from "./components/Grid.js";

/**
 * Classe principal que define a lógica para o Jogo da Vida (Game of Life).
 * Utiliza p5.js para renderização gráfica e interação.
 *
 * @class
 * @param {Object} params - Parâmetros de configuração inicial para o jogo.
 * @param {string} params.container - O seletor do contêiner HTML onde o jogo será renderizado.
 */

export default class GameOfLife {
  #container;

  constructor(params) {
    /**
     * @private
     * @type {string}
     * O contêiner HTML para a instância p5.
     */
    this.#container = params && params.container ? params.container : "";

    /**
     * Configura e gerencia os aspectos visuais e lógicos do jogo.
     * Essa é a função principal da classe. É toda a iteração de uma aplicação p5.js
     * nela, deve constar seus dois métodos principais setup() e draw().
     * Além de toda a iteração de funções de mouse, teclado e funções de suporte.
     * @param {p5} p - Instância do p5.js utilizada para desenho e interação.
     */

    this.sketch = function (p) {
      // variávels globais do sistema.
      let pause = false; //controla se a animação deve ficar parada ou rodar.
      const size = 1; //tamanho padrão da célula
      const rows = p.windowHeight; //número de linhas de acordo com o tamanho visível da janela. Altura
      const cols = p.windowWidth; // número de colunas de acordo com o tamanho visível da janela. Largura
      /*       const rows = 500;
      const cols = 500; */

      /*
       * Em Game of Life, as células possuem dois estados principais. live or dead
       * Aqui, estou usando Symbol() para criar uma chave única para os estados das células.
       */
      const live = Symbol(); //representa 1
      const dead = Symbol(); //representa 0
      const zumbi = Symbol(); // estado de teste

      /*
       * Array que consta a chave a cor e o valor de cada estado
       * Foi definido desta forma para poder usar mapeamento.
       * A ideia é usar poder usar outros estados que os valores possam ser iguais.
       */
      const stateList = [
        { key: dead, color: "blue", value: 0 },
        { key: live, color: "orange", value: 1 },
        { key: zumbi, color: "red", value: 1 },
      ];

      /*
       * Define a configuração inicial de cada célula
       * Foi utilizado no estilo de função pois os valores de x,y e index serão calculados na criação.
       * Cada célula terá seu index, posição e os possíveis estados.
       */
      const cellConfig = (x, y, index) => ({
        index: index,
        x,
        y,
        size,
        gap: 0,
        stateList,
      });

      /*
       * Grid é o container das células. As operações intermediárias serão gerenciadas pela grid
       * a grid recebe como parâmetro
       * instância do p5
       * número de linhas da grid
       * número de colunas da grid
       * configuração das células
       */
      let grid = new Grid(
        p,
        Math.floor(rows / size),
        Math.floor(cols / size),
        cellConfig
      );

      /*
       * Função auxiliar para estabelecer os estados inicias das células da grid
       * Pode-se criar outras funções deste tipo para preencher como desejar.
       * Percorre toda a coleção de células da grid. A cada iteração, randomize uma porcentagem
       * Randomiza também seu estado e escolhe entre live e dead
       * Configura o estado escolhido
       * Aproveita para verificar se o valor do estado da célula e 1, se for,
       * Acrescenta a célula na coleção de células ativas da grid que merecerá ser verificada
       */

      p.fillGrid = function () {
        grid.cells.forEach((cell) => {
          let percentage = Math.random();
          let state = Math.random() < percentage ? live : dead;
          cell.setState(state);
          let value = cell.getValue();
          if (value == 1) {
            grid.activeCells.add(cell.index);
          }
        });
      };

      /*
       * setup() é a função obrigatório do P5.
       * nela, estão os passos que ocorrerão somente no início do programa
       */

      p.setup = function () {
        p.frameRate(60); // ajusta a velocidade da aplicação
        p.createCanvas(cols, rows); // cria a janela do tamanho da tela
        p.noLoop(); // desativa o loop e deixa manual
        //p.background("black");
        grid.initGrid(); // inicia a Grid criando suas células
        p.fillGrid(); // função de suporte que altera os estados das células
        grid.showAllCells(); // solicita a grid a renderização de todas as células.
      };

      /*
       * Função principal de loop do P5.
       */
      p.draw = function () {
        //+  p.background("black");
        grid.updateGrid(); // atualiza as células da grid
        this.applyRules(); // aplica as regras do Game of Life

        p.checkKeysDown(); // verifica se existem teclas que estão apertadas
      };

      // Função de suporte do P5 que captura o clique do mouse.
      // Nest programa o clique do mouse seleciona uma célula da grid

      let startX = 0;
      let startY = 0;
      let drag = false;

      p.mousePressed = function () {
        startX = p.mouseX;
        startY = p.mouseY;
        drag = false;
      };
      p.mouseReleased = function (event) {
        if (!drag) {
          if (p.outOfBoundaries(p.mouseX, p.mouseY)) return; // verifica se o clique está dentro da janela, se não estiver, não continua

          // seleciona uma célula da grid. passando como parâmetro as coordenadas do mouse
          // recebe de retorno o index da célula e se ela está ativa e na coleção de células ativas da grid
          let [index, found] = grid.selectCell(p.mouseX, p.mouseY);

          // se retornou um índice válido
          if (index) {
            if (found) {
              // verifica se a célula está na coleção de células ativas da grid
              grid.setCellState(index, dead); // se estiver, marca como dead
              grid.activeCells.delete(index);

              // exclui a célula da coleção de células ativas da grid
            } else {
              grid.setCellState(index, live); // se não estiver ativa, marca como live
              grid.addActiveCell(index);
              // adiciona na coleção de células ativas
            }
            grid.showCell(index);

            // renderiza a célula selecionada para ajustar a tela.
          }
        }
      };

      p.mouseDragged = function (event) {
        let deltaX;
        let deltaY;

        deltaX = p.mouseX - startX;
        deltaY = p.mouseY - startY;

        if (deltaX > 10) {
          grid.moveLeft();
        } else if (deltaX < -10) {
          grid.moveRight();
        }

        if (deltaY > 10) {
          grid.moveUp();
        } else if (deltaY < -10) {
          grid.moveDown();
        }

        drag = true;
      };

      /*
       * outOfBoundaries
       * parâmetros x, y
       * recebe os parâmetros e verifica se estão dentro da área visível da grid
       */
      p.outOfBoundaries = function (x, y) {
        if (x > -1 && x < cols && y > -1 && y < rows) return false;

        return true;
      };

      /*
       * Funcão de suporte do P5 que verifica se uma tecla foi pressionada
       */

      p.keyPressed = function () {
        switch (p.keyCode) {
          case 80: {
            // TECLA P
            pause = !pause; // inicia ou para a animação
            pause ? p.loop() : p.noLoop(); // ajusta o loop
            break;
          }
          case 32: {
            // TECLA ESPAÇO
            !pause ? p.redraw() : null; // com a animação pausada, executa passo a passo ao clicar no ESPAÇO
            break;
          }
          case 107: {
            // TECLA NUMPAD +
            grid.zoomIn(); // chama zoom in na grid
            break;
          }
          case 109: {
            // TECLA NUMPAD -
            grid.zoomOut(); // chama zoom out na grid
            break;
          }
          case 37: {
            // TECLA ARROW LEFT
            grid.moveLeft(); // move a visualização
            break;
          }
          case 39: {
            // TECLA ARROW RIGHT
            grid.moveRight(); // move a visualização
            break;
          }
          case 38: {
            // TECLA ARROW UP
            grid.moveUp(); // move a visualização
            break;
          }
          case 40: {
            // TECLA ARROW DOWN
            grid.moveDown(); // move a visualização
            break;
          }
        }
      };

      /*
       *  Função que usa o wheel do mouse para aplicar Zoom na grid.
       */

      p.mouseWheel = function (event) {
        if (event.delta > 0) {
          grid.zoomIn();
        } else if (event.delta < 0) {
          grid.zoomOut();
        }
        return false;
      };

      /*
       * função de suporte que verifica se uma tecla continua pressionada.
       * executa os mesmos comandos de tecla clicada
       */
      p.checkKeysDown = function () {
        if (p.keyIsDown(37) === true) {
          grid.moveLeft();
        }
        if (p.keyIsDown(39) === true) {
          grid.moveRight();
        }
        if (p.keyIsDown(38) === true) {
          grid.moveUp();
        }
        if (p.keyIsDown(40) === true) {
          grid.moveDown();
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
              grid.setCellState(index, dead);
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
              grid.setCellState(index, live);
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

  /*
  Método de execução da animação. No constructor se cria toda a estrutura
  No método execute() cria o objeto p5 principal, com seu sketch e o container opcional que o app irá rodar.
  */
  execute() {
    this.p5_2 = new p5(this.sketch, this.#container);
  }
}
