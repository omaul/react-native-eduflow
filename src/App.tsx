import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { SunIcon, MoonIcon } from './components/Icons';
import Home from './pages/Home';
import NoteViewer from './pages/NoteViewer';
import Folders from './pages/Folders';
import FolderView from './pages/FolderView';
import AllNotes from './pages/AllNotes';
import { useTheme } from './hooks/useTheme';
import headerStyles from './components/Header.module.css';
import shared from './styles/shared.module.css';

function ThemeToggleButton() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      className={headerStyles.themeToggle}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
