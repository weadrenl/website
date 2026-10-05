import { createElement } from 'react';

// Splits text into masked lines/words/chars so GSAP can reveal them. Server-rendered, so SEO keeps the full text.
export function Chars({ text, tag = 'span', className = '' }: { text: string; tag?: string; className?: string }) {
  const words = text.split(' ');
  return createElement(tag, { className: `split ${className}`, 'aria-label': text },
    words.map((w, wi) => (
      <span className="w" aria-hidden="true" key={wi}>
        {w.split('').map((c, ci) => <span className="c" key={ci}><span className="ci">{c}</span></span>)}
        {wi < words.length - 1 ? '\u00A0' : ''}
      </span>
    )));
}

export function Words({ text, className = '' }: { text: string; className?: string }) {
  return <p className={`words ${className}`} aria-label={text}>{text.split(' ').map((w, i) => <span className="wd" aria-hidden="true" key={i}>{w}{' '}</span>)}</p>;
}
