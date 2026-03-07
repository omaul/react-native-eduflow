import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import NoteViewer from './pages/NoteViewer';
import Folders from './pages/Folders';
import FolderView from './pages/FolderView';
import AllNotes from './pages/AllNotes';
import { useTheme } from './hooks/useTheme';
import shared from './styles/shared.module.css';

function ThemeToggleButton() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-md)',
        border: '1px solid transparent',
        background: 'none',
        color: 'var(--color-text)',
        cursor: 'pointer',
        fontSize: '18px',
      }}
    >
      {theme === 'dark' ? '\u2600' : '\u263E'}
    </button>
  );
}

function App() {
  return (
    <div>
      <HashRouter>
        <Header themeToggle={<ThemeToggleButton />} />
        <main className={shared.main}>
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
