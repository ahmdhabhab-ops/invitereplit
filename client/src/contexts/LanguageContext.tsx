import { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language, type Translations } from "@/lib/translations";

const CURRENCY_CONFIG: Record<Language, { symbol: string; rate: number; code: string }> = {
  en: { symbol: "$", rate: 1, code: "USD" },
  fr: { symbol: "€", rate: 0.92, code: "EUR" },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  formatPrice: (usdAmount: number) => string;
  currencySymbol: string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
  formatPrice: (n) => `$${n}`,
  currencySymbol: "$",
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

  const { symbol, rate } = CURRENCY_CONFIG[language];

  const formatPrice = (usdAmount: number) => {
    const converted = Math.round(usdAmount * rate);
    return `${symbol}${converted}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language] as Translations,
        formatPrice,
        currencySymbol: symbol,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
