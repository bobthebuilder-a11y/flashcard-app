import { useState } from 'react';

interface Props {
  onSave: (key: string) => void;
  existing?: string;
}

export default function ApiKeySetup({ onSave, existing }: Props) {
  const [key, setKey] = useState(existing || '');
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔑</span>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1">Anthropic API Key Required</h3>
          <p className="text-sm text-amber-700 mb-3">
            Your key is stored locally in your browser and never sent anywhere except directly to Anthropic.
          </p>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 px-3 py-2 text-sm border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={() => setShowKey(v => !v)}
              className="px-3 py-2 text-sm text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={() => { if (key.trim()) onSave(key.trim()); }}
              disabled={!key.trim()}
              className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
