import Cell from "./Cell.js";

export class ViewportGrid {
  constructor(rows, cols) {
    this.cols = cols;
    this.rows = rows;
    this.zoom = 1;
    this.zoomResolution = 2;
    this.displacementResolution = 20;
    this.dx = 0;
    this.dy = 0;
    this.gridMaxX = this.cols * this.zoom;
    this.gridMaxY = this.rows * this.zoom;
  }

  getAdjustedPosition(x, y, size) {
    let adjustedX = x * this.zoom + this.dx;
    let adjustedY = y * this.zoom + this.dy;
    let adjustedSize = size * this.zoom;

    return [adjustedX, adjustedY, adjustedSize];
  }

  updatePosition(zoom, dx, dy) {
    // Validar e ajustar os limites do zoom
    if (zoom < 1) {
      zoom = 1;
    } else if (zoom > 100) {
      zoom = 100;
    }

    // Atualizar zoom apenas se ele mudar
    if (zoom !== this.zoom) {
      let centerX = Math.floor(this.cols / 2);
      let centerY = Math.floor(this.rows / 2);

      dx = Math.floor(centerX - ((centerX - this.dx) * zoom) / this.zoom);
      dy = Math.floor(centerY - ((centerY - this.dy) * zoom) / this.zoom);

      this.zoom = zoom;
      this.gridMaxX = this.cols * this.zoom;
      this.gridMaxY = this.rows * this.zoom;
    }

    // Condicional para centralizar o grid quando zoom é 1
    if (this.zoom === 1) {
      dx = 0;
      dy = 0;
    } else {
      // Ajustar deslocamentos para evitar que a grid saia da área visível
      dx = Math.min(Math.max(dx, this.cols - this.gridMaxX), 0);
      dy = Math.min(Math.max(dy, this.rows - this.gridMaxY), 0);
    }

    // Aplicar o novo deslocamento
    this.dx = dx;
    this.dy = dy;
  }

  zoomIn() {
    let zoom = this.zoom + this.zoomResolution;
    this.updatePosition(zoom, this.dx, this.dy);
  }

  zoomOut() {
    let zoom = this.zoom - this.zoomResolution;
    this.updatePosition(zoom, this.dx, this.dy);
  }

  moveRight() {
    let dx = this.dx - this.displacementResolution;
    this.updatePosition(this.zoom, dx, this.dy);
  }

  moveLeft() {
    let dx = this.dx + this.displacementResolution;
    this.updatePosition(this.zoom, dx, this.dy);
  }

  moveUp() {
    let dy = this.dy + this.displacementResolution;
    this.updatePosition(this.zoom, this.dx, dy);
  }

  moveDown() {
    let dy = this.dy - this.displacementResolution;
    this.updatePosition(this.zoom, this.dx, dy);
  }
}
/*
 * @class
 * Classe Grid
 * Contém uma coleção de células com suas características
 * Esta classe procura ao máximo ser genérica e cumprir somente a função de coleção e manipulação das células
 */
export default class Grid {
  constructor(p, rows, cols, cellConfig) {
    /*
     * this.p é a instância do p5 que será passada as celulas
     * cols e rows são as variáveis que controlarão o tamanho e a quantidade de células da grid
     * viewport será o objeto que irá controlar a visualização das células. Será responsável pelo pan e zoom
     */

    this.p = p;
    this.cols = cols;
    this.rows = rows;
    this.viewport = new ViewportGrid(rows, cols);

    /*
     * cells é o array que conterá todas as células da Grid
     * activeCells é um conjunto de índices das células ativas da Grid e que devem ser consideradas nas operações
     * O uso do conjunto activeCells é uma busca por otimização.
     */
    this.cells = Array();
    this.activeCells = new Set();

    /*
     * Caso não seja passada uma configuração para as células, uma configuração padrão será utilziada.
     */

    const cellConfigDefault = (x, y, index) => ({
      index: index,
      x,
      y,
      size: 3,
      range: 1,
      stateList: [
        { key: 0, color: "black", value: 0 },
        { key: 1, color: "white", value: 1 },
      ],
    });

    /*
     * cellConfig e cellSize são variáveis necessárias para a criação das células.
     */

    this.cellConfig = cellConfig ? cellConfig : cellConfigDefault;
    this.cellSize = this.cellConfig().size;
    this.range = this.cellConfig().range;
  }

