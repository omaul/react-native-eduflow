# Суммаризация проекта react-native-eduflow

## Общее описание

Статический сайт-блокнот для заметок в формате Markdown. Деплоится на GitHub Pages. Контент хранится в виде `.md` файлов в `public/content/`, а метаданные — в `public/content/index.json`. Бэкенда нет — всё работает на клиенте через fetch статических файлов.

**Стек:** React 18 + TypeScript + Vite + react-router-dom (HashRouter) + react-markdown + p5.js (генеративные фоны)

**URL:** `https://omaul.github.io/react-native-eduflow`

---

## Структура файлов

```
src/
  main.tsx                    — точка входа, рендер <App /> в #root
  App.tsx                     — корневой компонент: хедер + роутинг
  App.css                     — все стили (один файл, ~200 строк)
  index.css                   — базовые стили (body, fonts)
  types/index.ts              — типы NoteMeta, FolderMeta, ContentIndex
  hooks/useNotes.ts           — хук: загрузка index.json (список заметок + папок)
  utils/folders.ts            — утилита: извлечение top-level папки из slug
  pages/
    Home.tsx                  — главная: навигация (ссылки на "Темы" и "Все заметки")
    Folders.tsx               — список папок (группировка заметок по первому сегменту slug)
    FolderView.tsx            — заметки внутри конкретной папки + тематический фон
    AllNotes.tsx              — плоский список всех заметок
    NoteViewer.tsx            — просмотр одной заметки (загрузка .md, рендер через react-markdown)
  components/
    Icons.tsx                 — SVG-иконки (FolderIcon, ListIcon)
    NoteMetaInfo.tsx          — компонент: дата + теги заметки
    ThemeBackground.tsx       — p5.js canvas-фон для тематических страниц
  sketches/
    index.ts                  — реестр тем: "plants" и "water"
    plants.ts                 — генеративная анимация: ветви, лозы, семена, лепестки, папоротники, цветы
    water.ts                  — генеративная анимация: пузыри, волны, каустика, течения, частицы

public/
  content/
    index.json                — манифест: список папок (с темой/акцентом) и заметок (slug, title, tags, date)
    welcome.md                — приветственная заметка
    react-notes.md            — заметки по React
    guides/react/basics/      — заметка "React: основы"
    guides/react/advanced/    — заметка "React: продвинуто" (с картинкой)
    plants/medium/…           — 4 заметки про растения/субстраты
```

---

## Роутинг (HashRouter)

| Путь | Компонент | Описание |
|------|-----------|----------|
| `/#/` | `Home` | Главная — два пункта навигации |
| `/#/folders` | `Folders` | Список папок с кол-вом заметок |
| `/#/folder/:folder` | `FolderView` | Заметки конкретной папки |
| `/#/all` | `AllNotes` | Все заметки плоским списком |
| `/#/note/:slug` | `NoteViewer` | Просмотр заметки |
| `/#/note/*` | `NoteViewer` | Вложенные slug (например `plants/medium/definitions`) |

Используется `HashRouter` для совместимости с GitHub Pages (SPA без серверного роутинга).

---

## Система контента

### index.json

```json
{
  "folders": {
    "plants": { "title": "Растения", "theme": "plants", "accent": "#4a7c59" },
    "guides": { "title": "Гайды", "theme": "water", "accent": "#3a8fbf" },
    "cookbook": { "title": "Рецепты" }
  },
  "notes": [
    { "slug": "welcome", "title": "Добро пожаловать", "description": "...", "tags": ["intro"], "date": "2025-10-01" }
  ]
}
```

- **slug** определяет путь к .md файлу: `slug: "a/b"` -> `public/content/a/b/index.md` или `public/content/a/b.md`
- **Папки** — виртуальные, определяются первым сегментом slug. Заметки без `/` попадают в `_root`
- **Каждая папка** может иметь `theme` (генеративный фон) и `accent` (CSS-переменная для цвета)

### Загрузка заметки (NoteViewer)

1. Берёт slug из URL
2. Пробует загрузить `content/{slug}/index.md`, потом `content/{slug}.md`
3. Фильтрует HTML-ответы (404 на GitHub Pages возвращает HTML)
4. Рендерит через `react-markdown` с плагином `remark-gfm`
5. Относительные пути в markdown (картинки) трансформируются через `transformUri` с учётом basePath

---

## Генеративные фоны (p5.js)

Компонент `ThemeBackground` создаёт p5.js instance на canvas за контентом страницы.

### Тема "plants"
6 элементов: ветви с цветами, лозы с листьями, семена одуванчика, падающие лепестки, папоротники, бордюрные цветы. Для каждой страницы seed (slug) определяет комбинацию 2-3 элементов из предустановленных наборов.

### Тема "water"
5 элементов: пузыри, многослойные волны, каустические световые пятна, линии течений по краям, дрейфующие частицы. Все элементы отрисовываются одновременно.

### Общие принципы
- Canvas фиксирован (`position: fixed`), перекрывает весь экран
- Маскируется CSS gradient-маской: видно только по краям, центр прозрачный (чтобы не мешать чтению)
- `opacity: 0.55` для ненавязчивости
- Детерминированный seed из slug через простой хеш
- `windowResized` обработчик для адаптивности

---

## Стилизация

Один файл `App.css` (~200 строк):
- Sticky header с лого и навигацией
- Контент ограничен `max-width: 800px`
- Карточки заметок — border + border-radius
- Markdown: стилизация заголовков, код-блоков (тёмный фон), inline-код
- Адаптив: на `<640px` скрываются иконки навигации, показывается бургер-меню с dropdown
- CSS-переменная `--theme-accent` для тематического цвета ссылок и заголовков

---

## Сборка и деплой

- **Dev:** `npm start` -> Vite dev server на порту 3000
- **Build:** `npm run build` -> `tsc && vite build` -> выход в `build/`
- **Deploy:** `npm run deploy` -> build + `gh-pages -d build` (пушит в ветку `gh-pages`)
- **Base path:** `/react-native-eduflow/` (настроен в `vite.config.ts`)
- **Тесты:** `vitest` с `jsdom`, настройка через `vite.config.ts`

---

## Ключевые зависимости

| Пакет | Назначение |
|-------|-----------|
| react + react-dom 18 | UI |
| react-router-dom 7 | Клиентский роутинг (HashRouter) |
| react-markdown + remark-gfm | Рендер markdown с таблицами, чеклистами и т.д. |
| p5.js 1.x | Генеративные анимированные фоны |
| vite 6 | Сборщик |
| gh-pages | Деплой на GitHub Pages |
| typescript 5 | Типизация |

---

## Что тут НЕТ

- Бэкенда / API / базы данных
- Авторизации
- Поиска по заметкам
- Редактирования заметок в UI
- State-менеджера (всё через useState/useEffect)
- CSS-модулей или CSS-in-JS (один глобальный CSS файл)
- SSR / SSG — полностью клиентский SPA
