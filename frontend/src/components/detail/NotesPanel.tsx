'use client';

import { useState } from 'react';
import type { Note } from '@/types/client';

interface Props {
  notes: Note[];
  onAddNote: (text: string) => Promise<void>;
}

export default function NotesPanel({ notes, onAddNote }: Props) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await onAddNote(text.trim());
    setText('');
    setSaving(false);
  };

  return (
    <section className="card notes-panel">
      <h3 className="serif">Matchmaker Notes</h3>
      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="notes-empty">No notes yet. Add context from calls and meetings below.</p>
        ) : (
          notes.map((note) => (
            <div key={note.timestamp} className="note-item">
              <p className="note-text">{note.text}</p>
              <p className="note-time">{new Date(note.timestamp).toLocaleString('en-IN')}</p>
            </div>
          ))
        )}
      </div>
      <textarea
        className="input"
        rows={4}
        placeholder="Add a note — family preferences, call summary, red flags..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn-primary" type="button" onClick={submit} style={{ marginTop: 10, width: '100%' }}>
        {saving ? 'Saving...' : 'Add Note'}
      </button>
    </section>
  );
}
