import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, CheckCircle } from 'lucide-react';
import { z } from 'zod';

// Schema de validação com Zod
const adoptionSchema = z.object({
  nome: z.string().min(3, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido (DDD + Número)"),
  motivo: z.string().min(20, "Conte-nos mais sobre por que quer adotar (mínimo 20 caracteres)"),
});

type AdoptionFormData = z.infer<typeof adoptionSchema>;

interface AdoptionFormModalProps {
  petId: number;
  onClose: () => void;
}

export default function AdoptionFormModal({ petId, onClose }: AdoptionFormModalProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdoptionFormData>({
    resolver: zodResolver(adoptionSchema)
  });

  const onSubmit = async (data: AdoptionFormData) => {
    try {
      console.log("Enviando interesse para pet ID:", petId, data);
      
      // Simulação de envio para API
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      alert("Interesse registrado com sucesso! Entraremos em contato.");
      onClose();
    } catch (error) {
      alert("Erro ao enviar. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-purple-700 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="bg-purple-100/50 px-6 py-6 border-b border-purple-200">
          <h2 className="text-2xl font-extrabold text-purple-900">Adotar um Amigo</h2>
          <p className="text-sm text-purple-700">Preencha com atenção. Pet ID: {petId}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Seu Nome Completo</label>
            <input 
              {...register('nome')} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow" 
              placeholder="Ex: Maria Silva"
            />
            {errors.nome && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input 
                {...register('email')} 
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow" 
                placeholder="seu@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
              <input 
                {...register('telefone')} 
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow" 
                placeholder="(11) 99999-9999"
              />
              {errors.telefone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.telefone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo da Adoção</label>
            <textarea 
              {...register('motivo')} 
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-shadow" 
              placeholder="Conte um pouco sobre sua experiência e o ambiente onde o pet vai morar..."
            />
            {errors.motivo && <p className="text-red-500 text-xs mt-1 font-medium">{errors.motivo.message}</p>}
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : (
                <>
                  Enviar Interesse <CheckCircle size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}