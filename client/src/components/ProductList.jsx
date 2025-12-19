import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard';
import Paginate from './Paginate';
import { ProductListSkeleton } from './ProductSkeleton';
import ProductFilters from './ProductFilters';
import ProductSort from './ProductSort';
import QuickViewModal from './QuickViewModal';
import Breadcrumbs from './Breadcrumbs';
import { LayoutGrid, List } from 'lucide-react';
import { API_URL } from '../config/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [sortBy, setSortBy] = useState('newest');
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        sizes: [],
        colors: [],
        brands: []
    });
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');

    const { keyword, pageNumber } = useParams();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                let url = `${API_URL}/products?pageNumber=${pageNumber || 1}`;

                if (keyword) {
                    url += `&keyword=${keyword}`;
                }
                if (category) {
                    url += `&category=${category}`;
                }

                const response = await axios.get(url);
                setProducts(response.data.products);
                setPages(response.data.pages);
                setPage(response.data.page);
                setTotalProducts(response.data.total || response.data.products.length);
            } catch (err) {
                setError('Error al cargar los productos. Verifica que el servidor esté corriendo.');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category, keyword, pageNumber]);

    // Filter and sort products client-side
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // Apply price filters
        if (filters.minPrice) {
            result = result.filter(p => {
                const finalPrice = p.discount ? p.price * (1 - p.discount / 100) : p.price;
                return finalPrice >= parseFloat(filters.minPrice);
            });
        }
        if (filters.maxPrice) {
            result = result.filter(p => {
                const finalPrice = p.discount ? p.price * (1 - p.discount / 100) : p.price;
                return finalPrice <= parseFloat(filters.maxPrice);
            });
        }

        // Apply size filters
        if (filters.sizes.length > 0) {
            result = result.filter(p =>
                p.sizeStock?.some(ss => filters.sizes.includes(ss.size) && ss.stock > 0)
            );
        }

        // Apply sorting
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => {
                    const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
                    const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
                    return priceA - priceB;
                });
                break;
            case 'price-desc':
                result.sort((a, b) => {
                    const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
                    const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
                    return priceB - priceA;
                });
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'popular':
                result.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
                break;
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        return result;
    }, [products, filters, sortBy]);

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            sizes: [],
            colors: [],
            brands: []
        });
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Breadcrumbs */}
            <Breadcrumbs />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {keyword ? `Resultados para: "${keyword}"` : category ? `${category}` : 'Todos los Productos'}
                    </h1>
                    {!loading && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'} encontrados
                        </p>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-20">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 hidden lg:block">
                                Filtros
                            </h2>
                            <ProductFilters
                                filters={filters}
                                onFilterChange={setFilters}
                                onClear={clearFilters}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                            {/* Sort */}
                            <ProductSort value={sortBy} onChange={setSortBy} />

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                                        ? 'bg-primary-light text-primary dark:bg-primary-dark dark:text-primary-light'
                                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    title="Vista cuadrícula"
                                >
                                    <LayoutGrid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                                        ? 'bg-primary-light text-primary dark:bg-primary-dark dark:text-primary-light'
                                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    title="Vista lista"
                                >
                                    <List size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Products */}
                        {loading ? (
                            <ProductListSkeleton count={8} />
                        ) : filteredAndSortedProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    No se encontraron productos que coincidan con los filtros.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-primary hover:text-primary-dark dark:text-primary font-medium"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        ) : (
                            <div className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                                    : 'space-y-4'
                            }>
                                {filteredAndSortedProducts.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        viewMode={viewMode}
                                        onQuickView={() => setQuickViewProduct(product)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="mt-8">
                            <Paginate pages={pages} page={page} keyword={keyword ? keyword : ''} />
                        </div>
                    </main>
                </div>
            </div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
};

export default ProductList;


