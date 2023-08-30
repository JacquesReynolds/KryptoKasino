import { Welcome, Poker, Navbar, Footer, Lobby } from './components';
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen">
      <div className='gradient-bg-welcome'>
        <Welcome />
      </div>
      <Poker />
    </div>
  )
}

const App = () => {

  return (
    <div className="h-full">
      <div className='app-container gradient-bg-welcome'>
        <Navbar />
        <Routes>
          <Route path="/" element={< Home />} />
          <Route path="/game" element={<Lobby />} />
          <Route path="/play" element={< Poker />} />
        </Routes>
        <Footer />
      </div>

    </div>
  );
};

export default App;