  /*
   * function initGrid()
   * Tem a tarefa de criar todas as células da Grid.
   * Considerando a largura e a altura da grid.
   * calcula o indice e passa para a célula.
   * também calcula seus vizinhos e passa para a célula.
   */

  initGrid() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let index = x + y * this.cols;

        this.cells.push(new Cell(this.p, this.cellConfig(x, y, index)));
        let neighbors = this.getNeighborsIndex(index, this.range);
        this.cells[index].setNeighbors(neighbors);
      }
    }
  }

  /*
   * function updateGrid()
   * chama somente duas funções auxiliares
   * #showActiveCells() -> Mostra somente as células do conjunto de células ativas. Otimizando o processo
   * #clearUnselectedCells() -> Depois de mostrar as células limpa as células que não estão mais ativas do conjunto
   */
  updateGrid() {
    this.#showActiveCells();
    this.#clearUnselectedCells();
  }

  /*
   * function showAllCells() -> função que exite toda a coleção de células.
   * é usada quando for aplicado um zoom ou pan na tela.
   * também usada no início da geração da grid.
   * Para cada célula, obtem sua posição relativa de acordo com a Viewport
   */
  showAllCells() {
    this.cells.forEach((cell) => {
      const [adjustedX, adjustedY, adjustedSize] =
        this.viewport.getAdjustedPosition(cell.x, cell.y, cell.size);
      cell.show(adjustedX, adjustedY, adjustedSize);
    });
  }
  /*
   * function showActiveCells() -> função otimizada que renderiza somente as células que estão no conjunto de
   * > células ativas. Utiliza índices e não as próprias células, por este motivo as funções foram separadas.
   * Para cada célula, obtem sua posição relativa de acordo com a viewport
   */
  #showActiveCells() {
    this.activeCells.forEach((index) => {
      const cell = this.cells[index];
      const [adjustedX, adjustedY, adjustedSize] =
        this.viewport.getAdjustedPosition(cell.x, cell.y, cell.size);

      cell.show(adjustedX, adjustedY, adjustedSize);
    });
  }

  /*
   * function #clearUnselectedCells() -> limpa do conjunto de células ativas, todas as células consideradas inativas
   */
  #clearUnselectedCells() {
    this.activeCells.forEach((index) => {
      if (this.cells[index].getValue() == 0) {
        this.activeCells.delete(index);
      }
    });
  }

  /*
   *  FUNÇÕES DE INTERFACE
   *  Funções de manipulação das células
   *  Tentativa de não manipular diretamente a coleção e sim através de funções de suporte
   *  Em todas, é necessário passar o Index da célula
   */
  getCellStatus(index) {
    return this.cells[index].getState();
  }
  getCellValue(index) {
    return this.cells[index].getValue();
  }
  getCellNeighbors(index) {
    return this.cells[index].getNeighbors();
  }
  setCellState(index, status) {
    this.cells[index].setState(status);
    return this.cells[index].getState();
  }
  showCell(index) {
    const cell = this.cells[index];
    const [adjustedX, adjustedY, adjustedSize] =
      this.viewport.getAdjustedPosition(cell.x, cell.y, cell.size);

    cell.show(adjustedX, adjustedY, adjustedSize);
  }
  deleteActiveCell(index) {
    this.activeCells.delete(index);
  }
  addActiveCell(index) {
    this.activeCells.add(index);
  }

  selectCell(mx, my) {
    const [x, y] = this.#transformMouseToPosition(mx, my); // transforma as posições do mouse nos X e Y relativos
    if (this.#outOfBoundaries(x, y)) return; // Se estiver fora do visual da grid, sai da função
    const index = this.#transformXandYtoIndex(x, y); // Transforma o X e Y relativos no Index da célula
    const found = this.activeCells.has(index); // Verifica se a célula já está ativa

    return [index, found]; // função retorna o índice e o status da célula
  }

  /*
   * FUNÇÕES DE INTERFACE
   * Funções de manipulação de visualização da grid
   * Em todas, é necessário renderizar toda a grid.
   * Utiliza as funções de interface da viewport.
   * Para os outros objetos, a viewport não está diretamente visível.
   */
  zoomIn() {
    this.viewport.zoomIn();
    this.showAllCells();
  }
  zoomOut() {
    this.viewport.zoomOut();
    this.showAllCells();
  }
  moveRight() {
    this.viewport.moveRight();
    this.showAllCells();
  }
  moveLeft() {
    this.viewport.moveLeft();
    this.showAllCells();
  }
  moveUp() {
    this.viewport.moveUp();
    this.showAllCells();
  }
  moveDown() {
    this.viewport.moveDown();
    this.showAllCells();
  }

  /*
   * function getNeighborsIndex() -> função que retorna os índices de todos os vizinhos de uma célula
   * usa range como nível de profundidade dos vizinhos da célula.
   */
  getNeighborsIndex(index, range = 1) {
    //const level = Math.floor(2 * range + 1); // fórmula para identificar o nível. padrão é 1.
    const level = range;
    let neighbors = [];
    const [col, row] = this.#transformIndexToPosition(index); // pega o index da célula atual e transforma em posições x e y

    for (let yOffset = -level; yOffset <= level; yOffset++) {
      // percorre todos os vizinhos
      let new_y = this.#wrapY(row + yOffset);
      for (let xOffset = -level; xOffset <= level; xOffset++) {
        let new_x = this.#wrapX(col + xOffset);

        let neighborsIndex = this.#transformXandYtoIndex(new_x, new_y); // faz o caminho contrário, com o x e y do vizinho, calcula seu index
        if (neighborsIndex !== index) {
          // não grava o index da célula atual
          neighbors.push(neighborsIndex);
        }
      }
    }
    return neighbors;
  }

  /*
   * FUNCṌES DE SUPORTE
   * Funções da classe que auxiliam nos processos internos
   */

  /*
   * function #wrapX() -> verifica se a posição X já atravessou para o outro lado.
   */
  #wrapX(x) {
    return (x + this.cols) % this.cols;
  }
  /*
   * function #wrapY() -> verifica se a posição Y já atravessou para o outro lado.
   */
  #wrapY(y) {
    return (y + this.rows) % this.rows;
  }

  /*
   *  function #transformMouseToPosition() -> pega a posição do mouse e transforma e X e Y, levando em consideração as posições relativas
   * > alteradas pela viewport
   */

  #transformMouseToPosition(mx, my) {
    let x = Math.floor((mx - this.viewport.dx) / this.viewport.zoom);
    let y = Math.floor((my - this.viewport.dy) / this.viewport.zoom);
    return [x, y];
  }

  /*
   *  function #transformIndexToPosition() -> pega o indice, calcula e retorna sua posição x e y
   *  Tudo é baseado no número de colunas da grid.
   *  Seu módulo retorna sua posição na coluna
   *  Sua divisão mostra sua posição na linha.
   */

  #transformIndexToPosition(index) {
    let x = index % this.cols;
    let y = Math.floor(index / this.cols);

    return [x, y];
  }

  /*
   * function # transformaXandYtoIndex() -> muito importante para encontrar o indice da célula na coleção
   */
  #transformXandYtoIndex(x, y) {
    return x + y * this.cols;
  }

  /*
   * function #outOfBoundaries() -> retorna false se a posição não está dentro dos limites da grid.
   */

  #outOfBoundaries(x, y) {
    if (x > -1 && x < this.cols && y > -1 && y < this.rows) return false;

    return true;
  }
}
