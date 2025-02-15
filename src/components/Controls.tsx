import React from 'react';
import { useStore } from '../store';
import { Play, Pause, Square, SwordIcon, Save, Download, FolderOpen, FilePlus, Wand2 } from 'lucide-react';

const Controls: React.FC = () => {
  const {
    isPlaying,
    isRecording,
    compositions,
    currentComposition,
    togglePlayback,
    toggleRecording,
    loadComposition,
    saveComposition,
    saveAsNewComposition,
    createNewComposition,
    generateRandomMelody,
    exportMidi,
  } = useStore();

  const [isCompositionListOpen, setIsCompositionListOpen] = React.useState(false);

  // 現在の楽曲が保存済みかどうかを確認
  const isExistingComposition = compositions.some(c => c.id === currentComposition?.id);

  return (
    <div className="max-w-4xl mx-auto px-8 py-4">
      <div className="flex justify-between items-center">
        {/* 楽曲選択 */}
        <div className="relative flex items-center space-x-2">
          <button
            onClick={() => setIsCompositionListOpen(!isCompositionListOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
          >
            <FolderOpen size={20} />
            <span className="text-sm">
              {currentComposition?.name || '楽曲を選択'}
            </span>
          </button>

          <button
            onClick={createNewComposition}
            className="p-2 rounded-lg bg-white border shadow-sm hover:bg-gray-50"
            title="新規作成"
          >
            <FilePlus size={20} />
          </button>

          {/* 楽曲リストのドロップダウン */}
          {isCompositionListOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50">
              <div className="p-2">
                {compositions.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">保存された楽曲はありません</p>
                ) : (
                  <ul className="divide-y">
                    {compositions.map((comp) => (
                      <li key={comp.id}>
                        <button
                          onClick={() => {
                            loadComposition(comp.id);
                            setIsCompositionListOpen(false);
                          }}
                          className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded"
                        >
                          {comp.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 再生・録音コントロール */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-500' : 'bg-gray-200'
            } text-white shadow-md hover:opacity-90`}
            title={isRecording ? '録音停止' : '録音開始'}
          >
            {isRecording ? <Square size={24} /> : <SwordIcon size={24} />}
          </button>
          
          <button
            onClick={togglePlayback}
            className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:opacity-90"
            title={isPlaying ? '停止' : '再生'}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>

          <button
            onClick={generateRandomMelody}
            className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-md hover:opacity-90"
            title="ランダムメロディを生成"
          >
            <Wand2 size={24} />
          </button>
        </div>

        {/* 保存・エクスポートボタン */}
        <div className="flex items-center space-x-2">
          {isExistingComposition && (
            <button
              onClick={saveComposition}
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-md"
              title="上書き保存"
            >
              <Save size={20} />
            </button>
          )}
          <button
            onClick={saveAsNewComposition}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-md"
            title="新規保存"
          >
            <Save size={20} />
          </button>
          <button
            onClick={exportMidi}
            className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 shadow-md"
            title="楽曲をダウンロード"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* ステータス表示 */}
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-500">
          {isExistingComposition ? '既存の楽曲を編集中' : '新規楽曲を作成中'}
        </span>
      </div>
    </div>
  );
};

export default Controls;