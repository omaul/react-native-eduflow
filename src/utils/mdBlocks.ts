/**
 * Splits markdown source into plain-markdown segments and custom directive blocks.
 *
 * Supported syntax (see .claude/content-guide.md):
 *
 *   :::callout[Осторожно]
 *   Текст блока
 *   :::
 *
 *   :::quiz[Вопрос?]{hint="подсказка"}
 *   Ответ
 *   :::
 *
 *   <sim name="sponge-jar" />
 *
 * Directives are recognised only at the top level of a document and never inside
 * fenced code blocks, so a note can document the syntax without triggering it.
 * Unknown directive names are left untouched as ordinary markdown.
 */

export interface MdTextBlock {
  type: 'markdown';
  content: string;
}

export interface MdDirectiveBlock {
  type: 'directive';
  name: string;
  label?: string;
  attrs: Record<string, string>;
  content: string;
}

export type MdBlock = MdTextBlock | MdDirectiveBlock;

const OPEN_FENCE = /^:{3,}\s*([a-zA-Z][\w-]*)\s*(\[[^\]]*\])?\s*(\{[^}]*\})?\s*$/;
const CLOSE_FENCE = /^:{3,}\s*$/;
const SELF_CLOSING_TAG = /^<\s*([a-zA-Z][\w-]*)\s*([^>]*?)\/?\s*>$/;
const CODE_FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const ATTR_PAIR = /([a-zA-Z][\w-]*)\s*=\s*"([^"]*)"/g;

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of raw.matchAll(ATTR_PAIR)) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

export function parseMdBlocks(source: string, knownNames: readonly string[]): MdBlock[] {
  const known = new Set(knownNames);
  const lines = source.split('\n');
  const blocks: MdBlock[] = [];
  let buffer: string[] = [];
  let inCodeFence = false;

  function flushText() {
    const content = buffer.join('\n');
    if (content.trim()) blocks.push({ type: 'markdown', content });
    buffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code fences shield their contents from directive parsing
    if (CODE_FENCE.test(line)) {
      inCodeFence = !inCodeFence;
      buffer.push(line);
      continue;
    }
    if (inCodeFence) {
      buffer.push(line);
      continue;
    }

    const open = OPEN_FENCE.exec(line);
    if (open && known.has(open[1])) {
      flushText();
      const label = open[2] ? open[2].slice(1, -1).trim() : '';
      const attrs = open[3] ? parseAttrs(open[3]) : {};
      const body: string[] = [];
      let depth = 1;
      let innerCode = false;

      for (i++; i < lines.length; i++) {
        const inner = lines[i];
        if (CODE_FENCE.test(inner)) innerCode = !innerCode;
        if (!innerCode) {
          if (CLOSE_FENCE.test(inner)) {
            depth--;
            if (depth === 0) break;
          } else if (OPEN_FENCE.test(inner)) {
            depth++;
          }
        }
        body.push(inner);
      }

      blocks.push({
        type: 'directive',
        name: open[1],
        label: label || undefined,
        attrs,
        content: body.join('\n'),
      });
      continue;
    }

    const tag = SELF_CLOSING_TAG.exec(line.trim());
    if (tag && known.has(tag[1])) {
      flushText();
      blocks.push({
        type: 'directive',
        name: tag[1],
        attrs: parseAttrs(tag[2] || ''),
        content: '',
      });
      continue;
    }

    buffer.push(line);
  }

  flushText();
  return blocks;
}
