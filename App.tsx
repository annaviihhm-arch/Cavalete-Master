
import React, { useState, useEffect, useMemo } from 'react';
import Dashboard from './components/Dashboard';
import RackModal from './components/RackModal';
import { LayoutIcon, ShareIcon } from './components/Icons';
import { RackData } from './types';
import { storageService } from './services/storageService';
import { DEFAULT_PATIO_ID } from './constants';

const App: React.FC = () => {
  // Estado do Pátio Atual
  const [patioId, setPatioId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('p') || DEFAULT_PATIO_ID;
  });

  const [racks, setRacks] = useState<RackData[]>([]);
  const [selectedRack, setSelectedRack] = useState<RackData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Carregar dados e escutar mudanças (Tempo Real local)
  useEffect(() => {
    const loadData = () => {
      setRacks(storageService.getRacks(patioId));
    };

    loadData();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageService.getPatioKey(patioId)) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [patioId]);

  const handleSaveRack = (updatedRack: RackData) => {
    const newRacks = storageService.updateRack(patioId, updatedRack);
    setRacks(newRacks);
    setSelectedRack(null);
  };

  const handleShare = () => {
    let currentId = patioId;
    if (patioId === DEFAULT_PATIO_ID) {
      currentId = Math.random().toString(36).substring(2, 9);
      // Salva os dados atuais no novo ID para não começar do zero
      storageService.saveRacks(currentId, racks);
      const newUrl = `${window.location.origin}${window.location.pathname}?p=${currentId}`;
      window.history.pushState({}, '', newUrl);
      setPatioId(currentId);
    }
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?p=${currentId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = useMemo(() => ({
    total: racks.length,
    occupied: racks.filter(r => r.status === 'OCCUPIED').length,
    free: racks.filter(r => r.status === 'FREE').length,
    maintenance: racks.filter(r => r.status === 'MAINTENANCE').length,
  }), [racks]);

  const filteredRacks = racks.filter(r => 
    r.id.toString().includes(searchTerm) || 
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.orderNumber?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Sidebar Lateral */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <LayoutIcon />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight">Cavalete</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Master Pro</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => {
              window.history.pushState({}, '', window.location.pathname);
              setPatioId(DEFAULT_PATIO_ID);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${patioId === DEFAULT_PATIO_ID ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutIcon /> Meu Pátio Local
          </button>
          
          <button 
            onClick={handleShare}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <div className="flex items-center gap-3">
              <ShareIcon />
              <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
            </div>
            {!copied && patioId === DEFAULT_PATIO_ID && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cloud Ativa</span>
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="relative w-full lg:w-96">
            <input
              type="text"
              placeholder="Pesquisar por ID, Cliente ou OS..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-center">
              <div className="px-3 border-r border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase">Livre</p>
                <p className="text-sm font-black text-emerald-600">{stats.free}</p>
              </div>
              <div className="px-3 border-r border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase">Ocupado</p>
                <p className="text-sm font-black text-rose-600">{stats.occupied}</p>
              </div>
              <div className="px-3">
                <p className="text-[9px] font-black text-slate-400 uppercase">Manut.</p>
                <p className="text-sm font-black text-amber-600">{stats.maintenance}</p>
              </div>
            </div>
            
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${patioId !== DEFAULT_PATIO_ID ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${patioId !== DEFAULT_PATIO_ID ? 'bg-amber-500' : 'bg-slate-400'}`} />
              {patioId === DEFAULT_PATIO_ID ? 'Local' : `Pátio: ${patioId}`}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mapa do Pátio</h2>
              <p className="text-slate-500 text-xs font-medium">Controle de fluxo de cavaletes em tempo real</p>
            </div>
            
            <Dashboard 
              racks={filteredRacks} 
              onSelectRack={setSelectedRack} 
            />
          </div>
        </div>

        <footer className="bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {patioId === DEFAULT_PATIO_ID ? 'Privado • Salvo Localmente' : `Link Compartilhado • Sincronizado`}
          </p>
          <p className="text-[9px] font-bold text-slate-300">v3.1.0-STABLE</p>
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
