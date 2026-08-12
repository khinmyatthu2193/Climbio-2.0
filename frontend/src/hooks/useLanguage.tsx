import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import english from '@/locales/en.json';
import myanmar from '@/locales/my.json';

export type Language = 'en' | 'my';
type Dictionary = Record<string, string>;
const dictionaries: Record<Language, Dictionary> = { en: english, my: myanmar };
const myanmarToEnglish = new Map(Object.entries(myanmar).map(([key, value]) => [value, key]));

function translateText(value: string, language: Language) {
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const text = value.trim();
  if (!text) return value;
  const englishKey = english[text as keyof typeof english] ? text : myanmarToEnglish.get(text);
  if (!englishKey) return value;
  return `${leading}${dictionaries[language][englishKey] ?? englishKey}${trailing}`;
}

interface LanguageValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  translate: (text: string) => string;
}
const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem('climbio-language') === 'my' ? 'my' : 'en');
  const setLanguage = (next: Language) => { localStorage.setItem('climbio-language', next); setLanguageState(next); };

  useEffect(() => {
    document.documentElement.lang = language === 'my' ? 'my' : 'en';
    const translateElement = (element: Element) => {
      for (const attribute of ['placeholder', 'title', 'aria-label']) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, translateText(value, language));
      }
      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue) node.nodeValue = translateText(node.nodeValue, language);
        else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node as Element);
      });
    };
    const root = document.getElementById('root');
    if (!root) return;
    translateElement(root);
    const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue) node.nodeValue = translateText(node.nodeValue, language);
      else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node as Element);
    })));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo<LanguageValue>(() => ({ language, setLanguage, toggleLanguage: () => setLanguage(language === 'en' ? 'my' : 'en'), translate: (text) => translateText(text, language) }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
