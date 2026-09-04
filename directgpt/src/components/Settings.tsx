import { useState } from 'react';
import { DEFAULT_MODEL } from '../settings';
import type { Settings } from '../types';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

export default function SettingsDialog({ settings, onSave, onClose }: Props) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model || DEFAULT_MODEL);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>
        <label>
          OpenAI API key
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." autoFocus />
        </label>
        <p className="hint">The key is stored only in this browser (localStorage) and sent directly to api.openai.com.</p>
        <label>
          Model
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder={DEFAULT_MODEL} />
        </label>
        <p className="hint">The paper uses “gpt-3.5-turbo”. Change it only if that model is no longer served for your account.</p>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              onSave({ apiKey: apiKey.trim(), model: model.trim() || DEFAULT_MODEL });
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
