export function Mark({ className = '', title = 'ADRENL' }: { className?: string; title?: string }) {
  return (
    <svg className={className} role="img" aria-label={title} viewBox="72 30 640 560" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path className="mk-grey" opacity="0.42" d="M389.5 95.5 L524.5 434.5 L693 576.5 L455 483 L525.5 437.5 L390.5 315.5 L253.5 437 L325.5 483.5 L86 576.5 L253.5 435.5 Z" />
      <path className="mk-shell" d="M389 42 L694.5 577.5 L525 434.5 L390 95 L253 435.5 L83.5 576.5 Z" />
      <path className="mk-wedge" d="M387.5 317 L326.5 482.5 L254 439.5 Z" />
      <path className="mk-wedge" d="M391 317 L525 438 L452 480.5 Z" />
    </svg>
  );
}
