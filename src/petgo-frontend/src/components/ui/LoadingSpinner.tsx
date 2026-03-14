"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2
        className={cn(
          "animate-spin text-blue-600",
          sizeClasses[size],
          className
        )}
      />
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
}

// Componente para tela inteira
export function LoadingScreen({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg text-gray-700">{text}</p>
      </div>
    </div>
  );
}

// Componente para loading em cards
export function CardLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <LoadingSpinner size="md" text="Carregando..." />
    </div>
  );
}
