import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../context/CurrencyContext';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageCurrencySelector = () => {
    const { t, i18n } = useTranslation();
    const { currency, setCurrency, currencies } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
    const currentCurrency = currencies.find(c => c.code === currency);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
    };

    const handleCurrencyChange = (currencyCode) => {
        setCurrency(currencyCode);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
                <Globe size={18} />
                <span className="hidden sm:inline">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                <span className="hidden sm:inline">/ {currentCurrency?.symbol}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {/* Language Section */}
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('settings.language')}
                        </p>
                    </div>
                    <div className="py-1">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${i18n.language === lang.code
                                        ? 'text-primary bg-primary-light/50 dark:bg-primary/10'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span>{lang.name}</span>
                                {i18n.language === lang.code && (
                                    <span className="ml-auto text-primary">✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Currency Section */}
                    <div className="px-3 py-2 border-t border-b border-gray-200 dark:border-gray-700 mt-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('settings.currency')}
                        </p>
                    </div>
                    <div className="py-1">
                        {currencies.map(curr => (
                            <button
                                key={curr.code}
                                onClick={() => handleCurrencyChange(curr.code)}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${currency === curr.code
                                        ? 'text-primary bg-primary-light/50 dark:bg-primary/10'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <span className="font-medium w-6">{curr.symbol}</span>
                                <span>{curr.name}</span>
                                {currency === curr.code && (
                                    <span className="ml-auto text-primary">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageCurrencySelector;


