import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Instagram, Twitter, Facebook } from 'lucide-react';
import { taglinePart1, taglinePart2, fullName, social, api } from '../config/branding';

const Footer = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        const apiUrl = process.env.NODE_ENV === 'production' ? api.production : api.development;
        try {
            await axios.post(`${apiUrl}/api/newsletter`, { email });
            toast.success(t('footer.subscribeSuccess', '¡Suscrito correctamente!'));
            setEmail('');
        } catch (error) {
            const message = error.response?.data?.message || t('common.error');
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const footerLinks = {
        shop: [
            { label: t('nav.men'), href: '/?category=Hombre' },
            { label: t('nav.women'), href: '/?category=Mujer' },
            { label: t('nav.kids'), href: '/?category=Niños' },
            { label: t('nav.accessories'), href: '/?category=Accesorios' },
        ],
        help: [
            { label: t('order.trackOrder'), href: '/track-order' },
            { label: t('nav.cart'), href: '/cart' },
            { label: t('nav.profile'), href: '/profile' },
        ],
    };

    return (
        <footer className="bg-neutral-950 text-white pt-16 pb-8 mt-auto print:hidden">
            <div className="container-main">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <h3 className="text-xl font-semibold tracking-[0.15em] uppercase mb-4">
                            {taglinePart1}<span className="font-light">{taglinePart2}</span>
                        </h3>
                        <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                            {t('footer.tagline')}
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {social.instagram && (
                                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors" aria-label="Instagram">
                                    <Instagram size={18} strokeWidth={1.5} />
                                </a>
                            )}
                            {social.twitter && (
                                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors" aria-label="Twitter">
                                    <Twitter size={18} strokeWidth={1.5} />
                                </a>
                            )}
                            {social.facebook && (
                                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors" aria-label="Facebook">
                                    <Facebook size={18} strokeWidth={1.5} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-4">
                            {t('footer.shop')}
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-neutral-300 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help Links */}
                    <div>
                        <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-4">
                            {t('footer.help')}
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.help.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-neutral-300 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-4">
                            {t('footer.newsletter')}
                        </h4>
                        <p className="text-sm text-neutral-400 mb-4">
                            {t('footer.newsletterDesc')}
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={16} className="text-neutral-500" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('footer.emailPlaceholder')}
                                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 focus:border-neutral-600 text-white placeholder:text-neutral-500 text-sm transition-colors outline-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-white text-neutral-900 text-sm font-medium uppercase tracking-wider hover:bg-neutral-100 transition-colors disabled:opacity-50"
                            >
                                {loading ? '...' : t('footer.subscribe')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-neutral-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-neutral-500">
                            © {new Date().getFullYear()} {fullName}. {t('footer.rights')}
                        </p>
                        <div className="flex items-center gap-6 text-xs text-neutral-500">
                            <a href="#" className="hover:text-neutral-300 transition-colors">{t('footer.privacyShort')}</a>
                            <a href="#" className="hover:text-neutral-300 transition-colors">{t('footer.termsShort')}</a>
                            <a href="#" className="hover:text-neutral-300 transition-colors">{t('footer.cookies')}</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;


