import { Link } from 'react-router-dom';

const Paginate = ({ pages, page, isAdmin = false, keyword = '' }) => {
    return (
        pages > 1 && (
            <div className="flex justify-center mt-8">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {[...Array(pages).keys()].map((x) => (
                        <Link
                            key={x + 1}
                            to={
                                !isAdmin
                                    ? keyword
                                        ? `/search/${keyword}/page/${x + 1}`
                                        : `/page/${x + 1}`
                                    : `/admin/productlist/${x + 1}`
                            }
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                            ${x + 1 === page
                                    ? 'z-10 bg-primary-light/50 border-primary text-primary'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }
                            ${x === 0 ? 'rounded-l-md' : ''}
                            ${x === pages - 1 ? 'rounded-r-md' : ''}
                            `}
                        >
                            {x + 1}
                        </Link>
                    ))}
                </nav>
            </div>
        )
    );
};

export default Paginate;


