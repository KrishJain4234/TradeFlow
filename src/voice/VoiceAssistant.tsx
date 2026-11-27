import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { BookOpen, Headphones, Mic, Pause, Play, RotateCcw, Send, ShieldCheck, Square, X } from 'lucide-react'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const LANGUAGES = [['en','English'],['hi','हिन्दी'],['kn','ಕನ್ನಡ'],['mr','मराठी'],['gu','ગુજરાતી'],['ta','தமிழ்']]
type Action = { id: string; label: string }
type Reply = { intent: string; message: string; response_language?: string; sources?: { label: string; url?: string | null; timestamp?: string | null }[]; suggested_actions?: Action[]; action_payload?: Record<string, unknown> | null; requires_approval?: boolean }
type Message = { role: 'assistant' | 'user'; text: string; reply?: Reply }
type RecognitionResult = { 0: { transcript: string } }
type RecognitionEvent = Event & { results: ArrayLike<RecognitionResult> }
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: RecognitionEvent) => void) | null; onerror: ((event: Event) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void }
type RecognitionConstructor = new () => Recognition
type WisprCapture = { stream: MediaStream; context: AudioContext; source: MediaStreamAudioSourceNode; processor: ScriptProcessorNode; silentGain: GainNode; chunks: Float32Array[]; lastSpeechAt: number }
declare global { interface Window { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor } }

const PRESETS = ['Company overview of Infosys', 'Explain key financial ratios', 'Recent announcements for TCS', 'IT sector summary', 'Weekly price movement for Reliance']

