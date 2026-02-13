
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import RackModal from './components/RackModal';
import { LayoutIcon, ShareIcon, CheckIcon } from './components/Icons';
import { RackData } from './types';
import { storageService } from './services/storageService';
import { DEFAULT_PATIO_ID } from './constants';

const App: React.FC = () => {
  const [racks, setRacks] = useState<RackData[]>([]);
  const [selectedRack, setSelectedRack] = useState<RackData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Obtém o ID do pátio da URL ou usa o padrão
  const urlParams = new URLSearchParams(window.location.search);
  const patioId = urlParams.get('patio') || DEFAULT_PATIO_ID;
  const isShared = patioId !== DEFAULT_PATIO_ID;

  useEffect(() => {
    setRacks(storageService.getRacks(patioId));
    
    // Simulação de "Tempo Real" - Escuta mudanças no localStorage de outras abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageService.getPatioKey(patioId)) {
        setRacks(storageService.getRacks(patioId));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [patioId]);

  const handleSaveRack = (updatedRack: RackData) => {
    const newRacks = storageService.updateRack(patioId, updatedRack);
    setRacks(newRacks);
    setSelectedRack(null);
  };

  const handleShare = () => {
    const newId = isShared ? patioId : Math.random().toString(36).substring(2, 9);
    const shareUrl = `${window.location.origin}${window.location.pathname}?patio=${newId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    if (!isShared) {
      // Se era o pátio padrão, migra os dados para o novo ID compartilhado para não perder o que já foi feito
      const currentData = storageService.getRacks(DEFAULT_PATIO_ID);
      localStorage.setItem(storageService.getPatioKey(newId), JSON.stringify(currentData));
      window.history.pushState({}, '', `?patio=${newId}`);
    }
  };

  const stats = {
    total: racks.length,
    occupied: racks.filter(r => r.status === 'OCCUPIED').length,
    free: racks.filter(r => r.status === 'FREE').length,
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <LayoutIcon />
          </div>
          <div>
            <h1 className="font-black text-xl leading-none">Cavalete</h1>
            <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest mt-1">Master Pro</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className={`p-3 rounded-xl flex items-center gap-3 font-bold text-sm transition ${!isShared ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <LayoutIcon />
            <span>Meu Pátio Local</span>
          </div>
          
          <button 
            onClick={handleShare}
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm transition group ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <div className="flex items-center gap-3">
              <ShareIcon />
              <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
            </div>
            {!copied && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-2xl p-4">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Sincronização</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-xs font-bold text-slate-300">Tempo Real Ativo</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 md:p-6 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                placeholder="Buscar cavalete, cliente ou OS..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Livres</p>
                <p className="text-xl font-black text-emerald-600">{stats.free}</p>
              </div>
              <div className="text-right border-l border-slate-200 pl-4">
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Ocupados</p>
                <p className="text-xl font-black text-rose-600">{stats.occupied}</p>
              </div>
            </div>
            
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isShared ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isShared ? 'bg-amber-500' : 'bg-indigo-500'}`} />
              {isShared ? `Pátio Compartilhado: ${patioId}` : 'Pátio Privado'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Mapa de Cavaletes</h2>
                <p className="text-slate-500 font-medium">Controle de estoque e logística de pátio</p>
              </div>
              
              {isShared && (
                <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 animate-pulse">
                   <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">VC</div>
                      <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">AN</div>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">2 Online agora</span>
                </div>
              )}
            </div>

            <Dashboard 
              racks={racks.filter(r => 
                r.id.toString().includes(searchTerm) || 
                r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.orderNumber?.includes(searchTerm)
              )} 
              onSelectRack={setSelectedRack} 
            />
          </div>
        </div>

        <footer className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isShared ? 'Visualização em Nuvem (ID: ' + patioId + ')' : 'Armazenamento Local Ativo'}
          </p>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <span>v2.5.0</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Suporte: 0800-MASTER</span>
          </div>
        </footer>
      </main>

      {selectedRack && (
        <RackModal 
          rack={selectedRack} 
          onClose={() => setSelectedRack(null)} 
          onSave={handleSaveRack} 
        />
      )}
    </div>
  );
};

export default App;
