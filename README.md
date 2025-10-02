# Чистая ридмишка

[Сборка лежит тут](https://omaul.github.io/react-native-eduflow)

Ура, теперь изменения подтягиваются автоматически, вот это магия конечно

## Как добавлять заметки

- Создайте Markdown-файл в `public/content`, например: `public/content/my-note.md`
- Добавьте объект в `public/content/index.json`:

```json
{
  "slug": "my-note",
  "title": "Моя заметка",
  "description": "Короткое описание",
  "tags": ["tag1"],
  "date": "2025-10-01"
}
```

- Зайдите по ссылке `/#/note/my-note` или нажмите на неё на главной странице

## Как публиковать контент

1. Локально проверьте изменения:
   - Установите зависимости (первый раз): `npm install`
   - Запустите локально: `npm start`
   - Откройте `http://localhost:3000` и убедитесь, что заметки из `public/content` и записи в `public/content/index.json` отображаются корректно.

2. Опубликуйте на GitHub Pages:
   - Выполните: `npm run deploy`
   - Скрипт соберёт проект (`npm run build`) и опубликует каталог `build/` в ветку `gh-pages` (пакет `gh-pages`).
   - Сайт будет доступен по адресу из `homepage` в `package.json`: `https://username.github.io/react-native-eduflow`.

3. Что важно знать:
   - Добавляйте/обновляйте файлы в `public/content/**` и поддерживайте список в `public/content/index.json`.
   - Слаг (`slug`) должен совпадать с путём к заметке: `slug: "a/b"` означает `public/content/a/b/index.md` или `public/content/a/b.md`.
   - Изображения кладите рядом с `index.md` и ссылайтесь относительными путями, например: `![img](./example.jpg)`.
   - Если после деплоя страница не обновилась, подождите 1–2 минуты и обновите кэш (Ctrl/Cmd+Shift+R).
