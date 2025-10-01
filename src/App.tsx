import React from 'react';
import './App.css';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import NoteViewer from './pages/NoteViewer';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <header className="Header">
          <div className="Header__inner">
            <Link to="/" className="Brand">Some Notes</Link>
          </div>
        </header>
        <main className="Main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/note/:slug" element={<NoteViewer />} />
          </Routes>
        </main>
      </HashRouter>
    </div>
  );
}

export default App;
