
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

  // Lógica de Visualização (Própria vs Compartilhada)
  const urlParams = new URLSearchParams(window.location.search);
  const viewEmail = urlParams.get('view');
  const isViewingOwn = !viewEmail || viewEmail.toLowerCase() === user.email.toLowerCase();
  const ownerEmail = isViewingOwn ? user.email : viewEmail!;

  // Determinar Papel
  const role: UserRole = useMemo(() => {
    if (isViewingOwn) return 'OWNER';
    const perms = storageService.getPermissions(ownerEmail);
    const myPerm = perms.find(p => p.granteeEmail.toLowerCase() === user.email.toLowerCase());
    return myPerm ? myPerm.role : 'OBSERVER';
  }, [isViewingOwn, ownerEmail, user.email]);

  useEffect(() => {
    // Carregar Racks
    setRacks(storageService.getRacks(ownerEmail));

    // Auto-registrar na lista de quem acessou o link de Anna
    if (!isViewingOwn) {
      const perms = storageService.getPermissions(ownerEmail);
      if (!perms.find(p => p.granteeEmail.toLowerCase() === user.email.toLowerCase())) {
        storageService.updatePermission(ownerEmail, user.email, 'OBSERVER', user.name);
      }
    }
  }, [ownerEmail, isViewingOwn, user.email, user.name]);

  const handleSaveRack = (updatedRack: RackData) => {
    if (role === 'OBSERVER') {
      alert("Você não tem permissão para editar este pátio.");
      return;
    }
    const newRacks = storageService.updateRack(ownerEmail, updatedRack);
    setRacks(newRacks);
    setSelectedRack(null);
  };

  const stats = {
    total: racks.length,
    occupied: racks.filter(r => r.status === 'OCCUPIED').length,
    free: racks.filter(r => r.status === 'FREE').length,
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutIcon />
          </div>
          <h1 className="font-black text-xl">Master</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => window.location.href = window.location.pathname}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${isViewingOwn ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutIcon /> Meus Cavaletes
          </button>
          
          <button 
            onClick={() => setIsSharingModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl transition font-bold"
          >
            <ShareIcon /> Compartilhar
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition font-bold text-sm">
            <LogoutIcon /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-slate-50 flex flex-col max-h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-800">
              {isViewingOwn ? 'Seu Painel' : `Pátio de ${ownerEmail.split('@')[0]}`}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${role === 'OWNER' ? 'bg-indigo-100 text-indigo-700' : role === 'EDITOR' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                Papel: {role === 'OWNER' ? 'Dono' : role === 'EDITOR' ? 'Editor' : 'Observador'}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Ocupados</p>
              <p className="text-lg font-black text-rose-600">{stats.occupied}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Livres</p>
              <p className="text-lg font-black text-emerald-600">{stats.free}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {!isViewingOwn && (
            <div className="mb-6 bg-amber-50 border border-amber-100 p-3 rounded-xl text-amber-800 text-xs font-medium">
              Você está visualizando os dados de outra conta. Permissão atual: <b>{role}</b>.
            </div>
          )}
          <Dashboard racks={racks} onSelectRack={setSelectedRack} />
        </div>
      </main>

      {selectedRack && (
        <RackModal 
          rack={selectedRack} 
          onClose={() => setSelectedRack(null)} 
          onSave={handleSaveRack}
          isReadOnly={role === 'OBSERVER'}
        />
      )}

      {isSharingModalOpen && (
        <SharingModal user={user} onClose={() => setIsSharingModalOpen(false)} />
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
