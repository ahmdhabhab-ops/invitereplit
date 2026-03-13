import { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language, type Translations } from "@/lib/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

function detectLanguage(): Language {
  const stored = localStorage.getItem("einvite-language");
  if (stored === "fr" || stored === "en") return stored;
  const browserLang = navigator.language || (navigator as any).userLanguage || "";
  if (browserLang.toLowerCase().startsWith("fr")) return "fr";
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const detected = detectLanguage();
    setLanguageState(detected);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("einvite-language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] as Translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
