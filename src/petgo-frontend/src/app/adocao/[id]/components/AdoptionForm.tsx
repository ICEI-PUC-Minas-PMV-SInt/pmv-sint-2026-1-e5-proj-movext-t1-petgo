'use client'; // ESSENCIAL: Marca como Client Component

import { useState, FormEvent } from 'react';
import api from '@/lib/api';
import { AdoptionFormPayload } from '@/types/pet';

interface AdoptionFormProps {
  petId: string;
  petName: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function AdoptionForm({ petId, petName }: AdoptionFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const payload: AdoptionFormPayload = { petId, name, email, message };

    try {
      // Endpoint: POST /api/adoptions
      await api.post('/adoptions', payload);
      setStatus('success');
    } catch (error) {
      console.error('Falha ao enviar solicitação:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-6 bg-green-100 text-green-800 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Solicitação Enviada!</h3>
        <p>Obrigado pelo seu interesse. Entraremos em contato em breve.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 bg-gray-50 rounded-lg shadow-inner space-y-6"
    >
      <h3 className="text-2xl font-semibold text-gray-800">
        Quero adotar o(a) {petName}!
      </h3>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Seu Nome</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Seu Email</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensagem (Opcional)</label>
        <textarea id="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      {status === 'error' && (<p className="text-sm text-red-600">Ocorreu um erro. Tente novamente.</p>)}
      <button type="submit" disabled={status === 'loading'} className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400">
        {status === 'loading' ? 'Enviando...' : 'Enviar Solicitação'}
      </button>
    </form>
  );
}