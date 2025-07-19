// src/components/TicTacToe.js
import React, { useState } from 'react';

function TicTacToe() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isX, setIsX] = useState(true);

  const handleClick = (index) => {
    if (squares[index] || calculateWinner(squares)) return;

    const nextSquares = squares.slice();
    nextSquares[index] = isX ? 'X' : 'O';
    setSquares(nextSquares);
    setIsX(!isX);
  };

  const winner = calculateWinner(squares);

  return (
    <div>
      <h2>Tic Tac Toe</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 60px)' }}>
        {squares.map((val, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            style={{ width: 60, height: 60, fontSize: 24 }}
          >
            {val}
          </button>
        ))}
      </div>
      <p>{winner ? `Winner: ${winner}` : `Next: ${isX ? 'X' : 'O'}`}</p>
    </div>
  );
}

function calculateWinner(sq) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // cols
    [0, 4, 8], [2, 4, 6],             // diagonals
  ];
  for (let [a, b, c] of lines) {
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) {
      return sq[a];
    }
  }
  return null;
}

export default TicTacToe;
