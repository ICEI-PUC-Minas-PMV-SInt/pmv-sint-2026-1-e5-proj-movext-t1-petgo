import React from "react";
import { Heart, Package, Users, Star, Shield, Clock } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Package,
    title: "Produtos Pet",
    description: "Encontre os melhores produtos para seu animal de estimação",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Users,
    title: "Passeadores Qualificados",
    description: "Profissionais verificados para cuidar do seu pet",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Heart,
    title: "Adoção Responsável",
    description: "Encontre seu novo melhor amigo para adoção",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Shield,
    title: "Segurança Garantida",
    description: "Todos os serviços são verificados e seguros",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Star,
    title: "Avaliações Reais",
    description: "Sistema de avaliações de usuários reais",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: Clock,
    title: "Disponível 24/7",
    description: "Suporte e serviços disponíveis a qualquer hora",
    color: "bg-indigo-100 text-indigo-600",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              🐾 Cuidado Animal Premium
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Bem-vindo ao{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              PetGo
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            A plataforma completa para cuidado de animais de estimação.{" "}
            <br className="hidden md:block" />
            Produtos, serviços e adoção em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/produtos">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg">
                Ver Produtos
              </button>
            </Link>
            <Link href="/sobre">
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-lg">
                Saiba Mais
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tudo que seu pet precisa
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Oferecemos uma experiência completa e segura para você e seu animal
            de estimação
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div
                  className={`inline-flex p-4 rounded-2xl ${feature.color} mb-6`}
                >
                  <IconComponent size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">1000+</div>
              <div className="text-gray-600">Produtos Disponíveis</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">500+</div>
              <div className="text-gray-600">Passeadores Verificados</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-red-600">200+</div>
              <div className="text-gray-600">Pets Adotados</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-600">5000+</div>
              <div className="text-gray-600">Famílias Felizes</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de donos de pets que já confiam no PetGo
          </p>
          <Link href="/cadastrar">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold text-lg transform hover:scale-105">
              Cadastre-se Gratuitamente
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
