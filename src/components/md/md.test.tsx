import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Callout from './Callout';
import Quiz from './Quiz';
import Spoiler from './Spoiler';
import Sim from './Sim';
import MarkdownContent from './MarkdownContent';

describe('Callout', () => {
  it('shows the label and the body', () => {
    render(
      <Callout label="Осторожно" attrs={{}}>
        <p>Не используй песок.</p>
      </Callout>
    );
    expect(screen.getByText('Осторожно')).toBeInTheDocument();
    expect(screen.getByText('Не используй песок.')).toBeInTheDocument();
  });

  it('derives the variant from the label', () => {
    const { container } = render(<Callout label="Никогда" attrs={{}} />);
    expect(container.querySelector('aside')?.className).toContain('danger');
  });

  it('falls back to the info variant for an unknown label', () => {
    const { container } = render(<Callout label="Просто мысль" attrs={{}} />);
    expect(container.querySelector('aside')?.className).toContain('info');
  });

  it('lets an explicit variant attribute win', () => {
    const { container } = render(<Callout label="Интересно" attrs={{ variant: 'warning' }} />);
    expect(container.querySelector('aside')?.className).toContain('warning');
  });

  it('renders without a label', () => {
    render(
      <Callout attrs={{}}>
        <p>Только текст.</p>
      </Callout>
    );
    expect(screen.getByText('Только текст.')).toBeInTheDocument();
  });
});

describe('Quiz', () => {
  it('hides the answer until the reader asks for it', () => {
    render(
      <Quiz label="Почему корни гниют?" attrs={{}}>
        <p>Нет кислорода.</p>
      </Quiz>
    );

    expect(screen.getByText('Почему корни гниют?')).toBeInTheDocument();
    expect(screen.queryByText('Нет кислорода.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Показать ответ/i }));

    expect(screen.getByText('Нет кислорода.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Показать ответ/i })).not.toBeInTheDocument();
  });

  it('supports the question/answer attribute form', () => {
    render(<Quiz attrs={{ question: 'Что такое субстрат?', answer: 'Среда для корней' }} />);

    expect(screen.getByText('Что такое субстрат?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Среда для корней')).toBeInTheDocument();
  });

  it('shows a hint before the answer is revealed', () => {
    render(
      <Quiz label="Вопрос?" attrs={{ hint: 'подумай про воздух' }}>
        <p>Ответ.</p>
      </Quiz>
    );

    expect(screen.getByText('подумай про воздух')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('подумай про воздух')).not.toBeInTheDocument();
  });
});

describe('Spoiler', () => {
  it('renders a collapsed details element with the label', () => {
    const { container } = render(
      <Spoiler label="Ответ" attrs={{}}>
        <p>Скрытый текст.</p>
      </Spoiler>
    );
    const details = container.querySelector('details');
    expect(details).toBeInTheDocument();
    expect(details).not.toHaveAttribute('open');
    expect(screen.getByText('Ответ')).toBeInTheDocument();
  });

  it('uses a default summary when no label is given', () => {
    render(<Spoiler attrs={{}} />);
    expect(screen.getByText('Показать')).toBeInTheDocument();
  });
});

describe('Sim', () => {
  it('reports an unknown simulation instead of failing silently', () => {
    render(<Sim attrs={{ name: 'no-such-sim' }} />);
    expect(screen.getByText(/не найдена/i)).toBeInTheDocument();
  });

  it('reports a missing name attribute', () => {
    render(<Sim attrs={{}} />);
    expect(screen.getByText(/не найдена/i)).toBeInTheDocument();
  });
});

describe('MarkdownContent', () => {
  it('renders markdown and directives together', () => {
    const source = [
      '# Заголовок',
      '',
      'Обычный текст.',
      '',
      ':::callout[Осторожно]',
      'Опасный совет.',
      ':::',
      '',
      ':::spoiler[Подробнее]',
      'Детали.',
      ':::',
    ].join('\n');

    const { container } = render(<MarkdownContent source={source} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Заголовок' })).toBeInTheDocument();
    expect(screen.getByText('Обычный текст.')).toBeInTheDocument();
    expect(screen.getByText('Опасный совет.')).toBeInTheDocument();
    expect(container.querySelector('aside')).toBeInTheDocument();
    expect(container.querySelector('details')).toBeInTheDocument();
  });

  it('renders markdown inside a directive body', () => {
    const source = ':::callout[Важно]\nЭто **жирный** текст.\n:::';
    const { container } = render(<MarkdownContent source={source} />);
    expect(container.querySelector('aside strong')?.textContent).toBe('жирный');
  });

  it('passes urlTransform through to images', () => {
    const source = '![Лист](leaf.png)';
    const { container } = render(
      <MarkdownContent source={source} urlTransform={(uri) => `/base/${uri}`} />
    );
    expect(container.querySelector('img')).toHaveAttribute('src', '/base/leaf.png');
  });

  it('leaves documented syntax inside code fences alone', () => {
    const source = ['```md', ':::callout[Важно]', 'текст', ':::', '```'].join('\n');
    const { container } = render(<MarkdownContent source={source} />);
    expect(container.querySelector('aside')).not.toBeInTheDocument();
    expect(container.querySelector('code')?.textContent).toContain(':::callout[Важно]');
  });
});
