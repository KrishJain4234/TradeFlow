import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  GraduationCap,
  Layers,
  Mic,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { INDUSTRIES, LESSONS, TRACKS, type IndustryPlaybook, type Lesson, type TrackId } from './learnData'

const PROGRESS_STORAGE_KEY = 'tradeflow-learn-completed'

type ViewFocus = 'all' | TrackId | 'industries'

interface LearnPageProps {
  onAskVoice: (prompt?: string) => void
  onBackHome?: () => void
}

export default function LearnPage({ onAskVoice, onBackHome }: LearnPageProps) {
  const [viewFocus, setViewFocus] = useState<ViewFocus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState<string>(LESSONS[0].id)
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('banking')
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(completedIds))
  }, [completedIds])

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredLessons = useMemo(() => {
    return LESSONS.filter((lesson) => {
      if (viewFocus !== 'all' && viewFocus !== 'industries' && lesson.track !== viewFocus) {
        return false
      }
      if (!normalizedQuery) return true
      return (
        lesson.title.toLowerCase().includes(normalizedQuery) ||
        lesson.summary.toLowerCase().includes(normalizedQuery) ||
        lesson.concepts.some((c) => c.toLowerCase().includes(normalizedQuery)) ||
        lesson.explanation.some((p) => p.toLowerCase().includes(normalizedQuery))
      )
    })
  }, [viewFocus, normalizedQuery])

  const filteredIndustries = useMemo(() => {
    if (!normalizedQuery) return INDUSTRIES
    return INDUSTRIES.filter(
      (ind) =>
        ind.name.toLowerCase().includes(normalizedQuery) ||
        ind.tagline.toLowerCase().includes(normalizedQuery) ||
        ind.howAnalystsJudge.toLowerCase().includes(normalizedQuery) ||
        ind.examples.some((ex) => ex.toLowerCase().includes(normalizedQuery)) ||
        ind.metrics.some(
          (m) =>
            m.name.toLowerCase().includes(normalizedQuery) ||
            m.shortName.toLowerCase().includes(normalizedQuery) ||
            m.whatItMeans.toLowerCase().includes(normalizedQuery) ||
            m.whyItMatters.toLowerCase().includes(normalizedQuery),
        ),
    )
  }, [normalizedQuery])

  const activeLesson: Lesson = useMemo(() => {
    return (
      filteredLessons.find((l) => l.id === selectedLessonId) ||
      filteredLessons[0] ||
      LESSONS.find((l) => l.id === selectedLessonId) ||
      LESSONS[0]
    )
  }, [filteredLessons, selectedLessonId])

  const activeIndustry: IndustryPlaybook = useMemo(() => {
    return (
      filteredIndustries.find((ind) => ind.id === selectedIndustryId) ||
      filteredIndustries[0] ||
      INDUSTRIES[0]
    )
  }, [filteredIndustries, selectedIndustryId])

  const activeTrackMeta = TRACKS.find((t) => t.id === activeLesson.track) || TRACKS[0]
  const activeLessonIndex = LESSONS.findIndex((l) => l.id === activeLesson.id)
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < LESSONS.length - 1 ? LESSONS[activeLessonIndex + 1] : null

  const completionPct = Math.round((completedIds.length / LESSONS.length) * 100)
  const isCompleted = completedIds.includes(activeLesson.id)
  const selectedQuizOption = quizAnswers[activeLesson.id]

  function toggleCompleted(lessonId: string) {
    setCompletedIds((current) =>
      current.includes(lessonId) ? current.filter((id) => id !== lessonId) : [...current, lessonId],
    )
  }

  function handleSelectTrack(track: ViewFocus) {
    setViewFocus(track)
    if (track !== 'all' && track !== 'industries') {
      const firstInTrack = LESSONS.find((l) => l.track === track)
      if (firstInTrack) setSelectedLessonId(firstInTrack.id)
    }
  }

  function handleAnswerQuiz(lessonId: string, optionIndex: number, correctIndex: number) {
    setQuizAnswers((prev) => ({ ...prev, [lessonId]: optionIndex }))
    if (optionIndex === correctIndex && !completedIds.includes(lessonId)) {
      setCompletedIds((prev) => [...prev, lessonId])
    }
  }

  const showCurriculum = viewFocus !== 'industries'
  const showIndustries = viewFocus === 'all' || viewFocus === 'industries'

  return (
    <div className="learn-page">
      {/* HERO */}
      <section className="learn-hero">
        <div className="learn-hero-inner">
          <div className="learn-hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              TradeFlow Academy • Basics to Full Pro
            </div>
            <h1>
              Learn the stock market.
              <br />
              <span>From first share to sector mastery.</span>
            </h1>
            <p>
              Step-by-step lessons covering ownership, stock splits, dividends, valuation ratios, mutual funds, and
              derivatives—paired with real industry playbooks showing how analysts judge banks, IT, pharma, and more.
            </p>
            <div className="learn-hero-actions">
              <button
                className="primary-button"
                onClick={() => {
                  setViewFocus('all')
                  document.getElementById('learn-curriculum')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <GraduationCap size={18} /> Start learning path
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  setViewFocus('industries')
                  setSelectedIndustryId('banking')
                  document.getElementById('learn-industries')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Building2 size={18} /> Explore industry playbooks
              </button>
              {onBackHome && (
                <button className="secondary-button" onClick={onBackHome}>
                  Back to Dashboard
                </button>
              )}
            </div>
          </div>

          <div className="learn-progress-card">
            <div className="learn-progress-top">
              <div>
                <span className="muted-label-dark">YOUR LEARNING PROGRESS</span>
                <strong>
                  {completedIds.length} / {LESSONS.length} lessons completed
                </strong>
              </div>
              <span className="learn-progress-badge">
                <Award size={15} /> {completionPct}%
              </span>
            </div>
            <div className="learn-progress-bar">
              <div className="learn-progress-fill" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="learn-track-mini-grid">
              {TRACKS.map((track) => {
                const trackLessons = LESSONS.filter((l) => l.track === track.id)
                const done = trackLessons.filter((l) => completedIds.includes(l.id)).length
                return (
                  <button
                    key={track.id}
                    className={`learn-track-mini ${viewFocus === track.id ? 'active' : ''}`}
                    onClick={() => handleSelectTrack(track.id)}
                  >
                    <span className="learn-track-dot" style={{ background: track.accent }} />
                    <div>
                      <small>{track.levelLabel.split('•')[0].trim()}</small>
                      <strong>
                        {done}/{trackLessons.length} done
                      </strong>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <section className="learn-toolbar-wrap">
        <div className="learn-toolbar">
          <div className="learn-filter-pills" role="tablist" aria-label="Learning sections">
            <button
              className={`learn-pill ${viewFocus === 'all' ? 'active' : ''}`}
              onClick={() => handleSelectTrack('all')}
            >
              <Layers size={15} /> All Topics
            </button>
            {TRACKS.map((track) => (
              <button
                key={track.id}
                className={`learn-pill ${viewFocus === track.id ? 'active' : ''}`}
                onClick={() => handleSelectTrack(track.id)}
              >
                <span className="learn-pill-dot" style={{ background: track.accent }} />
                {track.levelLabel.replace('• ', '')}
              </button>
            ))}
            <button
              className={`learn-pill ${viewFocus === 'industries' ? 'active' : ''}`}
              onClick={() => handleSelectTrack('industries')}
            >
              <Building2 size={15} /> Industry Playbooks ({INDUSTRIES.length})
            </button>
          </div>

          <div className="learn-search">
            <Search size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics or metrics (e.g. split, CASA, P/E, options)…"
              aria-label="Search learn topics"
            />
            {searchQuery && (
              <button className="learn-search-clear" onClick={() => setSearchQuery('')}>
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CURRICULUM: BASICS TO PRO */}
      {showCurriculum && (
        <section id="learn-curriculum" className="learn-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">STRUCTURED CURRICULUM</span>
              <h2>From market basics to full pro derivatives</h2>
            </div>
            <button className="text-button" onClick={() => onAskVoice(activeLesson.voicePrompt)}>
              <Mic size={15} /> Ask TradeFlow about “{activeLesson.title.split(':')[0]}”
            </button>
          </div>

          {filteredLessons.length === 0 ? (
            <div className="learn-empty">
              <p>No curriculum lessons matched “{searchQuery}”. Check the Industry Playbooks below or clear your search.</p>
            </div>
          ) : (
            <div className="learn-workspace">
              {/* LEFT: LESSON LIST GROUPED BY TRACK */}
              <aside className="learn-sidebar" aria-label="Curriculum lessons">
                {TRACKS.filter((t) => viewFocus === 'all' || viewFocus === t.id).map((track) => {
                  const lessonsInTrack = filteredLessons.filter((l) => l.track === track.id)
                  if (lessonsInTrack.length === 0) return null
                  return (
                    <div className="learn-track-group" key={track.id}>
                      <div className="learn-track-header">
                        <span className="learn-track-badge" style={{ color: track.accent, borderColor: `${track.accent}44`, background: `${track.accent}14` }}>
                          {track.levelLabel}
                        </span>
                        <h3>{track.title}</h3>
                      </div>
                      <div className="learn-lesson-list">
                        {lessonsInTrack.map((lesson) => {
                          const selected = lesson.id === activeLesson.id
                          const done = completedIds.includes(lesson.id)
                          return (
                            <button
                              key={lesson.id}
                              className={`learn-lesson-item ${selected ? 'selected' : ''} ${done ? 'done' : ''}`}
                              onClick={() => setSelectedLessonId(lesson.id)}
                            >
                              <span className="learn-lesson-num">{done ? <CheckCircle2 size={16} /> : lesson.number}</span>
                              <div className="learn-lesson-meta">
                                <strong>{lesson.title}</strong>
                                <small>{lesson.readTime} read • {lesson.concepts.slice(0, 2).join(', ')}</small>
                              </div>
                              <ChevronRight size={15} className="learn-lesson-arrow" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </aside>

              {/* RIGHT: ACTIVE LESSON READER */}
              <article className="learn-reader">
                <div className="learn-reader-top">
                  <div className="learn-reader-badges">
                    <span
                      className="learn-track-badge"
                      style={{
                        color: activeTrackMeta.accent,
                        borderColor: `${activeTrackMeta.accent}44`,
                        background: `${activeTrackMeta.accent}14`,
                      }}
                    >
                      {activeTrackMeta.levelLabel}
                    </span>
                    <span className="learn-read-time">Lesson {activeLesson.number} • {activeLesson.readTime}</span>
                  </div>
                  <button
                    className={`learn-complete-btn ${isCompleted ? 'completed' : ''}`}
                    onClick={() => toggleCompleted(activeLesson.id)}
                  >
                    <CheckCircle2 size={16} />
                    {isCompleted ? 'Completed' : 'Mark complete'}
                  </button>
                </div>

                <h2>{activeLesson.title}</h2>
                <p className="learn-reader-summary">{activeLesson.summary}</p>

                <div className="learn-concept-chips">
                  {activeLesson.concepts.map((concept) => (
                    <span key={concept}>{concept}</span>
                  ))}
                </div>

                <div className="learn-reader-body">
                  {activeLesson.explanation.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {activeLesson.formula && (
                  <div className="learn-formula-box">
                    <span>{activeLesson.formula.label}</span>
                    <code>{activeLesson.formula.expression}</code>
                  </div>
                )}

                <div className="learn-callouts">
                  <div className="learn-example-card">
                    <div className="learn-callout-title">
                      <Sparkles size={16} /> {activeLesson.exampleTitle}
                    </div>
                    <p>{activeLesson.exampleBody}</p>
                  </div>

                  <div className="learn-watchout-card">
                    <div className="learn-callout-title">
                      <AlertTriangle size={16} /> Watch out for
                    </div>
                    <p>{activeLesson.watchOut}</p>
                  </div>
                </div>

                {/* INTERACTIVE MINI QUIZ */}
                <div className="learn-quiz-card">
                  <div className="learn-quiz-head">
                    <span>QUICK CHECK</span>
                    <strong>{activeLesson.quiz.question}</strong>
                  </div>
                  <div className="learn-quiz-options">
                    {activeLesson.quiz.options.map((option, idx) => {
                      const picked = selectedQuizOption === idx
                      const isCorrect = idx === activeLesson.quiz.correctIndex
                      const showResult = selectedQuizOption !== undefined
                      let stateClass = ''
                      if (showResult) {
                        if (isCorrect) stateClass = 'correct'
                        else if (picked) stateClass = 'wrong'
                      }
                      return (
                        <button
                          key={option}
                          className={`learn-quiz-option ${picked ? 'picked' : ''} ${stateClass}`}
                          onClick={() => handleAnswerQuiz(activeLesson.id, idx, activeLesson.quiz.correctIndex)}
                        >
                          <span>{String.fromCharCode(65 + idx)}</span>
                          <span>{option}</span>
                        </button>
                      )
                    })}
                  </div>
                  {selectedQuizOption !== undefined && (
                    <div
                      className={`learn-quiz-feedback ${
                        selectedQuizOption === activeLesson.quiz.correctIndex ? 'correct' : 'wrong'
                      }`}
                    >
                      <strong>
                        {selectedQuizOption === activeLesson.quiz.correctIndex ? 'Correct! ' : 'Not quite. '}
                      </strong>
                      {activeLesson.quiz.explanation}
                    </div>
                  )}
                </div>

                <div className="learn-reader-footer">
                  <button className="secondary-light-btn" onClick={() => onAskVoice(activeLesson.voicePrompt)}>
                    <Mic size={16} /> Practice with TradeFlow AI
                  </button>
                  {nextLesson && (
                    <button
                      className="primary-button"
                      onClick={() => {
                        setSelectedLessonId(nextLesson.id)
                        if (viewFocus !== 'all' && viewFocus !== nextLesson.track) {
                          setViewFocus(nextLesson.track)
                        }
                      }}
                    >
                      Next: {nextLesson.title.split(':')[0]} <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </article>
            </div>
          )}
        </section>
      )}

      {/* INDUSTRY PLAYBOOKS */}
      {showIndustries && (
        <section id="learn-industries" className="learn-section learn-industries-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">SECTOR INTELLIGENCE</span>
              <h2>Industry Playbooks: How each sector is actually judged</h2>
            </div>
            <button className="text-button" onClick={() => onAskVoice(activeIndustry.voicePrompt)}>
              <Compass size={15} /> Ask AI about {activeIndustry.name}
            </button>
          </div>

          <p className="learn-section-lead">
            A P/E ratio means very different things in Banking vs Metals vs IT. Pick an industry to learn the exact
            ratios, unit economics, and red flags analysts inspect before valuing companies in that sector.
          </p>

          {filteredIndustries.length === 0 ? (
            <div className="learn-empty">
              <p>No industries matched “{searchQuery}”.</p>
            </div>
          ) : (
            <>
              <div className="learn-industry-tabs" role="tablist" aria-label="Industries">
                {filteredIndustries.map((industry) => (
                  <button
                    key={industry.id}
                    className={`learn-industry-tab ${activeIndustry.id === industry.id ? 'active' : ''}`}
                    onClick={() => setSelectedIndustryId(industry.id)}
                  >
                    <Building2 size={16} />
                    <span>{industry.name}</span>
                  </button>
                ))}
              </div>

              <div className="learn-industry-board">
                <div className="learn-industry-overview">
                  <div>
                    <span className="learn-sector-tag">INDUSTRY PLAYBOOK</span>
                    <h3>{activeIndustry.name}</h3>
                    <p className="learn-industry-tagline">{activeIndustry.tagline}</p>
                    <div className="learn-industry-examples">
                      <span>Indian Leaders:</span>
                      {activeIndustry.examples.map((ex) => (
                        <em key={ex}>{ex}</em>
                      ))}
                    </div>
                  </div>
                  <div className="learn-valuation-card">
                    <span>PRIMARY VALUATION LENS</span>
                    <strong>{activeIndustry.valuationAnchor}</strong>
                  </div>
                </div>

                <div className="learn-how-judged">
                  <strong>
                    <BookOpen size={16} /> How analysts judge {activeIndustry.name}
                  </strong>
                  <p>{activeIndustry.howAnalystsJudge}</p>
                </div>

                <h4 className="learn-metrics-heading">Key Sector Metrics & Ratios</h4>
                <div className="learn-metrics-grid">
                  {activeIndustry.metrics.map((metric) => (
                    <div className="learn-metric-card" key={metric.name}>
                      <div className="learn-metric-top">
                        <strong>{metric.name}</strong>
                        <span className="learn-benchmark-pill">{metric.healthyBenchmark}</span>
                      </div>
                      <p className="learn-metric-desc">{metric.whatItMeans}</p>
                      <div className="learn-metric-why">
                        <span>Why it matters:</span> {metric.whyItMatters}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="learn-drivers-grid">
                  <div className="learn-driver-box bull">
                    <h5>
                      <TrendingUp size={16} /> What drives the sector higher
                    </h5>
                    <ul>
                      {activeIndustry.bullDrivers.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="learn-driver-box bear">
                    <h5>
                      <AlertTriangle size={16} /> Sector red flags to watch
                    </h5>
                    <ul>
                      {activeIndustry.redFlags.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
