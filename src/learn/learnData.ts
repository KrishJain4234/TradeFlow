export type TrackId = 'basics' | 'intermediate' | 'advanced' | 'pro'

export interface LessonQuiz {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Lesson {
  id: string
  track: TrackId
  number: string
  title: string
  readTime: string
  summary: string
  concepts: string[]
  explanation: string[]
  exampleTitle: string
  exampleBody: string
  formula?: { label: string; expression: string }
  watchOut: string
  voicePrompt: string
  quiz: LessonQuiz
}

export interface TrackMeta {
  id: TrackId
  levelLabel: string
  title: string
  subtitle: string
  accent: string
}

export interface IndustryMetric {
  name: string
  shortName: string
  whatItMeans: string
  healthyBenchmark: string
  whyItMatters: string
}

export interface IndustryPlaybook {
  id: string
  name: string
  tagline: string
  examples: string[]
  valuationAnchor: string
  howAnalystsJudge: string
  metrics: IndustryMetric[]
  bullDrivers: string[]
  redFlags: string[]
  voicePrompt: string
}

export const TRACKS: TrackMeta[] = [
  {
    id: 'basics',
    levelLabel: 'Level 1 • Beginner',
    title: 'Foundations of the Stock Market',
    subtitle: 'Understand ownership, stock splits, dividends, exchanges, and how market indices work.',
    accent: '#18c875',
  },
  {
    id: 'intermediate',
    levelLabel: 'Level 2 • Intermediate',
    title: 'Valuation & Fundamental Analysis',
    subtitle: 'Read P/E ratios, P/B, ROE, cash flows, debt, and evaluate business quality.',
    accent: '#5da8ff',
  },
  {
    id: 'advanced',
    levelLabel: 'Level 3 • Advanced',
    title: 'Portfolio Instruments & Technicals',
    subtitle: 'Compare mutual funds, ETFs, bonds, chart structure, and disciplined risk sizing.',
    accent: '#ffae4a',
  },
  {
    id: 'pro',
    levelLabel: 'Level 4 • Full Pro',
    title: 'Derivatives & Institutional Playbook',
    subtitle: 'Master futures, options payoffs, Option Greeks, IV crush, Open Interest, and FII/DII flows.',
    accent: '#b47aff',
  },
]

export const LESSONS: Lesson[] = [
  // LEVEL 1: BASICS
  {
    id: 'what-is-a-stock',
    track: 'basics',
    number: '01',
    title: 'What Is a Stock & What Ownership Means',
    readTime: '4 min',
    summary: 'A stock represents fractional equity ownership in a company, giving you a claim on its future profits and assets.',
    concepts: ['Equity share', 'Voting rights', 'Promoter vs public float', 'Residual claim'],
    explanation: [
      'When a company wants to raise capital without taking on debt, it divides its ownership into small units called shares (or equities) and sells them to investors. Buying even 1 share makes you a part-owner (shareholder) of that business.',
      'Ownership brings three practical rights: (1) a proportional claim on distributed profits (dividends), (2) capital appreciation if the business grows more valuable, and (3) voting rights on major resolutions like board appointments or mergers.',
      'Unlike bondholders or lenders, equity shareholders have a residual claim—meaning if a company winds down, lenders and creditors are paid first, and shareholders receive what remains. That higher risk is why equities historically offer higher long-term return potential.',
    ],
    exampleTitle: 'Real Indian Market Context',
    exampleBody:
      'If a company has 10 crore total shares and you buy 1,000 shares, you own 0.001% of the business. On NSE/BSE filings, look at the Shareholding Pattern: Promoters (founders) + FIIs + DIIs + Retail public make up 100% of ownership.',
    watchOut: 'Buying a stock with a lower share price (e.g. ₹40) does NOT mean it is cheaper than a ₹4,000 stock—only total valuation relative to profits matters.',
    voicePrompt: 'Explain market capitalisation',
    quiz: {
      question: 'What does owning 100 equity shares of a listed company primarily give you?',
      options: [
        'A guaranteed fixed annual interest payment',
        'Fractional ownership and a proportional claim on future earnings',
        'Priority repayment ahead of banks if the company shuts down',
      ],
      correctIndex: 1,
      explanation: 'Equity represents ownership. Fixed interest and priority repayment belong to debt/bond holders, not equity shareholders.',
    },
  },
  {
    id: 'how-market-works',
    track: 'basics',
    number: '02',
    title: 'How the Stock Market Works (NSE, BSE & Orders)',
    readTime: '5 min',
    summary: 'Learn the difference between IPOs and secondary trading, how orders match on NSE/BSE, and Market vs Limit orders.',
    concepts: ['Primary vs Secondary market', 'Demat account', 'Market vs Limit order', 'SEBI'],
    explanation: [
      'Companies raise fresh money in the Primary Market (through an IPO). Once listed, investors buy and sell existing shares among themselves on the Secondary Market—primarily the NSE and BSE in India, regulated by SEBI.',
      'Your shares are held electronically in a Demat account (with CDSL or NSDL), while your broker provides the trading interface to route buy/sell orders to the exchange order book.',
      'Every trade matches a buyer and seller. A Market Order executes immediately at the best available price in the order book, whereas a Limit Order lets you specify the maximum price you will pay (or minimum you will accept).',
    ],
    exampleTitle: 'Order Book Example',
    exampleBody:
      'Suppose INFY is trading with sellers offering shares at ₹1,520.10 and buyers bidding at ₹1,519.80. A Market Buy fills immediately at ₹1,520.10. A Limit Buy at ₹1,515.00 waits in the order book until a seller agrees to ₹1,515.00 or lower.',
    watchOut: 'In thinly traded (illiquid) small-cap stocks, placing a Market Order can cause sharp slippage because the bid-ask spread may be wide.',
    voicePrompt: 'Explain stop-loss',
    quiz: {
      question: 'Which order type guarantees your maximum purchase price, even if it does not execute immediately?',
      options: ['Market Order', 'Limit Order', 'After-Market Market Order'],
      correctIndex: 1,
      explanation: 'A Limit Order executes only at your specified price or better, protecting you from unexpected price spikes.',
    },
  },
  {
    id: 'stock-splits-bonus',
    track: 'basics',
    number: '03',
    title: 'How Stock Splits & Bonus Shares Work',
    readTime: '4 min',
    summary: 'Why companies split shares or issue bonuses—and why your total portfolio value stays mathematically unchanged.',
    concepts: ['Face value', 'Split ratio', 'Bonus issue', 'Liquidity'],
    explanation: [
      'When a stock price rises very high (for example, ₹10,000+ per share), small retail investors may find buying a single share expensive. A Stock Split divides each existing share into multiple shares and lowers the Face Value proportionally.',
      'For example, in a 1:5 split, 1 share of Face Value ₹10 priced at ₹2,500 becomes 5 shares of Face Value ₹2 priced around ₹500 each. Your total holding stays ₹2,500.',
      'A Bonus Issue works similarly in value terms—existing shareholders receive extra free shares from the company’s accumulated reserves (e.g. 1:1 bonus), doubling your share count while halving the share price proportionally, without changing Face Value.',
    ],
    exampleTitle: '1:5 Split Walkthrough',
    exampleBody:
      'Before split: 20 shares × ₹3,000 = ₹60,000 (Face Value ₹10). After 1:5 split: 100 shares × ₹600 = ₹60,000 (Face Value ₹2). Market cap and your % ownership remain identical, though improved liquidity often attracts broader participation.',
    formula: {
      label: 'Post-Split Adjusted Price',
      expression: 'New Price ≈ Old Price ÷ Split Multiplier',
    },
    watchOut: 'A stock split or bonus does NOT make a business more profitable or "cheaper" fundamentally—never buy solely because a split is announced.',
    voicePrompt: 'Company overview of Infosys',
    quiz: {
      question: 'You hold 50 shares at ₹1,000 each before a 1:2 stock split. Immediately after the split adjusts, what do you hold?',
      options: [
        '100 shares worth ~₹1,000 each (total ₹1,00,000)',
        '100 shares worth ~₹500 each (total ₹50,000)',
        '25 shares worth ~₹2,000 each (total ₹50,000)',
      ],
      correctIndex: 1,
      explanation: 'Share count doubles and price halves proportionally, leaving total value unchanged at ₹50,000.',
    },
  },
  {
    id: 'dividends-corporate-actions',
    track: 'basics',
    number: '04',
    title: 'Dividends, Yield & Corporate Actions',
    readTime: '4 min',
    summary: 'How companies share cash profits with shareholders, what ex-dividend date means, and how buybacks work.',
    concepts: ['Dividend per share', 'Dividend yield', 'Ex-dividend date', 'Share buyback'],
    explanation: [
      'Mature, cash-generative companies often distribute part of their net profit directly to shareholders as cash Dividends. Dividend Yield measures annual dividend per share as a percentage of the current share price.',
      'To receive a dividend, you must own the shares BEFORE the Ex-Dividend Date (under India’s T+1 settlement cycle, buying on the ex-date itself does not qualify you). On the ex-date, the stock price typically adjusts downward by roughly the dividend amount.',
      'Companies can also return cash via Share Buybacks—buying back their own shares from the market and extinguishing them, which reduces total share count and increases each remaining shareholder’s ownership percentage and EPS.',
    ],
    exampleTitle: 'Dividend Yield Calculation',
    exampleBody:
      'If ITC trades at ₹450 and pays ₹13.50 in total annual dividends per share, its Dividend Yield is ₹13.50 ÷ ₹450 = 3.0%. Note that dividends are taxed in your hands at your income tax slab rate.',
    formula: {
      label: 'Dividend Yield (%)',
      expression: '(Annual Dividend Per Share ÷ Current Share Price) × 100',
    },
    watchOut: 'An unusually high dividend yield (e.g. 12%+) can be a warning sign that the stock price crashed due to falling business fundamentals or a one-time special dividend.',
    voicePrompt: 'Explain dividend yield',
    quiz: {
      question: 'When must you buy a stock to be eligible for an upcoming dividend?',
      options: [
        'On or after the ex-dividend date',
        'Before the ex-dividend date',
        'On the dividend payout date',
      ],
      correctIndex: 1,
      explanation: 'You must purchase the shares before the ex-dividend date so your name appears on the company register on the record date.',
    },
  },
  {
    id: 'market-cap-indices',
    track: 'basics',
    number: '05',
    title: 'Market Cap, Large/Mid/Small Cap & Indices',
    readTime: '4 min',
    summary: 'How companies are sized in India (SEBI classification) and what NIFTY 50 and SENSEX actually measure.',
    concepts: ['Market capitalisation', 'Free-float weighting', 'NIFTY 50 & SENSEX', 'Cap buckets'],
    explanation: [
      'Market Capitalisation (Market Cap) is the total market value of a company’s equity: Current Share Price × Total Outstanding Shares. This—not share price alone—tells you how big a company is.',
      'In India, SEBI classifies the top 100 listed companies by full market cap as Large-Cap, ranks 101–250 as Mid-Cap, and rank 251 onward as Small-Cap. Large-caps typically offer stability and liquidity; mid/small-caps offer higher growth potential with sharper drawdowns.',
      'Benchmark indices like NIFTY 50 (top 50 NSE companies) and SENSEX (30 BSE companies) are Free-Float Market-Cap Weighted, meaning larger, widely traded companies move the index more than smaller constituents.',
    ],
    exampleTitle: 'Why Share Price Misleads Beginners',
    exampleBody:
      'Company A at ₹100 with 100 crore shares has a Market Cap of ₹10,000 crore. Company B at ₹2,000 with 1 crore shares has a Market Cap of only ₹2,000 crore—Company A is 5× bigger despite a lower per-share price.',
    formula: {
      label: 'Market Capitalisation',
      expression: 'Share Price × Total Outstanding Shares',
    },
    watchOut: 'Small-cap stocks can rally fast in bull markets but can also lose 50–70% during downturns with limited exit liquidity.',
    voicePrompt: 'Explain bull market',
    quiz: {
      question: 'Under SEBI’s classification, which companies are categorized as Mid-Cap in India?',
      options: [
        'Ranks 1 to 100 by market cap',
        'Ranks 101 to 250 by market cap',
        'Any company with share price between ₹100 and ₹500',
      ],
      correctIndex: 1,
      explanation: 'SEBI defines Large-Cap as ranks 1–100, Mid-Cap as 101–250, and Small-Cap as 251 and below by full market capitalisation.',
    },
  },

  // LEVEL 2: INTERMEDIATE
  {
    id: 'pe-ratio-eps',
    track: 'intermediate',
    number: '06',
    title: 'EPS & P/E Ratio: Paying for Earnings',
    readTime: '5 min',
    summary: 'How to connect profits per share (EPS) with stock price (P/E), and when a "low P/E" is actually a trap.',
    concepts: ['EPS', 'Trailing vs Forward P/E', 'PEG ratio', 'Sector comparison'],
    explanation: [
      'Earnings Per Share (EPS) shows how much net profit a company earned for each share: Net Profit ÷ Total Shares. Price-to-Earnings (P/E) divides Share Price by EPS—telling you how many rupees investors are paying for ₹1 of annual profit.',
      'A P/E of 25x means investors pay ₹25 for every ₹1 of current annual earnings (or roughly 25 years of current flat profits to pay back the price). High-growth, capital-light businesses normally command higher P/Es than slow-growing or cyclical ones.',
      'Trailing P/E uses the last 12 months (TTM) of reported earnings; Forward P/E uses consensus estimated next-12-month earnings. Combining P/E with profit growth gives the PEG Ratio (P/E ÷ EPS Growth %).',
    ],
    exampleTitle: 'Comparing Two Peers',
    exampleBody:
      'An IT company earning ₹80 EPS and trading at ₹2,000 has a P/E of 25x. A peer earning ₹50 EPS at ₹1,500 has a P/E of 30x. Always compare P/E within the same industry and against the company’s own 5-year median P/E.',
    formula: {
      label: 'Price-to-Earnings (P/E)',
      expression: 'Share Price ÷ Earnings Per Share (EPS)',
    },
    watchOut: 'Never use P/E in isolation for cyclical metals/oil companies (earnings peak makes P/E look artificially low right before profits drop) or for banks (where P/B is primary).',
    voicePrompt: 'Explain P/E ratio',
    quiz: {
      question: 'If a stock trades at ₹600 and its TTM EPS is ₹30, what is its trailing P/E ratio?',
      options: ['15x', '20x', '30x'],
      correctIndex: 1,
      explanation: 'P/E = Share Price ÷ EPS = 600 ÷ 30 = 20x.',
    },
  },
  {
    id: 'pb-roe-roce',
    track: 'intermediate',
    number: '07',
    title: 'Book Value, P/B Ratio, ROE & ROCE',
    readTime: '5 min',
    summary: 'Measure how efficiently management compounds capital—and why ROE and ROCE separate great businesses from average ones.',
    concepts: ['Book Value (P/B)', 'ROE', 'ROCE', 'Capital efficiency'],
    explanation: [
      'Book Value is a company’s net worth on the balance sheet (Total Assets minus Total Liabilities). Price-to-Book (P/B) compares market price against this net worth—especially vital for banks, NBFCs, and asset-heavy companies.',
      'Return on Equity (ROE = Net Profit ÷ Shareholders’ Equity) measures how much profit the company generates per rupee of shareholders’ funds. Return on Capital Employed (ROCE = EBIT ÷ Capital Employed) includes debt as well, preventing high debt from artificially inflating ROE.',
      'Businesses that consistently earn high ROCE (>18–20%) and reinvest profits at those rates compound intrinsic value rapidly over time.',
    ],
    exampleTitle: 'Why ROCE Catches Debt Distortion',
    exampleBody:
      'Company X and Y both have ₹100 Cr capital and earn ₹15 Cr EBIT (15% ROCE). If Company Y replaces ₹80 Cr of equity with ₹80 Cr debt, its ROE looks huge on a tiny ₹20 Cr equity base—even though the underlying business efficiency (ROCE) is identical.',
    formula: {
      label: 'ROE & ROCE',
      expression: 'ROE = Net Profit ÷ Equity  |  ROCE = EBIT ÷ (Equity + Debt)',
    },
    watchOut: 'A high ROE driven purely by heavy borrowing collapses quickly when interest rates rise or demand slows.',
    voicePrompt: 'Explain key financial ratios',
    quiz: {
      question: 'Which ratio accounts for both equity AND debt capital when measuring business efficiency?',
      options: ['ROE (Return on Equity)', 'ROCE (Return on Capital Employed)', 'Dividend Yield'],
      correctIndex: 1,
      explanation: 'ROCE measures operating profit against total capital employed (equity + debt), revealing true operational efficiency.',
    },
  },
  {
    id: 'three-financial-statements',
    track: 'intermediate',
    number: '08',
    title: 'Reading the 3 Financial Statements',
    readTime: '6 min',
    summary: 'Connect the Profit & Loss (Income Statement), Balance Sheet, and Cash Flow Statement to verify earnings quality.',
    concepts: ['P&L statement', 'Balance sheet', 'Operating cash flow (CFO)', 'Free cash flow'],
    explanation: [
      'Every quarterly or annual report rests on three connected statements: (1) Profit & Loss (revenue, expenses, net profit over a period), (2) Balance Sheet (a snapshot of assets, debt, and equity on a single date), and (3) Cash Flow Statement (actual cash moving in and out).',
      'Accounting profit on the P&L can be boosted by credit sales (receivables) or non-cash gains. The Cash Flow Statement cuts through this by showing Cash Flow from Operations (CFO)—actual cash collected from customers.',
      'Free Cash Flow (FCF = CFO minus Capital Expenditure) is the true surplus cash available to repay debt, pay dividends, buy back shares, or fund acquisitions.',
    ],
    exampleTitle: 'The Cash Conversion Check',
    exampleBody:
      'Over 5 years, compare cumulative Net Profit (PAT) with cumulative Operating Cash Flow (CFO). If a company reports ₹1,000 Cr in PAT but only ₹300 Cr in CFO because receivables keep ballooning, profits may not be turning into real cash.',
    formula: {
      label: 'Free Cash Flow (FCF)',
      expression: 'FCF = Operating Cash Flow (CFO) − Capital Expenditure (CapEx)',
    },
    watchOut: 'Rapid revenue growth paired with shrinking operating cash flow and rising receivables is a classic early warning of aggressive revenue recognition.',
    voicePrompt: 'Recent announcements for TCS',
    quiz: {
      question: 'Which metric tells you how much actual cash a business generates after maintaining/expanding its physical assets?',
      options: ['Gross Profit', 'Free Cash Flow (FCF)', 'EBITDA'],
      correctIndex: 1,
      explanation: 'Free Cash Flow subtracts Capital Expenditure (CapEx) from Operating Cash Flow, showing true distributable cash.',
    },
  },
  {
    id: 'debt-margins-moats',
    track: 'intermediate',
    number: '09',
    title: 'Debt, Operating Margins & Economic Moats',
    readTime: '5 min',
    summary: 'Evaluate solvency, pricing power through Gross/EBITDA margins, and durable competitive advantages (moats).',
    concepts: ['Debt-to-Equity', 'Interest coverage', 'EBITDA & PAT margin', 'Economic moat'],
    explanation: [
      'Debt magnifies returns in good times and destroys equity in bad times. Check Debt-to-Equity (Total Debt ÷ Shareholders’ Equity) and Interest Coverage Ratio (EBIT ÷ Interest Expense). An Interest Coverage below 2x leaves little margin of safety.',
      'Margin analysis shows pricing power: Gross Margin shows raw-material pricing power; EBITDA Margin shows core operating efficiency; PAT Margin shows bottom-line profitability after interest and taxes.',
      'An Economic Moat is a structural advantage that protects high returns from competitors—such as strong consumer brands, switching costs (enterprise software), network effects, cost leadership, or regulatory licenses.',
    ],
    exampleTitle: 'Margin Expansion Signal',
    exampleBody:
      'If a company’s revenue grows 15% while Gross Margin expands from 42% to 46%, it likely has strong pricing power or an improving product mix rather than buying growth with discounts.',
    formula: {
      label: 'Interest Coverage Ratio',
      expression: 'EBIT (Operating Profit) ÷ Annual Interest Expense',
    },
    watchOut: 'Always inspect promoter share pledges alongside debt—high debt plus high promoter pledge often leads to forced selling in market downturns.',
    voicePrompt: 'IT sector summary',
    quiz: {
      question: 'Which ratio specifically checks whether operating profits comfortably cover interest payments on debt?',
      options: ['Current Ratio', 'Interest Coverage Ratio', 'P/B Ratio'],
      correctIndex: 1,
      explanation: 'Interest Coverage (EBIT ÷ Interest Expense) measures how many times over operating profits can pay interest obligations.',
    },
  },

  // LEVEL 3: ADVANCED
  {
    id: 'mutual-funds-etfs',
    track: 'advanced',
    number: '10',
    title: 'Mutual Funds, Index Funds, SIPs & ETFs',
    readTime: '5 min',
    summary: 'How pooled funds work, Direct vs Regular plans, Expense Ratio drag, and why SIPs automate discipline.',
    concepts: ['NAV & Expense Ratio', 'Direct vs Regular', 'Index ETFs', 'Rupee-cost averaging'],
    explanation: [
      'A Mutual Fund pools money from thousands of investors and invests across a basket of stocks or bonds according to a stated mandate. Each unit’s price is its Net Asset Value (NAV), updated daily after market close.',
      'Active funds rely on a fund manager trying to beat the benchmark; Index Funds and ETFs (Exchange-Traded Funds) passively mirror an index like NIFTY 50 at a fraction of the cost. Unlike mutual funds settled at end-of-day NAV, ETFs trade live on the exchange during market hours.',
      'Always compare Expense Ratio and choose Direct plans over Regular plans if investing without a distributor—saving 0.75–1.0% annually compounds enormously over 15–20 years. A Systematic Investment Plan (SIP) buys more units when markets dip and fewer when markets peak (rupee-cost averaging).',
    ],
    exampleTitle: 'Expense Ratio Compounding Drag',
    exampleBody:
      'Investing ₹10,000/month for 20 years at 12% gross return builds ~₹99.9 lakh in a 0.1% Direct Index Fund vs ~₹87.6 lakh in a 1.1% Regular fund—a ~₹12.3 lakh difference from a 1% fee gap alone.',
    watchOut: 'With ETFs, always check daily trading volume and iNAV (indicative NAV) before placing market orders so you don’t pay an artificial premium.',
    voicePrompt: 'Explain mutual funds',
    quiz: {
      question: 'What is the main structural difference between an Index Mutual Fund and an Index ETF?',
      options: [
        'ETFs cannot track NIFTY 50',
        'ETFs trade live on the stock exchange throughout the day, whereas mutual funds transact at end-of-day NAV',
        'Mutual funds have zero expense ratios',
      ],
      correctIndex: 1,
      explanation: 'ETFs trade intraday on exchanges like stocks; traditional mutual fund units are allotted/redeemed at the day’s closing NAV.',
    },
  },
  {
    id: 'bonds-asset-allocation',
    track: 'advanced',
    number: '11',
    title: 'Bonds, Yields & Portfolio Asset Allocation',
    readTime: '5 min',
    summary: 'Understand fixed-income pricing, why bond prices fall when interest rates rise, and how diversification limits drawdowns.',
    concepts: ['Coupon vs Yield', 'Interest-rate sensitivity', 'Credit quality', 'Rebalancing'],
    explanation: [
      'A Bond is a loan you give to a government (G-Sec / T-Bill) or corporation in exchange for periodic interest (coupon) and return of principal at maturity. Sovereign government bonds carry negligible default risk; corporate bonds pay higher yields to compensate for credit risk.',
      'Bond prices and market interest rates move inversely. If you hold a 7% bond and new bonds start paying 8%, buyers will only buy your 7% bond at a discount so its effective Yield-to-Maturity (YTM) matches 8%. Longer-duration bonds swing more in price when RBI changes repo rates.',
      'Asset Allocation—splitting money across equities, debt/bonds, and gold—drives most of your portfolio’s volatility profile. Periodic rebalancing trims assets that rallied and adds to lagging ones systematically.',
    ],
    exampleTitle: 'Why Diversification Works',
    exampleBody:
      'During sharp equity corrections, high-quality sovereign bonds or gold often hold value or rise, cushioning portfolio drawdowns and giving you dry powder to rebalance back into equities at lower valuations.',
    formula: {
      label: 'Inverse Bond Rule',
      expression: 'Interest Rates ↑  ⇒  Existing Bond Prices ↓  (Longer Maturity = Bigger Move)',
    },
    watchOut: 'Chasing high-yield corporate bonds without checking credit ratings (AAA/AA vs below investment grade) exposes your debt allocation to equity-like default risk.',
    voicePrompt: 'Explain portfolio diversification',
    quiz: {
      question: 'If market interest rates rise by 1%, what typically happens to the market price of an existing long-term fixed-rate bond?',
      options: ['Its price rises', 'Its price falls', 'Its price never changes'],
      correctIndex: 1,
      explanation: 'Existing bonds with lower fixed coupons must trade at a lower price so new buyers earn a competitive yield.',
    },
  },
  {
    id: 'technical-analysis-price-action',
    track: 'advanced',
    number: '12',
    title: 'Technical Analysis: Trends, Moving Averages & RSI',
    readTime: '5 min',
    summary: 'Read candlestick structure, support/resistance zones, 50/200 DMA trends, RSI momentum, and volume confirmation.',
    concepts: ['Candlesticks (OHLC)', 'Support & Resistance', '50 & 200 DMA', 'RSI & Volume'],
    explanation: [
      'While fundamentals tell you WHAT to buy, technical analysis studies price and volume to help decide WHEN to enter or manage risk. Each candlestick shows four prices for a period: Open, High, Low, and Close.',
      'Support is a price zone where buying demand historically steps in; Resistance is where selling supply tends to cap rallies. Once broken decisively on high Volume, old resistance often becomes new support.',
      'Trend-following indicators like the 50-day and 200-day Moving Averages (DMA) smooth out noise—institutions often watch the 200 DMA as the long-term bull/bear dividing line. RSI (0–100) measures momentum speed; above 70 can signal stretched short-term buying, below 30 stretched selling.',
    ],
    exampleTitle: 'Volume Confirms Breakouts',
    exampleBody:
      'If a stock breaks above a 6-month resistance level of ₹1,200 on 3× its average daily volume, institutional participation is likely backing the move—unlike a low-volume breakout that often fails.',
    watchOut: 'In a strong uptrend, RSI can stay above 70 for weeks. Never short or sell solely because RSI looks "overbought" without price structure breaking.',
    voicePrompt: 'Weekly price movement for Reliance',
    quiz: {
      question: 'What makes a price breakout above a major resistance level more reliable?',
      options: [
        'Very low trading volume',
        'Significantly higher-than-average trading volume',
        'A stock split announcement on the same day',
      ],
      correctIndex: 1,
      explanation: 'Strong volume indicates broad conviction and institutional participation behind the price move.',
    },
  },
  {
    id: 'risk-management-position-sizing',
    track: 'advanced',
    number: '13',
    title: 'Risk Management, Stop-Loss & Position Sizing',
    readTime: '5 min',
    summary: 'Learn drawdown asymmetry, the 1–2% risk-per-trade rule, and how professionals size positions before entering.',
    concepts: ['Drawdown asymmetry', 'Position sizing', 'Risk-to-Reward ratio', 'Stop-loss discipline'],
    explanation: [
      'Losses hurt mathematically more than gains help: a 10% loss requires an 11.1% gain to recover, but a 50% loss requires a 100% gain just to break even. Capital preservation is the foundation of longevity.',
      'Professionals decide their Stop-Loss (the price where their thesis is invalid) BEFORE buying, then calculate Position Size based on maximum acceptable account risk (often 1–2% of total portfolio capital per trade).',
      'Look for asymmetric Risk-to-Reward (at least 1:2 or 1:3)—meaning if you risk ₹1,000 on a setup, your realistic target upside is ₹2,000–₹3,000, allowing profitability even with a 40–50% win rate.',
    ],
    exampleTitle: 'Position Sizing Formula in Action',
    exampleBody:
      'Portfolio = ₹5,00,000. Max risk per trade (1%) = ₹5,000. Entry = ₹500, Stop-loss = ₹475 (risk per share = ₹25). Position size = ₹5,000 ÷ ₹25 = 200 shares (₹1,00,000 capital deployed, capped loss ₹5,000).',
    formula: {
      label: 'Position Size (Shares)',
      expression: 'Max Rupee Risk Allowed ÷ (Entry Price − Stop-Loss Price)',
    },
    watchOut: 'Never average down into a losing short-term trade just to lower your buy price—that turns a small planned loss into a portfolio-crippling drawdown.',
    voicePrompt: 'Explain bear market',
    quiz: {
      question: 'If a stock drops by 50% from ₹200 to ₹100, what percentage gain is needed to return to ₹200?',
      options: ['50%', '75%', '100%'],
      correctIndex: 2,
      explanation: 'Moving from ₹100 back to ₹200 is a ₹100 gain on a ₹100 base, which equals +100%.',
    },
  },

  // LEVEL 4: PRO
  {
    id: 'futures-contracts',
    track: 'pro',
    number: '14',
    title: 'Futures Contracts: Leverage, Margin & MTM',
    readTime: '6 min',
    summary: 'How equity and index futures work on NSE, lot sizes, daily Mark-to-Market settlement, basis, and rollover.',
    concepts: ['Lot size & leverage', 'Initial & SPAN margin', 'Mark-to-Market (MTM)', 'Basis & Rollover'],
    explanation: [
      'A Futures contract is a legally binding obligation to buy or sell an underlying asset (like NIFTY 50 or RELIANCE) at a predetermined price on a fixed expiry date. Unlike buying cash shares, futures trade in standardized Lot Sizes and require only a fraction of the contract value as Margin.',
      'Because leverage amplifies both gains and losses, NSE settles profits and losses daily through Mark-to-Market (MTM). If your position moves against you, cash is debited daily; failing to maintain maintenance margin triggers an immediate margin call or forced square-off.',
      'Futures typically trade at a slight premium to Spot price (Cost of Carry / Basis) reflecting interest rates. Traders extend positions from the expiring month to the next month via a Rollover.',
    ],
    exampleTitle: 'Leverage Reality Check',
    exampleBody:
      'Suppose 1 lot of a stock futures contract has a notional value of ₹8,00,000 and requires ₹1,60,000 margin (5× leverage). A 5% drop in the stock wipes ₹40,000—that is a 25% loss on your deposited margin in a single move.',
    formula: {
      label: 'Effective Leverage',
      expression: 'Total Notional Contract Value (Price × Lot Size) ÷ Margin Deposited',
    },
    watchOut: 'Never confuse margin requirement with maximum loss—in futures, losses are uncapped relative to margin if the market gaps overnight.',
    voicePrompt: 'Why is Reliance falling today?',
    quiz: {
      question: 'What happens at the end of every trading day on an open NSE Futures position?',
      options: [
        'Nothing until the monthly expiry date',
        'Daily profits or losses are settled via Mark-to-Market (MTM)',
        'Your shares are automatically converted to physical delivery',
      ],
      correctIndex: 1,
      explanation: 'Futures undergo daily Mark-to-Market settlement to prevent counterparty default risk from accumulating.',
    },
  },
  {
    id: 'options-calls-puts',
    track: 'pro',
    number: '15',
    title: 'Options Mastery: Calls, Puts & Asymmetric Payoffs',
    readTime: '6 min',
    summary: 'Master Call vs Put rights, ITM/ATM/OTM moneyness, Intrinsic vs Time Value, and buyer vs writer payoff asymmetry.',
    concepts: ['Call & Put options', 'Strike & Premium', 'ITM / ATM / OTM', 'Intrinsic vs Time Value'],
    explanation: [
      'An Option gives the buyer the RIGHT—but NOT the obligation—to buy (Call / CE) or sell (Put / PE) an asset at a chosen Strike Price on or before expiry, in exchange for an upfront Premium.',
      'An option’s premium has two parts: Intrinsic Value (the immediate profit if exercised now) + Time Value (the extra amount traders pay for remaining time and potential volatility). By expiry, Time Value decays to zero.',
      'Moneyness compares Strike vs Spot: for a Call, Strike < Spot is In-the-Money (ITM), Strike ≈ Spot is At-the-Money (ATM), and Strike > Spot is Out-of-the-Money (OTM). Buyers have capped loss (premium paid) and large upside; Option Sellers/Writers collect the premium upfront but carry substantial downside risk if unhedged.',
    ],
    exampleTitle: 'Call Option Breakdown',
    exampleBody:
      'NIFTY Spot = 25,600. A 25,500 Call (ITM) trading at ₹180 has ₹100 of Intrinsic Value (25,600 − 25,500) and ₹80 of Time Value. Your breakeven at expiry is 25,500 + 180 = 25,680.',
    formula: {
      label: 'Option Breakeven at Expiry',
      expression: 'Long Call = Strike + Premium  |  Long Put = Strike − Premium',
    },
    watchOut: 'Buying cheap far-OTM options before expiry has a very low probability of profit because Time Value erodes rapidly against you.',
    voicePrompt: 'Explain stop-loss',
    quiz: {
      question: 'If Spot is ₹1,000 and a ₹1,050 Call Option trades at ₹18, how much Intrinsic Value does it have?',
      options: ['₹50', '₹18', '₹0 (it is Out-of-the-Money; the entire ₹18 is Time Value)'],
      correctIndex: 2,
      explanation: 'A ₹1,050 Call is OTM when Spot is ₹1,000, so Intrinsic Value is ₹0 and the entire ₹18 premium is Time Value.',
    },
  },
  {
    id: 'option-greeks-iv',
    track: 'pro',
    number: '16',
    title: 'Option Greeks & Implied Volatility (IV Crush)',
    readTime: '6 min',
    summary: 'Use Delta, Gamma, Theta, and Vega to predict option behavior—and avoid losing money right after earnings even if you guessed direction right.',
    concepts: ['Delta & Gamma', 'Theta (time decay)', 'Vega & Implied Volatility', 'IV Crush'],
    explanation: [
      'Option prices do not move purely with the underlying stock. Four "Greeks" quantify every driver: Delta measures how much the option moves per ₹1 move in the stock (~0.50 for ATM). Gamma measures how fast Delta accelerates near expiry.',
      'Theta is daily Time Decay—the silent enemy of option buyers and friend of option sellers. Theta accelerates sharply in the final week before expiry.',
      'Vega measures sensitivity to Implied Volatility (IV)—the market’s expectation of future price swings (reflected broadly by India VIX). Before big events like quarterly results or RBI policy, IV spikes and inflates premiums. Immediately after the announcement, uncertainty vanishes and IV collapses—causing "IV Crush" that can make both Calls and Puts lose value simultaneously.',
    ],
    exampleTitle: 'Surviving IV Crush Around Earnings',
    exampleBody:
      'Before quarterly results, a stock option might price in a ±6% move (high IV). Even if the stock rises +2.5% after results, the sudden drop in IV and Theta decay can push a naked OTM Call down in price.',
    watchOut: 'Naked option buying before known binary events (earnings, budgets) often loses to IV crush unless the actual move exceeds what the options market already priced in.',
    voicePrompt: 'Explain P/E ratio',
    quiz: {
      question: 'Which Greek measures how much value an option loses each day solely from the passage of time?',
      options: ['Delta', 'Theta', 'Vega'],
      correctIndex: 1,
      explanation: 'Theta quantifies daily time decay, eroding the option’s time value as expiry approaches.',
    },
  },
  {
    id: 'pro-strategies-institutional-flow',
    track: 'pro',
    number: '17',
    title: 'Multi-Leg Strategies, Open Interest & FII/DII Flow',
    readTime: '6 min',
    summary: 'Trade defined-risk spreads like Covered Calls and Iron Condors, and read Option Chain Open Interest and institutional flows.',
    concepts: ['Bull Call Spread & Covered Call', 'Iron Condor', 'Open Interest (OI) & PCR', 'FII vs DII flows'],
    explanation: [
      'Rather than making all-or-nothing directional bets, professionals combine options into Spreads. A Bull Call Spread (buy lower-strike Call, sell higher-strike Call) cuts cost, lowers breakeven, and cushions Theta/IV drag in exchange for capping maximum profit.',
      'A Covered Call (own 1 lot of shares + sell an OTM Call) generates steady income in sideways markets. An Iron Condor combines a Bull Put Spread and Bear Call Spread to earn premium when an index stays within a range, with strictly capped risk on both sides.',
      'To gauge market positioning, read the Option Chain: strikes with the highest Call Open Interest (OI) often act as short-term resistance (call writers defending the level), while highest Put OI acts as support. Put-Call Ratio (PCR = Total Put OI ÷ Total Call OI) and daily FII/DII cash & derivatives flows reveal whether institutions are accumulating or hedging.',
    ],
    exampleTitle: 'Reading Option Chain Positioning',
    exampleBody:
      'If NIFTY trades at 25,600 with massive Put OI building at 25,500 and heavy Call OI at 25,800, option writers expect a 25,500–25,800 range unless a sharp unwinding (short covering) breaks either wall.',
    watchOut: 'Open Interest shows existing positions, NOT whether institutions bought or sold those strikes—always combine OI changes with price action.',
    voicePrompt: 'IT sector summary',
    quiz: {
      question: 'Why do pro traders often prefer a Bull Call Spread over buying a naked Call when IV is elevated?',
      options: [
        'Because selling the higher strike offsets part of the premium cost, Theta decay, and Vega/IV risk',
        'Because spreads require zero margin and have infinite profit',
        'Because spreads are exempt from expiry',
      ],
      correctIndex: 0,
      explanation: 'Selling the higher-strike call reduces net debit paid and partially hedges both time decay (Theta) and volatility drop (Vega).',
    },
  },
]

export const INDUSTRIES: IndustryPlaybook[] = [
  {
    id: 'banking',
    name: 'Banking & Financial Services',
    tagline: 'Money is the raw material—judge banks by deposit franchise, lending spreads, and asset quality.',
    examples: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Kotak Mahindra Bank', 'Axis Bank'],
    valuationAnchor: 'Price-to-Book (P/B) paired with Return on Assets (RoA) & Return on Equity (RoE) — NOT P/E alone',
    howAnalystsJudge:
      'Banks borrow money from depositors and lend it out at higher rates. Because loans sit on the balance sheet and credit losses can show up years later, analysts never trust reported profit growth alone. A top-tier bank combines a sticky, low-cost deposit base (high CASA), healthy Net Interest Margins (NIM), clean loan books (low NNPA with high Provision Coverage), and consistent 1.5%+ RoA.',
    metrics: [
      {
        name: 'CASA Ratio (Current Account + Savings Account)',
        shortName: 'CASA Ratio',
        whatItMeans: 'Percentage of total bank deposits held in current and savings accounts rather than expensive fixed/term deposits.',
        healthyBenchmark: '40%–50%+ is strong for Indian banks',
        whyItMatters:
          'Current accounts pay 0% interest and savings accounts pay ~2.7–3.5%, whereas term deposits cost 6.5–7.5%+. A high CASA ratio gives a bank a structural cost-of-funds moat, letting it lend profitably without taking reckless credit risk.',
      },
      {
        name: 'Net Interest Margin (NIM)',
        shortName: 'NIM',
        whatItMeans: '(Interest Earned on Loans/Investments − Interest Paid on Deposits/Borrowings) ÷ Average Earning Assets.',
        healthyBenchmark: '3.2%–4.5% for large universal banks (higher for small finance/microfinance)',
        whyItMatters:
          'NIM is a bank’s gross profit margin. Rising deposit costs or fierce competition for prime borrowers compress NIM; sticky CASA protects it.',
      },
      {
        name: 'GNPA, NNPA & Provision Coverage Ratio (PCR)',
        shortName: 'GNPA / NNPA / PCR',
        whatItMeans:
          'Gross NPA = % of loans overdue >90 days. Net NPA = GNPA minus provisions already set aside. PCR = % of bad loans already provided for.',
        healthyBenchmark: 'GNPA < 2.0%, NNPA < 0.6%, PCR > 70%–75%',
        whyItMatters:
          'Measures true asset quality. A low NNPA backed by a 75%+ PCR means the bank has already absorbed bad-loan pain on its P&L rather than hiding losses.',
      },
      {
        name: 'Return on Assets (RoA) & Capital Adequacy (CAR / CRAR)',
        shortName: 'RoA & CAR',
        whatItMeans:
          'RoA = Net Profit ÷ Total Assets (profit per rupee of balance sheet). CAR = Tier-1 + Tier-2 capital ÷ Risk-Weighted Assets.',
        healthyBenchmark: 'RoA ≥ 1.4%–1.8%; CAR ≥ 15% (RBI minimum ~11.5% incl. buffers)',
        whyItMatters:
          'Unlike RoE, RoA cannot be gamed by excessive leverage. Strong CAR ensures the bank can absorb shocks and fund loan growth without diluting shareholders.',
      },
      {
        name: 'Credit-to-Deposit (CD) Ratio & Cost-to-Income',
        shortName: 'CD Ratio & C/I',
        whatItMeans:
          'CD Ratio = Total Loans ÷ Total Deposits. Cost-to-Income = Operating Expenses ÷ Net Total Income.',
        healthyBenchmark: 'CD Ratio ~75%–85%; Cost-to-Income < 45%–50%',
        whyItMatters:
          'If CD Ratio climbs too high (>90%), the bank struggles to grow loans unless it aggressively raises expensive deposits, squeezing NIM.',
      },
    ],
    bullDrivers: [
      'Steady CASA accretion outpacing peers during tight liquidity cycles',
      'Falling credit costs (slippages trending down) while PCR remains >75%',
      'Digital operating leverage lowering Cost-to-Income over time',
    ],
    redFlags: [
      'Rapid loan growth (>25%+) funded by high-cost wholesale/bulk deposits instead of retail CASA',
      'Rising unsecured personal/credit-card delinquencies or sudden divergence between RBI audit and reported NPAs',
      'Sharp drop in PCR to artificially boost quarterly net profit',
    ],
    voicePrompt: 'Explain P/E ratio',
  },
  {
    id: 'it',
    name: 'Information Technology (IT Services)',
    tagline: 'Asset-light cash machines judged by deal pipeline, constant-currency growth, and talent utilization.',
    examples: ['TCS', 'Infosys', 'HCLTech', 'Wipro', 'Tech Mahindra'],
    valuationAnchor: 'Forward P/E & Free Cash Flow Yield (high FCF conversion enables generous dividends & buybacks)',
    howAnalystsJudge:
      'Indian IT firms export software engineering, cloud, AI, and consulting services primarily to US and European enterprises. Since currency swings (USD/INR) distort headline rupee revenue, analysts strip out FX noise to track Constant Currency (CC) growth, forward deal bookings (TCV), and operating margins.',
    metrics: [
      {
        name: 'Constant Currency (CC) Revenue Growth',
        shortName: 'CC Growth',
        whatItMeans: 'Year-on-year or sequential revenue growth assuming exchange rates stayed unchanged.',
        healthyBenchmark: '8%–14%+ in normal cycles; watch QoQ momentum inflection',
        whyItMatters: 'Shows true volume and pricing demand from global clients without Rupee depreciation masking flat volumes.',
      },
      {
        name: 'Total Contract Value (TCV) & Book-to-Bill',
        shortName: 'TCV Deals',
        whatItMeans: 'Total multi-year value of new and renewed deals signed during the quarter.',
        healthyBenchmark: 'Book-to-Bill > 1.1x–1.2x signals expanding revenue visibility',
        whyItMatters: 'TCV is the leading indicator for revenue 2–4 quarters ahead—especially split between "net new" deals vs renewals.',
      },
      {
        name: 'EBIT Margin & Employee Utilization',
        shortName: 'EBIT & Utilization',
        whatItMeans: 'Operating profit margin after employee salaries and subcontractor costs; Utilization = % of billable staff actively on client projects.',
        healthyBenchmark: 'EBIT 17%–25% (Tier-1); Utilization ~82%–86% (excl. trainees)',
        whyItMatters: 'Since people are the main cost, managing pyramid mix (freshers vs senior staff) and utilization drives margin resilience.',
      },
      {
        name: 'LTM Attrition & Client Concentration',
        shortName: 'Attrition',
        whatItMeans: 'Last-12-month voluntary employee turnover and % of revenue from top 5/10 clients or BFSI vertical.',
        healthyBenchmark: 'Attrition 11%–15% is manageable; >20% spikes wage inflation',
        whyItMatters: 'High attrition forces expensive lateral hiring and hurts project delivery continuity.',
      },
    ],
    bullDrivers: [
      'Large net-new transformation/AI/cloud deal wins boosting Book-to-Bill',
      'US Federal Reserve rate cuts reviving discretionary BFSI & retail tech budgets',
      'Consistent >85% Free Cash Flow to PAT conversion returned via buybacks/dividends',
    ],
    redFlags: [
      'Rising revenue guidance cuts paired with shrinking net headcount for multiple quarters',
      'Heavy dependence on a single troubled client or vertical',
      'Margin expansion achieved only by slashing training/R&D rather than pricing power',
    ],
    voicePrompt: 'IT sector summary',
  },
  {
    id: 'fmcg',
    name: 'FMCG & Consumer Staples',
    tagline: 'Brand moats and distribution reach—judged by real volume growth, not just inflation-led price hikes.',
    examples: ['Hindustan Unilever', 'ITC', 'Nestle India', 'Britannia', 'Dabur'],
    valuationAnchor: 'P/E & EV/EBITDA (premium multiples justified only when volume growth + high ROCE persist)',
    howAnalystsJudge:
      'Consumer staples sell everyday products repeatedly. When raw material prices (palm oil, wheat, crude packaging) rise, companies hike prices—making revenue look strong even if fewer packs are sold. Analysts therefore separate Volume Growth from Price Growth and watch rural vs urban demand.',
    metrics: [
      {
        name: 'Underlying Volume Growth (UVG)',
        shortName: 'Volume Growth',
        whatItMeans: 'Percentage growth in physical units/tonnage sold, stripping out price hikes.',
        healthyBenchmark: '5%–8%+ steady UVG indicates healthy market share and consumer demand',
        whyItMatters: 'Sustainable compounding comes from selling more packs to more households, not temporary inflation hikes.',
      },
      {
        name: 'Gross Margin vs A&P Spend',
        shortName: 'Gross Margin & A&P',
        whatItMeans: 'Revenue minus raw material costs; A&P = Advertising & Promotion investment as % of sales.',
        healthyBenchmark: 'Gross margin 45%–55%+; A&P ~8%–12% to defend brand equity',
        whyItMatters: 'When input inflation cools, Gross Margin expands—good firms reinvest part of that gain into A&P to win share.',
      },
      {
        name: 'Working Capital Cycle & ROCE',
        shortName: 'Negative WC & ROCE',
        whatItMeans: 'Cash collected from distributors faster than suppliers are paid, creating negative working capital.',
        healthyBenchmark: 'ROCE > 35%–60%+ for top Indian FMCG leaders',
        whyItMatters: 'Allows massive dividend payouts with minimal debt.',
      },
    ],
    bullDrivers: [
      'Rural recovery (monsoon + agri incomes) lifting mass-category volumes',
      'Premiumization (shifting buyers from base soaps/biscuits to higher-margin variants)',
      'Softening commodity costs expanding gross margins',
    ],
    redFlags: [
      'Flat or negative volume growth masked by price increases',
      'Slashing advertising spend solely to meet quarterly EBITDA targets',
      'Aggressive D2C/regional competitors eroding core category share',
    ],
    voicePrompt: 'Explain dividend yield',
  },
  {
    id: 'pharma',
    name: 'Pharmaceuticals & Healthcare',
    tagline: 'Dual-engine sector balancing steady Indian branded prescriptions with high-stakes US generics & R&D.',
    examples: ['Sun Pharma', 'Cipla', 'Dr. Reddy’s', 'Divi’s Labs', 'Apollo Hospitals'],
    valuationAnchor: 'EV/EBITDA & Sum-of-the-Parts (SOTP) valuing Domestic Branded higher than US Generics',
    howAnalystsJudge:
      'Not all pharma revenue is equal. Domestic Indian branded formulations act like sticky FMCG franchises (high margin, steady growth), whereas US commodity generics face stiff price erosion and strict USFDA plant inspections. Specialty drugs and complex injectables command durable moats.',
    metrics: [
      {
        name: 'USFDA Inspection Status (VAI / OAI / Warning Letter)',
        shortName: 'USFDA Status',
        whatItMeans: 'Regulatory clearance of export manufacturing plants (NAI/VAI = clear/minor; OAI/Warning Letter = blocked new approvals).',
        healthyBenchmark: 'Clean NAI/VAI status across key export facilities',
        whyItMatters: 'An OAI or Import Alert freezes new US product launches from that plant and can trigger sharp re-ratings.',
      },
      {
        name: 'Domestic Branded vs US Generics Mix',
        shortName: 'Geography Mix',
        whatItMeans: 'Share of revenue from high-margin chronic Indian therapies (cardiac, diabetes) vs competitive US generics.',
        healthyBenchmark: 'Rising chronic/specialty mix improves earnings predictability',
        whyItMatters: 'Domestic chronic prescriptions enjoy strong doctor stickiness and steady 10–12% growth.',
      },
      {
        name: 'R&D Spend (% of Sales) & Specialty Pipeline',
        shortName: 'R&D Intensity',
        whatItMeans: 'Annual investment in ANDA filings, biosimilars, or patented specialty molecules.',
        healthyBenchmark: '6%–9%+ of revenue for R&D-led pharma',
        whyItMatters: 'Funds complex launches that escape brutal commodity price erosion.',
      },
    ],
    bullDrivers: [
      'Successful USFDA re-inspection clearances unlocking stalled ANDA approvals',
      'Ramp-up of patented specialty molecules or limited-competition generics',
      'Hospital chains increasing ARPOB (Average Revenue Per Occupied Bed) and occupancy',
    ],
    redFlags: [
      'Repeated USFDA OAI / Data Integrity observations across multiple plants',
      'Heavy reliance on a single blockbuster drug nearing patent/exclusivity cliff',
      'Rising working capital days from overdue export receivables',
    ],
    voicePrompt: 'Explain P/E ratio',
  },
  {
    id: 'auto',
    name: 'Automobiles & EV Ecosystem',
    tagline: 'Cyclical consumer discretionary leaders judged by monthly dispatches, ASP mix, and EV transition readiness.',
    examples: ['Maruti Suzuki', 'Tata Motors', 'Mahindra & Mahindra', 'Bajaj Auto', 'Eicher Motors'],
    valuationAnchor: 'P/E & EV/EBITDA normalized across the auto demand cycle',
    howAnalystsJudge:
      'Auto OEMs report sales numbers every single month on the 1st—making demand trends transparent in real time. Profitability depends heavily on operating leverage (factory utilization), vehicle mix (SUVs vs entry hatchbacks), and raw material costs (steel, aluminium, rubber).',
    metrics: [
      {
        name: 'Monthly Wholesale & VAHAN Retail Volumes',
        shortName: 'Volumes & Market Share',
        whatItMeans: 'Units dispatched to dealers (wholesale) vs actual customer registrations on VAHAN (retail).',
        healthyBenchmark: 'Retail keeping pace with wholesale (avoids dealer inventory pile-up)',
        whyItMatters: 'Reveals true consumer demand and whether an OEM is gaining or losing segment share.',
      },
      {
        name: 'Average Selling Price (ASP) & SUV/Premium Mix',
        shortName: 'ASP & Mix',
        whatItMeans: 'Total vehicle revenue ÷ total units sold.',
        healthyBenchmark: 'Steadily rising ASP signals successful premiumization',
        whyItMatters: 'Higher-end SUVs and premium 2-wheelers carry much higher margins per vehicle than entry models.',
      },
      {
        name: 'EV Penetration, Capex & Commodity Pass-Through',
        shortName: 'EV & Margins',
        whatItMeans: 'Share of EV/hybrid models in portfolio, R&D capex, and ability to pass steel/lithium price swings to buyers.',
        healthyBenchmark: 'EBITDA margin ~12%–16% for well-utilized OEMs',
        whyItMatters: 'Heavy EV capex must be balanced against cannibalization of profitable ICE vehicles.',
      },
    ],
    bullDrivers: [
      'Successful new model launches creating multi-month order backlogs',
      'Softening steel/aluminium prices boosting per-vehicle gross margins',
      'Export expansion across Africa, LatAm, and Europe diversifying domestic cycles',
    ],
    redFlags: [
      'Rising dealer inventory days (>45–60 days) signaling forced channel stuffing',
      'Heavy discounting on flagship models to defend market share',
      'Missing the EV/hybrid technology curve in core segments',
    ],
    voicePrompt: 'Explain key financial ratios',
  },
  {
    id: 'energy-metals',
    name: 'Energy, Refining & Metals (Cyclicals)',
    tagline: 'Capital-intensive price takers—beware the "low P/E at peak cycle" trap and track EV/EBITDA & debt.',
    examples: ['Reliance Industries', 'ONGC', 'Tata Steel', 'JSW Steel', 'Hindalco'],
    valuationAnchor: 'EV/EBITDA & P/B across mid-cycle margins (P/E looks deceptively cheap at cycle peaks!)',
    howAnalystsJudge:
      'Commodity producers do not set global prices—prices of crude, refining spreads, steel, or aluminium move with global supply/demand (especially China). The classic mistake is buying metals at 5x P/E when margins are at an unsustainable peak; smart investors buy when spreads are depressed and companies are low-cost producers.',
    metrics: [
      {
        name: 'Gross Refining Margin (GRM) / EBITDA per Tonne',
        shortName: 'GRM / EBITDA per Tonne',
        whatItMeans: 'Refining: value of refined fuels minus crude input cost ($/barrel). Metals: operating profit per tonne of steel/aluminium sold.',
        healthyBenchmark: 'Tracking spread vs benchmark (e.g., Singapore GRM) shows plant efficiency',
        whyItMatters: 'Measures core unit profitability regardless of headline top-line inflation.',
      },
      {
        name: 'Net Debt / EBITDA',
        shortName: 'Net Debt / EBITDA',
        whatItMeans: 'How many years of current operating cash flow it takes to pay off net debt.',
        healthyBenchmark: '< 1.5x–2.0x entering a downturn',
        whyItMatters: 'High debt during a commodity downcycle is the #1 destroyer of equity in cyclical industries.',
      },
      {
        name: 'Captive Raw Material Integration & Capacity Utilization',
        shortName: 'Captive Integration',
        whatItMeans: 'Ownership of iron ore/coal mines or bauxite/power plants reducing input volatility.',
        healthyBenchmark: 'Utilization > 85% lowers fixed cost per unit',
        whyItMatters: 'Low-cost integrated producers stay cash-positive even when marginal peers lose money.',
      },
    ],
    bullDrivers: [
      'Global supply discipline or stimulus lifting spreads from cycle troughs',
      'Upcycle cash flows aggressively paying down debt (deleveraging shifts value from debt to equity)',
      'Value-added downstream mix (auto-grade steel, petrochemicals)',
    ],
    redFlags: [
      'Buying solely because trailing P/E looks single-digit after an extraordinary price boom',
      'Announcing massive debt-funded mega-capex right at the top of the commodity cycle',
      'Sudden export duties or windfall taxes altering domestic realizations',
    ],
    voicePrompt: 'Why is Reliance falling today?',
  },
  {
    id: 'telecom',
    name: 'Telecom & Digital Infrastructure',
    tagline: 'High fixed-cost networks judged by ARPU expansion, subscriber stickiness, and Free Cash Flow inflection.',
    examples: ['Bharti Airtel', 'Reliance Jio', 'Indus Towers', 'Vodafone Idea'],
    valuationAnchor: 'EV/EBITDA & Free Cash Flow after Spectrum/Capex',
    howAnalystsJudge:
      'Telecom requires massive upfront spending on towers, fiber, and spectrum before earning a single rupee. Once the network is built, every extra rupee of tariff hike flows largely straight to EBITDA and Free Cash Flow—creating powerful operating leverage.',
    metrics: [
      {
        name: 'ARPU (Average Revenue Per User)',
        shortName: 'ARPU',
        whatItMeans: 'Monthly mobile/broadband revenue generated per active subscriber.',
        healthyBenchmark: 'Steady upward climb via tariff hikes & 4G/5G upgrades (e.g. ₹200+ → ₹250+)',
        whyItMatters: 'Even a ₹10–₹20 ARPU increase across 35+ crore users adds thousands of crores straight to operating profit.',
      },
      {
        name: 'Subscriber Additions, Data Usage & Churn',
        shortName: 'Subs & Churn',
        whatItMeans: 'Net monthly active users gained/lost and % of customers leaving each month.',
        healthyBenchmark: 'Low monthly churn (<2%–3%) & rising postpaid/home-broadband share',
        whyItMatters: 'Market share stability ensures tariff hikes translate into revenue rather than customer defections.',
      },
      {
        name: 'Capex Intensity & Free Cash Flow Inflection',
        shortName: 'Capex / FCF',
        whatItMeans: 'Annual network capex as % of revenue vs operating cash flow.',
        healthyBenchmark: 'Capex peaking and moderating toward <18%–20% of revenue',
        whyItMatters: 'As 5G rollout matures, falling capex + rising ARPU drives rapid debt reduction and ROE expansion.',
      },
    ],
    bullDrivers: [
      'Industry consolidation supporting disciplined tariff increases',
      '5G capex intensity moderating while home broadband (FTTH/AirFiber) scales',
      'Enterprise connectivity, cloud, and data-center revenues expanding margins',
    ],
    redFlags: [
      'Renewed predatory price wars eroding ARPU',
      'Ballooning spectrum/AGR debt obligations exceeding operating cash flow',
      'Sustained loss of active VLR subscribers to competitors',
    ],
    voicePrompt: 'Explain bull market',
  },
]
