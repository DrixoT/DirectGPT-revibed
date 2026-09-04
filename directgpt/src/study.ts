import { SAMPLES } from './samples';
import type { Content } from './types';

/**
 * Study apparatus of §4: for each content, four tasks (three localized, one global),
 * each with a short instruction and a target the participant reproduces.
 */
export interface StudyTask {
  /** Short instruction, e.g. "Text in yellow => synonyms" or "Reproduce" (§4.2). */
  instruction: string;
  /** Exact substrings of the starting content shown in yellow (first occurrence). */
  highlights?: string[];
  /** Target image for the image activity (fig. 5). */
  targetSvg?: string;
}

export interface StudyActivity {
  id: string;
  name: string;
  activity: 'text' | 'code' | 'image';
  content: Content;
  tasks: StudyTask[];
}

/** Time limit per task (§4.2: "reached a time limit of three minutes"). */
export const TASK_TIME_LIMIT_S = 180;

const sample = (id: string): Content => {
  const s = SAMPLES.find((x) => x.id === id);
  if (!s) throw new Error(`unknown sample ${id}`);
  return s.content;
};

const FLOWER_GRADIENT = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e11d48"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><circle cx="150" cy="60" r="22" fill="url(#tg)"/><circle cx="176" cy="79" r="22" fill="url(#tg)"/><circle cx="166" cy="110" r="22" fill="url(#tg)"/><circle cx="134" cy="110" r="22" fill="black"/><circle cx="124" cy="79" r="22" fill="black"/><circle cx="150" cy="88" r="13" fill="white"/></svg>`;

const FLOWER_ADD = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><circle cx="150" cy="60" r="22" fill="black"/><circle cx="176" cy="79" r="22" fill="black"/><circle cx="166" cy="110" r="22" fill="black"/><circle cx="134" cy="110" r="22" fill="black"/><circle cx="124" cy="79" r="22" fill="black"/><circle cx="150" cy="88" r="13" fill="white"/><line x1="150" y1="120" x2="150" y2="190" stroke="black" stroke-width="5"/><line x1="150" y1="175" x2="105" y2="140" stroke="black" stroke-width="5"/><line x1="150" y1="175" x2="195" y2="140" stroke="black" stroke-width="5"/><circle cx="103" cy="138" r="12" fill="black"/><circle cx="197" cy="138" r="12" fill="black"/></svg>`;

const FLOWER_REMOVE = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><circle cx="150" cy="60" r="22" fill="black"/><circle cx="176" cy="79" r="22" fill="black"/><circle cx="150" cy="88" r="13" fill="white"/></svg>`;

const FLOWER_FLIP = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,200) scale(1,-1)"><circle cx="150" cy="60" r="22" fill="black"/><circle cx="176" cy="79" r="22" fill="black"/><circle cx="166" cy="110" r="22" fill="black"/><circle cx="134" cy="110" r="22" fill="black"/><circle cx="124" cy="79" r="22" fill="black"/><circle cx="150" cy="88" r="13" fill="white"/></g></svg>`;

const SMILEY_GRADIENT = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f5f5f5"/><stop offset="100%" stop-color="#4b5563"/></linearGradient></defs><circle cx="150" cy="80" r="45" fill="url(#tg)"/><circle cx="135" cy="68" r="5" fill="#374151"/><circle cx="165" cy="68" r="5" fill="black"/><circle cx="150" cy="84" r="4" fill="#374151"/><line x1="130" y1="102" x2="170" y2="102" stroke="black" stroke-width="3"/></svg>`;

const SMILEY_ADD = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><circle cx="150" cy="80" r="45" fill="orange"/><circle cx="135" cy="68" r="5" fill="black"/><circle cx="165" cy="68" r="5" fill="black"/><circle cx="150" cy="84" r="4" fill="black"/><line x1="130" y1="102" x2="170" y2="102" stroke="black" stroke-width="3"/><line x1="150" y1="125" x2="150" y2="180" stroke="black" stroke-width="3"/><line x1="150" y1="140" x2="110" y2="162" stroke="black" stroke-width="3"/><line x1="150" y1="140" x2="190" y2="162" stroke="black" stroke-width="3"/><circle cx="108" cy="163" r="7" fill="black"/><circle cx="192" cy="163" r="7" fill="black"/></svg>`;

const SMILEY_REMOVE = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><circle cx="150" cy="80" r="45" fill="orange"/><circle cx="135" cy="68" r="5" fill="black"/><circle cx="165" cy="68" r="5" fill="black"/></svg>`;

const SMILEY_FLIP = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,200) scale(1,-1)"><circle cx="150" cy="80" r="45" fill="orange"/><circle cx="135" cy="68" r="5" fill="black"/><circle cx="165" cy="68" r="5" fill="black"/><circle cx="150" cy="84" r="4" fill="black"/><line x1="130" y1="102" x2="170" y2="102" stroke="black" stroke-width="3"/></g></svg>`;

