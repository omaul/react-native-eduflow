import { Link, useLocation } from 'react-router-dom';
import { CourseNavigation } from '../utils/courseNav';
import { ArrowLeftIcon } from './Icons';
import s from './CourseNav.module.css';

interface CourseNavProps {
  nav: CourseNavigation;
}

function useNoteHref() {
  const { search } = useLocation();
  return (slug: string) => `/note/${slug}${search}`;
}

/**
 * Top of the note: where you are in the subtopic, as a thin timeline.
 * Segments behind the current one are dimmed — read means passed.
 */
export function CourseRail({ nav }: CourseNavProps) {
  const href = useNoteHref();

  return (
    <nav className={s.rail} aria-label="Позиция в теме">
      <div className={s.railHead}>
        <span className={s.railTitle}>{nav.current.subtopicTitle}</span>
        <span className={s.railCount}>
          {nav.position} / {nav.siblings.length}
        </span>
      </div>

      <ol className={s.segments}>
        {nav.siblings.map((step, index) => {
          const isCurrent = step.slug === nav.current.slug;
          const state = isCurrent ? s.current : index < nav.position - 1 ? s.passed : s.upcoming;
          return (
            <li key={step.slug} className={s.segmentItem}>
              <Link
                to={href(step.slug)}
                className={`${s.segment} ${state}`}
                title={step.title}
                aria-label={step.title}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className={s.segmentBar} />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Bottom of the note: previous/next across the whole section, plus one-tap jumps
 * to the other subtopics.
 */
export function CoursePager({ nav }: CourseNavProps) {
  const href = useNoteHref();
  const otherTopics = nav.subtopics.filter((topic) => !topic.isCurrent);

  return (
    <nav className={s.pagerNav} aria-label="Переход к другим заметкам">
      <div className={s.pager}>
        {nav.prev ? (
          <Link to={href(nav.prev.slug)} className={`${s.step} ${s.stepPrev}`} rel="prev">
            <span className={s.stepLabel}>
              <ArrowLeftIcon className={s.stepIcon} />
              Назад
            </span>
            <span className={s.stepTitle}>{nav.prev.title}</span>
          </Link>
        ) : (
          <span className={s.stepEmpty} aria-hidden="true" />
        )}

        {nav.next && (
          <Link to={href(nav.next.slug)} className={`${s.step} ${s.stepNext}`} rel="next">
            <span className={s.stepLabel}>
              Дальше
              <ArrowLeftIcon className={`${s.stepIcon} ${s.stepIconFlip}`} />
            </span>
            <span className={s.stepTitle}>{nav.next.title}</span>
          </Link>
        )}
      </div>

      {otherTopics.length > 0 && (
        <div className={s.topics}>
          <span className={s.topicsLabel}>Другие темы</span>
          <div className={s.topicsList}>
            {otherTopics.map((topic) => (
              <Link key={topic.key} to={href(topic.firstSlug)} className={s.topic}>
                {topic.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
