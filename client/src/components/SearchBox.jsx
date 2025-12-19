import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBox = () => {
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/search/${keyword}`);
            setKeyword('');
        } else {
            navigate('/search');
        }
    };

    return (
        <form onSubmit={submitHandler} className="w-full">
            <div className="relative">
                <input
                    type="text"
                    name="q"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                    <Search size={20} />
                </button>
            </div>
        </form>
    );
};

export default SearchBox;