export const STUDY_ACTIVITIES: StudyActivity[] = [
  {
    id: 'text-a',
    name: 'Text A — Alice',
    activity: 'text',
    content: sample('alice'),
    tasks: [
      { instruction: 'Text in yellow => synonyms', highlights: ['tired', 'peeped', 'pictures', 'sleepy', 'ran '] },
      {
        instruction: 'Text in yellow => add more description',
        highlights: ['the book her sister was reading', 'a White Rabbit with pink eyes'],
      },
      {
        instruction: 'Text in yellow => summarize',
        highlights: [
          '(when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural)',
          'she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge',
        ],
      },
      { instruction: 'Whole text => future tense' },
    ],
  },
  {
    id: 'text-b',
    name: 'Text B — Frankenstein',
    activity: 'text',
    content: sample('frankenstein'),
    tasks: [
      { instruction: 'Text in yellow => synonyms', highlights: ['rejoice', 'disaster', 'welfare', 'cold', 'delight'] },
      {
        instruction: 'Text in yellow => add more description',
        highlights: ['I am already far north of London', 'a foretaste of those icy climes'],
      },
      {
        instruction: 'Text in yellow => summarize',
        highlights: [
          'I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.',
          'I try in vain to be persuaded that the pole is the seat of frost and desolation; it ever presents itself to my imagination as the region of beauty and delight.',
        ],
      },
      { instruction: 'Whole text => future tense' },
    ],
  },
  {
    id: 'code-a',
    name: 'Code A — pyramid',
    activity: 'code',
    content: sample('pyramid'),
    tasks: [
      { instruction: 'Variable in yellow => rename it', highlights: ['height'] },
      {
        instruction: 'Loops in yellow => while loops',
        highlights: [
          'for (let space = 0; space < height - row; space++) {\n      line += " ";\n    }',
          'for (let star = 0; star < 2 * row - 1; star++) {\n      line += "*";\n    }',
        ],
      },
      {
        instruction: 'Loop in yellow => factorize with repeat',
        highlights: ['for (let star = 0; star < 2 * row - 1; star++) {\n      line += "*";\n    }'],
      },
      { instruction: 'Whole function => Python' },
    ],
  },
  {
    id: 'code-b',
    name: 'Code B — moving window',
    activity: 'code',
    content: sample('window'),
    tasks: [
      { instruction: 'Variable in yellow => rename it', highlights: ['windowSize'] },
      {
        instruction: 'Loops in yellow => while loops',
        highlights: [
          'for (let j = i; j < i + windowSize; j++) {\n      sum += values[j];\n    }',
          'for (let k = i; k < i + windowSize; k++) {\n      if (values[k] < mean) {\n        count++;\n      }\n    }',
        ],
      },
      {
        instruction: 'Loop in yellow => factorize with reduce',
        highlights: ['for (let j = i; j < i + windowSize; j++) {\n      sum += values[j];\n    }'],
      },
      { instruction: 'Whole function => Python' },
    ],
  },
  {
    id: 'image-a',
    name: 'Image A — flower',
    activity: 'image',
    content: sample('flower'),
    tasks: [
      { instruction: 'Reproduce (colour with gradients)', targetSvg: FLOWER_GRADIENT },
      { instruction: 'Reproduce (add elements)', targetSvg: FLOWER_ADD },
      { instruction: 'Reproduce (remove elements)', targetSvg: FLOWER_REMOVE },
      { instruction: 'Reproduce (upside down)', targetSvg: FLOWER_FLIP },
    ],
  },
  {
    id: 'image-b',
    name: 'Image B — smiley',
    activity: 'image',
    content: sample('smiley'),
    tasks: [
      { instruction: 'Reproduce (colour with gradients)', targetSvg: SMILEY_GRADIENT },
      { instruction: 'Reproduce (add elements)', targetSvg: SMILEY_ADD },
      { instruction: 'Reproduce (remove elements)', targetSvg: SMILEY_REMOVE },
      { instruction: 'Reproduce (upside down)', targetSvg: SMILEY_FLIP },
    ],
  },
];

export interface Segment {
  text: string;
  mark: boolean;
}

/** Splits the starting content so the parts named by a task can be shown in yellow. */
export function highlightSegments(value: string, highlights: string[] | undefined): Segment[] {
  if (!highlights || highlights.length === 0) return [{ text: value, mark: false }];
  const ranges: Array<{ start: number; end: number }> = [];
  for (const h of highlights) {
    const i = value.indexOf(h);
    if (i < 0) continue;
    ranges.push({ start: i, end: i + h.length });
  }
  ranges.sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start < cursor) continue;
    if (r.start > cursor) out.push({ text: value.slice(cursor, r.start), mark: false });
    out.push({ text: value.slice(r.start, r.end), mark: true });
    cursor = r.end;
  }
  if (cursor < value.length) out.push({ text: value.slice(cursor), mark: false });
  return out;
}
