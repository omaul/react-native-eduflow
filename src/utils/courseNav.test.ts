import { describe, it, expect } from 'vitest';
import { buildCourseSequence, getCourseNavigation } from './courseNav';
import { FolderMeta, NoteMeta } from '../types';

const FOLDER: FolderMeta = {
  title: 'Уход',
  subtopics: {
    basics: { title: 'С чего начать', order: 1 },
    medium: { title: 'Субстрат', order: 2 },
    water: { title: 'Полив', order: 3 },
  },
};

// Deliberately out of order in the manifest, to prove ordering comes from `order`
const NOTES: NoteMeta[] = [
  { slug: 'care/water/basics', title: 'Когда поливать' },
  { slug: 'care/water/overwatering', title: 'Перелив' },
  { slug: 'care/basics/needs', title: 'Что нужно растению' },
  { slug: 'care/medium/definitions', title: 'Термины' },
  { slug: 'care/medium/why-loose', title: 'Рыхлость' },
  { slug: 'other/thing/x', title: 'Из другого раздела' },
];

describe('buildCourseSequence', () => {
  it('orders notes by subtopic order, then by manifest position', () => {
    const sequence = buildCourseSequence(NOTES, 'care', FOLDER);
    expect(sequence.map((step) => step.slug)).toEqual([
      'care/basics/needs',
      'care/medium/definitions',
      'care/medium/why-loose',
      'care/water/basics',
      'care/water/overwatering',
    ]);
  });

  it('excludes notes from other folders', () => {
    const sequence = buildCourseSequence(NOTES, 'care', FOLDER);
    expect(sequence.some((step) => step.slug.startsWith('other/'))).toBe(false);
  });

  it('resolves subtopic titles', () => {
    const sequence = buildCourseSequence(NOTES, 'care', FOLDER);
    expect(sequence[0].subtopicTitle).toBe('С чего начать');
    expect(sequence[3].subtopicTitle).toBe('Полив');
  });

  it('falls back to the folder title when a subtopic is not declared', () => {
    const sequence = buildCourseSequence(
      [{ slug: 'care/unknown/note', title: 'X' }],
      'care',
      FOLDER
    );
    expect(sequence[0].subtopicTitle).toBe('Уход');
  });

  it('works without folder metadata', () => {
    const sequence = buildCourseSequence(NOTES, 'care', undefined);
    expect(sequence).toHaveLength(5);
    expect(sequence[0].subtopicTitle).toBe('care');
  });

  it('returns an empty sequence for a folder with no notes', () => {
    expect(buildCourseSequence(NOTES, 'nothing', FOLDER)).toEqual([]);
  });
});

describe('getCourseNavigation', () => {
  const sequence = buildCourseSequence(NOTES, 'care', FOLDER);

  it('returns null for a slug outside the sequence', () => {
    expect(getCourseNavigation(sequence, 'care/nope/nope')).toBeNull();
  });

  it('finds previous and next inside a subtopic', () => {
    const nav = getCourseNavigation(sequence, 'care/medium/definitions');
    expect(nav?.prev?.slug).toBe('care/basics/needs');
    expect(nav?.next?.slug).toBe('care/medium/why-loose');
  });

  it('crosses subtopic boundaries for next', () => {
    const nav = getCourseNavigation(sequence, 'care/medium/why-loose');
    expect(nav?.next?.slug).toBe('care/water/basics');
    expect(nav?.next?.subtopicTitle).toBe('Полив');
  });

  it('has no previous on the first step', () => {
    const nav = getCourseNavigation(sequence, 'care/basics/needs');
    expect(nav?.prev).toBeNull();
    expect(nav?.overallPosition).toBe(1);
  });

  it('has no next on the last step', () => {
    const nav = getCourseNavigation(sequence, 'care/water/overwatering');
    expect(nav?.next).toBeNull();
    expect(nav?.overallPosition).toBe(5);
    expect(nav?.overallTotal).toBe(5);
  });

  it('reports position inside the current subtopic', () => {
    const nav = getCourseNavigation(sequence, 'care/medium/why-loose');
    expect(nav?.position).toBe(2);
    expect(nav?.siblings).toHaveLength(2);
    expect(nav?.siblings.map((step) => step.slug)).toEqual([
      'care/medium/definitions',
      'care/medium/why-loose',
    ]);
  });

  it('lists every subtopic once, in order, with its first note', () => {
    const nav = getCourseNavigation(sequence, 'care/medium/definitions');
    expect(nav?.subtopics).toEqual([
      { key: 'basics', title: 'С чего начать', firstSlug: 'care/basics/needs', isCurrent: false },
      { key: 'medium', title: 'Субстрат', firstSlug: 'care/medium/definitions', isCurrent: true },
      { key: 'water', title: 'Полив', firstSlug: 'care/water/basics', isCurrent: false },
    ]);
  });

  it('handles a single-note section', () => {
    const single = buildCourseSequence([{ slug: 'care/basics/needs', title: 'X' }], 'care', FOLDER);
    const nav = getCourseNavigation(single, 'care/basics/needs');
    expect(nav?.prev).toBeNull();
    expect(nav?.next).toBeNull();
    expect(nav?.position).toBe(1);
    expect(nav?.siblings).toHaveLength(1);
  });
});
