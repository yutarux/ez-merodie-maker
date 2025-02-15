import React from 'react';
import { useStore } from '../store';
import { Save, Download, Music2, X } from 'lucide-react';

const Settings: React.FC = () => {
  const {
    isMetronomeOn,
    tempo,
    instrument,
    scale,
    octave,
    compositions,
    toggleMetronome,
    setTempo,
    setInstrument,
    setScale,
    setOctave,
    saveComposition,
    exportMidi,
    loadComposition
  } = useStore();

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Settings</h2>
        <button 
          onClick={() => (document.getElementById('settings-modal') as HTMLDialogElement)?.close()}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4 space-y-6">
        {/* 保存された楽曲リスト */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">保存された楽曲</h3>
          <div className="max-h-40 overflow-y-auto border rounded">
            {compositions.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">保存された楽曲はありません</p>
            ) : (
              <ul className="divide-y">
                {compositions.map((comp) => (
                  <li key={comp.id} className="p-2 hover:bg-gray-50">
                    <button
                      onClick={() => {
                        loadComposition(comp.id);
                        (document.getElementById('settings-modal') as HTMLDialogElement)?.close();
                      }}
                      className="w-full text-left text-sm"
                    >
                      {comp.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Instrument</label>
            <select
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="synth">FM Synth</option>
              <option value="guitar">Guitar</option>
              <option value="electric">Electric Guitar</option>
              <option value="piano">Piano</option>
              <option value="violin">Violin</option>
              <option value="flute">Flute</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Scale</label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="chromatic">Chromatic (All Notes)</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="dorian">Dorian</option>
              <option value="phrygian">Phrygian</option>
              <option value="lydian">Lydian</option>
              <option value="mixolydian">Mixolydian</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Octave</label>
            <select
              value={octave}
              onChange={(e) => setOctave(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              {[2, 3, 4, 5, 6].map((oct) => (
                <option key={oct} value={oct}>Octave {oct}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMetronome}
              className={`p-2 rounded-full ${
                isMetronomeOn ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              <Music2 size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-16 p-1 border rounded"
                min="40"
                max="240"
              />
              <span className="text-sm text-gray-600">BPM</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={saveComposition}
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
            >
              <Save size={20} />
            </button>
            <button
              onClick={exportMidi}
              className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;