import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { ProductBadges } from './ProductBadge';
import { API_URL } from '../config/api';

const RelatedProducts = ({ productId, currentCategory }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/products/${productId}/related`);
                setProducts(data);
            } catch (error) {
                console.error('Error fetching related products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchRelated();
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">También te puede interesar</h2>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex-shrink-0 w-64 h-80 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    const scrollContainer = (direction) => {
        const container = document.getElementById('related-products-container');
        if (container) {
            const scrollAmount = 280; // card width + gap
            const newPosition = direction === 'left'
                ? Math.max(0, scrollPosition - scrollAmount)
                : scrollPosition + scrollAmount;

            container.scrollTo({ left: newPosition, behavior: 'smooth' });
            setScrollPosition(newPosition);
        }
    };

    return (
        <div className="mt-12 border-t pt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">También te puede interesar</h2>
                {products.length > 3 && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => scrollContainer('left')}
                            className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scrollContainer('right')}
                            className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div
                id="related-products-container"
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map(product => (
                    <Link
                        key={product._id}
                        to={`/product/${product.slug || product._id}`}
                        className="flex-shrink-0 w-64 group"
                    >
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Badges */}
                            {product.badges && product.badges.length > 0 && (
                                <div className="absolute top-2 right-2">
                                    <ProductBadges badges={product.badges} size="xs" maxVisible={1} />
                                </div>
                            )}
                        </div>
                        <div className="mt-3">
                            <p className="text-xs text-gray-500 uppercase">{product.category}</p>
                            <h3 className="font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                                {product.name}
                            </h3>
                            <p className="font-bold text-gray-900 mt-1">€{product.price.toFixed(2)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;


