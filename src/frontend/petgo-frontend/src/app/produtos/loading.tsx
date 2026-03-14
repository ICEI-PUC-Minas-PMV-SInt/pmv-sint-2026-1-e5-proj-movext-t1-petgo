import { ProdutosGridSkeleton } from "@/components/ProdutoSkeleton";

export default function LoadingProdutos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-3 justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
              Carregando produtos...
            </h1>
          </div>

          <p className="text-gray-600 animate-pulse">
            Aguarde enquanto conectamos ao servidor 🚀
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>

        {/* Grid skeleton */}
        <ProdutosGridSkeleton count={9} />

        {/* Footer message */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 animate-pulse">
            Primeira carga pode demorar alguns segundos ⏱️
          </p>
        </div>
      </div>
    </div>
  );
}
