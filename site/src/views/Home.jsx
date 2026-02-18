import React from 'react';

export default function Home(){
  const [state, setState] = React.useState({world: 'loading'});

  React.useEffect(() => {
    fetch('/api/world-state')
      .then(res => res.json())
      .then(data => setState({world: data.world || 'unknown'}))
      .catch(() => setState({world: 'unavailable'}));
  }, []);

  return (
    <div style={{padding:20}}>
      <h1>Elexa Live</h1>
      <p>Welcome to the Elexa Live main site. World state: {state.world}</p>
    </div>
  );
}
