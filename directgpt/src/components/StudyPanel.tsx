import { useEffect, useState } from 'react';
import { highlightSegments, TASK_TIME_LIMIT_S } from '../study';
import type { StudyActivity } from '../study';

export interface StudyResult {
  activity: string;
  task: number;
  instruction: string;
  seconds: number;
  rating: number | null;
  timedOut: boolean;
}

interface Props {
  activity: StudyActivity;
  taskIndex: number;
  startedAt: number;
  onFinishTask: (timedOut: boolean) => void;
  onQuit: () => void;
}

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Task panel of the study (§4.2): a short instruction that cannot be selected and an
 * image of the content to edit with the relevant parts in yellow, or the target image.
 * It stays visible for the whole task, and the task ends at the three-minute limit.
 */
export default function StudyPanel({ activity, taskIndex, startedAt, onFinishTask, onQuit }: Props) {
  const task = activity.tasks[taskIndex];
  const [left, setLeft] = useState(TASK_TIME_LIMIT_S);

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = TASK_TIME_LIMIT_S - elapsed;
      setLeft(remaining > 0 ? remaining : 0);
      if (remaining <= 0) onFinishTask(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, onFinishTask]);

  const segments = highlightSegments(activity.content.value, task.highlights);

  return (
    <aside className="study-panel" onDragStart={(e) => e.preventDefault()}>
      <div className="study-head">
        <span className="study-activity">{activity.name}</span>
        <button type="button" className="study-quit" onClick={onQuit} title="Leave the study session">
          ✕
        </button>
      </div>
      <div className="study-progress">
        Task {taskIndex + 1} of {activity.tasks.length}
      </div>
      <div className={`study-timer ${left <= 30 ? 'low' : ''}`}>{mmss(left)} left</div>
      <div className="study-instruction" draggable={false}>
        {task.instruction}
      </div>
      <div className="study-target" draggable={false}>
        {task.targetSvg ? (
          <div className="study-target-image" dangerouslySetInnerHTML={{ __html: task.targetSvg }} />
        ) : (
          <pre className={`study-target-text ${activity.activity === 'code' ? 'is-code' : ''}`}>
            {segments.map((seg, i) => (
              <span key={i} className={seg.mark ? 'mark' : undefined}>
                {seg.text}
              </span>
            ))}
          </pre>
        )}
      </div>
      <button type="button" className="primary study-done" onClick={() => onFinishTask(false)}>
        Task done
      </button>
    </aside>
  );
}

interface RatingProps {
  onRate: (rating: number) => void;
  timedOut: boolean;
}

/** "How close are you to the target" 5-point semantic differential, asked after each task (§4.2). */
export function RatingDialog({ onRate, timedOut }: RatingProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal rating">
        <h2>How close are you to the target?</h2>
        {timedOut && <p className="hint">The three-minute limit was reached.</p>}
        <div className="rating-scale">
          <span>distant</span>
          {[1, 2, 3, 4, 5].map((v) => (
            <button key={v} type="button" className="rating-dot" onClick={() => onRate(v)}>
              {v}
            </button>
          ))}
          <span>close</span>
        </div>
      </div>
    </div>
  );
}

interface SummaryProps {
  results: StudyResult[];
  onClose: () => void;
}

export function StudySummary({ results, onClose }: SummaryProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Session complete</h2>
        <table className="study-results">
          <thead>
            <tr>
              <th>Task</th>
              <th>Time</th>
              <th>Closeness</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.instruction}</td>
                <td>
                  {mmss(r.seconds)}
                  {r.timedOut ? ' (limit)' : ''}
                </td>
                <td>{r.rating ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="modal-actions">
          <button type="button" className="primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
