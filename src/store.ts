import { create } from 'zustand';
import { AppState, Note, Composition } from './types';
import * as Tone from 'tone';

// 音楽理論の定数
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11], // メジャースケール
  minor: [0, 2, 3, 5, 7, 8, 10], // マイナースケール
  dorian: [0, 2, 3, 5, 7, 9, 10], // ドリアン
  phrygian: [0, 1, 3, 5, 7, 8, 10], // フリジアン
  lydian: [0, 2, 4, 6, 7, 9, 11], // リディアン
  mixolydian: [0, 2, 4, 5, 7, 9, 10], // ミクソリディアン
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // クロマチック
};

// 音楽理論に基づく進行パターン
const COMMON_PATTERNS = [
  [0, 2, 4], // トライアド上昇
  [4, 2, 0], // トライアド下降
  [0, 2, 1], // 隣接音進行
  [0, 4, 7], // アルペジオ
  [0, -1, 0], // 近接音装飾
];

// 確率的なリズムパターン
const RHYTHM_PATTERNS = [
  ['4n', '4n', '4n', '4n'], // 4分音符x4
  ['2n', '4n', '4n'], // 2分音符 + 4分音符x2
  ['4n', '8n', '8n', '4n', '4n'], // 4分音符 + 8分音符x2 + 4分音符x2
];

const createNewComposition = (): Composition => ({
  id: crypto.randomUUID(),
  name: `新しい楽曲 ${new Date().toLocaleString()}`,
  notes: [],
  tempo: 120,
  instrument: 'synth',
  scale: 'chromatic',
  octave: 4
});

// ローカルストレージから保存された作曲を読み込む
const loadSavedCompositions = (): Composition[] => {
  const saved = localStorage.getItem('compositions');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load compositions:', e);
      return [];
    }
  }
  return [];
};

// 音名を取得
const getNoteNameFromScale = (scale: string, octave: number, index: number): string => {
  const baseNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const scaleIntervals = SCALES[scale as keyof typeof SCALES] || SCALES.chromatic;
  const noteIndex = scaleIntervals[index % scaleIntervals.length];
  const octaveOffset = Math.floor(index / scaleIntervals.length);
  return `${baseNotes[noteIndex]}${octave + octaveOffset}`;
};

// メロディパターンを生成
const generateMelodyPattern = (length: number): number[] => {
  const pattern = [];
  let currentIndex = 0;

  while (pattern.length < length) {
    const randomPattern = COMMON_PATTERNS[Math.floor(Math.random() * COMMON_PATTERNS.length)];
    for (const step of randomPattern) {
      if (pattern.length < length) {
        currentIndex += step;
        // スケール内に収まるように調整
        while (currentIndex < 0) currentIndex += 7;
        currentIndex = currentIndex % 7;
        pattern.push(currentIndex);
      }
    }
  }

  return pattern;
};

// リズムパターンを生成
const generateRhythmPattern = (length: number): string[] => {
  const pattern = [];
  while (pattern.length < length) {
    const rhythmPattern = RHYTHM_PATTERNS[Math.floor(Math.random() * RHYTHM_PATTERNS.length)];
    pattern.push(...rhythmPattern);
  }
  return pattern.slice(0, length);
};

