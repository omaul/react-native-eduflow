import React from 'react';
import './App.css';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import NoteViewer from './pages/NoteViewer';
import Folders from './pages/Folders';
import FolderView from './pages/FolderView';
import AllNotes from './pages/AllNotes';

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M10 4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h4z" />
    </svg>
  );
}

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
    </svg>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="App">
      <HashRouter>
        <header className="Header">
          <div className="Header__inner">
            <Link to="/" className="Brand">Some Notes</Link>

            <nav className="Nav">
              <div className="Nav__right">
                <Link
                  to="/folders"
                  className="IconLink"
                  aria-label="Темы"
                  title="Темы"
                >
                  <FolderIcon />
                </Link>
                <Link
                  to="/all"
                  className="IconLink"
                  aria-label="Все заметки"
                  title="Все заметки"
                >
                  <ListIcon />
                </Link>

                <button
                  className="Burger"
                  aria-label="Меню"
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <span className="Burger__bars" />
                </button>
              </div>

              {menuOpen && (
                <div id="mobile-menu" className="MobileMenu" role="menu">
                  <Link to="/folders" className="MobileMenu__item" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <FolderIcon />
                    <span>Темы</span>
                  </Link>
                  <Link to="/all" className="MobileMenu__item" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <ListIcon />
                    <span>Все заметки</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </header>
        <main className="Main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/folders" element={<Folders />} />
            <Route path="/folder/:folder" element={<FolderView />} />
            <Route path="/all" element={<AllNotes />} />
            <Route path="/note/:slug" element={<NoteViewer />} />
            <Route path="/note/*" element={<NoteViewer />} />
          </Routes>
        </main>
      </HashRouter>
    </div>
  );
}

export default App;
