import React, { useState } from 'react';
import { useStore } from '../store';
import { Music, Trash2, Edit3, X } from 'lucide-react';
import { Note } from '../types';

type EditModalProps = {
  note: Note;
  onClose: () => void;
  onUpdate: (updates: Partial<Note>) => void;
  onDelete: () => void;
};

const EditModal: React.FC<EditModalProps> = ({ note, onClose, onUpdate, onDelete }) => {
  const [duration, setDuration] = useState(parseFloat(note.duration));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">音符を編集</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              音の長さ (秒)
            </label>
            <input
              type="range"
              min="0.1"
              max="4"
              step="0.1"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-center mt-1 text-sm text-gray-600">
              {duration.toFixed(1)}秒
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => onDelete()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
            >
              <Trash2 size={16} />
              削除
            </button>
            <button
              onClick={() => {
                onUpdate({ duration: duration.toString() });
                onClose();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              更新
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NoteDisplay: React.FC = () => {
  const { currentComposition, updateNote, deleteNote } = useStore();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const notes = currentComposition?.notes || [];

  if (notes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <Music size={48} className="mb-2" />
        <p className="text-lg">録音した音符がここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-8 gap-2">
          {notes.map((note) => {
            const duration = parseFloat(note.duration);
            const width = Math.min(Math.max(Math.ceil(duration * 2), 1), 4);

            return (
              <div
                key={note.id}
                className={`
                  bg-blue-100 rounded-lg p-2 h-24
                  flex flex-col items-center justify-center
                  relative group cursor-pointer
                `}
                style={{
                  gridColumn: `span ${width}`,
                }}
                onClick={() => setEditingNote(note)}
              >
                <span className="text-lg font-bold text-blue-800">
                  {note.pitch.replace(/\d+/, '')}
                </span>
                <span className="text-xs text-blue-600">
                  {note.pitch.match(/\d+/)?.[0]}
                </span>
                <span className="text-xs text-blue-400 mt-1">
                  {duration.toFixed(1)}s
                </span>
                <button 
                  className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit3 size={12} className="text-blue-500" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {editingNote && (
        <EditModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onUpdate={(updates) => updateNote(editingNote.id, updates)}
          onDelete={() => {
            deleteNote(editingNote.id);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
};

export default NoteDisplay;