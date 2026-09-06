import { useGlitchIn } from '../glitch';
import { IconPlus, IconSettings } from '../icons';
import { SAMPLES } from '../samples';
import type { Sample } from '../samples';
import { STUDY_ACTIVITIES } from '../study';
import type { StudyActivity } from '../study';
import Toolbar from './Toolbar';
import type { ActiveTool, ObjectRef, Tool } from '../types';

interface Props {
  mode: 'direct' | 'chat';
  hasKey: boolean;
  activeSample: Sample | null;
  studyRunning: boolean;
  canNew: boolean;
  tools: Tool[];
  activeTool: ActiveTool | null;
  onNew: () => void;
  onLoadSample: (s: Sample) => void;
  onStartActivity: (a: StudyActivity) => void;
  onQuitStudy: () => void;
  onOpenSettings: () => void;
  onClickTool: (id: string) => void;
  onRemoveTool: (id: string) => void;
  onHoverRef: (ref: ObjectRef | null) => void;
}

const GROUPS: Array<Sample['group']> = ['Text', 'Code', 'Image'];

/**
 * The left column of the design: wordmark, New, the samples, the study session,
 * the Toolbar rail and the API-key/Settings row.
 *
 * The Toolbar lives here rather than in its own column, which is what keeps the
 * paper's "toolbar to the left of the content area" (figures 1d, 2c, 4) true
 * while the design's single 256px sidebar owns the whole left edge.
 */
export default function Sidebar({
  mode,
  hasKey,
  activeSample,
  studyRunning,
  canNew,
  tools,
  activeTool,
  onNew,
  onLoadSample,
  onStartActivity,
  onQuitStudy,
  onOpenSettings,
  onClickTool,
  onRemoveTool,
  onHoverRef,
}: Props) {
  const glitch = useGlitchIn();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1 className={`wordmark ${glitch}`} data-text="DIRECT GPT" tabIndex={0}>
          DIRECT GPT
        </h1>
      </div>

      {canNew && (
        <div className="sidebar-top">
          <button type="button" className="side-row" onClick={onNew} title="Clear the content and the toolbar">
            <IconPlus />
            <span className="label">New</span>
          </button>
        </div>
      )}

      <div className="sidebar-scroll">
        <section className="side-section">
          <div className="side-label">Load study sample</div>
          {GROUPS.map((g) => (
            <div key={g}>
              <div className="side-group">{g}</div>
              {SAMPLES.filter((s) => s.group === g).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`side-row ${activeSample?.id === s.id ? 'on' : ''}`}
                  onClick={() => onLoadSample(s)}
                >
                  <span className="label">{s.name}</span>
                </button>
              ))}
            </div>
          ))}
        </section>

        <section className="side-section">
          <div className="side-label">Study session</div>
          <div className="side-group">Start an activity (4 tasks, 3 min each)</div>
          {STUDY_ACTIVITIES.map((a) => (
            <button key={a.id} type="button" className="side-row" onClick={() => onStartActivity(a)}>
              <span className="label">{a.name}</span>
            </button>
          ))}
          {studyRunning && (
            <button type="button" className="side-row danger" onClick={onQuitStudy}>
              <span className="label">Leave the current session</span>
            </button>
          )}
        </section>

      </div>

      {/* Pinned rather than scrolled with the lists above: TEST-G01 wants the
          Toolbar region reserved and visible to the left of the content. */}
      {mode === 'direct' && (
        <div className="sidebar-tools">
          <Toolbar
            tools={tools}
            active={activeTool}
            onClickTool={onClickTool}
            onRemoveTool={onRemoveTool}
            onHoverRef={onHoverRef}
          />
        </div>
      )}

      <div className="sidebar-foot">
        <button
          type="button"
          className="account"
          onClick={onOpenSettings}
          title={hasKey ? 'API key set — open Settings' : 'No API key set — open Settings'}
        >
          <span className={`account-badge ${hasKey ? '' : 'unset'}`} aria-hidden="true">
            KEY
          </span>
          <span className="account-label">Settings</span>
          <IconSettings />
        </button>
      </div>
    </aside>
  );
}
