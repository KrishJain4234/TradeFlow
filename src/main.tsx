import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowUpRight, Bell, ChevronDown, CircleDollarSign, Command,
  Gem, LayoutGrid, LineChart, Mic, MoreHorizontal, Search, ShieldCheck,
  Sparkles, TrendingUp, Wallet, X, Zap
} from 'lucide-react'
import './styles.css'

type Market = { name: string; value: string; delta: string; positive?: boolean }

const markets: Market[] = [
  { name: 'NIFTY 50', value: '25,607.20', delta: '1.07%' },
  { name: 'SENSEX', value: '83,482.17', delta: '0.62%', positive: true },
  { name: 'BANK NIFTY', value: '58,122.30', delta: '0.44%', positive: true },
  { name: 'GOLD / 10g', value: '₹72,890', delta: '1.48%', positive: true },
]

const holdings = [
  { name: 'HDFC Bank', symbol: 'HDFCBANK', amount: '₹48,240', return: '+8.46%', positive: true, color: '#6aa9ff' },
  { name: 'Reliance Industries', symbol: 'RELIANCE', amount: '₹34,820', return: '+4.28%', positive: true, color: '#b47aff' },
  { name: 'Infosys', symbol: 'INFY', amount: '₹22,640', return: '-1.34%', positive: false, color: '#ffb454' },
]

const menuGroups = [
  { title: 'Trade smarter', items: [
    { label: 'Stocks', icon: CircleDollarSign, tone: 'blue' },
    { label: 'Mutual funds', icon: Sparkles, tone: 'purple' },
    { label: 'ETFs', icon: LineChart, tone: 'teal' },
    { label: 'Digital gold', icon: Gem, tone: 'gold' },
  ] },
  { title: 'Tools of the trade', items: [
    { label: 'Screener', icon: LayoutGrid, tone: 'orange' },
    { label: 'Portfolio', icon: Wallet, tone: 'blue' },
    { label: 'Watchlist', icon: Sparkles, tone: 'purple' },
    { label: 'Alerts', icon: Bell, tone: 'green' },
  ] },
]

function Logo() {
  return <div className="logo" aria-label="TradeFlow home"><span className="logo-mark"><span /></span><span>Trade<span className="logo-flow">Flow</span></span></div>
}

function MarketTicker() {
  const items = [...markets, ...markets]
  return <div className="ticker" aria-label="Market ticker"><div className="ticker-track">{items.map((market, i) => <span className="ticker-item" key={`${market.name}-${i}`}><b>{market.name}</b><strong>{market.value}</strong><em className={market.positive ? 'up' : 'down'}>{market.positive ? '▲' : '▼'} {market.delta}</em></span>)}</div></div>
}

function MarketCard({ market }: { market: Market }) {
  return <div className="market-card"><div className="market-card-top"><span>{market.name}</span><span className="market-dot" /></div><strong>{market.value}</strong><em className={market.positive ? 'up' : 'down'}>{market.positive ? '▲' : '▼'} {market.delta}</em></div>
}

function VoiceButton({ onClick }: { onClick: () => void }) {
  return <button className="voice-button" onClick={onClick}><Mic size={19} strokeWidth={2.4} /><span>Ask TradeFlow</span><kbd>⌘ K</kbd></button>
}

function Nav({ onMenu, menuOpen, onVoice }: { onMenu: () => void; menuOpen: boolean; onVoice: () => void }) {
  return <>
    <header className="nav-wrap">
      <div className="nav-inner">
        <Logo />
        <div className="search-box"><Search size={18} /><input aria-label="Search investments" placeholder="Search stocks, ETFs, mutual funds" /><kbd>/</kbd></div>
        <nav className="desktop-nav">
          <button className="nav-link active"><Wallet size={18} />Portfolio</button>
          <button className="nav-link"><TrendingUp size={18} />Markets</button>
          <button className="nav-link"><Gem size={18} />Gold</button>
          <button className="nav-link"><LineChart size={18} />Screener</button>
          <button className={`nav-link more-link ${menuOpen ? 'selected' : ''}`} onClick={onMenu}><MoreHorizontal size={19} />More<ChevronDown size={15} /></button>
        </nav>
        <div className="nav-actions"><VoiceButton onClick={onVoice} /><button className="account-button"><span className="account-avatar">K</span><span className="account-label">Sign up / Login</span><ChevronDown size={15} /></button></div>
        <button className="mobile-menu-button" aria-label="Open menu" onClick={onMenu}><LayoutGrid size={21} /></button>
      </div>
    </header>
    {menuOpen && <MoreMenu />}
  </>
}

