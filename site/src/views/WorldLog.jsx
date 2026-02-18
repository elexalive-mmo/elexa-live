import React, {useEffect, useState} from 'react';

export default function WorldLog(){
  const [world, setWorld] = useState('Loading...');
  useEffect(()=>{
    fetch('/api/chronicle')
      .then(r=>r.json())
      .then(j=> setWorld(j.chronicle || 'No world events'))
      .catch(_=> setWorld('Error loading'));
  },[]);
  return (
    <div style={{padding:20}}>
      <h1>World Log</h1>
      <pre style={{whiteSpace:'pre-wrap'}}>{world}</pre>
    </div>
  );
}
