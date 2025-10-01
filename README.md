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
