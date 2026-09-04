import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css';

export default Prism;

export interface Leaf {
  text: string;
  cls: string;
}

/** Flattens Prism's token tree into leaf strings with their combined classes, preserving every character. */
export function tokenizeLeaves(code: string, language: string | null): Leaf[] {
  const grammar = language ? Prism.languages[language] : undefined;
  if (!grammar) return [{ text: code, cls: '' }];
  const out: Leaf[] = [];
  const walk = (tokens: Array<string | Prism.Token>, parent: string) => {
    for (const t of tokens) {
      if (typeof t === 'string') {
        out.push({ text: t, cls: parent });
        continue;
      }
      const alias = Array.isArray(t.alias) ? t.alias.join(' ') : t.alias ? String(t.alias) : '';
      const cls = `${parent} token ${t.type} ${alias}`.trim();
      if (typeof t.content === 'string') out.push({ text: t.content, cls });
      else if (Array.isArray(t.content)) walk(t.content, cls);
      else walk([t.content], cls);
    }
  };
  walk(Prism.tokenize(code, grammar), '');
  return out;
}
