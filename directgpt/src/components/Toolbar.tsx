import { chipInnerHTML } from '../chip';
import type { ActiveTool, ObjectRef, Tool } from '../types';

interface Props {
  tools: Tool[];
  active: ActiveTool | null;
  onClickTool: (id: string) => void;
  onRemoveTool: (id: string) => void;
  onHoverRef: (ref: ObjectRef | null) => void;
}

/**
 * Toolbar of prompts reused as tools (§3.2.3, fig. 1d, 2c, 4b).
 *
 * Rendered as a section of the sidebar rather than its own rail, which keeps it
 * to the left of the content area as the figures place it.
 */
export default function Toolbar({ tools, active, onClickTool, onRemoveTool, onHoverRef }: Props) {
  return (
    <div className="toolbar">
      <div className="side-label toolbar-title">Toolbar</div>
      {tools.length === 0 && <div className="toolbar-empty">Executed prompts appear here as reusable tools.</div>}
      {tools.map((tool) => {
        const isActive = active?.id === tool.id;
        let slot = 0;
        return (
          <div key={tool.id} className={`tool-wrap ${isActive ? 'active' : ''}`}>
            <button
              type="button"
              className="tool"
              onClick={() => onClickTool(tool.id)}
              title={isActive ? 'Click to leave this tool' : tool.slots > 0 ? 'Click, then click objects to fill each "?"' : 'Click, then select objects to apply this prompt'}
            >
              {tool.template.map((p, i) => {
                if (p.type === 'text') return <span key={i}>{p.text}</span>;
                const idx = slot++;
                const filled = isActive ? active?.filled[idx] : undefined;
                if (filled) {
                  return (
                    <span
                      key={i}
                      className="chip"
                      onMouseEnter={() => onHoverRef(filled)}
                      onMouseLeave={() => onHoverRef(null)}
                      dangerouslySetInnerHTML={{ __html: chipInnerHTML(filled) }}
                    />
                  );
                }
                return (
                  <span key={i} className="slot">
                    ?
                  </span>
                );
              })}
            </button>
            <button type="button" className="tool-remove" title="Remove tool" onClick={() => onRemoveTool(tool.id)}>
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
