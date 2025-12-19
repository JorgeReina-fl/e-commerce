import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items = [] }) => {
    const location = useLocation();

    // Auto-generate breadcrumbs from path if no items provided
    const generateBreadcrumbs = () => {
        if (items.length > 0) return items;

        const pathSegments = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Inicio', path: '/' }];

        const pathLabels = {
            'product': 'Producto',
            'cart': 'Carrito',
            'checkout': 'Checkout',
            'profile': 'Perfil',
            'wishlist': 'Favoritos',
            'order': 'Pedido',
            'notifications': 'Notificaciones',
            'admin': 'Admin',
            'search': 'Búsqueda'
        };

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;

            // Skip IDs (MongoDB ObjectIds)
            if (segment.length === 24 && /^[a-f0-9]+$/i.test(segment)) {
                return;
            }

            const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
            breadcrumbs.push({
                label,
                path: currentPath,
                isLast: index === pathSegments.length - 1
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    if (breadcrumbs.length <= 1) return null;

    return (
        <nav className="flex items-center space-x-2 text-sm py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center">
                    {index > 0 && (
                        <ChevronRight size={16} className="text-gray-400 mx-2" />
                    )}

                    {index === 0 ? (
                        <Link
                            to={crumb.path}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                        >
                            <Home size={16} />
                            <span className="hidden sm:inline">{crumb.label}</span>
                        </Link>
                    ) : crumb.isLast ? (
                        <span className="text-gray-900 dark:text-white font-medium truncate max-w-40">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            to={crumb.path}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumbs;


