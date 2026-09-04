import { useCallback, useEffect, useRef, useState } from 'react';
import { chipInnerHTML } from './chip';
import ChatView from './components/ChatView';
import EmptyState from './components/EmptyState';
import PromptField from './components/PromptField';
import type { PromptFieldHandle } from './components/PromptField';
import SettingsDialog from './components/Settings';
import StudyPanel, { RatingDialog, StudySummary } from './components/StudyPanel';
import type { StudyResult } from './components/StudyPanel';
import SvgView from './components/SvgView';
import TextView from './components/TextView';
import Toolbar from './components/Toolbar';
import { extractLocalized, extractObject } from './extract';
import { changedRanges } from './diff';
import { streamChat } from './openai';
import { buildPrompts, plainPromptText } from './prompts';
import { SAMPLES } from './samples';
import type { Sample } from './samples';
import { loadSettings, saveSettings } from './settings';
import { STUDY_ACTIVITIES } from './study';
import type { StudyActivity } from './study';
import { changedSvgIds, isRenderableSvg, normalizeSvg } from './svg';
import { refLabel, sameRef } from './types';
import type { ActiveTool, Content, ElementRef, LocationRef, ObjectRef, PromptPart, Range, Settings, TemplatePart, TextRef, Tool } from './types';
import { useHistory } from './useHistory';

interface Pending {
  targets: ObjectRef[];
  abort: AbortController;
  received: number;
}

interface Drag {
  refs: ObjectRef[];
  x: number;
  y: number;
}

function normalizeContent(c: Content): Content {
  return c.kind === 'svg' ? { ...c, value: normalizeSvg(c.value) } : c;
}

/** Abstracts an executed prompt into a template: object-words become slots ("?"). */
function partsToTemplate(parts: PromptPart[]): TemplatePart[] {
  const out: TemplatePart[] = [];
  for (const p of parts) {
    if (p.type === 'object') out.push({ type: 'slot' });
    else {
      const text = p.text.replace(/\s+/g, ' ');
      const last = out[out.length - 1];
      if (last && last.type === 'text') last.text += text;
      else out.push({ type: 'text', text });
    }
  }
  if (out[0]?.type === 'text') out[0] = { type: 'text', text: out[0].text.replace(/^\s+/, '') };
  const l = out.length - 1;
  if (l >= 0 && out[l].type === 'text') out[l] = { type: 'text', text: (out[l] as { text: string }).text.replace(/\s+$/, '') };
  return out.filter((p) => p.type === 'slot' || p.text.length > 0);
}

