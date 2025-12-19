const ProductSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
            {/* Image Skeleton */}
            <div className="h-64 bg-gray-200 dark:bg-gray-700" />

            {/* Content Skeleton */}
            <div className="p-4">
                {/* Title */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    ))}
                </div>

                {/* Price */}
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />

                {/* Sizes */}
                <div className="flex gap-2 mb-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-10 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                    ))}
                </div>

                {/* Button */}
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );
};

const ProductListSkeleton = ({ count = 8 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
};

export { ProductSkeleton, ProductListSkeleton };


