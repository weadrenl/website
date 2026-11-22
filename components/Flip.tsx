/**
 * A tee picture that shows its other side while a mouse is over its card (or the card has keyboard focus), the way shop
 * grids do on desktop (founder, 2026-11-22). The second picture is hidden, and so never downloaded, on touch screens: a
 * phone has no hover, and there a sideways swipe already means something (the next design in the lab's strip), so phones
 * turn tees with the Back/Front switch or in the full view, where a sideways swipe shows the other sides.
 * The card that holds it carries the hover: see `.flip` in globals.css for which cards.
 */
export function Flip({ src, other, alt, className, loading = 'lazy', tag }: {
  src: string;
  other?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  /** A small label shown with the other side, e.g. "Front". */
  tag?: string;
}) {
  return (
    <span className="flip">
      <img className={className} src={src} width={512} height={1024} alt={alt} loading={loading} decoding="async" />
      {other && <img className={`${className ? `${className} ` : ''}flip-alt`} src={other} width={512} height={1024} alt="" aria-hidden="true" loading="lazy" decoding="async" />}
      {other && tag && <span className="flip-tag" aria-hidden="true">{tag}</span>}
    </span>
  );
}