function templateToParts(template: TemplatePart[], filled: ObjectRef[]): PromptPart[] {
  let i = 0;
  return template.map((p) => (p.type === 'text' ? p : { type: 'object', ref: filled[i++] }));
}

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  return t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT';
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<'direct' | 'chat'>('direct');
  const history = useHistory<Content | null>(null);
  const content = history.current;

  const [selection, setSelection] = useState<ObjectRef[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  const [changedText, setChangedText] = useState<Range[]>([]);
  const [changedSvg, setChangedSvg] = useState<string[]>([]);
  const [hoverRef, setHoverRef] = useState<ObjectRef | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [activeSample, setActiveSample] = useState<Sample | null>(null);
  const [chatSeed, setChatSeed] = useState<{ content: Content; nonce: number } | null>(null);
  const [study, setStudy] = useState<{ activity: StudyActivity; index: number; startedAt: number } | null>(null);
  const [rating, setRating] = useState<{ timedOut: boolean; seconds: number } | null>(null);
  const [studyResults, setStudyResults] = useState<StudyResult[]>([]);
  const [studySummary, setStudySummary] = useState<StudyResult[] | null>(null);
  const [studyMenuOpen, setStudyMenuOpen] = useState(false);
  const promptRef = useRef<PromptFieldHandle>(null);

  const tool = activeTool ? tools.find((t) => t.id === activeTool.id) ?? null : null;

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 7000);
    return () => clearTimeout(t);
  }, [error]);

  const clearMarks = () => {
    setChangedText([]);
    setChangedSvg([]);
  };

  const loadContent = (c: Content) => {
    if (mode === 'chat') {
      setChatSeed({ content: c, nonce: Date.now() });
      return;
    }
    history.push(normalizeContent(c));
    setSelection([]);
    clearMarks();
    setActiveTool(null);
  };

  const newDocument = () => {
    pendingRef.current?.abort.abort();
    history.reset(null);
    setSelection([]);
    setTools([]);
    setActiveTool(null);
    clearMarks();
    setActiveSample(null);
    promptRef.current?.clear();
  };

  /** Loads a task's starting content ("already added ... as the first message", §4.2) and resets the history. */
  const startTask = useCallback(
    (activity: StudyActivity, index: number) => {
      pendingRef.current?.abort.abort();
      const content = normalizeContent(activity.content);
      history.reset(content);
      setChatSeed({ content, nonce: Date.now() });
      setSelection([]);
      setActiveTool(null);
      clearMarks();
      setActiveSample(null);
      promptRef.current?.clear();
      setStudy({ activity, index, startedAt: Date.now() });
    },
    // history.reset is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const finishTask = useCallback((timedOut: boolean) => {
    setStudy((s) => {
      if (!s) return s;
      setRating((r) => r ?? { timedOut, seconds: Math.round((Date.now() - s.startedAt) / 1000) });
      return s;
    });
  }, []);

  const recordRating = (value: number) => {
    if (!study || !rating) return;
    const task = study.activity.tasks[study.index];
    const result: StudyResult = {
      activity: study.activity.name,
      task: study.index + 1,
      instruction: task.instruction,
      seconds: rating.seconds,
      rating: value,
      timedOut: rating.timedOut,
    };
    const results = [...studyResults, result];
    setStudyResults(results);
    setRating(null);
    if (study.index + 1 < study.activity.tasks.length) {
      startTask(study.activity, study.index + 1);
    } else {
      setStudy(null);
      setStudyResults([]);
      setStudySummary(results);
    }
  };

  const quitStudy = () => {
    setStudy(null);
    setRating(null);
    setStudyResults([]);
  };

  const undo = () => {
    if (pendingRef.current || !history.canUndo) return;
    history.undo();
    setSelection([]);
    clearMarks();
    setActiveTool((a) => (a ? { ...a, filled: [] } : a));
  };
  const redo = () => {
    if (pendingRef.current || !history.canRedo) return;
    history.redo();
    setSelection([]);
    clearMarks();
    setActiveTool((a) => (a ? { ...a, filled: [] } : a));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTool(null);
        setSelection([]);
        return;
      }
      if (isEditableTarget(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /** Re-validates text references against the current content (offsets may be stale). */
  const refreshTextRef = (c: Content, r: TextRef): TextRef | null => {
    if (c.value.slice(r.start, r.end) === r.text) return r;
    const idx = c.value.indexOf(r.text);
    if (idx < 0) return null;
    return { ...r, start: idx, end: idx + r.text.length };
  };

  const addTool = (parts: PromptPart[]) => {
    const template = partsToTemplate(parts);
    if (!template.some((p) => p.type === 'text' && p.text.trim())) return;
    const signature = JSON.stringify(template);
    setTools((ts) => (ts.some((t) => t.signature === signature) ? ts : [...ts, { id: `tool-${Date.now()}-${ts.length}`, template, slots: template.filter((p) => p.type === 'slot').length, signature }]));
  };

  /**
   * Executes a prompt (words + object-words) on the current object of interest, optionally
   * localized to `targets`. Selected and referred objects pulse while the model works (§3.2.4).
   */
  const execute = async (rawParts: PromptPart[], rawTargets: ObjectRef[], source: 'prompt' | 'tool') => {
    if (pendingRef.current) {
      setError('A prompt is already running. Stop it first.');
      return;
    }
    if (!settings.apiKey) {
      setShowSettings(true);
      return;
    }
    const current = content;
    let parts = rawParts;
    let targets = rawTargets;
    if (current && current.kind !== 'svg') {
      let missing = false;
      parts = rawParts.map((p) => {
        if (p.type !== 'object' || p.ref.type !== 'text') return p;
        const r = refreshTextRef(current, p.ref);
        if (!r) missing = true;
        return r ? { type: 'object', ref: r } : p;
      });
      targets = rawTargets.flatMap((t): ObjectRef[] => {
        if (t.type !== 'text') return [t];
        const r = refreshTextRef(current, t);
        if (!r) missing = true;
        return r ? [r] : [];
      });
      if (missing) {
        setError('A referenced piece of text no longer exists in the content.');
        return;
      }
    }
    if (!current) targets = [];

    const built = buildPrompts(current, parts, targets);
    const abort = new AbortController();
    const refs = parts.filter((p): p is { type: 'object'; ref: ObjectRef } => p.type === 'object').map((p) => p.ref);
    const p: Pending = { targets: [...targets, ...refs], abort, received: 0 };
    pendingRef.current = p;
    setPending(p);
    clearMarks();
    setPreview('');
    try {
      const responses = await Promise.all(
        built.map((b) =>
          streamChat(settings, b.messages, abort.signal, (delta, total) => {
            if (!current) setPreview(total);
            setPending((prev) => (prev ? { ...prev, received: prev.received + delta.length } : prev));
          }),
        ),
      );
      let next: Content;
      if (built[0].apply === 'replace-target' && current) {
        const edits = built
          .map((b, i) => ({ start: b.target!.start, end: b.target!.end, text: extractLocalized(responses[i]) }))
          .sort((a, b) => a.start - b.start);
        let value = '';
        let cursor = 0;
        const changed: Range[] = [];
        for (const e of edits) {
          value += current.value.slice(cursor, e.start);
          changed.push({ start: value.length, end: value.length + e.text.length });
          value += e.text;
          cursor = e.end;
        }
        value += current.value.slice(cursor);
        next = { ...current, value };
        setChangedText(changed);
      } else {
        next = normalizeContent(extractObject(responses[0], current));
        // An image edit must not destroy the image when the model answers with prose or broken markup.
        if (current?.kind === 'svg' && (next.kind !== 'svg' || !isRenderableSvg(next.value))) {
          setError('The model did not return a valid SVG, so the image was left unchanged.');
          return;
        }
        if (next.kind === 'svg' && !isRenderableSvg(next.value)) {
          setError('The model returned SVG that could not be rendered.');
          return;
        }
        if (next.kind === 'svg') setChangedSvg(changedSvgIds(current?.kind === 'svg' ? current.value : null, next.value));
        else if (current && current.kind !== 'svg') setChangedText(changedRanges(current.value, next.value));
      }
      history.push(next);
      setSelection([]);
      addTool(parts);
      if (source === 'prompt') promptRef.current?.clear();
    } catch (err) {
      if (!abort.signal.aborted) setError(err instanceof Error ? err.message : String(err));
    } finally {
      pendingRef.current = null;
      setPending(null);
      setPreview('');
    }
  };

  const runTool = (t: Tool, filled: ObjectRef[], targets: ObjectRef[]) => {
    void execute(templateToParts(t.template, filled), targets, 'tool');
  };

  const mergeSelection = (prev: ObjectRef[], refs: ObjectRef[]): ObjectRef[] => {
    let out = [...prev];
    for (const r of refs) {
      // Ctrl/Cmd toggles: an exact match, or (for text) any span overlapping the clicked word.
      const i = out.findIndex(
        (o) => sameRef(o, r) || (o.type === 'text' && r.type === 'text' && o.start < r.end && r.start < o.end),
      );
      if (i >= 0) out = out.filter((_, j) => j !== i);
      else out.push(r);
    }
    return out;
  };

  /** A selection was completed on the output (click on an element, mouse-up on text). */
  const handleSelectionComplete = (refs: ObjectRef[], additive: boolean) => {
    // Select then type: the prompt field receives the keyboard right after a selection (§3.1).
    promptRef.current?.focus();
    if (tool && activeTool && tool.slots > 0) {
      if (refs.length === 0) return;
      const filled = [...activeTool.filled, ...refs].slice(0, tool.slots);
      if (filled.length >= tool.slots) {
        runTool(tool, filled, selection);
        setActiveTool({ id: tool.id, filled: [] });
      } else {
        setActiveTool({ id: tool.id, filled });
      }
      return;
    }
    const next = additive ? mergeSelection(selection, refs) : refs;
    setSelection(next);
    if (tool && tool.slots === 0 && !additive && next.length > 0) runTool(tool, [], next);
  };

  const handleToolClick = (id: string) => {
    const t = tools.find((x) => x.id === id);
    if (!t) return;
    if (activeTool?.id === id && selection.length === 0) {
      setActiveTool(null);
      return;
    }
    if (selection.length > 0) {
      // Noun-verb construction: the objects were selected first, the tool is used once (§3.2.3).
      if (t.slots === 0) {
        setActiveTool(null);
        runTool(t, [], selection);
        return;
      }
      const filled = selection.slice(0, t.slots);
      setSelection([]);
      if (filled.length === t.slots) {
        setActiveTool(null);
        runTool(t, filled, []);
        return;
      }
      setActiveTool({ id, filled });
      return;
    }
    setActiveTool({ id, filled: [] });
  };

  /* Drag and drop of objects from the output into the prompt (§3.2.2). */
  const startDrag = useCallback((refs: ObjectRef[], ev: PointerEvent) => {
    setDrag({ refs, x: ev.clientX, y: ev.clientY });
    const move = (e: PointerEvent) => {
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      promptRef.current?.dragOver(e.clientX, e.clientY);
    };
    const up = (e: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const over = promptRef.current?.dragOver(e.clientX, e.clientY) ?? false;
      if (over) {
        promptRef.current?.drop(refs);
        // A dropped object is referred to by the prompt; it is no longer a localization target (fig. 1c, 3a).
        setSelection((prev) => prev.filter((s) => !refs.some((r) => sameRef(r, s))));
      }
      promptRef.current?.dragEnd();
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }, []);

  // The cursor carries the active tool's label so the mode is visible where the user is pointing (§3.1, fig. 2c).
  useEffect(() => {
    if (!activeTool) {
      setCursor(null);
      return;
    }
    const move = (e: PointerEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [activeTool]);

  const slotRefs = activeTool?.filled ?? [];
  const pulse = pending?.targets ?? [];
  const status = pending ? `Generating… ${pending.received > 0 ? `${pending.received} characters received` : 'waiting for the model'}` : tool ? `Tool “${plainPromptText(templateToParts(tool.template, []).map((p) => (p.type === 'object' ? { type: 'text', text: '?' } : p)))}” active — ${tool.slots > 0 ? `click ${tool.slots - slotRefs.length} more object${tool.slots - slotRefs.length > 1 ? 's' : ''}` : 'select objects to apply it'} (Esc to leave)` : null;

  /** The tool's label with its already-filled slots shown, the rest left as "?". */
  const toolLabel = (t: Tool, filled: ObjectRef[]): TemplatePart[] => {
    let i = 0;
    return t.template.map((part) => {
      if (part.type === 'text') return part;
      const ref = filled[i++];
      return ref ? { type: 'text', text: refLabel(ref) } : part;
    });
  };

  const groups: Array<Sample['group']> = ['Text', 'Code', 'Image'];

  return (
    <div className="app">
      <header className="header">
        <h1>DirectGPT</h1>
        <div className="mode-switch">
          <button type="button" className={mode === 'direct' ? 'on' : ''} onClick={() => setMode('direct')}>
            DirectGPT
          </button>
          <button type="button" className={mode === 'chat' ? 'on' : ''} onClick={() => setMode('chat')}>
            ChatGPT replica
          </button>
        </div>
        <div className="menu">
          <button type="button" className="menu-trigger" onClick={() => setSamplesOpen((o) => !o)}>
            Load study sample ▾
          </button>
          {samplesOpen && (
            <div className="menu-list" onMouseLeave={() => setSamplesOpen(false)}>
              {groups.map((g) => (
                <div key={g}>
                  <div className="group">{g}</div>
                  {SAMPLES.filter((s) => s.group === g).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSamplesOpen(false);
                        setActiveSample(s);
                        loadContent(s.content);
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="menu">
          <button type="button" className="menu-trigger" onClick={() => setStudyMenuOpen((o) => !o)}>
            {study ? 'Study running' : 'Study session'} ▾
          </button>
          {studyMenuOpen && (
            <div className="menu-list" onMouseLeave={() => setStudyMenuOpen(false)}>
              <div className="group">Start an activity (4 tasks, 3 min each)</div>
              {STUDY_ACTIVITIES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setStudyMenuOpen(false);
                    setStudyResults([]);
                    startTask(a, 0);
                  }}
                >
                  {a.name}
                </button>
              ))}
              {study && (
                <button
                  type="button"
                  onClick={() => {
                    setStudyMenuOpen(false);
                    quitStudy();
                  }}
                >
                  Leave the current session
                </button>
              )}
            </div>
          )}
        </div>
        {mode === 'direct' && !study && (
          <button type="button" onClick={newDocument} title="Clear the content and the toolbar">
            New
          </button>
        )}
        <div className="spacer" />
        {!settings.apiKey && <span className="key-warning">No API key set</span>}
        <button type="button" onClick={() => setShowSettings(true)}>
          Settings
        </button>
      </header>

      {mode === 'direct' ? (
        <div className={`direct ${study ? 'with-study' : ''}`}>
          {study && (
            <StudyPanel
              activity={study.activity}
              taskIndex={study.index}
              startedAt={study.startedAt}
              onFinishTask={finishTask}
              onQuit={quitStudy}
            />
          )}
          <Toolbar tools={tools} active={activeTool} onClickTool={handleToolClick} onRemoveTool={(id) => setTools((ts) => ts.filter((t) => t.id !== id))} onHoverRef={setHoverRef} />
          <main className="workspace">
            <div className="history-bar">
              <button type="button" onClick={undo} disabled={!history.canUndo || !!pending} title="Undo (Ctrl/Cmd+Z)">
                ↶ Undo
              </button>
              <button type="button" onClick={redo} disabled={!history.canRedo || !!pending} title="Redo (Ctrl/Cmd+Shift+Z)">
                ↷ Redo
              </button>
            </div>
            <div className={`object-panel ${pending ? 'busy' : ''} ${tool ? 'tool-mode' : ''} ${pending && pulse.length === 0 ? 'working' : ''}`}>
              {content ? (
                content.kind === 'svg' ? (
                  <SvgView
                    value={content.value}
                    selection={selection}
                    pulse={pulse}
                    changed={changedSvg}
                    hover={hoverRef}
                    slotRefs={slotRefs}
                    onSelectionComplete={(refs: Array<ElementRef | LocationRef>, additive) => handleSelectionComplete(refs, additive)}
                    onDragStart={(refs, ev) => startDrag(refs, ev)}
                  />
                ) : (
                  <TextView
                    value={content.value}
                    language={content.kind === 'code' ? content.language ?? 'javascript' : null}
                    selection={selection.filter((s): s is TextRef => s.type === 'text')}
                    pulse={pulse}
                    changed={changedText}
                    hover={hoverRef}
                    slotRefs={slotRefs}
                    onSelectionComplete={(refs, additive) => handleSelectionComplete(refs, additive)}
                    onDragStart={(refs, ev) => startDrag(refs, ev)}
                  />
                )
              ) : preview ? (
                <pre className="preview">{preview}</pre>
              ) : (
                <EmptyState
                  onLoad={(c) => {
                    setActiveSample(SAMPLES.find((s) => s.content === c) ?? null);
                    loadContent(c);
                  }}
                />
              )}
            </div>
            {activeSample && content && !study && (
              <div className="tasks-hint">
                <b>Study tasks for this sample:</b> {activeSample.tasks.join(' · ')}
              </div>
            )}
            <PromptField
              ref={promptRef}
              generating={!!pending}
              status={status}
              selectionCount={selection.length}
              onSubmit={(parts) => void execute(parts, selection, 'prompt')}
              onStop={() => pendingRef.current?.abort.abort()}
              onClearSelection={() => setSelection([])}
              onHoverRef={setHoverRef}
            />
          </main>
        </div>
      ) : (
        <div className={`baseline ${study ? 'with-study' : ''}`}>
          {study && (
            <StudyPanel
              activity={study.activity}
              taskIndex={study.index}
              startedAt={study.startedAt}
              onFinishTask={finishTask}
              onQuit={quitStudy}
            />
          )}
          <ChatView settings={settings} onNeedKey={() => setShowSettings(true)} onError={setError} seed={chatSeed} />
        </div>
      )}

      {rating && <RatingDialog timedOut={rating.timedOut} onRate={recordRating} />}
      {studySummary && <StudySummary results={studySummary} onClose={() => setStudySummary(null)} />}

      {tool && cursor && !drag && !pending && (
        <div className="tool-cursor" style={{ left: cursor.x, top: cursor.y }}>
          {toolLabel(tool, slotRefs).map((p, i) => (p.type === 'text' ? <span key={i}>{p.text}</span> : <span key={i} className="slot">?</span>))}
        </div>
      )}

      {drag && (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}>
          {drag.refs.slice(0, 3).map((r, i) => (
            <span key={i} className="chip" dangerouslySetInnerHTML={{ __html: chipInnerHTML(r) }} />
          ))}
          {drag.refs.length > 3 && <span className="chip">+{drag.refs.length - 3}</span>}
        </div>
      )}

      {showSettings && (
        <SettingsDialog
          settings={settings}
          onSave={(s) => {
            setSettings(s);
            saveSettings(s);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
      {error && <div className="toast">{error}</div>}
    </div>
  );
}
