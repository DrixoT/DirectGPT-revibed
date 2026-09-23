/**
 * Icons exported from the Figma source (file zBlbjH4oVh3xD6TifUjzHj, frame 2:2).
 *
 * The path geometry, viewBox and stroke widths are the exported bytes verbatim;
 * only the hard-coded stroke/fill colours were swapped for `currentColor` so the
 * icons take the colour of the control they sit in. Each keeps its designed leaf
 * size (plus 14, chevron 12, settings/send 16, code/brain 20).
 */

interface IconProps {
  className?: string;
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 10.5C9.38071 10.5 10.5 9.38071 10.5 8C10.5 6.61929 9.38071 5.5 8 5.5C6.61929 5.5 5.5 6.61929 5.5 8C5.5 9.38071 6.61929 10.5 8 10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 1V3M8 13V15M1 8H3M13 8H15M3.05 3.05L4.46 4.46M11.54 11.54L12.95 12.95M3.05 12.95L4.46 11.54M11.54 4.46L12.95 3.05"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCode({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6 7L2 10L6 13M14 7L18 10L14 13M11 5L9 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBrain({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M7 10C7 8.34 8.34 7 10 7C11.66 7 13 8.34 13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 13V15M8 15H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconSend({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M14 8L2 2L5 8L2 14L14 8Z" fill="currentColor" />
    </svg>
  );
}

/** Not in the Figma source: the stop control replaces send while a prompt runs. */
export function IconStop({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1.5" fill="currentColor" />
    </svg>
  );
}

/** Not in the Figma source: model-picker chrome. */
export function IconStar({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.6l1.54 3.12 3.45.5-2.5 2.43.59 3.44L7 9.47 3.92 11.09l.59-3.44-2.5-2.43 3.45-.5L7 1.6z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6.2" cy="6.2" r="3.7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 9.2L12 12.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconOpenAI({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9 4.4c1.3 0 2.4.7 3 1.7-.6.2-1.3.3-2 .3-1.6 0-3-.8-3.7-2 .7-.6 1.6-1 2.7-1zm-3.4 2.2c.9-1 2.2-1.6 3.6-1.6.2 1.6 1.1 3 2.4 3.8-.5.9-1.3 1.6-2.3 2-1.2-1.4-2.8-2.4-3.7-4.2zm-.3 4c-.6-1-.7-2.2-.3-3.3 1.5.6 3.2.7 4.7.2.3 1.1.2 2.3-.3 3.3-1.3-.3-2.8-.3-4.1-.2zm3.7 3c-1.3 0-2.5-.6-3.3-1.6.9-.4 1.8-1.1 2.4-2 1.5.8 2.6 2.2 3 3.8-.7.5-1.4.8-2.1.8zm3.6-2.1c-.6 1.1-1.7 1.9-3 2.2-.3-1.6-1.2-3-2.5-3.8.5-.9 1.3-1.6 2.3-2 1.3 1.3 2.6 2.5 3.2 3.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconAnthropic({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 3.2L12.8 14.8h-2.1l-.7-2H8l-.7 2H5.2L9 3.2zM8.6 11.2h.8L9 10.1l-.4 1.1z" fill="currentColor" />
    </svg>
  );
}

export function IconGoogle({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M15.7 9.2c0-.5-.04-.9-.12-1.3H9.2v2.5h3.64c-.16.8-.63 1.48-1.34 1.94v1.6h2.16c1.27-1.17 2.04-2.9 2.04-4.74z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M9.2 16c1.82 0 3.35-.6 4.47-1.64l-2.16-1.6c-.6.4-1.37.64-2.31.64-1.78 0-3.28-1.2-3.82-2.82H3.14v1.66C4.25 14.86 6.54 16 9.2 16z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M5.38 10.58A3.9 3.9 0 0 1 5.16 9c0-.55.08-1.08.22-1.58V5.76H3.14A6.8 6.8 0 0 0 2.4 9c0 1.1.26 2.14.74 3.08l2.24-1.5z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M9.2 5.16c.99 0 1.88.34 2.58 1.01l1.93-1.93C12.54 3.12 11.02 2.5 9.2 2.5 6.54 2.5 4.25 3.64 3.14 5.76l2.24 1.66c.54-1.62 2.04-2.26 3.82-2.26z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}
