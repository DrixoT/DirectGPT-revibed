import ModelPicker from './ModelPicker';
import type { Settings } from '../types';

interface Props {
  settings: Settings;
  mode: 'direct' | 'chat';
  hasKey: boolean;
  onSetMode: (m: 'direct' | 'chat') => void;
  onSelectModel: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

/**
 * The design's header rule: the model pill and the interface switch on the
 * left, the connection status and the paper link on the right.
 */
export default function TopBar({ settings, mode, hasKey, onSetMode, onSelectModel, onToggleFavorite }: Props) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <ModelPicker settings={settings} onSelect={onSelectModel} onToggleFavorite={onToggleFavorite} />
        <div className="mode-switch">
          <button type="button" className={mode === 'direct' ? 'on' : ''} onClick={() => onSetMode('direct')}>
            DirectGPT
          </button>
          <button type="button" className={mode === 'chat' ? 'on' : ''} onClick={() => onSetMode('chat')}>
            ChatGPT replica
          </button>
        </div>
      </div>
      <div className="topbar-right">
        <div className={`status ${hasKey ? '' : 'off'}`} title={hasKey ? 'API key set' : 'No API key set'}>
          <span className="status-dot" />
          <span>{hasKey ? 'online' : 'no key'}</span>
        </div>
        <div className="mode-switch">
          <button
            type="button"
            className="on"
            title="Masson, Malacria, Casiez, and Vogel. DirectGPT. CHI 2024."
            onClick={() => window.open('https://damienmasson.com/pdfs/directgpt.pdf', '_blank', 'noopener,noreferrer')}
          >
            Paper
          </button>
        </div>
      </div>
    </header>
  );
}
