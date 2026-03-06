interface NoteMetaInfoProps {
  date?: string;
  tags?: string[];
}

export default function NoteMetaInfo({ date, tags }: NoteMetaInfoProps) {
  if (!date && (!tags || tags.length === 0)) return null;

  return (
    <div className="NoteMeta">
      {date && <span>{date}</span>}
      {tags && tags.length > 0 && (
        <span>{tags.map((t) => `#${t}`).join(' ')}</span>
      )}
    </div>
  );
}
