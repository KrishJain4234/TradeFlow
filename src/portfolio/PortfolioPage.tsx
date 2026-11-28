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

const CHART_PATHS: Record<string, string> = {
  '1D': 'M0 180 C40 174 60 165 100 158 S160 148 200 140 S250 130 300 118 S360 108 400 100 S450 88 490 76 S540 62 580 50 S620 36 680 20 S720 10 760 4',
  '1W': 'M0 190 C50 180 80 195 130 170 S200 180 250 155 S310 162 360 135 S420 148 470 118 S525 128 570 100 S625 80 670 58 S710 42 760 22',
  '1M': 'M0 200 C45 192 72 178 115 185 S175 162 215 172 S265 148 308 158 S358 130 400 142 S448 115 490 128 S538 100 582 112 S635 78 678 90 S720 55 760 30',
  '6M': 'M0 210 C48 202 75 215 118 195 S178 206 220 184 S272 194 315 170 S370 180 414 155 S462 165 505 138 S556 148 600 120 S650 90 695 62 S730 40 760 18',
  '1Y': 'M0 220 C50 210 78 198 122 207 S185 194 228 203 S278 188 322 196 S376 180 420 190 S468 172 512 183 S562 155 608 168 S658 130 702 90 S738 55 760 22',
  All:  'M0 225 C52 218 80 210 125 215 S188 205 232 212 S283 198 328 205 S382 192 428 200 S477 185 522 194 S572 165 618 178 S666 142 710 108 S740 72 760 28',
}

const CHART_LABELS: Record<string, string[]> = {
  '1D': ['9AM','11AM','1PM','3PM','4PM'],
  '1W': ['Mon','Tue','Wed','Thu','Fri'],
  '1M': ['Nov 01','Nov 08','Nov 15','Nov 22','Now'],
  '6M': ['Jun','Jul','Aug','Sep','Oct','Nov'],
  '1Y': ['Dec 25','Mar 26','Jun 26','Sep 26','Now'],
  All:  ['2023','2024','2025','2026','Now'],
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
  const [range, setRange] = useState('1M')
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
        <div className="pf-chart-card">
          <div className="pf-chart-header">
            <div>
              <div className="pf-label">Portfolio Performance</div>
              <div className="pf-chart-value">{fmt(tv)}</div>
            </div>
            <div className="pf-range-tabs">
              {RANGES.map(r => (
                <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
              ))}
            </div>
          </div>
          <div className="pf-chart-area">
            <div className="pf-chart-guides">
              <span>₹2.5L</span><span>₹2.0L</span><span>₹1.5L</span><span>₹1.0L</span>
            </div>
            <svg viewBox="0 0 760 240" preserveAspectRatio="none" className="pf-chart-svg">
              <defs>
                <linearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#18c875" stopOpacity=".25" />
                  <stop offset="1" stopColor="#18c875" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${CHART_PATHS[range]} V240 H0Z`} fill="url(#pfGrad)" />
              <path d={CHART_PATHS[range]} fill="none" stroke="#18c875" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pf-chart-axis">
            {CHART_LABELS[range].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>

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
