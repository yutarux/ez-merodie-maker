import React from 'react';
import PianoRoll from './components/PianoRoll';
import Controls from './components/Controls';
import Settings from './components/Settings';
import NoteDisplay from './components/NoteDisplay';
import { Settings2 } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <Controls />
      </header>
      
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <NoteDisplay />
        </div>
        <div className="h-[40vh] min-h-[300px]">
          <PianoRoll />
        </div>
      </main>

      <div className="fixed top-4 right-4 z-50">
        <button
          className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
          onClick={() => (document.getElementById('settings-modal') as HTMLDialogElement)?.showModal()}
        >
          <Settings2 size={24} className="text-gray-700" />
        </button>
      </div>

      <dialog 
        id="settings-modal" 
        className="fixed inset-0 z-50 w-full h-full p-0 bg-white md:static md:inset-auto md:rounded-lg md:h-auto md:max-w-lg md:mx-auto backdrop:bg-black/50"
      >
        <Settings />
      </dialog>
    </div>
  );
}

export default App;