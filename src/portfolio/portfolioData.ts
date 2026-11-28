export type Sector = 'Banking & Finance' | 'Information Technology' | 'Oil & Energy' | 'Pharmaceuticals' | 'FMCG' | 'Automobile'

export interface Position {
  id: string
  name: string
  symbol: string
  domain: string        // for Clearbit logo
  sector: Sector
  units: number
  avgPrice: number
  marketPrice: number
  color: string
  notes: string
}

export const SECTOR_COLORS: Record<Sector, string> = {
  'Banking & Finance': '#6aa9ff',
  'Information Technology': '#ffb454',
  'Oil & Energy': '#b47aff',
  'Pharmaceuticals': '#55c6ab',
  'FMCG': '#f4a356',
  'Automobile': '#ee8194',
}

const RAW: Omit<Position, 'notes'>[] = [
  { id: 'HDFCBANK',   name: 'HDFC Bank',               symbol: 'HDFCBANK',   domain: 'hdfcbank.com',    sector: 'Banking & Finance',      units: 24, avgPrice: 1853.33, marketPrice: 2010.00, color: '#6aa9ff' },
  { id: 'ICICIBANK',  name: 'ICICI Bank',               symbol: 'ICICIBANK',  domain: 'icicibank.com',   sector: 'Banking & Finance',      units: 18, avgPrice: 1011.22, marketPrice: 1436.67, color: '#5b9eff' },
  { id: 'SBIN',       name: 'State Bank of India',      symbol: 'SBIN',       domain: 'sbi.co.in',       sector: 'Banking & Finance',      units: 30, avgPrice: 622.40,  marketPrice: 791.00,  color: '#4587ff' },
  { id: 'TCS',        name: 'Tata Consultancy Services',symbol: 'TCS',        domain: 'tcs.com',         sector: 'Information Technology', units: 4,  avgPrice: 3680.00, marketPrice: 4250.00, color: '#55c6ab' },
  { id: 'INFY',       name: 'Infosys',                  symbol: 'INFY',       domain: 'infosys.com',     sector: 'Information Technology', units: 40, avgPrice: 573.68,  marketPrice: 566.00,  color: '#ffb454' },
  { id: 'WIPRO',      name: 'Wipro',                    symbol: 'WIPRO',      domain: 'wipro.com',       sector: 'Information Technology', units: 50, avgPrice: 420.10,  marketPrice: 480.60,  color: '#ffa733' },
  { id: 'RELIANCE',   name: 'Reliance Industries',      symbol: 'RELIANCE',   domain: 'ril.com',         sector: 'Oil & Energy',           units: 20, avgPrice: 1669.55, marketPrice: 1741.00, color: '#b47aff' },
  { id: 'SUNPHARMA',  name: 'Sun Pharma',               symbol: 'SUNPHARMA',  domain: 'sunpharma.com',   sector: 'Pharmaceuticals',        units: 22, avgPrice: 1120.50, marketPrice: 1340.00, color: '#55c6ab' },
  { id: 'DRREDDY',    name: "Dr. Reddy's",              symbol: 'DRREDDY',    domain: 'drreddys.com',    sector: 'Pharmaceuticals',        units: 8,  avgPrice: 5230.00, marketPrice: 5810.00, color: '#38b89a' },
  { id: 'HINDUNILVR', name: 'Hindustan Unilever',       symbol: 'HINDUNILVR', domain: 'hul.co.in',       sector: 'FMCG',                   units: 12, avgPrice: 2460.00, marketPrice: 2310.00, color: '#f4a356' },
  { id: 'TATAMOTORS', name: 'Tata Motors',              symbol: 'TATAMOTORS', domain: 'tatamotors.com',  sector: 'Automobile',             units: 60, avgPrice: 620.80,  marketPrice: 950.00,  color: '#ee8194' },
  { id: 'MARUTI',     name: 'Maruti Suzuki',            symbol: 'MARUTI',     domain: 'marutisuzuki.com',sector: 'Automobile',             units: 3,  avgPrice: 10200.00,marketPrice: 11800.00, color: '#e56a7c' },
]

function savedNotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('portfolio-notes') || '{}') } catch { return {} }
}

export function loadPositions(): Position[] {
  const notes = savedNotes()
  return RAW.map(p => ({ ...p, notes: notes[p.id] || '' }))
}

export function saveNote(id: string, text: string) {
  const notes = savedNotes()
  notes[id] = text
  localStorage.setItem('portfolio-notes', JSON.stringify(notes))
}

export function positionValue(p: Position) { return p.units * p.marketPrice }
export function positionInvested(p: Position) { return p.units * p.avgPrice }
export function positionPnL(p: Position) { return positionValue(p) - positionInvested(p) }
export function positionReturnPct(p: Position) { return (positionPnL(p) / positionInvested(p)) * 100 }
export function totalValue(positions: Position[]) { return positions.reduce((s, p) => s + positionValue(p), 0) }
export function totalInvested(positions: Position[]) { return positions.reduce((s, p) => s + positionInvested(p), 0) }

export function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(2)}K`
  return `₹${n.toFixed(2)}`
}

export function exportCSV(positions: Position[]) {
  const header = ['Name','Symbol','Sector','Units','Avg Price (₹)','Market Price (₹)','Current Value (₹)','Invested (₹)','P&L (₹)','Return (%)','Notes']
  const rows = positions.map(p => [
    p.name, p.symbol, p.sector, p.units,
    p.avgPrice.toFixed(2), p.marketPrice.toFixed(2),
    positionValue(p).toFixed(2), positionInvested(p).toFixed(2),
    positionPnL(p).toFixed(2), positionReturnPct(p).toFixed(2),
    `"${p.notes.replace(/"/g, '""')}"`,
  ].join(','))
  const csv = [header.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'tradeflow-portfolio.csv'; a.click()
  URL.revokeObjectURL(url)
}
