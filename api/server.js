const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

function readWorldState(){
  const p = path.join(__dirname, '../../memories/WORLD_STATE.md');
  if(fs.existsSync(p)){
    const raw = fs.readFileSync(p,'utf8');
    return { ok:true, world: raw };
  }
  return { ok:false, world: '' };
}
function readChronicle(){
  const p = path.join(__dirname, '../../memories/CHRONICLE.md');
  if(fs.existsSync(p)){
    const raw = fs.readFileSync(p,'utf8');
    return { ok:true, chronicle: raw };
  }
  return { ok:false, chronicle: '' };
}
app.use('/world-state', (req,res)=>{
  res.json(readWorldState());
});
app.use('/chronicle', (req,res)=>{
  res.json(readChronicle());
});
app.use('/roadmap', (req,res)=>{
  const p = path.join(__dirname, '../../docs/ROADMAP.md');
  if(fs.existsSync(p)){
    res.type('text/markdown').send(fs.readFileSync(p,'utf8'));
  } else res.status(404).send('Not found');
});
app.listen(PORT, ()=>console.log(`World API listening on port ${PORT}`));