function MoreMenu() {
  return <div className="more-menu"><div className="menu-heading">Explore TradeFlow <X size={17} /></div>{menuGroups.map(group => <div className="menu-group" key={group.title}><div className="menu-group-title">{group.title}</div><div className="menu-grid">{group.items.map(item => { const Icon = item.icon; return <button className="menu-tile" key={item.label}><span className={`menu-icon ${item.tone}`}><Icon size={20} /></span><span>{item.label}</span></button> })}</div></div>)}</div>
}

function Hero({ onVoice }: { onVoice: () => void }) {
  return <section className="hero-shell">
    <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" />India's calmest trading desk</div><h1>Invest with clarity.<br /><span>Trade with your voice.</span></h1><p>Real-time market signals, a living portfolio, and simple actions designed for Indian investors.</p><div className="hero-actions"><button className="primary-button" onClick={onVoice}><Mic size={18} />Ask your first question</button><button className="secondary-button">Explore markets <ArrowUpRight size={17} /></button></div><div className="hero-trust"><ShieldCheck size={16} />Secure by design <span /> <Sparkles size={16} />Built for long-term wealth</div></div>
    <div className="hero-visual"><div className="orb orb-one" /><div className="orb orb-two" /><div className="hero-grid" /><div className="float-card float-card-main"><div className="float-card-label"><span className="mini-icon"><TrendingUp size={14} /></span>Portfolio value</div><strong>₹1,48,560</strong><div className="gain-text">+11.08% <ArrowUpRight size={14} /></div><div className="sparkline"><i /><i /><i /><i /><i /><i /><i /></div></div><div className="float-card float-card-small"><span className="mini-icon orange"><Gem size={14} /></span><div><small>Digital gold</small><strong>₹72,890</strong></div><em className="up">+1.48%</em></div><div className="float-card float-card-voice"><span className="voice-orb"><Mic size={16} /></span><span>“Buy 2 shares of HDFC”</span></div><div className="hero-glow" /></div>
  </section>
}

function MarketOverview() {
  return <section className="section-pad overview-section"><div className="section-heading"><div><span className="section-kicker">LIVE MARKET PULSE</span><h2>Everything moving, in one view.</h2></div><button className="text-button">Open market board <ArrowUpRight size={16} /></button></div><div className="market-grid">{markets.map(market => <MarketCard key={market.name} market={market} />)}<div className="mood-card"><div className="mood-gauge"><span /></div><div><span className="market-card-top">Market mood</span><strong>Balanced</strong><small>Momentum is building</small></div></div></div></section>
}

