import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

const API = 'http://localhost:8000';
const languages = [
  ['en', 'English'], ['hi', 'हिन्दी'], ['kn', 'ಕನ್ನಡ'], ['mr', 'मराठी'], ['gu', 'ગુજરાતી'], ['ta', 'தமிழ்'],
];
const predefined = ['Company overview', 'Key financial ratios', 'Recent announcements', 'Sector summary', 'Weekly price movement'];
type Action = { id: string; label: string };
type Reply = { intent: string; message: string; sources?: { label: string; url?: string | null; timestamp?: string | null }[]; suggested_actions?: Action[]; action_payload?: Record<string, unknown> | null; requires_approval?: boolean; requires_clarification?: boolean };
type Message = { role: 'user' | 'assistant'; text: string; reply?: Reply };
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = Event & { results: ArrayLike<RecognitionResult>; resultIndex: number };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: RecognitionEvent) => void) | null; onerror: ((event: Event) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type RecognitionConstructor = new () => Recognition;
declare global { interface Window { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor } }

export default function App() {
  const [language, setLanguage] = useState(localStorage.getItem('tradeflow-language') || 'en');
  const [text, setText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: 'Ask about a company, a market term, or use the microphone. Demo responses are labeled and never claim to be live market data.' }]);
  const [dictionary, setDictionary] = useState<Record<string, string>>(() => { try { return JSON.parse(localStorage.getItem('tradeflow-dictionary') || '{}'); } catch { return {}; } });
  const [alias, setAlias] = useState('');
  const [symbol, setSymbol] = useState('');
  const [glossaryTerm, setGlossaryTerm] = useState('P/E ratio');
  const [explanation, setExplanation] = useState<{ term: string; definition: string; example: string } | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const handsFreeRef = useRef(false);
  const silenceTimer = useRef<number | undefined>();
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('tradeflow-language', language); }, [language]);
  useEffect(() => { handsFreeRef.current = handsFree; }, [handsFree]);
  useEffect(() => { localStorage.setItem('tradeflow-dictionary', JSON.stringify(dictionary)); }, [dictionary]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);
  useEffect(() => () => { window.clearTimeout(silenceTimer.current); recognition.current?.stop(); window.speechSynthesis?.cancel(); }, []);

  function speak(content: string) {
    if (!('speechSynthesis' in window)) { setNotice('Speech output is unavailable. The response remains available as text.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = ({ en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', mr: 'mr-IN', gu: 'gu-IN', ta: 'ta-IN' } as Record<string, string>)[language] || 'en-IN';
    utterance.onerror = () => setNotice('Speech playback failed. The response remains available as text.');
    window.speechSynthesis.speak(utterance);
  }

  function stopVoice(manual = true) {
    window.clearTimeout(silenceTimer.current);
    recognition.current?.stop(); recognition.current = null; setListening(false);
    if (manual) setNotice('Listening stopped. Review or edit the transcript before sending.');
  }

  function startVoice() {
    if (listening) { stopVoice(); return; }
    const RecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionApi) {
      if (handsFreeRef.current) { handsFreeRef.current = false; setHandsFree(false); }
      setNotice('Browser speech recognition is unavailable. Type your request below.'); return;
    }
    try {
      const instance = new RecognitionApi();
      instance.lang = ({ en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', mr: 'mr-IN', gu: 'gu-IN', ta: 'ta-IN' } as Record<string, string>)[language] || 'en-IN';
      instance.continuous = true; instance.interimResults = true;
      instance.onresult = event => {
        const textResult = Array.from({ length: event.results.length }, (_, i) => event.results[i][0].transcript).join(' ').trim();
        setTranscript(textResult); setText(textResult);
        window.clearTimeout(silenceTimer.current);
        silenceTimer.current = window.setTimeout(() => {
          stopVoice(false);
          if (handsFreeRef.current) void ask(textResult);
          else setNotice('Listening paused after five seconds of silence. Review or edit the transcript before sending.');
        }, 5000);
      };
      instance.onerror = () => { setNotice('Speech input could not be completed. You can edit the transcript or type instead.'); stopVoice(false); };
      instance.onend = () => { setListening(false); recognition.current = null; };
      recognition.current = instance; setTranscript(''); setNotice('Listening… Speak now. Recording stops after five seconds of silence.'); setListening(true); instance.start();
    } catch { setNotice('Microphone permission or speech service is unavailable. Type your request instead.'); setListening(false); }
  }

  async function ask(query: string) {
    const prompt = query.trim(); if (!prompt || busy) return;
    setMessages(items => [...items, { role: 'user', text: prompt }]); setText(''); setBusy(true); setNotice('');
    try {
      const response = await fetch(`${API}/api/assistant`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: prompt, language, dictionary, input_method: transcript ? 'speech' : 'typed' }) });
      if (!response.ok) throw new Error('Assistant service returned an error.');
      const reply = await response.json() as Reply;
      setMessages(items => [...items, { role: 'assistant', text: reply.message, reply }]);
      if (handsFree) speak(reply.message);
    } catch {
      setMessages(items => [...items, { role: 'assistant', text: 'The local assistant API is unavailable. Start the backend or use the glossary below; typed input is still available.' }]);
    } finally {
      setBusy(false); setTranscript('');
      if (handsFreeRef.current) window.setTimeout(() => startVoice(), 250);
    }
  }

  function submit(event: FormEvent) { event.preventDefault(); void ask(text); }
  async function explain(term = glossaryTerm) {
    try {
      const response = await fetch(`${API}/api/education/explain`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ term, language }) });
      if (!response.ok) throw new Error();
      setExplanation(await response.json());
    } catch { setNotice('Glossary service unavailable. Start the backend and try again.'); }
  }
  function addAlias(event: FormEvent) {
    event.preventDefault(); const key = alias.trim(); const value = symbol.trim().toUpperCase();
    if (!key || !value) return;
    setDictionary(current => ({ ...current, [key]: value })); setAlias(''); setSymbol('');
  }

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">T</span><span>TradeFlow<small>VOICE + RESEARCH</small></span></a><div className="top-right"><span className="demo-badge"><i /> DEMO MODE</span><label className="language-select"><span>Language</span><select value={language} onChange={e => setLanguage(e.target.value)}>{languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label><div className="avatar">A</div></div></header>
      <div className="page-layout" id="top"><section className="main-column">
      <div className="welcome"><div className="eyebrow"><span /> AI RESEARCH ASSISTANT</div><h1>Markets, made <em>clear.</em></h1><p>Ask in your own words. Get thoughtful explanations and research prompts in one place.</p></div>
      <section className="chat-card"><div className="chat-heading"><div><div className="section-kicker">YOUR CONVERSATION</div><h2>Talk to TradeFlow</h2></div><button className={`handsfree ${handsFree ? 'active' : ''}`} onClick={() => { const next = !handsFree; setHandsFree(next); if (next) startVoice(); else { stopVoice(false); window.speechSynthesis?.cancel(); } }} aria-pressed={handsFree}><span className="sound-bars">▮▮▮</span> Hands-free <i /></button></div>
        <div className="messages" aria-live="polite">{messages.map((message, index) => <article className={`message ${message.role}`} key={`${index}-${message.text.slice(0, 14)}`}><div className="message-avatar">{message.role === 'assistant' ? 'T' : 'A'}</div><div className="bubble-wrap"><div className="message-name">{message.role === 'assistant' ? 'TRADEFLOW' : 'YOU'}{message.role === 'assistant' && message.reply?.intent && <span className="intent-chip">{message.reply.intent.replaceAll('_', ' ')}</span>}</div><div className="bubble">{message.text}</div>{message.reply?.sources?.map((source, i) => <div className="source" key={i}>SOURCE · {source.label} {source.timestamp && `· ${source.timestamp}`}</div>)}{message.reply?.action_payload && <div className="preview-chip">Reviewable request · {String(message.reply.action_payload.side)} {String(message.reply.action_payload.quantity)} {String(message.reply.action_payload.symbol)} · not submitted</div>}{message.role === 'assistant' && <button className="listen-response" onClick={() => speak(message.text)}>◖ Listen</button>}</div></article>)}{busy && <div className="thinking"><span /><span /><span /> Working on your request</div>}<div ref={bottom} /></div>
        {notice && <div className="notice" role="status">{notice}</div>}{transcript && listening && <div className="transcript"><span className="recording-dot" /> Live transcript: “{transcript}”</div>}
        <form className="composer" onSubmit={submit}><button type="button" aria-label={listening ? 'Stop listening' : 'Start voice input'} className={`mic-button ${listening ? 'recording' : ''}`} onClick={() => listening ? stopVoice() : startVoice()}>{listening ? '■' : '♩'}</button><input value={text} onChange={e => setText(e.target.value)} placeholder="Ask about a stock, a term, or your portfolio…" aria-label="Type your request" /><button type="submit" disabled={!text.trim() || busy} className="send-button">Send <span>↗</span></button></form>
        <div className="composer-foot"><span>Voice and typed requests use the same assistant.</span><span>Enter ↵</span></div>
      </section>
      <section className="research-section"><div className="section-title"><div><div className="section-kicker">START WITH A PROMPT</div><h2>Research shortcuts</h2></div><span className="static-label">LOCAL DEMO KNOWLEDGE</span></div><div className="query-grid">{predefined.map((query, i) => <button key={query} className="query-card" onClick={() => void ask(`${query} ${i === 0 ? 'of Infosys' : i === 2 ? 'for TCS' : i === 4 ? 'for Reliance' : ''}`)}><span className="query-icon">{['◉', '⌁', '↗', '◌', '▥'][i]}</span><span>{query}</span><b>↗</b></button>)}</div></section>
    </section><aside className="side-column">
      <section className="side-card term-card"><div className="side-heading"><span className="side-icon book">Aa</span><div><div className="section-kicker">LEARN AS YOU GO</div><h3>Explain a term</h3></div></div><p>Get a plain-language definition and a practical example.</p><form className="term-form" onSubmit={e => { e.preventDefault(); void explain(); }}><input value={glossaryTerm} onChange={e => setGlossaryTerm(e.target.value)} aria-label="Financial term" /><button>Explain <span>→</span></button></form><div className="term-suggestions">{['P/E ratio', 'EPS', 'Dividend yield'].map(term => <button key={term} onClick={() => { setGlossaryTerm(term); void explain(term); }}>{term}</button>)}</div>{explanation && <div className="explanation"><button className="close" onClick={() => setExplanation(null)} aria-label="Close explanation">×</button><strong>{explanation.term}</strong><p>{explanation.definition}</p><small>EXAMPLE</small><p>{explanation.example}</p><div className="audio-controls"><button onClick={() => speak(`${explanation.definition} ${explanation.example}`)}>▶ Listen</button><button onClick={() => window.speechSynthesis?.pause()}>Ⅱ Pause</button><button onClick={() => { window.speechSynthesis?.cancel(); speak(`${explanation.definition} ${explanation.example}`); }}>↻ Replay</button></div></div>}</section>
      <section className="side-card dictionary-card"><div className="side-heading"><span className="side-icon dictionary">⌕</span><div><div className="section-kicker">PERSONAL VOCABULARY</div><h3>Your stock dictionary</h3></div></div><p>Add names or nicknames that should map to a ticker.</p><form onSubmit={addAlias} className="dictionary-form"><input placeholder="Nickname (e.g. my Reliance)" value={alias} onChange={e => setAlias(e.target.value)} aria-label="Stock nickname"/><div className="dictionary-input-row"><input placeholder="Ticker (e.g. RELIANCE)" value={symbol} onChange={e => setSymbol(e.target.value)} aria-label="Stock ticker"/><button aria-label="Add alias">+</button></div></form><div className="alias-list">{Object.entries(dictionary).length ? Object.entries(dictionary).map(([name, ticker]) => <div className="alias-row" key={name}><span>{name}</span><b>{ticker}</b><button aria-label={`Remove ${name}`} onClick={() => setDictionary(current => { const next = { ...current }; delete next[name]; return next; })}>×</button></div>) : <div className="alias-empty"><span>✦</span> Your saved aliases appear here.</div>}</div><div className="privacy-note"><span>♙</span> Saved on this device. Dictionary hints never verify identity.</div></section>
      <div className="safety-note"><span>◈</span><p><b>Clear, careful answers.</b><br/>Demo research is labeled. The assistant never submits an order or invents live prices.</p></div>
    </aside></div><footer>TRADEFLOW <span>·</span> A clearer way to explore markets</footer>
  </main>;
}
