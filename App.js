//import Sketch from "./Sketch.js";
import GameOfLife from "./GameOfLife.js"
//import Experimental from "./Experimental.js";

const App = () => {
  let app;
  
  app = new GameOfLife({ container: "app" });

  app.execute();
};

App();
