import { Link } from 'react-router-dom';
import s from '../styles/shared.module.css';

export default function Home() {
  return (
    <div className={s.container}>
      <h1 className={s.title}>Навигация</h1>
      <ul className={s.notesList}>
        <li>
          <Link to="/folders" className={s.noteLink}>
            <span className={s.noteTitle}>Темы</span>
            <span className={s.noteDescription}>Просмотр заметок по папкам</span>
          </Link>
        </li>
        <li>
          <Link to="/all" className={s.noteLink}>
            <span className={s.noteTitle}>Все заметки</span>
            <span className={s.noteDescription}>Полный список заметок</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
