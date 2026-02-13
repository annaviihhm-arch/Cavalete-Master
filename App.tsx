
import React, { useState, useEffect, useMemo } from 'react';
import AuthGuard from './components/AuthGuard';
import Dashboard from './components/Dashboard';
import RackModal from './components/RackModal';
import SharingModal from './components/SharingModal';
import { LayoutIcon, LogoutIcon, UserIcon, ShareIcon } from './components/Icons';
import { RackData, User, UserRole } from './types';
import { storageService } from './services/storageService';

const AppContent: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [racks, setRacks] = useState<RackData[]>([]);
  const [selectedRack, setSelectedRack] = useState<RackData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);

  // Determinar qual conta estamos vendo (nossa ou de outra pessoa via URL)
  const urlParams = new URLSearchParams(window.location.search);
  const viewOwnerEmail = urlParams.get('view');
  
  const isViewingOwn = !viewOwnerEmail || viewOwnerEmail.toLowerCase() === user.email.toLowerCase();
  const activeOwnerEmail = isViewingOwn ? user.email : viewOwnerEmail!;

  // Determinar papel do usuário atual no contexto da conta que ele está vendo
  const effectiveRole: UserRole = useMemo(() => {
    if (isViewingOwn) return 'OWNER';
    const permissions = storageService.getPermissions(activeOwnerEmail);
    const myPerm = permissions.find(p => p.granteeEmail.toLowerCase() === user.email.toLowerCase());
    return myPerm ? myPerm.role : 'OBSERVER'; // Padrão observador se acessou via link
  }, [isViewingOwn, activeOwnerEmail, user.email]);

  useEffect(() => {
    // Se estou visitando o link de outra pessoa, auto-adicionar-me à lista dela (como observador inicial)
    if (!isViewingOwn) {
      const perms = storageService.getPermissions(activeOwnerEmail);
      if (!perms.find(p => p.granteeEmail.toLowerCase() === user.email.toLowerCase())) {
        storageService.updatePermission(activeOwnerEmail, user.email, 'OBSERVER', user.name);
      }
    }
    setRacks(storageService.getRacks(activeOwnerEmail));
  }, [activeOwnerEmail, isViewingOwn, user.email, user.name]);

  const handleSaveRack = (updatedRack: RackData) => {
    if (effectiveRole === 'OBSERVER') return;
    const newRacks = storageService.updateRack(activeOwnerEmail, updatedRack);
    setRacks(newRacks);
    setSelectedRack(null);
  };

  const filteredRacks = racks.filter(rack => 
    rack.id.toString().includes(searchTerm) ||
    rack.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rack.orderNumber?.includes(searchTerm)
  );

  const stats = {
    total: racks.length,
    occupied: racks.filter(r => r.status === 'OCCUPIED').length,
    free: racks.filter(r => r.status === 'FREE').length,
    maintenance: racks.filter(r => r.status === 'MAINTENANCE').length,
  };

  const goHome = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <LayoutIcon />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight">CavaleteMaster</h1>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Painel de Controle</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={goHome}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${isViewingOwn ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LayoutIcon />
            <span>Meus Cavaletes</span>
          </button>
          
          <button 
            onClick={() => setIsSharingModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition font-bold"
          >
            <ShareIcon />
            <span>Compartilhamento</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <UserIcon />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition font-bold"
          >
            <LogoutIcon />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-slate-50 flex flex-col max-h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Pesquisar registros..."
              className="w-full pl-11 pr-4 py-2 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar items-center">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm whitespace-nowrap text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
              <p className="text-sm font-black text-indigo-600">{effectiveRole === 'OWNER' ? 'Proprietário' : effectiveRole === 'EDITOR' ? 'Editor' : 'Observador'}</p>
            </div>
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm whitespace-nowrap text-center min-w-[70px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Livres</p>
              <p className="text-xl font-black text-emerald-600">{stats.free}</p>
            </div>
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm whitespace-nowrap text-center min-w-[70px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total</p>
              <p className="text-xl font-black text-slate-700">{stats.total}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-[1400px] mx-auto">
            {!isViewingOwn && (
              <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg"><ShareIcon /></div>
                  <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Visualizando pátio de {activeOwnerEmail}</h3>
                    <p className="text-indigo-700 text-xs">Seu nível de acesso: {effectiveRole === 'EDITOR' ? 'Edição' : 'Apenas Leitura'}</p>
                  </div>
                </div>
                <button onClick={goHome} className="text-xs font-bold text-indigo-600 hover:underline">Voltar para meus cavaletes</button>
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800">{isViewingOwn ? 'Seus Cavaletes' : `Pátio de ${activeOwnerEmail}`}</h2>
              <p className="text-slate-500 text-sm">Controle de status e estoque</p>
            </div>

            <Dashboard 
              racks={filteredRacks} 
              onSelectRack={(rack) => setSelectedRack(rack)} 
            />
          </div>
        </div>

        <footer className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          <div>Conectado como {user.email}</div>
          <div>CavaleteMaster Pro © 2024</div>
        </footer>
      </main>

      {selectedRack && (
        <RackModal 
          rack={selectedRack} 
          onClose={() => setSelectedRack(null)} 
          onSave={handleSaveRack}
          // Se for observador, desabilitar ações de salvar dentro do modal (opcional, mas seguro)
          isReadOnly={effectiveRole === 'OBSERVER'}
        />
      )}

      {isSharingModalOpen && (
        <SharingModal 
          user={user} 
          onClose={() => setIsSharingModalOpen(false)} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthGuard>
      {(user, onLogout) => <AppContent user={user} onLogout={onLogout} />}
    </AuthGuard>
  );
};

export default App;
