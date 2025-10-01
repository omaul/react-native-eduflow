import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="Container">
      <h1 className="Title">Навигация</h1>
      <ul className="NotesList">
        <li className="NotesList__item">
          <Link to="/folders" className="NoteLink">
            <div className="NoteTitle">Темы</div>
            <div className="NoteDescription">Просмотр заметок по папкам</div>
          </Link>
        </li>
        <li className="NotesList__item">
          <Link to="/all" className="NoteLink">
            <div className="NoteTitle">Все заметки</div>
            <div className="NoteDescription">Полный список заметок</div>
          </Link>
        </li>
      </ul>
    </div>
  );
}


