import React, { Suspense } from "react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Package } from "lucide-react";
import ProdutosContent from "./ProdutosContent";

export default function ProdutosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg animate-pulse">
                <Package size={32} className="text-white" />
              </div>
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Carregando produtos...</p>
            </div>
          </div>
        }
      >
        <ProdutosContent />
      </Suspense>
    </div>
  );
}
