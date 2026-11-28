import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import VoiceAssistant from './voice/VoiceAssistant'
import LearnPage from './learn/LearnPage'
import PortfolioPage from './portfolio/PortfolioPage'
import {
  ArrowUpRight, AudioLines, Bell, ChevronDown,
  CircleDollarSign, Command, Gem, Globe2, GraduationCap, LayoutGrid, LineChart,
  LockKeyhole, Mic, MoreHorizontal, Search, ShieldCheck, Sparkles, TrendingUp,
  Wallet, X
} from 'lucide-react'
import { getLanguageOption, getMostFrequentLanguage, loadVoiceProfile, normalizeLanguageCode } from './voice/languages'
import './styles.css'

const DEMO_CREDENTIALS = { email: 'demo@tradeflow.in', password: 'TradeFlowDemo1!' }
const DEMO_SESSION_KEY = 'tradeflow-demo-session'

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

function Logo({ onClick }: { onClick: () => void }) {
  return <a href="/" className="logo logo-button" aria-label="TradeFlow home" onClick={onClick}><span className="logo-mark"><span /></span><span>Trade<span className="logo-flow">Flow</span></span></a>
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

function Nav({ onMenu, menuOpen, onVoice, onPortfolio, onLearn, onHome, onAccount, isDemoLoggedIn }: { onMenu: () => void; menuOpen: boolean; onVoice: () => void; onPortfolio: () => void; onLearn: () => void; onHome: () => void; onAccount: () => void; isDemoLoggedIn: boolean }) {
  return <>
    <header className="nav-wrap">
      <div className="nav-inner">
        <Logo onClick={onHome} />
        <div className="search-box"><Search size={18} /><input aria-label="Search investments" placeholder="Search stocks, ETFs, mutual funds" /><kbd>/</kbd></div>
        <nav className="desktop-nav">
          <button className="nav-link active" onClick={onPortfolio}><Wallet size={18} />Portfolio</button>
          <button className="nav-link"><TrendingUp size={18} />Markets</button>
          <button className="nav-link"><Gem size={18} />Gold</button>
          <button className="nav-link"><LineChart size={18} />Screener</button>
          <button className="nav-link learn-nav-link" onClick={onLearn}><GraduationCap size={18} />Learn</button>
          <button className={`nav-link more-link ${menuOpen ? 'selected' : ''}`} onClick={onMenu}><MoreHorizontal size={19} />More<ChevronDown size={15} /></button>
        </nav>
        <div className="nav-actions"><VoiceButton onClick={onVoice} /><button className="account-button" onClick={onAccount}><span className="account-avatar">{isDemoLoggedIn ? 'D' : 'K'}</span><span className="account-label">{isDemoLoggedIn ? 'Demo account' : 'Sign up / Login'}</span><ChevronDown size={15} /></button></div>
        <button className="mobile-menu-button" aria-label="Open menu" onClick={onMenu}><LayoutGrid size={21} /></button>
      </div>

    </header>
    {menuOpen && <MoreMenu onLearn={onLearn} onPortfolio={onPortfolio} onClose={onMenu} />}
  </>
}

function MoreMenu({ onLearn, onPortfolio, onClose }: { onLearn: () => void; onPortfolio: () => void; onClose: () => void }) {
  return <div className="more-menu"><div className="menu-heading">Explore TradeFlow <button type="button" className="menu-close-btn" onClick={onClose} aria-label="Close menu"><X size={17} /></button></div>{menuGroups.map(group => <div className="menu-group" key={group.title}><div className="menu-group-title">{group.title}</div><div className="menu-grid">{group.items.map(item => { const Icon = item.icon; return <button className="menu-tile" key={item.label} onClick={item.label === 'Learn' ? onLearn : item.label === 'Portfolio' ? () => { onClose(); onPortfolio() } : undefined}><span className={`menu-icon ${item.tone}`}><Icon size={20} /></span><span>{item.label}</span></button> })}</div></div>)}</div>
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

function DemoLoginDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (email.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      setError('Those demo credentials don’t match. Please try again.')
      return
    }
    onSuccess()
  }

  return <div className="login-overlay" role="presentation">
    <section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <button className="login-close" type="button" onClick={onClose} aria-label="Close sign in"><X size={19} /></button>
      <span className="login-icon"><LockKeyhole size={21} /></span>
      <span className="section-kicker">WELCOME TO TRADEFLOW</span>
      <h2 id="login-title">Sign in to your portfolio</h2>
      <p className="login-description">Use the demo account to explore the sample portfolio.</p>
      <div className="demo-credentials"><strong>Demo credentials</strong><span>Email <b>{DEMO_CREDENTIALS.email}</b></span><span>Password <b>{DEMO_CREDENTIALS.password}</b></span></div>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>Email address<input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
        {error && <p className="login-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit">Continue to portfolio <ArrowUpRight size={16} /></button>
      </form>
      <p className="login-demo-note">Demo sign-in is stored in this browser only; it is not production authentication.</p>
    </section>
  </div>
}

function VoiceProfilePanel() {
  const voiceProfile = loadVoiceProfile()
  const languagesSpoken = Object.entries(voiceProfile.languageCounts)
    .map(([code, count]) => ({ code: normalizeLanguageCode(code), count }))
    .filter((entry): entry is { code: string; count: number } => entry.code !== null && typeof entry.count === 'number' && entry.count > 0)
    .sort((a, b) => b.count - a.count)
  const primaryLanguage = getMostFrequentLanguage(voiceProfile)
  const otherLanguageCount = Math.max(0, languagesSpoken.length - (primaryLanguage ? 1 : 0))
  const totalVoiceInteractions = languagesSpoken.reduce((total, language) => total + language.count, 0)

  return <div className="voice-profile-content">
    <section className="voice-profile-intro">
      <span className="voice-profile-icon"><AudioLines size={22} /></span>
      <div><span className="section-kicker">YOUR VOICE</span><h2>Voice profile</h2><p>Languages are based on the voice interactions recorded in this browser.</p></div>
    </section>
    <section className="voice-profile-stats" aria-label="Voice profile summary">
      <article className="voice-profile-stat voice-profile-primary"><span><Globe2 size={15} /> Primary language</span><strong>{primaryLanguage ? getLanguageOption(primaryLanguage).name : 'Not detected yet'}</strong><small>{primaryLanguage ? getLanguageOption(primaryLanguage).nativeName : 'Try a voice interaction to build your profile'}</small></article>
      <article className="voice-profile-stat"><span>Other languages detected</span><strong>{otherLanguageCount}</strong><small>{otherLanguageCount === 1 ? 'additional language' : 'additional languages'}</small></article>
      <article className="voice-profile-stat"><span>Voice interactions</span><strong>{totalVoiceInteractions}</strong><small>Recorded on this device</small></article>
    </section>
    <section className="portfolio-panel voice-language-panel">
      <div className="portfolio-panel-heading"><div><h2>Languages in your voice profile</h2><p>Counts update when you use voice input.</p></div></div>
      {languagesSpoken.length
        ? <div className="voice-language-list">{languagesSpoken.map(language => {
            const option = getLanguageOption(language.code)
            return <div className="voice-language-row" key={language.code}><span><strong>{option.name}</strong><small>{option.nativeName}</small></span><span className={language.code === primaryLanguage ? 'voice-primary-badge' : ''}>{language.count} {language.count === 1 ? 'interaction' : 'interactions'}{language.code === primaryLanguage ? ' · Primary' : ''}</span></div>
          })}</div>
        : <p className="voice-profile-empty">No spoken languages have been recorded yet. Start a voice interaction and your profile will appear here.</p>}
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
  const [loginOpen, setLoginOpen] = useState(false)
  const [continueToPortfolio, setContinueToPortfolio] = useState(false)
  const [isDemoLoggedIn, setIsDemoLoggedIn] = useState(() => localStorage.getItem(DEMO_SESSION_KEY) === 'active')
  const [learnOpen, setLearnOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Home')
  const greeting = useMemo(() => new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening', [])

  const showPortfolio = () => { setActiveNav('Portfolio'); setPortfolioOpen(true); setLearnOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openPortfolio = () => {
    if (!isDemoLoggedIn) { setContinueToPortfolio(true); setLoginOpen(true); return }
    showPortfolio()
  }
  const openLearn = () => { setActiveNav('Learn'); setLearnOpen(true); setPortfolioOpen(false); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openHome = () => { setActiveNav('Home'); setPortfolioOpen(false); setLearnOpen(false); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleAskVoice = (prompt = '') => { setVoicePrompt(prompt); setVoiceOpen(true) }
  const handleDemoLogin = () => {
    localStorage.setItem(DEMO_SESSION_KEY, 'active')
    setIsDemoLoggedIn(true)
    setLoginOpen(false)
    if (continueToPortfolio) { setContinueToPortfolio(false); showPortfolio() }
  }

  return <div className="app-shell">
    <MarketTicker />
    <Nav menuOpen={menuOpen} onMenu={() => setMenuOpen(value => !value)} onVoice={() => handleAskVoice()} onPortfolio={openPortfolio} onLearn={openLearn} onHome={openHome} onAccount={() => { if (!isDemoLoggedIn) setLoginOpen(true) }} isDemoLoggedIn={isDemoLoggedIn} />
    <main>
      {learnOpen
        ? <LearnPage onAskVoice={handleAskVoice} onBackHome={openHome} />
        : portfolioOpen
        ? <PortfolioPage onBack={openHome} voiceProfileSlot={<VoiceProfilePanel />} />
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
    <footer><Logo onClick={openHome} /><span>© 2026 TradeFlow. Built for thoughtful investors.</span><div><button>Privacy</button><button>Help center</button></div></footer>
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
    {loginOpen && <DemoLoginDialog onClose={() => { setLoginOpen(false); setContinueToPortfolio(false) }} onSuccess={handleDemoLogin} />}
  </div>
}

export default App

createRoot(document.getElementById('root')!).render(<App />)
