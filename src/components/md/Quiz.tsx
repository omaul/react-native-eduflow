import React from 'react';
import { QuestionIcon } from '../Icons';
import { MdDirectiveProps } from './registry';
import s from './Quiz.module.css';

/**
 * An invitation to think, not an exam. The answer stays hidden until asked for,
 * so the reader's brain gets a moment to look for connections first.
 *
 * Two forms are accepted:
 *   :::quiz[Вопрос?]{hint="..."}  Ответ  :::
 *   <quiz question="Вопрос?" answer="Ответ" />
 */
export default function Quiz({ label, attrs, children }: MdDirectiveProps) {
  const [revealed, setRevealed] = React.useState(false);
  const question = attrs.question || label;
  const answer = children ?? attrs.answer;
  const answerId = React.useId();

  return (
    <section className={s.quiz}>
      <p className={s.question}>
        <QuestionIcon className={s.icon} />
        <span>{question}</span>
      </p>

      {attrs.hint && !revealed && <p className={s.hint}>{attrs.hint}</p>}

      {revealed ? (
        <div className={s.answer} id={answerId}>
          {answer}
        </div>
      ) : (
        <button
          type="button"
          className={s.reveal}
          onClick={() => setRevealed(true)}
          aria-expanded={false}
          aria-controls={answerId}
        >
          Показать ответ
        </button>
      )}
    </section>
  );
}
