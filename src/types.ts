export type Note = {
  id: string;
  pitch: string;
  time: number;
  duration: string;
};

export type Composition = {
  id: string;
  name: string;
  notes: Note[];
  tempo: number;
  instrument: string;
  scale: string;
  octave: number;
};

export type Scale = {
  name: string;
  intervals: number[];
};

export type AppState = {
  compositions: Composition[];
  currentComposition: Composition | null;
  isPlaying: boolean;
  isRecording: boolean;
  isMetronomeOn: boolean;
  tempo: number;
  instrument: string;
  scale: string;
  octave: number;
  currentPlayingPitch: string | null;
  setTempo: (tempo: number) => void;
  setInstrument: (instrument: string) => void;
  setScale: (scale: string) => void;
  setOctave: (octave: number) => void;
  toggleMetronome: () => void;
  togglePlayback: () => void;
  toggleRecording: () => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  saveComposition: () => void;
  saveAsNewComposition: () => void;
  loadComposition: (id: string) => void;
  createNewComposition: () => void;
  generateRandomMelody: () => void;
  exportMidi: () => void;
  clearCurrentComposition: () => void;
};