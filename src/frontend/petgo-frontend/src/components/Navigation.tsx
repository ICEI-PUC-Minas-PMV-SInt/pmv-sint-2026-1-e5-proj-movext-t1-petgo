"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import {
  Menu,
  X,
  Heart,
  Package,
  Users,
  Home,
  PawPrint,
  UserPlus,
  LogIn,
  LogOut,
  User,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useCarrinhoTotal } from "@/hooks/useCarrinho";

//menu principal
const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Produtos",
    href: "/produtos",
    icon: Package,
  },
  {
    name: "Adoção",
    href: "/adocao",
    icon: PawPrint,
  },
  {
    name: "Passeadores",
    href: "/passeadores",
    icon: Users,
  },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logoutContext, isLoading } = useAuth();

  // Buscar total do carrinho
  const { data: carrinhoTotal } = useCarrinhoTotal(user?.id);

  if (isLoading) {
    return <header className="h-16 bg-white"></header>; // Um "placeholder"
  }

  // Verifica qual link está ativo
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Heart className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">PetGo</span>
          </Link>

          {/* 🖥️ Menu Desktop */}
          <div className="hidden md:flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActiveLink(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Ações do usuário (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              // ---- SE ESTIVER LOGADO (DESKTOP) ----
              <>
                <Link
                  href="/carrinho"
                  className="relative text-gray-600 hover:text-gray-900 transition-colors"
                  title="Carrinho"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {carrinhoTotal && carrinhoTotal.quantidadeItens > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {carrinhoTotal.quantidadeItens}
                    </span>
                  )}
                </Link>
                <span className="text-sm text-gray-700">
                  Olá, {user?.nome}!
                </span>
                <Link
                  href="/perfil"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                >
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </Link>
                <button
                  onClick={logoutContext}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/cadastrar"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Cadastrar</span>
                </Link>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>

          {/* Botão menu mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActiveLink(item.href)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Ações Mobile */}
            <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
              {isAuthenticated ? (
                // ---- SE ESTIVER LOGADO (MOBILE) ----
                <>
                  <Link
                    href="/carrinho"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Carrinho</span>
                    {carrinhoTotal && carrinhoTotal.quantidadeItens > 0 && (
                      <span className="ml-auto bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {carrinhoTotal.quantidadeItens}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/perfil"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                  <button
                    onClick={() => {
                      logoutContext();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/cadastrar"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-4 py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Cadastrar</span>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
