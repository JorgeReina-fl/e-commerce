import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();

const MAX_COMPARE_ITEMS = 4;

export const CompareProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('luxethread_compare');
        if (saved) {
            try {
                setCompareItems(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading compare items:', error);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('luxethread_compare', JSON.stringify(compareItems));
    }, [compareItems]);

    const addToCompare = (product) => {
        if (compareItems.length >= MAX_COMPARE_ITEMS) {
            toast.error(`Máximo ${MAX_COMPARE_ITEMS} productos para comparar`);
            return;
        }

        if (compareItems.find(item => item._id === product._id)) {
            toast.error('Este producto ya está en la comparación');
            return;
        }

        setCompareItems(prev => [...prev, product]);
        toast.success('Producto añadido a comparar');
    };

    const removeFromCompare = (productId) => {
        setCompareItems(prev => prev.filter(item => item._id !== productId));
    };

    const clearCompare = () => {
        setCompareItems([]);
        toast.success('Comparación limpiada');
    };

    const isInCompare = (productId) => {
        return compareItems.some(item => item._id === productId);
    };

    const toggleCompare = (product) => {
        if (isInCompare(product._id)) {
            removeFromCompare(product._id);
        } else {
            addToCompare(product);
        }
    };

    return (
        <CompareContext.Provider value={{
            compareItems,
            compareCount: compareItems.length,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isInCompare,
            toggleCompare,
            maxItems: MAX_COMPARE_ITEMS
        }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within CompareProvider');
    }
    return context;
};

export default CompareContext;


