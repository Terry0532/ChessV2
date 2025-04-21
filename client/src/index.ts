import React from 'react';
import { createRoot } from 'react-dom/client';
import "bootstrap/dist/css/bootstrap.min.css";
import './index.css';
import Game from './components/game'
import { socket } from './socket';
import { AuthProvider } from './firebase/AuthContext';

const root = createRoot(document.getElementById('root'));
root.render(
  React.createElement(AuthProvider, null, 
    React.createElement(Game, { socket })
  )
);
