import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowDownRight, ArrowLeft, ArrowUpRight, Bell, ChevronDown, ChevronRight,
  Download, RefreshCw, Search, StickyNote, TrendingUp, X
} from 'lucide-react'
import {
  SECTOR_COLORS, exportCSV, fmt, loadPositions, positionInvested,
  positionPnL, positionReturnPct, positionValue, saveNote,
  totalInvested, totalValue, type Position, type Sector,
} from './portfolioData'
import './portfolio.css'

const RANGES = ['1D', '1W', '1M', '6M', '1Y', 'All']

// Deterministic realistic market-style normalized series (0..1 range, ending near current value)
function generateMarketSeries(seed: number, count: number, startLevel: number, endLevel: number, volatility: number): number[] {
  const pts: number[] = []
  let val = startLevel
  const drift = (endLevel - startLevel) / (count - 1)
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    // Combine multi-frequency waves + deterministic pseudo-random spikes for authentic market swings
    const s1 = Math.sin(i * 0.43 + seed * 1.7) * 0.45
    const s2 = Math.cos(i * 1.13 + seed * 3.1) * 0.35
    const s3 = Math.sin(i * 2.37 + seed * 0.9) * 0.25
    const spike = Math.sin(i * 0.19 + seed * 2.3) > 0.72 ? Math.sin(i * 3.1 + seed) * 0.55 : 0
    val = startLevel + drift * i + (s1 + s2 + s3 + spike) * volatility * Math.sin(Math.PI * Math.min(1, Math.max(0.08, t)))
    pts.push(val)
  }
  pts[pts.length - 1] = endLevel
  return pts
}

const RANGE_SERIES: Record<string, { pts: number[]; labels: string[] }> = {
  '1D': {
    pts: generateMarketSeries(1, 72, 3.84, 3.92, 0.045),
    labels: ['9:15', '10:00', '10:45', '11:30', '12:15', '1:00', '1:45', '2:30', '3:15', '4:00'],
  },
  '1W': {
    pts: generateMarketSeries(2, 78, 3.74, 3.92, 0.08),
    labels: ['Mon', 'Mon PM', 'Tue', 'Tue PM', 'Wed', 'Wed PM', 'Thu', 'Thu PM', 'Fri', 'Now'],
  },
  '1M': {
    pts: generateMarketSeries(3, 84, 3.46, 3.92, 0.16),
    labels: ['Nov 01', 'Nov 04', 'Nov 07', 'Nov 10', 'Nov 13', 'Nov 16', 'Nov 19', 'Nov 22', 'Nov 25', 'Now'],
  },
  '6M': {
    pts: generateMarketSeries(4, 96, 3.05, 3.92, 0.24),
    labels: ['Jun 26', 'Jun 15', 'Jul 26', 'Jul 15', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26'],
  },
  '1Y': {
    pts: generateMarketSeries(5, 110, 2.75, 3.92, 0.34),
    labels: ['Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26'],
  },
  All: {
    pts: generateMarketSeries(6, 120, 1.95, 3.92, 0.38),
    labels: ['2022', '2022 H2', '2023', '2023 H2', '2024', '2024 H2', '2025', '2025 H2', '2026', 'Now'],
  },
}

function buildSmoothMarketPath(pts: number[], w: number, h: number, padY = 14) {
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const span = max - min || 1
  const coords = pts.map((v, i) => ({
    x: (i / (pts.length - 1)) * w,
    y: padY + (1 - (v - min) / span) * (h - padY * 2),
  }))

  let d = `M${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)]
    const p1 = coords[i]
    const p2 = coords[i + 1]
    const p3 = coords[Math.min(coords.length - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  const ticks = Array.from({ length: 6 }, (_, i) => {
    const val = max - (i / 5) * span
    return `₹${val.toFixed(2)}L`
  })

  return { d, coords, ticks }
}

function CompanyLogo({ domain, name, color }: { domain: string; name: string; color: string }) {
  const [err, setErr] = useState(false)
  if (!err)
    return <img className="pf-logo" src={`https://logo.clearbit.com/${domain}`} alt={name} onError={() => setErr(true)} />
  return <span className="pf-logo-fallback" style={{ background: color }}>{name[0]}</span>
}

function SectorDonut({ sectors }: { sectors: { name: string; pct: number; color: string }[] }) {
  let offset = 0
  const r = 54, cx = 64, cy = 64, circumference = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 128 128" className="pf-donut">
      {sectors.map(s => {
        const dash = (s.pct / 100) * circumference
        const el = (
          <circle key={s.name} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="20"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        )
        offset += dash
        return el
      })}
      <circle cx={cx} cy={cy} r={44} fill="#1b2a39" />
    </svg>
  )
}

