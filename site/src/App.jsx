import React from 'react';
import Home from './views/Home';
import Lore from './views/Lore';
import Roadmap from './views/Roadmap';
import WorldLog from './views/WorldLog';

export default function App(){
  return (
    <div>
      <Home />
      <Lore />
      <Roadmap />
      <WorldLog />
    </div>
  );
}
