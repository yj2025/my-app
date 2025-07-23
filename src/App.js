// App.js
import React from 'react';
import TicTacToe from './components/TicTacToe';
import Weather from './components/Weather';

function App() {
  return (
    <div>
      <h1>React 게임</h1>
      <TicTacToe />
      <h1>Weather</h1>
      <Weather />
    </div>
  );
}

export default App;