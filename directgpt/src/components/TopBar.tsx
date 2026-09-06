import { IconChevron } from '../icons';

interface Props {
  model: string;
  mode: 'direct' | 'chat';
  hasKey: boolean;
  onSetMode: (m: 'direct' | 'chat') => void;
  onOpenSettings: () => void;
}

/**
 * The design's header rule: the model pill and the interface switch on the
 * left, the connection status on the right. The status dot replaces the old
 * "No API key set" span — it is the same fact, said where the design says it.
 */
export default function TopBar({ model, mode, hasKey, onSetMode, onOpenSettings }: Props) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="model-pill" onClick={onOpenSettings} title="Change the model in Settings">
          {model}
          <IconChevron />
        </button>
        <div className="mode-switch">
          <button type="button" className={mode === 'direct' ? 'on' : ''} onClick={() => onSetMode('direct')}>
            DirectGPT
          </button>
          <button type="button" className={mode === 'chat' ? 'on' : ''} onClick={() => onSetMode('chat')}>
            ChatGPT replica
          </button>
        </div>
      </div>
      <div className={`status ${hasKey ? '' : 'off'}`} title={hasKey ? 'API key set' : 'No API key set'}>
        <span className="status-dot" />
        <span>{hasKey ? 'online' : 'no key'}</span>
      </div>
    </header>
  );
}
