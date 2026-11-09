// How Fico stores and syncs data. Drawn as SVG so it follows the page colours in light and dark.

export default function ArchDiagram() {
  return (
    <svg viewBox="0 0 800 330" role="img" aria-labelledby="arch-title arch-desc" className="diagram">
      <title id="arch-title">How Fico stores and syncs data</title>
      <desc id="arch-desc">
        The app reads and writes a Postgres database on the device through a query engine. Writes are also queued in an
        outbox, which a sync loop replays to Supabase. A read-only MCP server reads from Supabase for an AI assistant.
      </desc>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* on device */}
      <rect x="8" y="8" width="456" height="314" rx="6" className="diagram__zone" />
      <text x="24" y="34" className="diagram__zone-label">On the phone</text>

      <rect x="28" y="56" width="150" height="56" rx="4" className="diagram__box" />
      <text x="103" y="89" textAnchor="middle" className="diagram__text">App screens</text>

      <rect x="28" y="140" width="150" height="56" rx="4" className="diagram__box" />
      <text x="103" y="166" textAnchor="middle" className="diagram__text">Query engine</text>
      <text x="103" y="184" textAnchor="middle" className="diagram__sub">supabase-js style calls</text>

      <rect x="28" y="236" width="150" height="62" rx="4" className="diagram__box diagram__box--key" />
      <text x="103" y="264" textAnchor="middle" className="diagram__text">Postgres (PGlite)</text>
      <text x="103" y="282" textAnchor="middle" className="diagram__sub">source for every read</text>

      <rect x="262" y="236" width="170" height="62" rx="4" className="diagram__box" />
      <text x="347" y="264" textAnchor="middle" className="diagram__text">Outbox</text>
      <text x="347" y="282" textAnchor="middle" className="diagram__sub">every changed row, in order</text>

      <line x1="103" y1="112" x2="103" y2="138" className="diagram__line" markerEnd="url(#arrow)" />
      <line x1="103" y1="196" x2="103" y2="234" className="diagram__line" markerEnd="url(#arrow)" />
      <line x1="178" y1="267" x2="260" y2="267" className="diagram__line" markerEnd="url(#arrow)" />
      <text x="219" y="257" textAnchor="middle" className="diagram__sub">on write</text>

      {/* server */}
      <rect x="600" y="56" width="192" height="130" rx="6" className="diagram__zone" />
      <text x="616" y="82" className="diagram__zone-label">Server</text>
      <rect x="620" y="98" width="152" height="62" rx="4" className="diagram__box diagram__box--key" />
      <text x="696" y="126" textAnchor="middle" className="diagram__text">Supabase</text>
      <text x="696" y="144" textAnchor="middle" className="diagram__sub">Postgres</text>

      <rect x="600" y="236" width="192" height="62" rx="4" className="diagram__box" />
      <text x="696" y="264" textAnchor="middle" className="diagram__text">MCP server</text>
      <text x="696" y="282" textAnchor="middle" className="diagram__sub">read-only, for an AI assistant</text>

      <path d="M432 267 H500 Q520 267 520 247 V150 Q520 129 540 129 H618" className="diagram__line" fill="none" markerEnd="url(#arrow)" />
      <text x="530" y="205" className="diagram__sub">sync replays</text>
      <text x="530" y="220" className="diagram__sub">the outbox</text>
      <line x1="696" y1="186" x2="696" y2="234" className="diagram__line" markerStart="url(#arrow)" strokeDasharray="4 4" />
    </svg>
  );
}
