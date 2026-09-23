import { useEffect, useRef, useState } from 'react';
import { providerOf, type Provider } from '../models';
import type { Settings } from '../types';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
  focusProvider?: Provider;
}

export default function SettingsDialog({ settings, onSave, onClose, focusProvider }: Props) {
  const [openaiApiKey, setOpenaiApiKey] = useState(settings.openaiApiKey);
  const [anthropicApiKey, setAnthropicApiKey] = useState(settings.anthropicApiKey);
  const [googleApiKey, setGoogleApiKey] = useState(settings.googleApiKey);
  const openaiRef = useRef<HTMLInputElement>(null);
  const anthropicRef = useRef<HTMLInputElement>(null);
  const googleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = focusProvider ?? providerOf(settings.model);
    const el = p === 'anthropic' ? anthropicRef.current : p === 'google' ? googleRef.current : openaiRef.current;
    el?.focus();
  }, [focusProvider, settings.model]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>
        <label>
          OpenAI API key
          <input
            ref={openaiRef}
            type="password"
            value={openaiApiKey}
            onChange={(e) => setOpenaiApiKey(e.target.value)}
            placeholder="sk-..."
          />
        </label>
        <label>
          Anthropic API key
          <input
            ref={anthropicRef}
            type="password"
            value={anthropicApiKey}
            onChange={(e) => setAnthropicApiKey(e.target.value)}
            placeholder="sk-ant-..."
          />
        </label>
        <label>
          Google API key
          <input
            ref={googleRef}
            type="password"
            value={googleApiKey}
            onChange={(e) => setGoogleApiKey(e.target.value)}
            placeholder="AIza..."
          />
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              onSave({
                openaiApiKey: openaiApiKey.trim(),
                anthropicApiKey: anthropicApiKey.trim(),
                googleApiKey: googleApiKey.trim(),
                model: settings.model,
                favorites: settings.favorites,
              });
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