export const useStore = create<AppState>((set, get) => {
  // シンセサイザーのインスタンスを保持
  const synth = new Tone.Synth().toDestination();
  
  return {
    compositions: loadSavedCompositions(),
    currentComposition: createNewComposition(),
    isPlaying: false,
    isRecording: false,
    isMetronomeOn: false,
    tempo: 120,
    instrument: 'synth',
    currentPlayingPitch: null,
    scale: 'chromatic',
    octave: 4,
    
    setTempo: (tempo) => set({ tempo }),
    setInstrument: (instrument) => set({ instrument }),
    setScale: (scale) => set({ scale }),
    setOctave: (octave) => set({ octave }),
    toggleMetronome: () => set((state) => ({ isMetronomeOn: !state.isMetronomeOn })),
    
    generateRandomMelody: () => {
      const state = get();
      const melodyLength = 8; // 8音のメロディを生成
      
      // メロディとリズムのパターンを生成
      const melodyPattern = generateMelodyPattern(melodyLength);
      const rhythmPattern = generateRhythmPattern(melodyLength);
      
      // ノートを生成
      const notes: Note[] = melodyPattern.map((index, i) => {
        const pitch = getNoteNameFromScale(state.scale, state.octave, index);
        return {
          id: crypto.randomUUID(),
          pitch,
          time: i * 0.5, // 各ノート0.5秒間隔
          duration: rhythmPattern[i],
        };
      });

      // 現在の楽曲に新しいノートを追加
      if (state.currentComposition) {
        set({
          currentComposition: {
            ...state.currentComposition,
            notes: [...state.currentComposition.notes, ...notes]
          }
        });
      }
    },
    
    togglePlayback: () => {
      const state = get();
      const transport = Tone.Transport;
      
      if (state.isPlaying) {
        transport.stop();
        transport.cancel();
        set({ isPlaying: false });
      } else {
        if (!state.currentComposition) {
          set({ currentComposition: createNewComposition() });
          return;
        }
        
        transport.cancel();
        
        // 最後のノートの時間を取得
        const lastNote = state.currentComposition.notes
          .reduce((latest, note) => {
            const endTime = note.time + parseFloat(note.duration);
            return endTime > latest ? endTime : latest;
          }, 0);
        
        // 再生完了時のコールバックを設定
        transport.schedule(() => {
          transport.stop();
          transport.cancel();
          set({ isPlaying: false });
        }, lastNote);
        
        // ノートのスケジューリング
        state.currentComposition.notes.forEach(note => {
          transport.schedule(time => {
            // 再生開始時に現在のピッチを設定
            set({ currentPlayingPitch: note.pitch });
            synth.triggerAttackRelease(
              note.pitch,
              parseFloat(note.duration),
              time
            );
            // 再生終了時にピッチをクリア
            transport.schedule(() => {
              set({ currentPlayingPitch: null });
            }, time + parseFloat(note.duration));
          }, note.time);
        });
        
        transport.start();
        set({ isPlaying: true });
      }
    },
    
    toggleRecording: () => set((state) => {
      if (state.isRecording) {
        return { isRecording: false };
      } else {
        if (!state.currentComposition) {
          return {
            isRecording: true,
            currentComposition: createNewComposition()
          };
        }
        return { isRecording: true };
      }
    }),
    
    addNote: (note: Note) => set((state) => {
      if (!state.currentComposition) {
        const newComposition = createNewComposition();
        newComposition.notes = [note];
        return { currentComposition: newComposition };
      }
      
      const updatedComposition = {
        ...state.currentComposition,
        notes: [...state.currentComposition.notes, note]
      };
      
      return { currentComposition: updatedComposition };
    }),

    updateNote: (id, updates) => set((state) => {
      if (!state.currentComposition) return state;

      const updatedNotes = state.currentComposition.notes.map(note =>
        note.id === id ? { ...note, ...updates } : note
      );

      return {
        currentComposition: {
          ...state.currentComposition,
          notes: updatedNotes
        }
      };
    }),

    deleteNote: (id) => set((state) => {
      if (!state.currentComposition) return state;

      const updatedNotes = state.currentComposition.notes.filter(note => note.id !== id);

      return {
        currentComposition: {
          ...state.currentComposition,
          notes: updatedNotes
        }
      };
    }),
    
    // 新規保存 - 新しい楽曲として保存
    saveAsNewComposition: () => {
      const state = get();
      if (!state.currentComposition) return;

      const now = new Date();
      const timeStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      const newComposition: Composition = {
        ...state.currentComposition,
        id: crypto.randomUUID(),
        name: `楽曲 ${timeStr}`
      };

      const compositions = [...state.compositions, newComposition];
      localStorage.setItem('compositions', JSON.stringify(compositions));
      
      alert('新しい楽曲として保存しました');
      set({ 
        compositions,
        currentComposition: newComposition
      });
    },

    // 上書き保存 - 既存の楽曲を更新
    saveComposition: () => {
      const state = get();
      if (!state.currentComposition) return;

      // 新規作成した楽曲の場合は新規保存として扱う
      const existingComposition = state.compositions.find(c => c.id === state.currentComposition?.id);
      if (!existingComposition) {
        get().saveAsNewComposition();
        return;
      }

      const compositions = state.compositions.map(comp => 
        comp.id === state.currentComposition?.id ? {
          ...state.currentComposition,
          tempo: state.tempo,
          instrument: state.instrument,
          scale: state.scale,
          octave: state.octave
        } : comp
      );

      localStorage.setItem('compositions', JSON.stringify(compositions));
      alert('楽曲を上書き保存しました');
      
      set({ compositions });
    },
    
    loadComposition: (id) => set((state) => {
      const composition = state.compositions.find(c => c.id === id);
      if (!composition) return state;

      // 読み込んだ楽曲の設定を反映
      return { 
        currentComposition: composition,
        tempo: composition.tempo,
        instrument: composition.instrument,
        scale: composition.scale,
        octave: composition.octave
      };
    }),

    createNewComposition: () => {
      const newComp = createNewComposition();
      set({
        currentComposition: newComp,
        tempo: newComp.tempo,
        instrument: newComp.instrument,
        scale: newComp.scale,
        octave: newComp.octave
      });
    },
    
    clearCurrentComposition: () => set({ currentComposition: null }),
    
    exportMidi: () => {
      const state = get();
      if (!state.currentComposition || state.currentComposition.notes.length === 0) {
        alert('エクスポートする音符がありません');
        return;
      }

      // MIDIファイルとしてダウンロードできるように文字列に変換
      const noteData = state.currentComposition.notes.map(note => ({
        pitch: note.pitch,
        time: note.time,
        duration: note.duration
      }));

      const dataStr = JSON.stringify(noteData);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      // ダウンロードリンクを作成
      const exportName = `${state.currentComposition.name}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportName);
      linkElement.click();
    }
  };
});