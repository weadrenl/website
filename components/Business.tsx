import { BUSINESS as B, POLICIES } from '@/lib/data';

/** Who runs ADRENL and how to reach them. Shown in the footer of every page (payment providers check for it). */
export function BusinessInfo() {
  return (
    <address className="biz">
      ADRENL is a brand of <b>{B.legalName}</b>.<br />
      {B.street},<br />{B.city}, {B.state} {B.pin}, India<br />
      <a href={`tel:${B.tel}`}>{B.phone}</a>
    </address>
  );
}

export function PolicyLinks() {
  return <p className="foot-links">{POLICIES.map(([h, t]) => <a key={h} href={h}>{t}</a>)}</p>;
}
