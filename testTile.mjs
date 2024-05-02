import Tile from "./components/Tile.mjs";

const config = (index) =>  ({
    pos_i : 0,
    pos_j : 0,
    size : 0,
    index : index,
    stateList  :[
      { key: 0, color: "black", value: 0 },
      { key: 1, color: "red", value: 1 },
      { key: 2, color: "white", value: 0 },
    ]
  })


const cells = new Array();
const active = new Set();

for (let i = 0; i<10; i++){
    cells.push(new Tile(0,config(i)))

    if (Math.random() < 0.7) {
        cells[i].setState(1);
      } else {
        cells[i].setState(0);
      }
}

cells.forEach((item)=>{
    let val = item.getValue();

    if (val == 1){
        active.add(item)
    }
})

active.forEach((item)=>{
    let val = item.getValue();
    if (val !== 1){
        console.log(item.getValue())
    }
})
console.log(active.size)