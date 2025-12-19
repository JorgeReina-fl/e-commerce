import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { taglinePart1, taglinePart2 } from '../config/branding';
import SearchBox from './SearchBox';
import NotificationBell from './NotificationBell';
import DarkModeToggle from './DarkModeToggle';
import LanguageCurrencySelector from './LanguageCurrencySelector';

const Navbar = ({ cartCount = 0 }) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { wishlistCount } = useWishlist();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const navLinks = [
        { to: '/', label: t('nav.home') },
        { to: '/?category=Hombre', label: t('nav.men') },
        { to: '/?category=Mujer', label: t('nav.women') },
        { to: '/?category=Niños', label: t('nav.kids') },
        { to: '/?category=Accesorios', label: t('nav.accessories') },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-neutral-950 print:hidden">
            {/* ═══════════════════════════════════════════════════════════
                TOP BAR: Logo + Search + Actions
            ═══════════════════════════════════════════════════════════ */}
            <div className="border-b border-neutral-200 dark:border-neutral-800">
                <div className="container-main">
                    <div className="flex items-center justify-between h-14 sm:h-16 gap-4">

                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0">
                            <span className="text-lg sm:text-xl font-semibold tracking-[0.12em] text-neutral-900 dark:text-white uppercase">
                                {taglinePart1}<span className="font-light">{taglinePart2}</span>
                            </span>
                        </Link>

                        {/* Search Box - Desktop */}
                        <div className="hidden md:flex flex-1 max-w-lg">
                            <SearchBox />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            {/* Language/Currency */}
                            <LanguageCurrencySelector />

                            {/* Dark Mode */}
                            <DarkModeToggle />

                            {/* Wishlist */}
                            {user && (
                                <Link
                                    to="/wishlist"
                                    className="relative p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                    aria-label="Wishlist"
                                >
                                    <Heart size={20} strokeWidth={1.5} />
                                    {wishlistCount > 0 && (
                                        <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] flex items-center justify-center bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[9px] font-semibold rounded-full">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* Notifications */}
                            {user && <NotificationBell />}

                            {/* Cart */}
                            <Link
                                to="/cart"
                                className="relative p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                aria-label="Cart"
                            >
                                <ShoppingBag size={20} strokeWidth={1.5} />
                                {cartCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] flex items-center justify-center bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[9px] font-semibold rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Menu - Desktop */}
                            {user ? (
                                <div className="hidden sm:flex items-center">
                                    <Link
                                        to="/profile"
                                        className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                    >
                                        <User size={20} strokeWidth={1.5} />
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-neutral-400 hover:text-error-500 transition-colors"
                                        aria-label="Logout"
                                    >
                                        <LogOut size={18} strokeWidth={1.5} />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="hidden sm:flex items-center px-4 py-1.5 ml-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium uppercase tracking-wider hover:bg-black dark:hover:bg-neutral-100 transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                            )}

                            {/* Mobile: User Icon */}
                            {!user && (
                                <Link to="/login" className="sm:hidden p-2 text-neutral-500">
                                    <User size={20} strokeWidth={1.5} />
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-neutral-600 dark:text-neutral-400"
                                aria-label="Menu"
                            >
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Search Box - Mobile */}
                    <div className="md:hidden pb-3">
                        <SearchBox />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                SUB NAV: Category Links (Desktop)
            ═══════════════════════════════════════════════════════════ */}
            <nav className="hidden md:block bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <div className="container-main">
                    <div className="flex items-center justify-between h-11">
                        {/* Category Links */}
                        <div className="flex items-center gap-6 lg:gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right side links */}
                        <div className="flex items-center gap-6">
                            <Link
                                to="/track-order"
                                className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                            >
                                {t('order.trackOrder', 'Track Order')}
                            </Link>
                            {user?.isAdmin && (
                                <Link
                                    to="/admin"
                                    className="text-[13px] font-medium text-gold-600 dark:text-gold-400 hover:text-gold-700 transition-colors"
                                >
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════════════════════
                MOBILE MENU (Fullscreen Overlay)
            ═══════════════════════════════════════════════════════════ */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[calc(56px+48px)] sm:top-[calc(64px+48px)] z-40 bg-white dark:bg-neutral-950 overflow-y-auto animate-fade-in">
                    <nav className="container-main py-6">
                        <div className="space-y-0">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-3.5 text-base font-medium text-neutral-800 dark:text-white border-b border-neutral-100 dark:border-neutral-800"
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <Link
                                to="/track-order"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-3.5 text-base font-medium text-neutral-800 dark:text-white border-b border-neutral-100 dark:border-neutral-800"
                            >
                                {t('order.trackOrder')}
                            </Link>

                            {user && (
                                <>
                                    <Link
                                        to="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-3.5 text-base font-medium text-neutral-800 dark:text-white border-b border-neutral-100 dark:border-neutral-800"
                                    >
                                        {t('nav.profile')}
                                    </Link>

                                    {user.isAdmin && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block py-3.5 text-base font-medium text-gold-600 dark:text-gold-400 border-b border-neutral-100 dark:border-neutral-800"
                                        >
                                            Admin Panel
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                        className="block w-full text-left py-3.5 text-base font-medium text-error-500"
                                    >
                                        {t('nav.logout')}
                                    </button>
                                </>
                            )}

                            {!user && (
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-3.5 text-base font-medium text-neutral-800 dark:text-white"
                                >
                                    {t('nav.login')}
                                </Link>
                            )}
                        </div>

                        {/* Settings */}
                        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between text-sm text-neutral-500">
                                <span>{t('common.settings', 'Settings')}</span>
                                <LanguageCurrencySelector />
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;