function PortfolioCard() {
  const [active, setActive] = useState('1M')
  return <section className="section-pad portfolio-section"><div className="section-heading"><div><span className="section-kicker">YOUR PORTFOLIO</span><h2>A better view of your money.</h2></div><button className="text-button">View portfolio <ArrowUpRight size={16} /></button></div><div className="portfolio-grid"><div className="portfolio-main"><div className="portfolio-top"><div><span className="muted-label">Total invested value</span><strong className="portfolio-value">₹1,48,560</strong></div><div className="portfolio-return"><span>+₹14,820</span><strong>+11.08%</strong></div></div><div className="chart-meta"><span>Portfolio growth</span><div className="chart-tabs">{['1W', '1M', '1Y', 'All'].map(tab => <button className={active === tab ? 'active' : ''} onClick={() => setActive(tab)} key={tab}>{tab}</button>)}</div></div><div className="chart"><div className="chart-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 600 180" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1677E8" stopOpacity=".32" /><stop offset="1" stopColor="#1677E8" stopOpacity="0" /></linearGradient></defs><path d="M0 152 C30 145, 39 123, 68 131 S110 112, 138 125 S181 87, 211 110 S251 78, 280 90 S318 74, 350 85 S390 45, 422 70 S468 43, 500 55 S550 29, 600 18 V180 H0 Z" fill="url(#chartFill)" /><path d="M0 152 C30 145, 39 123, 68 131 S110 112, 138 125 S181 87, 211 110 S251 78, 280 90 S318 74, 350 85 S390 45, 422 70 S468 43, 500 55 S550 29, 600 18" fill="none" stroke="#43A2FF" strokeWidth="3" strokeLinecap="round" /></svg><span className="chart-tooltip">₹1,48,560 <small>Today, 4:00 PM</small></span></div><div className="chart-axis"><span>Nov 01</span><span>Nov 08</span><span>Nov 15</span><span>Nov 22</span></div></div><div className="holdings-card"><div className="holdings-heading"><span>Top holdings</span><button aria-label="More holdings"><MoreHorizontal size={18} /></button></div>{holdings.map(item => <div className="holding-row" key={item.symbol}><span className="holding-logo" style={{ background: item.color }}>{item.symbol.slice(0, 1)}</span><div className="holding-name"><strong>{item.name}</strong><small>{item.symbol}</small></div><div className="holding-amount"><strong>{item.amount}</strong><em className={item.positive ? 'up' : 'down'}>{item.return}</em></div></div>)}<button className="full-width-button">See all holdings <ArrowUpRight size={15} /></button></div></div></section>
}

function VoicePanel({ onClose }: { onClose: () => void }) {
  return <div className="voice-overlay" onClick={onClose}><div className="voice-panel" onClick={e => e.stopPropagation()}><div className="voice-panel-top"><div><span className="section-kicker">VOICE COMMAND</span><h3>What do you want to know?</h3></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="voice-wave"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><button className="listen-button"><Mic size={21} />Tap to speak</button><div className="voice-suggestions"><button>“How is my portfolio doing?”</button><button>“Find me a safe dividend stock”</button><button>“Buy ₹2,000 of gold”</button></div></div></div>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Home')
  const greeting = useMemo(() => new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening', [])
  return <div className="app-shell"><MarketTicker /><Nav menuOpen={menuOpen} onMenu={() => setMenuOpen(value => !value)} onVoice={() => setVoiceOpen(true)} /><main><Hero onVoice={() => setVoiceOpen(true)} /><div className="welcome-strip"><div><span className="welcome-label">{greeting}, Krish <span>✦</span></span><strong>Your market day starts here.</strong></div><div className="quick-actions"><button><Mic size={16} /> Voice search</button><button><Wallet size={16} /> Add to portfolio</button></div></div><MarketOverview /><PortfolioCard /><section className="cta-section"><div><span className="section-kicker">TRADEFLOW FOR INDIA</span><h2>Make every move feel considered.</h2><p>One calm place for your watchlist, your wealth, and the next smart action.</p></div><button className="primary-button" onClick={() => setVoiceOpen(true)}><Mic size={18} /> Start with your voice</button></section></main><footer><Logo /><span>© 2026 TradeFlow. Built for thoughtful investors.</span><div><button>Privacy</button><button>Help center</button></div></footer><div className="mobile-bottom-nav">{['Home', 'Markets', 'Portfolio', 'Alerts'].map((item, index) => <button className={activeNav === item ? 'active' : ''} onClick={() => setActiveNav(item)} key={item}>{index === 0 ? <Command size={20} /> : index === 1 ? <TrendingUp size={20} /> : index === 2 ? <Wallet size={20} /> : <Bell size={20} />}<span>{item}</span></button>)}</div>{voiceOpen && <VoicePanel onClose={() => setVoiceOpen(false)} />}</div>
}

export default App

createRoot(document.getElementById('root')!).render(<App />)
