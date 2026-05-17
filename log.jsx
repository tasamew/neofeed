// ============================================================
// Daily log + trends view
// ============================================================
const D_L = window.NEOFEED_DATA;

// Safe number formatter — handles strings / null from GAS
const n = (v, d = 1) => {
  const x = parseFloat(v);
  return isFinite(x) ? x.toFixed(d) : "—";
};

function DailyLog({ patient, log }) {
  const entries = log[patient?.sessionId] || [];

  // Build simple multi-line chart for kcal / protein / fluid
  const W = 760, H = 240, pad = { l: 44, r: 28, t: 16, b: 28 };
  const maxDol = Math.max(...entries.map(e => e.dol), 14);
  const xScale = x => pad.l + (x / maxDol) * (W - pad.l - pad.r);

  const makeScale = (max) => (y => H - pad.b - (y / max) * (H - pad.t - pad.b));
  const yKcal  = makeScale(150);
  const yPro   = makeScale(5);
  const yFluid = makeScale(200);

  const pathFor = (key, yScale) =>
    entries.map((e, i) => `${i === 0 ? "M" : "L"} ${xScale(e.dol)} ${yScale(e[key])}`).join(" ");

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Daily nutritional log</h1>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-h">
          <Icon name="chart" size={14} color="var(--brand)" />
          Delivery trend · last {entries.length} days
        </div>
        <div className="card-b">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", maxWidth: 760 }}>
            <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} fill="oklch(99.5% 0.002 230)" />
            {[0, 25, 50, 75, 100, 125, 150].map(t => (
              <g key={t}>
                <line x1={pad.l} x2={W - pad.r} y1={yKcal(t)} y2={yKcal(t)} stroke="oklch(94% 0.005 230)" />
                <text x={pad.l - 6} y={yKcal(t) + 3} fontSize="10" textAnchor="end" fill="var(--ink-3)" fontFamily="IBM Plex Mono, monospace">{t}</text>
              </g>
            ))}
            {Array.from({ length: maxDol + 1 }).map((_, i) => i % 2 === 0 && (
              <text key={i} x={xScale(i)} y={H - pad.b + 14} fontSize="10" textAnchor="middle" fill="var(--ink-3)" fontFamily="IBM Plex Mono, monospace">{i}</text>
            ))}
            {/* target zones */}
            <rect x={pad.l} y={yKcal(135)} width={W - pad.l - pad.r} height={yKcal(110) - yKcal(135)} fill="oklch(50% 0.1 215 / .06)" />

            <path d={pathFor("kcal", yKcal)}  stroke="oklch(46% 0.085 215)" strokeWidth="2" fill="none" />
            <path d={pathFor("pro", v => yPro(v))}  stroke="oklch(55% 0.13 155)" strokeWidth="2" fill="none" strokeDasharray="0" />
            <path d={pathFor("fluid", yFluid)} stroke="oklch(60% 0.11 25)" strokeWidth="2" fill="none" strokeDasharray="2 2" />

            {entries.map((e, i) => (
              <g key={i}>
                <circle cx={xScale(e.dol)} cy={yKcal(e.kcal)}  r="3" fill="oklch(46% 0.085 215)" />
                <circle cx={xScale(e.dol)} cy={yPro(e.pro)}   r="3" fill="oklch(55% 0.13 155)" />
                <circle cx={xScale(e.dol)} cy={yFluid(e.fluid)} r="3" fill="oklch(60% 0.11 25)" />
              </g>
            ))}

            <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="var(--ink-3)" />
            <text x={(W) / 2} y={H - 4} fontSize="10" textAnchor="middle" fill="var(--ink-3)">Day of life</text>
          </svg>

          <div className="legend" style={{ marginTop: 10 }}>
            <div className="s"><span className="b" style={{ background: "oklch(46% 0.085 215)" }}></span>Energy (kcal/kg/d)</div>
            <div className="s"><span className="b" style={{ background: "oklch(55% 0.13 155)" }}></span>Protein × 30 (g/kg/d × 30)</div>
            <div className="s"><span className="b" style={{ background: "oklch(60% 0.11 25)" }}></span>Fluid (mL/kg/d)</div>
            <div className="s"><span className="b" style={{ background: "oklch(50% 0.1 215 / .25)" }}></span>Target energy zone</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <Icon name="log" size={14} color="var(--brand)" />
          All entries
          <span className="h-meta">{entries.length} records</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>DOL</th>
              <th>Date</th>
              <th>Weight</th>
              <th>Fluid</th>
              <th>GIR</th>
              <th>Protein</th>
              <th>Energy</th>
              <th>Na / K</th>
              <th>Route</th>
            </tr>
          </thead>
          <tbody>
            {entries.slice().reverse().map((e, i) => (
              <tr key={i}>
                <td className="num" style={{ fontWeight: 600 }}>{e.dol}</td>
                <td className="num" style={{ color: "var(--ink-3)" }}>{e.ts}</td>
                <td className="num">{e.weight || "—"} g</td>
                <td className="num">{n(e.fluid, 0)} mL/kg</td>
                <td className="num">{n(e.gir, 1)}</td>
                <td className="num">{n(e.pro, 1)} g/kg</td>
                <td className="num">{n(e.kcal, 0)} kcal/kg</td>
                <td className="num">{n(e.na, 1)} / {n(e.k, 1)}</td>
                <td style={{ color: "var(--ink-2)" }}>{e.route}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

window.DailyLog = DailyLog;
