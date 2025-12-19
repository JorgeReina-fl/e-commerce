import { useState } from 'react';
import { Share2, Twitter, Facebook, Link2, MessageCircle, Mail, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { fullName } from '../config/branding';

const ShareButtons = ({ product, variant = 'default' }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const productUrl = `${window.location.origin}/product/${product.slug || product._id}`;
    const productTitle = product.name;
    const productDescription = product.description?.substring(0, 100) || `${product.name} - €${product.price}`;

    const shareLinks = [
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'hover:text-[#1DA1F2]',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`¡Mira esto! ${productTitle}`)}&url=${encodeURIComponent(productUrl)}`
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'hover:text-[#4267B2]',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'hover:text-[#25D366]',
            url: `https://wa.me/?text=${encodeURIComponent(`¡Mira este producto! ${productTitle}\n${productUrl}`)}`
        },
        {
            name: 'Email',
            icon: Mail,
            color: 'hover:text-gray-600',
            url: `mailto:?subject=${encodeURIComponent(`Te comparto: ${productTitle}`)}&body=${encodeURIComponent(`¡Mira este producto de ${fullName}!\n\n${productTitle}\n${productDescription}\n\n${productUrl}`)}`
        }
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(productUrl);
            setCopied(true);
            toast.success('¡Enlace copiado!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Error al copiar el enlace');
        }
    };

    const handleShare = (e, link) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(link.url, '_blank', 'width=600,height=400');
        setShowMenu(false);
    };

    // Native share API for mobile
    const handleNativeShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: productTitle,
                    text: productDescription,
                    url: productUrl
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setShowMenu(true);
                }
            }
        } else {
            setShowMenu(!showMenu);
        }
    };

    if (variant === 'inline') {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Compartir:</span>
                <div className="flex items-center gap-1">
                    {shareLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={(e) => handleShare(e, link)}
                            className={`p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${link.color}`}
                            title={`Compartir en ${link.name}`}
                        >
                            <link.icon size={18} />
                        </button>
                    ))}
                    <button
                        onClick={copyToClipboard}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Copiar enlace"
                    >
                        {copied ? <Check size={18} className="text-green-500" /> : <Link2 size={18} />}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={handleNativeShare}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Compartir"
            >
                <Share2 size={20} />
            </button>

            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[180px]">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Compartir
                        </div>
                        {shareLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={(e) => handleShare(e, link)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${link.color}`}
                            >
                                <link.icon size={18} />
                                {link.name}
                            </button>
                        ))}
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    copyToClipboard();
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {copied ? <Check size={18} className="text-green-500" /> : <Link2 size={18} />}
                                {copied ? '¡Copiado!' : 'Copiar enlace'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShareButtons;


