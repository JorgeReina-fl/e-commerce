import { useEffect } from 'react';
import { name as siteName, seo } from '../config/branding';

/**
 * SEO Component for dynamic meta tags
 * Sets title, description, Open Graph, Twitter Cards, and JSON-LD structured data
 */
const SEO = ({
    title,
    description,
    image,
    url,
    type = 'website',
    product = null, // For product pages
    noIndex = false
}) => {
    useEffect(() => {
        const defaultDescription = seo.defaultDescription;
        const defaultImage = seo.ogImage;
        const baseUrl = window.location.origin;

        // Set document title
        document.title = title ? `${title} | ${siteName}` : siteName;

        // Helper to set/update meta tag
        const setMeta = (name, content, property = false) => {
            const attr = property ? 'property' : 'name';
            let tag = document.querySelector(`meta[${attr}="${name}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attr, name);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        // Basic meta tags
        setMeta('description', description || defaultDescription);
        if (noIndex) {
            setMeta('robots', 'noindex, nofollow');
        } else {
            setMeta('robots', 'index, follow');
        }

        // Open Graph tags
        setMeta('og:title', title || siteName, true);
        setMeta('og:description', description || defaultDescription, true);
        setMeta('og:image', image || `${baseUrl}${defaultImage}`, true);
        setMeta('og:url', url || window.location.href, true);
        setMeta('og:type', type, true);
        setMeta('og:site_name', siteName, true);
        setMeta('og:locale', 'es_ES', true);

        // Twitter Card tags
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', title || siteName);
        setMeta('twitter:description', description || defaultDescription);
        setMeta('twitter:image', image || `${baseUrl}${defaultImage}`);

        // Product-specific structured data (JSON-LD)
        if (product) {
            const existingScript = document.querySelector('script#product-jsonld');
            if (existingScript) existingScript.remove();

            const jsonLd = {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: product.name,
                description: product.description,
                image: product.image,
                url: url || window.location.href,
                sku: product._id,
                brand: {
                    '@type': 'Brand',
                    name: siteName
                },
                offers: {
                    '@type': 'Offer',
                    price: product.discount > 0
                        ? (product.price * (1 - product.discount / 100)).toFixed(2)
                        : product.price.toFixed(2),
                    priceCurrency: 'EUR',
                    availability: product.totalStock > 0
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                    url: url || window.location.href
                }
            };

            // Add aggregate rating if available
            if (product.numReviews > 0) {
                jsonLd.aggregateRating = {
                    '@type': 'AggregateRating',
                    ratingValue: product.rating.toFixed(1),
                    reviewCount: product.numReviews
                };
            }

            const script = document.createElement('script');
            script.id = 'product-jsonld';
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(jsonLd);
            document.head.appendChild(script);
        }

        // Cleanup on unmount
        return () => {
            const jsonLdScript = document.querySelector('script#product-jsonld');
            if (jsonLdScript) jsonLdScript.remove();
        };
    }, [title, description, image, url, type, product, noIndex]);

    return null; // This component doesn't render anything
};

export default SEO;


