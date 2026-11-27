import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, Sparkles } from 'lucide-react'
import { getLanguageOption, WISPR_LANGUAGES } from './languages'

type LanguageSelectorProps = {
  value: string
  mostSpokenLanguage: string | null
  onChange: (code: string) => void
}

export default function LanguageSelector({ value, mostSpokenLanguage, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selected = getLanguageOption(value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? WISPR_LANGUAGES.filter(
          lang =>
            lang.name.toLowerCase().includes(q) ||
            lang.nativeName.toLowerCase().includes(q) ||
            lang.code.toLowerCase().includes(q),
        )
      : [...WISPR_LANGUAGES].sort((a, b) => {
          if (a.code === mostSpokenLanguage) return -1
          if (b.code === mostSpokenLanguage) return 1
          return 0
        })
    return list
  }, [query, mostSpokenLanguage])

  useEffect(() => {
    if (!open) return
    setHighlightedIndex(0)
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  function selectLanguage(code: string) {
    onChange(code)
    setOpen(false)
    setQuery('')
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex(i => (filtered.length ? (i + 1) % filtered.length : 0))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex(i => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0))
      return
    }
    if (event.key === 'Enter' && filtered[highlightedIndex]) {
      event.preventDefault()
      selectLanguage(filtered[highlightedIndex].code)
    }
  }

  const labelText =
    selected.nativeName === selected.name ? selected.name : `${selected.nativeName} (${selected.name})`

  return (
    <div className="tfai-lang-picker" ref={containerRef}>
      <button
        type="button"
        className="tfai-lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Reply language"
        onClick={() => setOpen(current => !current)}
      >
        <span>{labelText}</span>
        {mostSpokenLanguage === value && (
          <span className="tfai-lang-badge" title="Default from voice profile (most frequently spoken)">
            <Sparkles size={11} />
            Voice profile
          </span>
        )}
        <ChevronDown size={14} className={open ? 'tfai-chevron-open' : ''} />
      </button>

      {open && (
        <div className="tfai-lang-menu" onKeyDown={handleKeyDown}>
          <div className="tfai-lang-search">
            <Search size={13} />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={event => {
                setQuery(event.target.value)
                setHighlightedIndex(0)
              }}
              placeholder="Search 100+ Wispr languages…"
              aria-label="Search reply languages"
            />
          </div>

          <ul className="tfai-lang-list" role="listbox" aria-label="Supported languages">
            {filtered.length === 0 ? (
              <li className="tfai-lang-empty">No languages match “{query}”</li>
            ) : (
              filtered.map((lang, index) => {
                const isSelected = lang.code === value
                const isMostSpoken = lang.code === mostSpokenLanguage
                const isHighlighted = index === highlightedIndex
                return (
                  <li key={lang.code} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={`tfai-lang-option${isSelected ? ' selected' : ''}${isHighlighted ? ' highlighted' : ''}`}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => selectLanguage(lang.code)}
                    >
                      <span className="tfai-lang-names">
                        <strong>{lang.nativeName}</strong>
                        {lang.nativeName !== lang.name && <small>{lang.name}</small>}
                        <small className="tfai-lang-code">{lang.code}</small>
                      </span>
                      <span className="tfai-lang-meta">
                        {isMostSpoken && <span className="tfai-lang-profile-tag">Most spoken</span>}
                        {isSelected && <Check size={13} />}
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
