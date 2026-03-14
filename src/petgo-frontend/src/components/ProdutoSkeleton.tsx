export default function ProdutoSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-64 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_200%] animate-shimmer" />

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_200%] animate-shimmer rounded w-3/4" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_200%] animate-shimmer rounded" />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_200%] animate-shimmer rounded w-5/6" />
        </div>

        {/* Price and stock */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_200%] animate-shimmer rounded w-24" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_200%] animate-shimmer rounded-full w-20" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_200%] animate-shimmer rounded-lg flex-1" />
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_200%] animate-shimmer rounded-lg w-10" />
        </div>
      </div>
    </div>
  );
}

export function ProdutosGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProdutoSkeleton key={i} />
      ))}
    </div>
  );
}
