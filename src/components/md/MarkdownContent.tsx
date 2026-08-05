import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseMdBlocks } from '../../utils/mdBlocks';
import { mdDirectives, mdDirectiveNames } from './registry';

interface MarkdownContentProps {
  source: string;
  urlTransform?: (uri: string) => string;
  className?: string;
}

/**
 * Renders markdown with project directives (see .claude/content-guide.md).
 * Plain segments go through react-markdown; directive blocks are handed to the
 * components registered in ./registry, with their body rendered as markdown too.
 */
export default function MarkdownContent({ source, urlTransform, className }: MarkdownContentProps) {
  const blocks = parseMdBlocks(source, mdDirectiveNames);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === 'markdown') {
          return (
            <ReactMarkdown key={index} remarkPlugins={[remarkGfm]} urlTransform={urlTransform}>
              {block.content}
            </ReactMarkdown>
          );
        }

        const Directive = mdDirectives[block.name];
        if (!Directive) return null;

        return (
          <Directive key={index} label={block.label} attrs={block.attrs}>
            {block.content.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={urlTransform}>
                {block.content}
              </ReactMarkdown>
            ) : null}
          </Directive>
        );
      })}
    </div>
  );
}
