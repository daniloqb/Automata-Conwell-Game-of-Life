import Grid from "./components/Grid.mjs";

const config = (x,y,index) =>  ({
    pos_i : x,
    pos_j : y,
    size : 10,
    index : index,
    stateList  :[
      { key: 0, color: "black", value: 0 },
      { key: 1, color: "red", value: 1 },
      { key: 2, color: "white", value: 0 },
    ]
  })

const grid = new Grid(0,10,10,config)
grid.initGrid();

grid.activeCells.forEach((item)=>{
    let val = item.getValue();
    if (val !== 1){
        console.log(item.getValue())
    }
})
console.log("Active Cells size: ",grid.activeCells.size)