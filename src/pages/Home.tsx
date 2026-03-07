import { Link } from 'react-router-dom';
import s from '../styles/shared.module.css';

export default function Home() {
  return (
    <div className={s.container}>
      <h1 className={s.title}>Навигация</h1>
      <ul className={s.notesList}>
        <li>
          <Link to="/folders" className={s.noteLink}>
            <div className={s.noteTitle}>Темы</div>
            <div className={s.noteDescription}>Просмотр заметок по папкам</div>
          </Link>
        </li>
        <li>
          <Link to="/all" className={s.noteLink}>
            <div className={s.noteTitle}>Все заметки</div>
            <div className={s.noteDescription}>Полный список заметок</div>
          </Link>
        </li>
      </ul>
    </div>
  );
}
