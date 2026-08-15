/** Mirror of the backend platform catalog (live-translation.types.ts).
 *  Names render native-first with the English form beside them (spec §38). */
export interface CatalogLanguage {
  code: string;
  englishName: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_CATALOG: CatalogLanguage[] = [
  { code: 'en-US', englishName: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es-US', englishName: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh-CN', englishName: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'fr-FR', englishName: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt-PT', englishName: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'de-DE', englishName: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', englishName: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ko-KR', englishName: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ja-JP', englishName: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar-EG', englishName: 'Arabic', nativeName: 'العربية', flag: '🇪🇬' },
  { code: 'hi-IN', englishName: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru-RU', englishName: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'vi-VN', englishName: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ig-NG', englishName: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬' },
  { code: 'yo-NG', englishName: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ha-NG', englishName: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' },
];

export function languageByCode(code: string): CatalogLanguage {
  return (
    LANGUAGE_CATALOG.find((l) => l.code === code) ?? {
      code,
      englishName: code,
      nativeName: code,
      flag: '🌐',
    }
  );
}

/** "中文 (Chinese)" — native first, English in parentheses when they differ. */
export function displayName(code: string): string {
  const lang = languageByCode(code);
  return lang.nativeName === lang.englishName
    ? lang.englishName
    : `${lang.nativeName} (${lang.englishName})`;
}
