import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import VoiceAssistant from './voice/VoiceAssistant'
import LearnPage from './learn/LearnPage'
import {
  ArrowDownRight, ArrowLeft, ArrowUpRight, Bell, BookOpen, ChevronDown,
  CircleDollarSign, Command, Gem, GraduationCap, LayoutGrid, LineChart,
  Mic, MoreHorizontal, Search, ShieldCheck, Sparkles, TrendingUp,
  Wallet, X, Zap
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
    { label: 'Learn', icon: GraduationCap, tone: 'teal' },
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

function Nav({ onMenu, menuOpen, onVoice, onPortfolio, onLearn }: { onMenu: () => void; menuOpen: boolean; onVoice: () => void; onPortfolio: () => void; onLearn: () => void }) {
  return <>
    <header className="nav-wrap">
      <div className="nav-inner">
        <Logo />
        <div className="search-box"><Search size={18} /><input aria-label="Search investments" placeholder="Search stocks, ETFs, mutual funds" /><kbd>/</kbd></div>
        <nav className="desktop-nav">
          <button className="nav-link active" onClick={onPortfolio}><Wallet size={18} />Portfolio</button>
          <button className="nav-link"><TrendingUp size={18} />Markets</button>
          <button className="nav-link"><Gem size={18} />Gold</button>
          <button className="nav-link"><LineChart size={18} />Screener</button>
          <button className="nav-link learn-nav-link" onClick={onLearn}><GraduationCap size={18} />Learn</button>
          <button className={`nav-link more-link ${menuOpen ? 'selected' : ''}`} onClick={onMenu}><MoreHorizontal size={19} />More<ChevronDown size={15} /></button>
        </nav>
        <div className="nav-actions"><VoiceButton onClick={onVoice} /><button className="account-button"><span className="account-avatar">K</span><span className="account-label">Sign up / Login</span><ChevronDown size={15} /></button></div>
        <button className="mobile-menu-button" aria-label="Open menu" onClick={onMenu}><LayoutGrid size={21} /></button>
      </div>
    </header>
    {menuOpen && <MoreMenu onLearn={onLearn} />}
  </>
}

function MoreMenu({ onLearn }: { onLearn: () => void }) {
  return <div className="more-menu"><div className="menu-heading">Explore TradeFlow <X size={17} /></div>{menuGroups.map(group => <div className="menu-group" key={group.title}><div className="menu-group-title">{group.title}</div><div className="menu-grid">{group.items.map(item => { const Icon = item.icon; return <button className="menu-tile" key={item.label} onClick={item.label === 'Learn' ? onLearn : undefined}><span className={`menu-icon ${item.tone}`}><Icon size={20} /></span><span>{item.label}</span></button> })}</div></div>)}</div>
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

function PortfolioCard({ onView }: { onView: () => void }) {
  const [active, setActive] = useState('1M')
  return <section className="section-pad portfolio-section"><div className="section-heading"><div><span className="section-kicker">YOUR PORTFOLIO</span><h2>A better view of your money.</h2></div><button className="text-button" onClick={onView}>View portfolio <ArrowUpRight size={16} /></button></div><div className="portfolio-grid"><div className="portfolio-main"><div className="portfolio-top"><div><span className="muted-label">Total invested value</span><strong className="portfolio-value">₹1,48,560</strong></div><div className="portfolio-return"><span>+₹14,820</span><strong>+11.08%</strong></div></div><div className="chart-meta"><span>Portfolio growth</span><div className="chart-tabs">{['1W', '1M', '1Y', 'All'].map(tab => <button className={active === tab ? 'active' : ''} onClick={() => setActive(tab)} key={tab}>{tab}</button>)}</div></div><div className="chart"><div className="chart-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 600 180" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1677E8" stopOpacity=".32" /><stop offset="1" stopColor="#1677E8" stopOpacity="0" /></linearGradient></defs><path d="M0 152 C30 145, 39 123, 68 131 S110 112, 138 125 S181 87, 211 110 S251 78, 280 90 S318 74, 350 85 S390 45, 422 70 S468 43, 500 55 S550 29, 600 18 V180 H0 Z" fill="url(#chartFill)" /><path d="M0 152 C30 145, 39 123, 68 131 S110 112, 138 125 S181 87, 211 110 S251 78, 280 90 S318 74, 350 85 S390 45, 422 70 S468 43, 500 55 S550 29, 600 18" fill="none" stroke="#43A2FF" strokeWidth="3" strokeLinecap="round" /></svg><span className="chart-tooltip">₹1,48,560 <small>Today, 4:00 PM</small></span></div><div className="chart-axis"><span>Nov 01</span><span>Nov 08</span><span>Nov 15</span><span>Nov 22</span></div></div><div className="holdings-card"><div className="holdings-heading"><span>Top holdings</span><button aria-label="More holdings"><MoreHorizontal size={18} /></button></div>{holdings.map(item => <div className="holding-row" key={item.symbol}><span className="holding-logo" style={{ background: item.color }}>{item.symbol.slice(0, 1)}</span><div className="holding-name"><strong>{item.name}</strong><small>{item.symbol}</small></div><div className="holding-amount"><strong>{item.amount}</strong><em className={item.positive ? 'up' : 'down'}>{item.return}</em></div></div>)}<button className="full-width-button" onClick={onView}>See all holdings <ArrowUpRight size={15} /></button></div></div></section>
}

const mockPositions = [
  { name: 'HDFC Bank', symbol: 'HDFCBANK', units: '24 shares', average: '₹1,853.33', price: '₹2,010.00', value: '₹48,240', pnl: '+₹3,760', return: '+8.45%', positive: true, color: '#6aa9ff' },
  { name: 'Reliance Industries', symbol: 'RELIANCE', units: '20 shares', average: '₹1,669.55', price: '₹1,741.00', value: '₹34,820', pnl: '+₹1,429', return: '+4.28%', positive: true, color: '#b47aff' },
  { name: 'Infosys', symbol: 'INFY', units: '40 shares', average: '₹573.68', price: '₹566.00', value: '₹22,640', pnl: '-₹307', return: '-1.34%', positive: false, color: '#ffb454' },
  { name: 'Tata Consultancy Services', symbol: 'TCS', units: '4 shares', average: '₹3,680.00', price: '₹4,250.00', value: '₹17,000', pnl: '+₹2,280', return: '+15.49%', positive: true, color: '#55c6ab' },
  { name: 'ICICI Bank', symbol: 'ICICIBANK', units: '18 shares', average: '₹1,011.22', price: '₹1,436.67', value: '₹25,860', pnl: '+₹7,658', return: '+42.07%', positive: true, color: '#ee8194' },
]

const portfolioRanges = ['1W', '1M', '1Y', 'All']
const portfolioChartPaths: Record<string, string> = {
  '1W': 'M0 174 C50 166 75 182 120 152 S190 165 240 126 S310 139 360 107 S430 112 480 78 S550 96 600 60 S670 65 720 34',
  '1M': 'M0 186 C42 179 56 154 94 166 S145 134 181 147 S222 121 264 132 S311 97 350 114 S398 89 438 101 S480 68 522 79 S569 55 610 66 S671 30 720 20',
  '1Y': 'M0 198 C45 185 70 202 108 174 S163 182 201 152 S251 162 290 129 S344 146 382 111 S437 123 476 88 S530 101 570 67 S630 78 670 44 S700 34 720 16',
  All: 'M0 206 C46 200 71 190 112 195 S164 164 203 174 S248 151 291 158 S340 132 382 143 S429 101 474 115 S523 84 568 93 S626 55 669 70 S700 28 720 18',
}
const portfolioChartLabels: Record<string, string[]> = {
  '1W': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  '1M': ['Nov 01', 'Nov 08', 'Nov 15', 'Nov 22', 'Now'],
  '1Y': ['Dec 25', 'Mar 26', 'Jun 26', 'Sep 26', 'Now'],
  All: ['2023', '2024', '2025', '2026', 'Now'],
}

function PortfolioPage({ onBack }: { onBack: () => void }) {
  const [activeRange, setActiveRange] = useState('1M')
  const chartPath = portfolioChartPaths[activeRange]

  return <div className="portfolio-page">
    <div className="portfolio-demo-banner" role="note">
      <span className="portfolio-demo-mark"><Sparkles size={17} /></span>
      <div><strong>Demo portfolio</strong><span>This is a demo portfolio. Sample values only—not connected to a live account.</span></div>
      <span className="portfolio-demo-tag">MOCK DATA</span>
    </div>

    <div className="portfolio-page-heading">
      <div>
        <button className="portfolio-back" onClick={onBack}><ArrowLeft size={16} /> Back to overview</button>
        <h1>My portfolio</h1>
        <p>Track your investments and see how they’re performing.</p>
      </div>
      <span className="portfolio-updated">Last updated today, 4:00 PM</span>
    </div>

    <section className="portfolio-summary-grid" aria-label="Portfolio summary">
      <article className="portfolio-summary-card"><span>Total portfolio value</span><strong>₹1,48,560</strong><small className="summary-positive"><TrendingUp size={14} /> +₹1,240 today</small></article>
      <article className="portfolio-summary-card"><span>Total invested</span><strong>₹1,33,740</strong><small>Across 5 investments</small></article>
      <article className="portfolio-summary-card"><span>Overall returns</span><strong className="summary-positive">+₹14,820</strong><small className="summary-positive">+11.08% all time</small></article>
      <article className="portfolio-summary-card"><span>Today’s return</span><strong className="summary-positive">+₹1,240</strong><small className="summary-positive">+0.84% today</small></article>
    </section>

    <section className="portfolio-analysis-grid">
      <article className="portfolio-panel portfolio-performance">
        <div className="portfolio-panel-heading"><div><h2>Portfolio performance</h2><p>Value over the selected period</p></div><div className="portfolio-range-tabs" aria-label="Performance period">{portfolioRanges.map(range => <button key={range} className={activeRange === range ? 'active' : ''} aria-pressed={activeRange === range} onClick={() => setActiveRange(range)}>{range}</button>)}</div></div>
        <div className="portfolio-chart-area">
          <div className="portfolio-chart-guides"><span>₹1.5L</span><span>₹1.4L</span><span>₹1.3L</span><span>₹1.2L</span></div>
          <svg viewBox="0 0 720 230" preserveAspectRatio="none" role="img" aria-label={`Mock portfolio value trend for ${activeRange}`}>
            <defs><linearGradient id="portfolioPageFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1677e8" stopOpacity=".2" /><stop offset="1" stopColor="#1677e8" stopOpacity="0" /></linearGradient></defs>
            <path d={`${chartPath} V230 H0Z`} fill="url(#portfolioPageFill)" />
            <path d={chartPath} fill="none" stroke="#1677e8" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="portfolio-chart-axis">{portfolioChartLabels[activeRange].map(label => <span key={label}>{label}</span>)}</div>
      </article>

      <article className="portfolio-panel portfolio-allocation">
        <div className="portfolio-panel-heading"><div><h2>Asset allocation</h2><p>By current value</p></div></div>
        <div className="allocation-content"><div className="allocation-donut"><div><strong>5</strong><span>assets</span></div></div><div className="allocation-legend">
          <div><i className="allocation-blue" /><span>HDFC Bank</span><strong>32.5%</strong></div>
          <div><i className="allocation-purple" /><span>Reliance</span><strong>23.4%</strong></div>
          <div><i className="allocation-orange" /><span>Infosys</span><strong>15.2%</strong></div>
          <div><i className="allocation-teal" /><span>TCS</span><strong>11.4%</strong></div>
          <div><i className="allocation-rose" /><span>ICICI Bank</span><strong>17.5%</strong></div>
        </div></div>
      </article>
    </section>

    <section className="portfolio-panel portfolio-positions">
      <div className="portfolio-panel-heading"><div><h2>Your holdings</h2><p>5 investments in this demo portfolio</p></div><span className="portfolio-total-value">Total value <strong>₹1,48,560</strong></span></div>
      <div className="portfolio-table-wrap"><table className="portfolio-table">
        <thead><tr><th>Investment</th><th>Quantity</th><th>Avg. price</th><th>Market price</th><th>Current value</th><th>Returns</th></tr></thead>
        <tbody>{mockPositions.map(position => <tr key={position.symbol}>
          <td><div className="portfolio-position-name"><span className="holding-logo" style={{ background: position.color }}>{position.symbol.slice(0, 1)}</span><span><strong>{position.name}</strong><small>{position.symbol}</small></span></div></td>
          <td>{position.units}</td><td>{position.average}</td><td>{position.price}</td><td><strong>{position.value}</strong></td>
          <td><span className={`portfolio-position-return ${position.positive ? 'positive' : 'negative'}`}>{position.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{position.return}<small>{position.pnl}</small></span></td>
        </tr>)}</tbody>
      </table></div>
      <p className="portfolio-disclaimer">Illustrative sample values for demo purposes only. This page is not connected to a brokerage account.</p>
    </section>
  </div>
}

function VoicePanel({ onClose, initialPrompt }: { onClose: () => void; initialPrompt?: string }) {
  return <VoiceAssistant onClose={onClose} initialPrompt={initialPrompt} />
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [voicePrompt, setVoicePrompt] = useState('')
  const [portfolioOpen, setPortfolioOpen] = useState(false)
  const [learnOpen, setLearnOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Home')
  const greeting = useMemo(() => new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening', [])

  const openPortfolio = () => { setActiveNav('Portfolio'); setPortfolioOpen(true); setLearnOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openLearn = () => { setActiveNav('Learn'); setLearnOpen(true); setPortfolioOpen(false); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openHome = () => { setActiveNav('Home'); setPortfolioOpen(false); setLearnOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleAskVoice = (prompt = '') => { setVoicePrompt(prompt); setVoiceOpen(true) }

  return <div className="app-shell">
    <MarketTicker />
    <Nav menuOpen={menuOpen} onMenu={() => setMenuOpen(value => !value)} onVoice={() => handleAskVoice()} onPortfolio={openPortfolio} onLearn={openLearn} />
    <main>
      {learnOpen
        ? <LearnPage onAskVoice={handleAskVoice} onBackHome={openHome} />
        : portfolioOpen
        ? <PortfolioPage onBack={openHome} />
        : <>
            <Hero onVoice={() => handleAskVoice()} />
            <div className="welcome-strip">
              <div><span className="welcome-label">{greeting}, Krish <span>✦</span></span><strong>Your market day starts here.</strong></div>
              <div className="quick-actions">
                <button><Mic size={16} /> Voice search</button>
                <button onClick={openPortfolio}><Wallet size={16} /> View demo portfolio</button>
                <button onClick={openLearn}><GraduationCap size={16} /> Learn investing</button>
              </div>
            </div>
            <MarketOverview />
            <PortfolioCard onView={openPortfolio} />
            <section className="cta-section">
              <div><span className="section-kicker">TRADEFLOW FOR INDIA</span><h2>Make every move feel considered.</h2><p>One calm place for your watchlist, your wealth, and the next smart action.</p></div>
              <button className="primary-button" onClick={() => handleAskVoice()}><Mic size={18} /> Start with your voice</button>
            </section>
          </>
      }
    </main>
    <footer><Logo /><span>© 2026 TradeFlow. Built for thoughtful investors.</span><div><button>Privacy</button><button>Help center</button></div></footer>
    <div className="mobile-bottom-nav">
      {(['Home', 'Markets', 'Portfolio', 'Learn', 'Alerts'] as const).map((item, index) =>
        <button
          className={activeNav === item ? 'active' : ''}
          onClick={() => item === 'Portfolio' ? openPortfolio() : item === 'Home' ? openHome() : item === 'Learn' ? openLearn() : setActiveNav(item)}
          key={item}
        >
          {index === 0 ? <Command size={20} /> : index === 1 ? <TrendingUp size={20} /> : index === 2 ? <Wallet size={20} /> : index === 3 ? <GraduationCap size={20} /> : <Bell size={20} />}
          <span>{item}</span>
        </button>
      )}
    </div>
    {voiceOpen && <VoicePanel onClose={() => setVoiceOpen(false)} initialPrompt={voicePrompt} />}
  </div>
}

export default App

createRoot(document.getElementById('root')!).render(<App />)
