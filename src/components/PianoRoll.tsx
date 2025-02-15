import React from 'react';
import * as Tone from 'tone';
import { useStore } from '../store';
import { Note } from '../types';

const SCALES = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10]
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const PianoRoll: React.FC = () => {
  const {
    scale,
    octave,
    isRecording,
    addNote,
    currentPlayingPitch
  } = useStore();
  
  const synth = React.useRef<Tone.Synth | null>(null);
  const startTimeRef = React.useRef<number>(0);
  const pressStartTimeRef = React.useRef<number>(0);
  const activeNoteRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    synth.current = new Tone.Synth().toDestination();
    return () => {
      synth.current?.dispose();
    };
  }, []);

  React.useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Tone.now();
    }
  }, [isRecording]);

  const getScaleNotes = (scale: string, octave: number) => {
    if (scale === 'chromatic') {
      // クロマチックスケール（全ての音を含む）
      return NOTE_NAMES.map(noteName => `${noteName}${octave}`);
    }
    
    const intervals = SCALES[scale as keyof typeof SCALES];
    return intervals.map(interval => {
      const noteIndex = interval;
      const noteName = NOTE_NAMES[noteIndex % 12];
      const actualOctave = octave + Math.floor(noteIndex / 12);
      return `${noteName}${actualOctave}`;
    });
  };

  const handleNoteStart = (notePitch: string) => {
    pressStartTimeRef.current = Date.now();
    activeNoteRef.current = notePitch;
    synth.current?.triggerAttack(notePitch);
  };

  const handleNoteEnd = () => {
    if (!activeNoteRef.current) return;

    const notePitch = activeNoteRef.current;
    const pressDuration = (Date.now() - pressStartTimeRef.current) / 1000; // 秒単位に変換
    const duration = Math.min(Math.max(pressDuration, 0.1), 4); // 0.1秒から4秒の間に制限
    
    synth.current?.triggerRelease();
    
    if (isRecording) {
      const newNote: Note = {
        id: crypto.randomUUID(),
        pitch: notePitch,
        time: Tone.now() - startTimeRef.current,
        duration: `${duration}`
      };
      addNote(newNote);
    }

    activeNoteRef.current = null;
  };

  const notes = getScaleNotes(scale, octave);

  return (
    <div className="h-full flex items-end p-4 pb-24">
      <div className="grid grid-cols-4 gap-3 w-full max-w-md mx-auto">
        {notes.map((note) => (
          <button
            key={note}
            className={`
              aspect-square bg-white rounded-xl shadow-lg
              active:bg-blue-100 active:shadow-inner
              flex flex-col items-center justify-center
              transition-all duration-100
              ${isRecording ? 'ring-2 ring-red-500 ring-offset-2' : ''}
              ${activeNoteRef.current === note ? 'bg-blue-100 shadow-inner scale-95' : ''}
              ${currentPlayingPitch === note ? 'bg-blue-200 shadow-lg scale-105 ring-2 ring-blue-400 ring-offset-2' : ''}
            `}
            onTouchStart={(e) => {
              e.preventDefault();
              handleNoteStart(note);
            }}
            onTouchEnd={() => handleNoteEnd()}
            onTouchCancel={() => handleNoteEnd()}
            onMouseDown={() => handleNoteStart(note)}
            onMouseUp={() => handleNoteEnd()}
            onMouseLeave={() => activeNoteRef.current === note && handleNoteEnd()}
          >
            <span className="text-2xl font-bold text-gray-800">{note.replace(/\d+/, '')}</span>
            <span className="text-sm text-gray-500">{note.match(/\d+/)?.[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PianoRoll;