import React from 'react';
import { Link } from 'react-router-dom';
import { FolderIcon, ListIcon } from './Icons';
import styles from './Header.module.css';

interface HeaderProps {
  themeToggle?: React.ReactNode;
}

export default function Header({ themeToggle }: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          Some Notes
        </Link>

        <nav className={styles.nav}>
          <div className={styles.navRight}>
            <Link to="/folders" className={styles.iconLink} aria-label="Темы" title="Темы">
              <FolderIcon />
            </Link>
            <Link
              to="/all"
              className={styles.iconLink}
              aria-label="Все заметки"
              title="Все заметки"
            >
              <ListIcon />
            </Link>
            {themeToggle}

            <button
              className={styles.burger}
              aria-label="Меню"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={styles.burgerBars} />
            </button>
          </div>

          {menuOpen && (
            <div id="mobile-menu" className={styles.mobileMenu} role="menu">
              <Link
                to="/folders"
                className={styles.mobileMenuItem}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <FolderIcon />
                <span>Темы</span>
              </Link>
              <Link
                to="/all"
                className={styles.mobileMenuItem}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <ListIcon />
                <span>Все заметки</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
