// src/components/SafeImage.tsx - VERSÃO MELHORADA
"use client";

import React, { useState, useEffect } from "react";
import NextImage from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

export function SafeImage({
  src,
  alt,
  className = "",
  fallback,
  onLoad,
  onError,
  style = {},
}: SafeImageProps) {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    if (!src) {
      setImageState("error");
      return;
    }

    setImageState("loading");

    const img = new Image();

    img.onload = () => {
      setImgSrc(src);
      setImageState("loaded");
      onLoad?.();
      console.log("✅ SafeImage carregada:", src.substring(0, 50) + "...");
    };

    img.onerror = (error) => {
      setImageState("error");
      onError?.();
      console.error(
        "❌ SafeImage falhou:",
        error,
        src.substring(0, 50) + "..."
      );
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  if (imageState === "error") {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={style}
      >
        {fallback || (
          <div className="text-gray-400 text-center">
            <svg
              className="w-8 h-8 mx-auto mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs">Imagem não disponível</p>
          </div>
        )}
      </div>
    );
  }

  if (imageState === "loading") {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 animate-pulse ${className}`}
        style={style}
      >
        <div className="text-gray-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            ></circle>
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <NextImage
      src={imgSrc}
      alt={alt}
      fill
      className={className}
      style={style}
      draggable={false}
    />
  );
}