export default function VoiceAssistant({ onClose }: { onClose: () => void }) {
  const [language, setLanguage] = useState(localStorage.getItem('tradeflow-language') || 'en')
  const [dictionary, setDictionary] = useState<Record<string,string>>(() => { try { return JSON.parse(localStorage.getItem('tradeflow-dictionary') || '{}') } catch { return {} } })
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: 'Ask a market question, explore a research shortcut, or ask me to explain a financial term. Demo answers are labeled and are not live market data.' }])
  const [value, setValue] = useState('')
  const [transcript, setTranscript] = useState('')
  const [notice, setNotice] = useState('')
  const [listening, setListening] = useState(false)
  const [handsFree, setHandsFree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [term, setTerm] = useState('P/E ratio')
  const [explanation, setExplanation] = useState<{term:string;definition:string;example:string;response_language?:string} | null>(null)
  const [alias, setAlias] = useState('')
  const [ticker, setTicker] = useState('')
  const rec = useRef<Recognition | null>(null)
  const capture = useRef<WisprCapture | null>(null)
  const silence = useRef<number | undefined>(undefined)
  const handsFreeRef = useRef(false)
  const fromVoice = useRef(false)
  const forceBrowserVoice = useRef(false)

  useEffect(() => { localStorage.setItem('tradeflow-language', language) }, [language])
  useEffect(() => { localStorage.setItem('tradeflow-dictionary', JSON.stringify(dictionary)) }, [dictionary])
  useEffect(() => { handsFreeRef.current = handsFree }, [handsFree])
  useEffect(() => () => { window.clearTimeout(silence.current); rec.current?.stop(); if (capture.current) { capture.current.stream.getTracks().forEach(track=>track.stop()); void capture.current.context.close() }; window.speechSynthesis?.cancel() }, [])

  async function speak(text: string, outputLanguage = language) {
    try {
      const response = await fetch(`${API}/api/voice/speak`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,language:outputLanguage})})
      if (response.ok) {
        const url = URL.createObjectURL(await response.blob())
        const audio = new Audio(url)
        audio.onended = () => URL.revokeObjectURL(url)
        await audio.play()
        return
      }
    } catch { /* use the final browser fallback below */ }
    if (!window.speechSynthesis) { setNotice('Speech playback is unavailable; the answer is shown as text.'); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = ({en:'en-IN',hi:'hi-IN',kn:'kn-IN',mr:'mr-IN',gu:'gu-IN',ta:'ta-IN'} as Record<string,string>)[outputLanguage] || 'en-IN'
    utterance.onerror = () => setNotice('Speech playback failed; the answer is shown as text.')
    window.speechSynthesis.speak(utterance)
  }

  async function send(raw = value) {
    const prompt = raw.trim()
    if (!prompt || busy) return
    setValue(''); setBusy(true); setNotice(''); setMessages(current => [...current, {role:'user', text:prompt}])
    const inputMethod = fromVoice.current ? 'speech' : 'typed'; fromVoice.current = false
    try {
      const result = await fetch(`${API}/api/assistant`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:prompt, language, dictionary, input_method:inputMethod}) })
      if (!result.ok) throw new Error('Assistant API error')
      const reply = await result.json() as Reply
      setMessages(current => [...current, {role:'assistant', text:reply.message, reply}])
      if (handsFreeRef.current) speak(reply.message, reply.response_language || 'en')
    } catch {
      setMessages(current => [...current, {role:'assistant', text:'The local assistant service is unavailable. Start the FastAPI service or use typed input after it is running.'}])
    } finally {
      setBusy(false)
      if (handsFreeRef.current) window.setTimeout(startVoice, 250)
    }
  }

  function startVoice() {
    if(forceBrowserVoice.current){startBrowserVoice();return}
    void fetch(`${API}/api/health`).then(result => result.json()).then(status => {
      if (status.voice?.wispr) void startWisprRecording()
      else startBrowserVoice()
    }).catch(() => startBrowserVoice())
  }

  async function startWisprRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}})
      const context = new AudioContext()
      const source = context.createMediaStreamSource(stream)
      const processor = context.createScriptProcessor(4096,1,1)
      const silentGain = context.createGain(); silentGain.gain.value = 0
      const session: WisprCapture = {stream,context,source,processor,silentGain,chunks:[],lastSpeechAt:performance.now()}
      processor.onaudioprocess = event => {
        if (capture.current !== session) return
        const data = event.inputBuffer.getChannelData(0).slice()
        session.chunks.push(data)
        let energy = 0
        for (let i=0;i<data.length;i+=4) energy += data[i]*data[i]
        const rms = Math.sqrt(energy / Math.max(1,Math.ceil(data.length/4)))
        if (rms > 0.012) session.lastSpeechAt = performance.now()
        if (performance.now()-session.lastSpeechAt >= 5000) stopVoice()
        if (session.chunks.length > 5500) stopVoice()
      }
      source.connect(processor); processor.connect(silentGain); silentGain.connect(context.destination)
      capture.current = session; setTranscript(''); setValue(''); setNotice('Wispr Flow is listening. Audio is sent to the configured provider after you stop.'); setListening(true)
    } catch { setNotice('Microphone access failed. Use browser speech or type your question.'); setListening(false) }
  }

  function encodeWav(chunks: Float32Array[], inputRate: number): string {
    const input = new Float32Array(chunks.reduce((sum,chunk)=>sum+chunk.length,0))
    let offset=0; for (const chunk of chunks) {input.set(chunk,offset);offset+=chunk.length}
    const outputRate=16000, outputLength=Math.floor(input.length*outputRate/inputRate)
    const buffer=new ArrayBuffer(44+outputLength*2), view=new DataView(buffer)
    const write=(position:number,value:string)=>{for(let i=0;i<value.length;i++)view.setUint8(position+i,value.charCodeAt(i))}
    write(0,'RIFF');view.setUint32(4,36+outputLength*2,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,outputRate,true);view.setUint32(28,outputRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,outputLength*2,true)
    for(let i=0;i<outputLength;i++){const sample=input[Math.floor(i*inputRate/outputRate)]||0;view.setInt16(44+i*2,Math.max(-1,Math.min(1,sample))<0?Math.max(-1,Math.min(1,sample))*32768:Math.min(1,sample)*32767,true)}
    const bytes=new Uint8Array(buffer);let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+0x8000,bytes.length)))
    return btoa(binary)
  }

  async function finishWispr(session: WisprCapture) {
    try {
      session.processor.disconnect();session.source.disconnect();session.silentGain.disconnect();session.stream.getTracks().forEach(track=>track.stop());
      const audio=encodeWav(session.chunks,session.context.sampleRate);await session.context.close()
      if (audio.length < 100) {setNotice('No speech was captured. Type your question or try speaking again.');return}
      setNotice('Transcribing with Wispr Flow…')
      const result=await fetch(`${API}/api/voice/wispr/transcribe`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audio,language,dictionary})})
      if(!result.ok) throw new Error('Wispr transcription is unavailable')
      const data=await result.json() as {text:string;language?:string}
      setTranscript(data.text);setValue(data.text);fromVoice.current=true;setNotice(data.text?'Wispr transcript ready. Review or edit before sending.':'No speech was recognized; please try again.')
      if(data.text&&handsFreeRef.current) await send(data.text)
    } catch {
      setNotice('Wispr Flow could not transcribe this recording. Trying browser speech recognition is available from the microphone button.')
      forceBrowserVoice.current=true
      if(handsFreeRef.current) setHandsFree(false)
      if(window.SpeechRecognition||window.webkitSpeechRecognition) startBrowserVoice()
    }
  }

  function startBrowserVoice() {
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Constructor) { setHandsFree(false); handsFreeRef.current = false; setNotice('This browser does not support speech recognition. Type your question instead.'); return }
    try {
      const instance = new Constructor()
      instance.lang = ({en:'en-IN',hi:'hi-IN',kn:'kn-IN',mr:'mr-IN',gu:'gu-IN',ta:'ta-IN'} as Record<string,string>)[language] || 'en-IN'
      instance.continuous = true; instance.interimResults = true
      instance.onresult = event => {
        const words = Array.from({length:event.results.length}, (_,i) => event.results[i][0].transcript).join(' ').trim()
        setTranscript(words); setValue(words); fromVoice.current = true
        window.clearTimeout(silence.current)
        silence.current = window.setTimeout(() => { stopVoice(); if (handsFreeRef.current) void send(words); else setNotice('Listening stopped after five seconds of silence. Review the transcript before sending.') }, 5000)
      }
      instance.onerror = () => { setNotice('Speech input failed. Edit the transcript or type your question.'); stopVoice() }
      instance.onend = () => { setListening(false); rec.current = null }
      rec.current = instance; setTranscript(''); setNotice('Listening. Recording stops after five seconds of silence.'); setListening(true); instance.start()
    } catch { setNotice('Microphone permission or speech recognition is unavailable. Type your question instead.'); setListening(false) }
  }

  function stopVoice() {
    window.clearTimeout(silence.current)
    if(capture.current){const current=capture.current;capture.current=null;setListening(false);void finishWispr(current);return}
    rec.current?.stop();rec.current=null;setListening(false)
  }

  async function explain() {
    try {
      const result = await fetch(`${API}/api/education/explain`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({term,language})})
      if (!result.ok) throw new Error()
      setExplanation(await result.json())
    } catch { setNotice('The local glossary service is unavailable. Start the backend and try again.') }
  }

  function addAlias(event: FormEvent) { event.preventDefault(); if (!alias.trim() || !ticker.trim()) return; setDictionary(current => ({...current,[alias.trim()]:ticker.trim().toUpperCase()})); setAlias(''); setTicker('') }

  return <div className="voice-overlay" onClick={onClose}><section className="voice-panel tfai-panel" onClick={event => event.stopPropagation()} aria-label="TradeFlow AI and voice assistant">
    <div className="voice-panel-top"><div><span className="section-kicker">TRADEFLOW AI · DEMO MODE</span><h3>What would you like to know?</h3></div><button className="icon-button" onClick={onClose} aria-label="Close assistant"><X size={18}/></button></div>
    <div className="tfai-controls"><label>Reply language <select value={language} onChange={event => setLanguage(event.target.value)}>{LANGUAGES.map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></label><button className={handsFree?'tfai-on':''} onClick={() => {const next=!handsFree;setHandsFree(next);if(next)startVoice();else{handsFreeRef.current=false;stopVoice();window.speechSynthesis?.cancel()}}}><Headphones size={15}/> Hands-free {handsFree?'on':'off'}</button></div>
    <div className="tfai-messages" aria-live="polite">
      {messages.map((message,index) => (
        <article className={`tfai-message ${message.role}`} key={`${index}-${message.text.slice(0,12)}`}>
          <b>{message.role==='assistant'?'TRADEFLOW':'YOU'}{message.reply?.intent&&<span> · {message.reply.intent.replaceAll('_',' ')}</span>}</b>
          <p>{message.text}</p>
          {message.reply?.action_payload&&<small className="tfai-preview">Reviewable order preview · {String(message.reply.action_payload.side)} {String(message.reply.action_payload.quantity)} {String(message.reply.action_payload.symbol)} · not submitted</small>}
          {message.reply?.sources?.map((source,i)=><small className="tfai-source" key={i}>Source: {source.label}{source.timestamp?` · ${source.timestamp}`:''}</small>)}
          {message.role==='assistant' && <>
            {message.reply?.suggested_actions?.map(action=><button key={action.id} className="tfai-action" onClick={() => setNotice(action.id==='REVIEW_ORDER'?'Review the order details above. No order is sent or approved in this demo.':`“${action.label}” is available as a suggestion; this demo stays on the current screen.`)}>{action.label}</button>)}
            <button className="tfai-listen" onClick={() => speak(message.text,message.reply?.response_language||'en')}><Play size={12}/> Listen</button>
          </>}
        </article>
      ))}
      {busy&&<div className="tfai-status">Thinking…</div>}
    </div>
    {transcript&&listening&&<div className="tfai-status"><Mic size={13}/> Transcript: “{transcript}”</div>}{notice&&<div className="tfai-notice" role="status">{notice}</div>}
    <form className="tfai-composer" onSubmit={(event:FormEvent)=>{event.preventDefault();void send()}}><button type="button" className={listening?'tfai-recording':''} aria-label={listening?'Stop listening':'Start voice input'} onClick={()=>listening?stopVoice():startVoice()}>{listening?<Square size={16}/>:<Mic size={17}/>}</button><input value={value} onChange={event=>{setValue(event.target.value);fromVoice.current=false}} placeholder="Type or speak a question…" aria-label="Ask TradeFlow"/><button type="submit" disabled={!value.trim()||busy} aria-label="Send question"><Send size={15}/></button></form>
    <div className="tfai-lower"><section><b>Research shortcuts</b><div className="tfai-preset-list">{PRESETS.map(prompt=><button key={prompt} onClick={()=>void send(prompt)}>{prompt} ↗</button>)}</div></section>
    <div className="tfai-tools"><section><b><BookOpen size={14}/> Explain a term</b><form onSubmit={(event:FormEvent)=>{event.preventDefault();void explain()}}><input value={term} onChange={event=>setTerm(event.target.value)} aria-label="Financial term"/><button type="submit">Explain</button></form>{explanation&&<div className="tfai-explanation"><button className="tfai-close" aria-label="Close explanation" onClick={()=>setExplanation(null)}><X size={13}/></button><strong>{explanation.term}</strong><p>{explanation.definition}</p><small>Example</small><p>{explanation.example}</p><div><button onClick={()=>speak(`${explanation.definition} ${explanation.example}`,explanation.response_language||'en')}><Play size={12}/> Listen</button><button onClick={()=>window.speechSynthesis?.pause()}><Pause size={12}/> Pause</button><button onClick={()=>window.speechSynthesis?.resume()}><Play size={12}/> Resume</button><button onClick={()=>{window.speechSynthesis?.cancel();speak(`${explanation.definition} ${explanation.example}`,explanation.response_language||'en')}}><RotateCcw size={12}/> Replay</button></div></div>}</section>
    <section><b><ShieldCheck size={14}/> Personal stock aliases</b><form className="tfai-alias-form" onSubmit={addAlias}><input placeholder="Nickname" value={alias} onChange={event=>setAlias(event.target.value)} aria-label="Stock nickname"/><input placeholder="Ticker" value={ticker} onChange={event=>setTicker(event.target.value)} aria-label="Ticker symbol"/><button type="submit">+</button></form><div className="tfai-aliases">{Object.entries(dictionary).map(([name,symbol])=><span key={name}>{name} → {symbol}<button aria-label={`Remove ${name}`} onClick={()=>setDictionary(current=>{const next={...current};delete next[name];return next})}><X size={11}/></button></span>)}</div></section></div></div>
    <footer className="tfai-safety">Demo knowledge is not live data. The assistant can prepare an order preview but never submits an order.</footer>
  </section></div>
}
