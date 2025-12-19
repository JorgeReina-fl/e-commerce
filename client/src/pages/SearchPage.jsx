import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search/${searchTerm}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Volver</span>
                </button>

                {/* Search Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-light dark:bg-primary/10 rounded-full mb-6">
                        <Search size={40} className="text-primary dark:text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Buscar Productos
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Encuentra exactamente lo que estás buscando
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-12">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre, categoría, marca..."
                            className="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!searchTerm.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                        >
                            Buscar
                        </button>
                    </div>
                </form>

                {/* Popular Searches */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Búsquedas Populares
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {['Camisetas', 'Pantalones', 'Zapatos', 'Vestidos', 'Chaquetas', 'Accesorios'].map((term) => (
                            <button
                                key={term}
                                onClick={() => navigate(`/search/${term}`)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-primary-light dark:hover:bg-primary/10 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary rounded-lg transition-colors"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { name: 'Hombre', emoji: '👔' },
                        { name: 'Mujer', emoji: '👗' },
                        { name: 'Niños', emoji: '👶' },
                        { name: 'Accesorios', emoji: '👜' }
                    ].map((category) => (
                        <button
                            key={category.name}
                            onClick={() => navigate(`/?category=${category.name}`)}
                            className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-primary dark:hover:border-blue-400 transition-all group"
                        >
                            <div className="text-4xl mb-3">{category.emoji}</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">
                                {category.name}
                            </h3>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;


