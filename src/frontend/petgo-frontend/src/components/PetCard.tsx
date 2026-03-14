import Image from 'next/image';
import { Heart, Dog, Cat, CheckCircle } from 'lucide-react';
import { Pet } from '@/types/pet';

interface PetCardProps {
  pet: Pet;
  onAdopt: (id: number) => void;
}

export default function PetCard({ pet, onAdopt }: PetCardProps) {
  const imageUrl = pet.imagens && pet.imagens.length > 0 
    ? pet.imagens[0] 
    : '/placeholder-pet.jpg';

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-purple-100 flex flex-col h-full">
      {/* Imagem */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Foto de ${pet.nome}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-md">
          {pet.sexo || 'Indefinido'}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{pet.nome}</h2>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            {pet.especie === 'Cão' ? <Dog size={20} className="text-orange-500" /> : <Cat size={20} className="text-sky-500" />}
          </div>
        </div>
        
        <p className="text-md text-purple-600 font-semibold mb-4">
          {pet.raca || 'SRD'} • {pet.idade ? `${pet.idade} anos` : 'Idade não informada'}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {pet.vacinado && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle size={14} /> Vacinado
            </span>
          )}
          {pet.castrado && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
              <CheckCircle size={14} /> Castrado
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
          {pet.descricao}
        </p>

        <button 
          onClick={() => onAdopt(pet.id)}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mt-auto"
        >
          <Heart size={18} className="fill-current text-white" />
          Quero Adotar
        </button>
      </div>
    </div>
  );
}