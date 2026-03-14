import React from "react";

interface PasseadorSkeletonProps {
  count?: number;
}

export function PasseadorSkeleton({ count = 1 }: PasseadorSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse"
        >
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar skeleton */}
              <div className="w-20 h-20 rounded-full bg-gray-200" />

              {/* Info skeleton */}
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>

            {/* Services skeleton */}
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-20" />
              <div className="h-6 bg-gray-200 rounded-full w-24" />
            </div>

            {/* Contact skeleton */}
            <div className="h-4 bg-gray-200 rounded w-40 mb-4" />

            {/* Actions skeleton */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
              <div className="h-10 w-20 bg-gray-200 rounded-lg" />
              <div className="h-10 w-20 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function PasseadoresGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <PasseadorSkeleton count={count} />
    </div>
  );
}
