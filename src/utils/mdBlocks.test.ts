import { describe, it, expect } from 'vitest';
import { parseMdBlocks, MdDirectiveBlock } from './mdBlocks';

const KNOWN = ['callout', 'quiz', 'spoiler', 'sim'];

function directives(blocks: ReturnType<typeof parseMdBlocks>): MdDirectiveBlock[] {
  return blocks.filter((b): b is MdDirectiveBlock => b.type === 'directive');
}

describe('parseMdBlocks', () => {
  it('returns a single markdown block when there are no directives', () => {
    const blocks = parseMdBlocks('# Заголовок\n\nПростой текст.', KNOWN);
    expect(blocks).toEqual([{ type: 'markdown', content: '# Заголовок\n\nПростой текст.' }]);
  });

  it('extracts a container directive with a label', () => {
    const blocks = parseMdBlocks(':::callout[Осторожно]\nНе используй песок.\n:::', KNOWN);
    expect(blocks).toEqual([
      {
        type: 'directive',
        name: 'callout',
        label: 'Осторожно',
        attrs: {},
        content: 'Не используй песок.',
      },
    ]);
  });

  it('keeps surrounding markdown as separate blocks', () => {
    const blocks = parseMdBlocks('До.\n\n:::callout[Важно]\nВнутри.\n:::\n\nПосле.', KNOWN);
    expect(blocks.map((b) => b.type)).toEqual(['markdown', 'directive', 'markdown']);
    expect(blocks[0].content.trim()).toBe('До.');
    expect(blocks[2].content.trim()).toBe('После.');
  });

  it('treats a label as optional', () => {
    const [block] = directives(parseMdBlocks(':::callout\nБез заголовка.\n:::', KNOWN));
    expect(block.label).toBeUndefined();
    expect(block.content).toBe('Без заголовка.');
  });

  it('parses attributes on a container fence', () => {
    const [block] = directives(
      parseMdBlocks(':::quiz[Почему?]{hint="подумай про воздух"}\nОтвет.\n:::', KNOWN)
    );
    expect(block.label).toBe('Почему?');
    expect(block.attrs).toEqual({ hint: 'подумай про воздух' });
  });

  it('parses a self-closing tag with attributes', () => {
    const [block] = directives(parseMdBlocks('<sim name="sponge-jar" height="360" />', KNOWN));
    expect(block).toMatchObject({
      name: 'sim',
      attrs: { name: 'sponge-jar', height: '360' },
      content: '',
    });
  });

  it('supports the attribute form of quiz documented in the content guide', () => {
    const [block] = directives(
      parseMdBlocks('<quiz question="Что такое субстрат?" answer="Среда для корней" />', KNOWN)
    );
    expect(block.attrs.question).toBe('Что такое субстрат?');
    expect(block.attrs.answer).toBe('Среда для корней');
  });

  it('leaves unknown directive names as plain markdown', () => {
    const blocks = parseMdBlocks(':::unknown[X]\nтело\n:::', KNOWN);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('markdown');
    expect(blocks[0].content).toContain('тело');
  });

  it('does not parse directives inside fenced code blocks', () => {
    const source = ['Пример синтаксиса:', '', '```md', ':::callout[Важно]', 'текст', ':::', '```'].join(
      '\n'
    );
    const blocks = parseMdBlocks(source, KNOWN);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('markdown');
    expect(blocks[0].content).toContain(':::callout[Важно]');
  });

  it('handles nested directives by tracking fence depth', () => {
    const source = [
      ':::callout[Важно]',
      'Внешний текст.',
      ':::spoiler[Ответ]',
      'Скрытое.',
      ':::',
      ':::',
    ].join('\n');
    const [block] = directives(parseMdBlocks(source, KNOWN));
    expect(block.name).toBe('callout');
    expect(block.content).toBe('Внешний текст.\n:::spoiler[Ответ]\nСкрытое.\n:::');
  });

  it('recovers gracefully from an unclosed directive without losing content', () => {
    const [block] = directives(parseMdBlocks(':::callout[Важно]\nТекст без закрытия.', KNOWN));
    expect(block.content).toBe('Текст без закрытия.');
  });

  it('does not treat an ordinary html-like line as a directive', () => {
    const blocks = parseMdBlocks('<div class="x" />', KNOWN);
    expect(blocks[0].type).toBe('markdown');
  });

  it('drops whitespace-only markdown segments', () => {
    const blocks = parseMdBlocks('\n\n:::callout\nтело\n:::\n\n', KNOWN);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('directive');
  });
});
