export type LanguageOption = {
  code: string
  name: string
  nativeName: string
  locale?: string
}

export type VoiceProfile = {
  languageCounts: Record<string, number>
  lastSpokenLanguage?: string
}

const VOICE_PROFILE_KEY = 'tradeflow-voice-profile'
const FALLBACK_LANGUAGE_KEY = 'tradeflow-language'

/**
 * Languages supported by Wispr Flow (ISO 639-1 codes).
 * Includes English name, native name, and BCP-47 locale for browser speech fallback.
 */
export const WISPR_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', locale: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', locale: 'hi-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', locale: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', locale: 'gu-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', locale: 'ta-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', locale: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', locale: 'te-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', locale: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', locale: 'pa-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', locale: 'ur-PK' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', locale: 'or-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', locale: 'as-IN' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', locale: 'ne-NP' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', locale: 'sa-IN' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', locale: 'sd-IN' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', locale: 'si-LK' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', locale: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', locale: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', locale: 'de-DE' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', locale: 'pt-PT' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', locale: 'it-IT' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', locale: 'nl-NL' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', locale: 'ru-RU' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', locale: 'zh-CN' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', locale: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', locale: 'ko-KR' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', locale: 'ar-SA' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', locale: 'tr-TR' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', locale: 'vi-VN' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', locale: 'th-TH' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', locale: 'id-ID' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', locale: 'ms-MY' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', locale: 'tl-PH' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', locale: 'pl-PL' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', locale: 'uk-UA' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', locale: 'cs-CZ' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', locale: 'sk-SK' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', locale: 'ro-RO' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', locale: 'hu-HU' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', locale: 'el-GR' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', locale: 'sv-SE' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', locale: 'da-DK' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', locale: 'nb-NO' },
  { code: 'nn', name: 'Norwegian Nynorsk', nativeName: 'Nynorsk', locale: 'nn-NO' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', locale: 'fi-FI' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', locale: 'is-IS' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', locale: 'he-IL' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', locale: 'fa-IR' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', locale: 'ps-AF' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', locale: 'sw-KE' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', locale: 'am-ET' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', locale: 'af-ZA' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', locale: 'sq-AL' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', locale: 'hy-AM' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', locale: 'az-AZ' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', locale: 'eu-ES' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', locale: 'be-BY' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', locale: 'bs-BA' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', locale: 'bg-BG' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', locale: 'ca-ES' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', locale: 'hr-HR' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', locale: 'et-EE' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', locale: 'gl-ES' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', locale: 'ka-GE' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', locale: 'ht-HT' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', locale: 'ha-NG' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi', locale: 'haw-US' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', locale: 'ig-NG' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', locale: 'ga-IE' },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', locale: 'jv-ID' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', locale: 'kk-KZ' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', locale: 'km-KH' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', locale: 'ky-KG' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', locale: 'lo-LA' },
  { code: 'la', name: 'Latin', nativeName: 'Latina', locale: 'la' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', locale: 'lv-LV' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', locale: 'lt-LT' },
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch', locale: 'lb-LU' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', locale: 'mk-MK' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy', locale: 'mg-MG' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', locale: 'mt-MT' },
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori', locale: 'mi-NZ' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', locale: 'mn-MN' },
  { code: 'my', name: 'Myanmar (Burmese)', nativeName: 'မြန်မာ', locale: 'my-MM' },
  { code: 'oc', name: 'Occitan', nativeName: 'Occitan', locale: 'oc-FR' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', locale: 'sr-RS' },
  { code: 'sn', name: 'Shona', nativeName: 'ChiShona', locale: 'sn-ZW' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', locale: 'sl-SI' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', locale: 'so-SO' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', locale: 'su-ID' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', locale: 'tg-TJ' },
  { code: 'tt', name: 'Tatar', nativeName: 'Татарча', locale: 'tt-RU' },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་སྐད', locale: 'bo-CN' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmençe', locale: 'tk-TM' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek', locale: 'uz-UZ' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', locale: 'cy-GB' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', locale: 'xh-ZA' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש', locale: 'yi' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', locale: 'yo-NG' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', locale: 'zu-ZA' },
  { code: 'ba', name: 'Bashkir', nativeName: 'Башҡортса', locale: 'ba-RU' },
  { code: 'br', name: 'Breton', nativeName: 'Brezhoneg', locale: 'br-FR' },
  { code: 'fo', name: 'Faroese', nativeName: 'Føroyskt', locale: 'fo-FO' },
  { code: 'ln', name: 'Lingala', nativeName: 'Lingála', locale: 'ln-CD' },
]

const LANGUAGE_MAP = new Map(WISPR_LANGUAGES.map(lang => [lang.code, lang]))

export function normalizeLanguageCode(raw?: string | null): string | null {
  if (!raw) return null
  const cleaned = raw.trim().toLowerCase()
  const base = cleaned.split(/[-_]/)[0]
  if (LANGUAGE_MAP.has(base)) return base
  const byName = WISPR_LANGUAGES.find(
    lang => lang.name.toLowerCase() === cleaned || lang.nativeName.toLowerCase() === cleaned,
  )
  return byName ? byName.code : null
}

export function getLanguageOption(code: string): LanguageOption {
  return LANGUAGE_MAP.get(code) ?? WISPR_LANGUAGES[0]
}

export function getSpeechLocale(code: string): string {
  return LANGUAGE_MAP.get(code)?.locale ?? code
}

export function loadVoiceProfile(): VoiceProfile {
  try {
    const raw = localStorage.getItem(VOICE_PROFILE_KEY)
    if (!raw) return { languageCounts: {} }
    const parsed = JSON.parse(raw) as Partial<VoiceProfile>
    return {
      languageCounts: parsed.languageCounts && typeof parsed.languageCounts === 'object' ? parsed.languageCounts : {},
      lastSpokenLanguage: typeof parsed.lastSpokenLanguage === 'string' ? parsed.lastSpokenLanguage : undefined,
    }
  } catch {
    return { languageCounts: {} }
  }
}

export function getMostFrequentLanguage(profile: VoiceProfile): string | null {
  let topCode: string | null = null
  let topCount = 0
  for (const [code, count] of Object.entries(profile.languageCounts)) {
    if (!LANGUAGE_MAP.has(code) || typeof count !== 'number' || count <= 0) continue
    if (count > topCount || (count === topCount && code === profile.lastSpokenLanguage)) {
      topCode = code
      topCount = count
    }
  }
  return topCode
}

export function getDefaultLanguageFromVoiceProfile(): string {
  const profile = loadVoiceProfile()
  const mostFrequent = getMostFrequentLanguage(profile)
  if (mostFrequent) return mostFrequent
  const saved = normalizeLanguageCode(localStorage.getItem(FALLBACK_LANGUAGE_KEY))
  return saved ?? 'en'
}

export function recordSpokenLanguage(rawLanguage: string): VoiceProfile {
  const code = normalizeLanguageCode(rawLanguage)
  const profile = loadVoiceProfile()
  if (!code) return profile
  const next: VoiceProfile = {
    languageCounts: {
      ...profile.languageCounts,
      [code]: (profile.languageCounts[code] ?? 0) + 1,
    },
    lastSpokenLanguage: code,
  }
  try {
    localStorage.setItem(VOICE_PROFILE_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage quota errors
  }
  return next
}
