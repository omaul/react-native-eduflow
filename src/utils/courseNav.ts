/**
 * Turns a folder's notes into one ordered course sequence, so a note page can show
 * where the reader is and where to go next.
 *
 * Order: subtopics by their `order`, notes inside a subtopic by their position in
 * index.json. Previous/next cross subtopic boundaries — the section reads as one path.
 */

import { FolderMeta, NoteMeta } from '../types';
import { getSubtopic, getTopLevelFolder } from './folders';

export interface CourseStep {
  slug: string;
  title: string;
  subtopic: string;
  subtopicTitle: string;
}

export interface CourseSubtopic {
  key: string;
  title: string;
  firstSlug: string;
  isCurrent: boolean;
}

export interface CourseNavigation {
  current: CourseStep;
  prev: CourseStep | null;
  next: CourseStep | null;
  /** Steps of the current subtopic, for the progress rail */
  siblings: CourseStep[];
  /** 1-based position of the current note inside its subtopic */
  position: number;
  /** All subtopics of the section, for quick jumps */
  subtopics: CourseSubtopic[];
  /** 1-based position inside the whole section */
  overallPosition: number;
  overallTotal: number;
}

export function buildCourseSequence(
  notes: NoteMeta[],
  folderKey: string,
  folderMeta?: FolderMeta
): CourseStep[] {
  const subtopics = folderMeta?.subtopics;

  const steps = notes
    .filter((note) => getTopLevelFolder(note.slug) === folderKey)
    .map((note, index) => {
      const subtopic = getSubtopic(note.slug);
      return {
        slug: note.slug,
        title: note.title,
        subtopic,
        subtopicTitle: subtopics?.[subtopic]?.title ?? folderMeta?.title ?? folderKey,
        order: subtopics?.[subtopic]?.order ?? 999,
        index,
      };
    });

  steps.sort((a, b) => (a.order === b.order ? a.index - b.index : a.order - b.order));

  return steps.map(({ slug, title, subtopic, subtopicTitle }) => ({
    slug,
    title,
    subtopic,
    subtopicTitle,
  }));
}

export function getCourseNavigation(
  sequence: CourseStep[],
  currentSlug: string
): CourseNavigation | null {
  const index = sequence.findIndex((step) => step.slug === currentSlug);
  if (index === -1) return null;

  const current = sequence[index];
  const siblings = sequence.filter((step) => step.subtopic === current.subtopic);

  const seen = new Set<string>();
  const subtopics: CourseSubtopic[] = [];
  for (const step of sequence) {
    if (seen.has(step.subtopic)) continue;
    seen.add(step.subtopic);
    subtopics.push({
      key: step.subtopic,
      title: step.subtopicTitle,
      firstSlug: step.slug,
      isCurrent: step.subtopic === current.subtopic,
    });
  }

  return {
    current,
    prev: index > 0 ? sequence[index - 1] : null,
    next: index < sequence.length - 1 ? sequence[index + 1] : null,
    siblings,
    position: siblings.findIndex((step) => step.slug === currentSlug) + 1,
    subtopics,
    overallPosition: index + 1,
    overallTotal: sequence.length,
  };
}
