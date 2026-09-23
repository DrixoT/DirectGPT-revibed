import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { IconAnthropic, IconChevron, IconGoogle, IconOpenAI, IconOpenRouter, IconSearch, IconStar } from '../icons';
import { allModels, modelLabel, openrouterKey, setOpenRouterModels, type Provider } from '../models';
import { fetchOpenRouterModels } from '../openai';
import type { Settings } from '../types';

type RailFilter = 'favorites' | Provider;

interface Props {
  settings: Settings;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function ProviderMark({ provider }: { provider: Provider }) {
  if (provider === 'anthropic') return <IconAnthropic />;
  if (provider === 'google') return <IconGoogle />;
  if (provider === 'openrouter') return <IconOpenRouter />;
  return <IconOpenAI />;
}

export default function ModelPicker({ settings, onSelect, onToggleFavorite }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rail, setRail] = useState<RailFilter | null>(null);
  const [hi, setHi] = useState(0);
  const [catalog, setCatalog] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);

  const favorites = settings.favorites;
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allModels().filter((m) => {
      if (rail === 'favorites' && !favorites.includes(m.id)) return false;
      if (rail && rail !== 'favorites' && m.provider !== rail) return false;
      if (!q) return true;
      return m.label.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.providerLabel.toLowerCase().includes(q);
    });
  }, [query, rail, favorites, catalog]);

  useEffect(() => {
    const key = openrouterKey(settings);
    if (!key) {
      setOpenRouterModels([]);
      setLoading(false);
      setFetchError(null);
      setCatalog((n) => n + 1);
      return;
    }
    let ignore = false;
    setLoading(true);
    setFetchError(null);
    fetchOpenRouterModels(key)
      .then(() => {
        if (ignore) return;
        setLoading(false);
        setCatalog((n) => n + 1);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setLoading(false);
        setFetchError(err instanceof Error ? err.message : String(err));
        setCatalog((n) => n + 1);
      });
    return () => {
      ignore = true;
    };
  }, [settings.openrouterApiKey, settings.openaiApiKey]);

  useEffect(() => {
    if (!open) return;
    const idx = list.findIndex((m) => m.id === settings.model);
    setHi(idx >= 0 ? idx : 0);
  }, [open, query, rail, settings.model, catalog]);

  useEffect(() => {
    setHi((i) => (list.length === 0 ? 0 : Math.min(i, list.length - 1)));
  }, [list.length]);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  const choose = (id: string) => {
    onSelect(id);
    setOpen(false);
    setQuery('');
  };

  const onListKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.model-row-star')) return;
    if (!list.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHi((i) => Math.min(list.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const m = list[hi];
      if (m) choose(m.id);
    }
  };

  const toggleRail = (next: RailFilter) => setRail((cur) => (cur === next ? null : next));

  return (
    <div className="model-picker-wrap" ref={wrap}>
      <button
        type="button"
        className={`model-pill${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        title="Choose a model"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {modelLabel(settings.model)}
        <IconChevron />
      </button>
      {open && (
        <div className="model-picker" role="dialog" aria-label="Model picker" onKeyDown={onListKey}>
          <div className="model-picker-rail" aria-label="Filter models">
            <button
              type="button"
              className={rail === 'favorites' ? 'on' : ''}
              title="Favorites"
              aria-label="Favorites"
              aria-pressed={rail === 'favorites'}
              onClick={() => toggleRail('favorites')}
            >
              <IconStar filled={rail === 'favorites'} />
            </button>
            <button
              type="button"
              className={`prov openai${rail === 'openai' ? ' on' : ''}`}
              title="OpenAI"
              aria-label="OpenAI"
              aria-pressed={rail === 'openai'}
              onClick={() => toggleRail('openai')}
            >
              <IconOpenAI />
            </button>
            <button
              type="button"
              className={`prov anthropic${rail === 'anthropic' ? ' on' : ''}`}
              title="Anthropic"
              aria-label="Anthropic"
              aria-pressed={rail === 'anthropic'}
              onClick={() => toggleRail('anthropic')}
            >
              <IconAnthropic />
            </button>
            <button
              type="button"
              className={`prov google${rail === 'google' ? ' on' : ''}`}
              title="Google"
              aria-label="Google"
              aria-pressed={rail === 'google'}
              onClick={() => toggleRail('google')}
            >
              <IconGoogle />
            </button>
            <button
              type="button"
              className={`prov openrouter${rail === 'openrouter' ? ' on' : ''}`}
              title="OpenRouter"
              aria-label="OpenRouter"
              aria-pressed={rail === 'openrouter'}
              onClick={() => toggleRail('openrouter')}
            >
              <IconOpenRouter />
            </button>
          </div>
          <div className="model-picker-main">
            <label className="model-picker-search">
              <IconSearch />
              <input
                ref={search}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models..."
                aria-label="Search models"
                aria-controls="model-picker-list"
                aria-activedescendant={list[hi] ? `model-opt-${list[hi].id}` : undefined}
              />
            </label>
            <ul id="model-picker-list" className="model-picker-list" role="listbox" aria-label="Models">
              {list.length === 0 && (
                <li className="model-picker-empty">
                  {loading
                    ? 'Loading OpenRouter models…'
                    : fetchError
                      ? `Could not load OpenRouter models: ${fetchError}`
                      : rail === 'openrouter' && !openrouterKey(settings)
                        ? 'Add an OpenRouter API key in Settings.'
                        : 'No models match.'}
                </li>
              )}
              {list.map((m, i) => {
                const fav = favorites.includes(m.id);
                return (
                  <li key={m.id} role="none" className={`model-row${m.id === settings.model ? ' selected' : ''}${i === hi ? ' hi' : ''}`}>
                    <button
                      type="button"
                      id={`model-opt-${m.id}`}
                      role="option"
                      aria-selected={i === hi}
                      className="model-row-main"
                      onMouseEnter={() => setHi(i)}
                      onClick={() => choose(m.id)}
                    >
                      <span className={`model-row-mark ${m.provider}`}>
                        <ProviderMark provider={m.provider} />
                      </span>
                      <span className="model-row-text">
                        <span className="model-row-label">{m.label}</span>
                        <span className="model-row-sub">{m.providerLabel}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`model-row-star${fav ? ' on' : ''}`}
                      title={fav ? 'Remove from favorites' : 'Add to favorites'}
                      aria-label={fav ? `Remove ${m.label} from favorites` : `Add ${m.label} to favorites`}
                      aria-pressed={fav}
                      onMouseEnter={() => setHi(i)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(m.id);
                      }}
                    >
                      <IconStar filled={fav} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