function NoteModal({ position, onClose }: { position: Position; onClose: () => void }) {
  const [text, setText] = useState(position.notes)
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  function save() { saveNote(position.id, text); onClose() }
  return (
    <div className="pf-modal-overlay" onClick={onClose}>
      <div className="pf-modal" onClick={e => e.stopPropagation()}>
        <div className="pf-modal-header">
          <div>
            <div className="pf-modal-title"><StickyNote size={16} /> Note for {position.name}</div>
            <div className="pf-modal-sub">{position.symbol}</div>
          </div>
          <button className="pf-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <textarea ref={ref} className="pf-modal-textarea" value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add your research notes, buy thesis, target price…" />
        <div className="pf-modal-actions">
          <button className="pf-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="pf-btn-primary" onClick={save}>Save note</button>
        </div>
      </div>
    </div>
  )
}

export default function PortfolioPage({ onBack, voiceProfileSlot }: { onBack: () => void; voiceProfileSlot?: ReactNode }) {
  const [positions, setPositions] = useState<Position[]>(loadPositions)
  const [activeTab, setActiveTab] = useState<'overview' | 'voice-profile'>('overview')
  const [range, setRange] = useState('1Y')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [noteTarget, setNoteTarget] = useState<Position | null>(null)
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(() => new Set(Object.keys(SECTOR_COLORS)))
  const [sortBy, setSortBy] = useState<'value' | 'return' | 'name'>('value')

  const tv = totalValue(positions)
  const ti = totalInvested(positions)
  const pnl = tv - ti
  const pnlPct = (pnl / ti) * 100

  // Sector breakdown
  const sectorData = useMemo(() => {
    const map: Record<string, { value: number; invested: number; count: number; color: string }> = {}
    positions.forEach(p => {
      if (!map[p.sector]) map[p.sector] = { value: 0, invested: 0, count: 0, color: SECTOR_COLORS[p.sector] }
      map[p.sector].value += positionValue(p)
      map[p.sector].invested += positionInvested(p)
      map[p.sector].count += 1
    })
    return Object.entries(map)
      .map(([name, d]) => ({ name: name as Sector, ...d, pct: (d.value / tv) * 100 }))
      .sort((a, b) => b.value - a.value)
  }, [positions, tv])

  const filteredPositions = useMemo(() => {
    const q = search.toLowerCase()
    return positions
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.symbol.toLowerCase().includes(q) || p.sector.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'value') return positionValue(b) - positionValue(a)
        if (sortBy === 'return') return positionReturnPct(b) - positionReturnPct(a)
        return a.name.localeCompare(b.name)
      })
  }, [positions, search, sortBy])

  const positionsBySector = useMemo(() => {
    const map: Record<string, Position[]> = {}
    filteredPositions.forEach(p => {
      if (!map[p.sector]) map[p.sector] = []
      map[p.sector].push(p)
    })
    return map
  }, [filteredPositions])

  function handleNoteClose() {
    setPositions(loadPositions())
    setNoteTarget(null)
  }

  function toggleSector(name: string) {
    setExpandedSectors(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <div className="pf-page">
      {noteTarget && <NoteModal position={noteTarget} onClose={handleNoteClose} />}

      {/* ── HEADER ── */}
      <div className="pf-header">
        <div className="pf-header-left">
          <button className="pf-back" onClick={onBack}><ArrowLeft size={16} /> Overview</button>
          <div>
            <div className="pf-breadcrumb">My Portfolio</div>
            <div className="pf-last-updated">Last updated today, 4:00 PM IST</div>
          </div>
        </div>
        <div className="pf-header-actions">
          {voiceProfileSlot && (
            <div className="pf-range-tabs" role="tablist" aria-label="Portfolio sections">
              <button type="button" role="tab" aria-selected={activeTab === 'overview'} className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
              <button type="button" role="tab" aria-selected={activeTab === 'voice-profile'} className={activeTab === 'voice-profile' ? 'active' : ''} onClick={() => setActiveTab('voice-profile')}>Voice profile</button>
            </div>
          )}
          <button className="pf-btn-ghost" onClick={() => setPositions(loadPositions())}><RefreshCw size={15} /> Refresh</button>
          <button className="pf-btn-primary" onClick={() => exportCSV(positions)}><Download size={15} /> Export CSV</button>
        </div>
      </div>

      {activeTab === 'voice-profile' && voiceProfileSlot ? (
        <div style={{ padding: '24px 36px' }}>{voiceProfileSlot}</div>
      ) : (
        <>

      {/* ── SUMMARY CARDS ── */}
      <div className="pf-summary-grid">
        <div className="pf-summary-card pf-summary-main">
          <span className="pf-label">Total Portfolio Value</span>
          <div className="pf-summary-value">{fmt(tv)}</div>
          <div className={`pf-summary-delta ${pnl >= 0 ? 'up' : 'down'}`}>
            {pnl >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {pnl >= 0 ? '+' : ''}{fmt(Math.abs(pnl))} ({pnlPct.toFixed(2)}%) all time
          </div>
        </div>
        <div className="pf-summary-card">
          <span className="pf-label">Total Invested</span>
          <div className="pf-summary-value pf-sm">{fmt(ti)}</div>
          <div className="pf-label">{positions.length} holdings</div>
        </div>
        <div className="pf-summary-card">
          <span className="pf-label">Today's P&amp;L</span>
          <div className="pf-summary-value pf-sm up">+{fmt(1240)}</div>
          <div className="pf-label up">+0.84% today</div>
        </div>
        <div className="pf-summary-card">
          <span className="pf-label">Best Performer</span>
          <div className="pf-summary-value pf-sm">ICICI Bank</div>
          <div className="pf-label up">+42.07% return</div>
        </div>
        <div className="pf-summary-card">
          <span className="pf-label">Worst Performer</span>
          <div className="pf-summary-value pf-sm">Infosys</div>
          <div className="pf-label down">-1.34% return</div>
        </div>
        <div className="pf-summary-card">
          <span className="pf-label">Sectors Covered</span>
          <div className="pf-summary-value pf-sm">{sectorData.length}</div>
          <div className="pf-label">Diversified portfolio</div>
        </div>
      </div>

      {/* ── CHART + SECTOR DONUT ── */}
      <div className="pf-chart-row">
        {(() => {
          const series = RANGE_SERIES[range]
          const scale = tv / 392000
          const scaledPts = series.pts.map(v => v * scale)
          const { d, coords, ticks } = buildSmoothMarketPath(scaledPts, 760, 220)
          const activePt = hoverIdx !== null ? coords[hoverIdx] : null
          const activeVal = hoverIdx !== null ? scaledPts[hoverIdx] : null
          return (
            <div className="pf-chart-card">
              <div className="pf-chart-header">
                <div>
                  <div className="pf-label">Portfolio Performance</div>
                  <div className="pf-chart-value">
                    {activeVal !== null ? `₹${activeVal.toFixed(2)}L` : fmt(tv)}
                  </div>
                </div>
              </div>
              <div className="pf-chart-area pf-chart-area-right">
                <svg
                  viewBox="0 0 760 220"
                  preserveAspectRatio="none"
                  className="pf-chart-svg"
                  onMouseMove={e => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                    setHoverIdx(Math.round(ratio * (scaledPts.length - 1)))
                  }}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  <defs>
                    <linearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#19d49e" stopOpacity=".10" />
                      <stop offset="1" stopColor="#19d49e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3, 4, 5].map(i => {
                    const y = 14 + (i / 5) * (220 - 28)
                    return <line key={i} x1="0" y1={y} x2="760" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  })}
                  <path d={`${d} L760 220 L0 220 Z`} fill="url(#pfGrad)" />
                  <path d={d} fill="none" stroke="#19d49e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  {activePt && (
                    <>
                      <line x1={activePt.x} y1="0" x2={activePt.x} y2="220" stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" strokeWidth="1" />
                      <circle cx={activePt.x} cy={activePt.y} r="4.5" fill="#19d49e" stroke="#111a24" strokeWidth="2" />
                    </>
                  )}
                </svg>
                <div className="pf-chart-guides pf-chart-guides-right">
                  {ticks.map((t, i) => <span key={i}>{t}</span>)}
                </div>
              </div>
              <div className="pf-chart-axis pf-chart-axis-full">
                {series.labels.map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="pf-chart-footer-tabs">
                <div className="pf-range-tabs pf-range-pills">
                  {RANGES.map(r => (
                    <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}

        <div className="pf-donut-card">
          <div className="pf-label" style={{ marginBottom: 16 }}>Sector Diversification</div>
          <div className="pf-donut-wrap">
            <SectorDonut sectors={sectorData.map(s => ({ name: s.name, pct: s.pct, color: s.color }))} />
            <div className="pf-donut-center">
              <strong>{sectorData.length}</strong>
              <span>sectors</span>
            </div>
          </div>
          <div className="pf-sector-legend">
            {sectorData.map(s => (
              <div key={s.name} className="pf-sector-legend-row">
                <span className="pf-sector-dot" style={{ background: s.color }} />
                <span className="pf-sector-name">{s.name}</span>
                <span className="pf-sector-pct">{s.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTOR ALLOCATION CARDS ── */}
      <div className="pf-section-heading">
        <TrendingUp size={17} /> Sector Breakdown
      </div>
      <div className="pf-sector-grid">
        {sectorData.map(s => {
          const sectorPnl = s.value - s.invested
          const sectorPnlPct = (sectorPnl / s.invested) * 100
          return (
            <div key={s.name} className="pf-sector-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div className="pf-sector-card-name">{s.name}</div>
              <div className="pf-sector-card-value">{fmt(s.value)}</div>
              <div className="pf-sector-card-row">
                <span className="pf-label">{s.pct.toFixed(1)}% of portfolio</span>
                <span className={sectorPnl >= 0 ? 'up' : 'down'}>
                  {sectorPnl >= 0 ? '+' : ''}{sectorPnlPct.toFixed(2)}%
                </span>
              </div>
              <div className="pf-sector-card-bar">
                <div style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
              <div className="pf-label">{s.count} holding{s.count > 1 ? 's' : ''}</div>
            </div>
          )
        })}
      </div>

      {/* ── HOLDINGS TABLE ── */}
      <div className="pf-section-heading">
        <Bell size={17} /> Holdings by Sector
        <div className="pf-holdings-toolbar">
          <div className="pf-search-box">
            <Search size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search holdings…" />
            {search && <button onClick={() => setSearch('')}><X size={13} /></button>}
          </div>
          <div className="pf-sort-tabs">
            <span>Sort:</span>
            {(['value', 'return', 'name'] as const).map(s => (
              <button key={s} className={sortBy === s ? 'active' : ''} onClick={() => setSortBy(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {Object.entries(positionsBySector).map(([sector, sectorPositions]) => (
        <div key={sector} className="pf-sector-group">
          <button className="pf-sector-group-header" onClick={() => toggleSector(sector)}>
            <span className="pf-sector-dot" style={{ background: SECTOR_COLORS[sector as Sector] }} />
            <strong>{sector}</strong>
            <span className="pf-label">({sectorPositions.length} holdings)</span>
            <span className="pf-label" style={{ marginLeft: 'auto' }}>
              {fmt(sectorPositions.reduce((s, p) => s + positionValue(p), 0))}
            </span>
            {expandedSectors.has(sector)
              ? <ChevronDown size={16} />
              : <ChevronRight size={16} />}
          </button>

          {expandedSectors.has(sector) && (
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Units</th>
                    <th>Avg Price</th>
                    <th>Market Price</th>
                    <th>Current Value</th>
                    <th>P&amp;L</th>
                    <th>Return</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorPositions.map(p => {
                    const val = positionValue(p)
                    const pnl = positionPnL(p)
                    const ret = positionReturnPct(p)
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="pf-company-cell">
                            <CompanyLogo domain={p.domain} name={p.name} color={p.color} />
                            <div>
                              <div className="pf-company-name">{p.name}</div>
                              <div className="pf-company-symbol">{p.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.units}</td>
                        <td>₹{p.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td>₹{p.marketPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td><strong>{fmt(val)}</strong></td>
                        <td className={pnl >= 0 ? 'up' : 'down'}>
                          {pnl >= 0 ? '+' : ''}{fmt(Math.abs(pnl))}
                        </td>
                        <td>
                          <span className={`pf-return-badge ${ret >= 0 ? 'up' : 'down'}`}>
                            {ret >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {ret >= 0 ? '+' : ''}{ret.toFixed(2)}%
                          </span>
                        </td>
                        <td>
                          <button className="pf-note-btn" onClick={() => setNoteTarget(p)}>
                            <StickyNote size={14} />
                            {p.notes ? 'Edit note' : 'Add note'}
                          </button>
                          {p.notes && <div className="pf-note-preview">{p.notes.slice(0, 40)}{p.notes.length > 40 ? '…' : ''}</div>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      <div className="pf-disclaimer">
        Illustrative sample values for demo purposes only. Not connected to a live brokerage account.
      </div>
        </>
      )}
    </div>
  )
}
