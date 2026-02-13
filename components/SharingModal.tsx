
import React, { useState, useEffect } from 'react';
import { SharePermission, User } from '../types';
import { storageService } from '../services/storageService';
import { XIcon, ShareIcon, CheckIcon } from './Icons';

interface SharingModalProps {
  user: User;
  onClose: () => void;
}

const SharingModal: React.FC<SharingModalProps> = ({ user, onClose }) => {
  const [permissions, setPermissions] = useState<SharePermission[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPermissions(storageService.getPermissions(user.email));
  }, [user.email]);

  const shareUrl = `${window.location.origin}${window.location.pathname}?view=${encodeURIComponent(user.email)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateRole = (granteeEmail: string, role: 'EDITOR' | 'OBSERVER') => {
    const updated = storageService.updatePermission(user.email, granteeEmail, role);
    setPermissions(updated);
  };

  const handleRemove = (granteeEmail: string) => {
    const updated = storageService.updatePermission(user.email, granteeEmail, null);
    setPermissions(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-in animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <ShareIcon />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Compartilhamento</h3>
              <p className="text-xs text-slate-500">Gerencie quem pode ver seu pátio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400">
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Link de Acesso Direto</label>
            <div className="flex gap-2">
              <input
                readOnly
                className="flex-1 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 outline-none"
                value={shareUrl}
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {copied ? <CheckIcon /> : 'Copiar'}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 italic">
              * Quem acessar este link será adicionado automaticamente à sua lista abaixo para você definir o papel.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-700">Usuários com Acesso ({permissions.length})</h4>
            {permissions.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400">Ninguém acessou seu link ainda.</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {permissions.map((p) => (
                  <div key={p.granteeEmail} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 truncate">{p.granteeName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{p.granteeEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none"
                        value={p.role}
                        onChange={(e) => handleUpdateRole(p.granteeEmail, e.target.value as any)}
                      >
                        <option value="OBSERVER">Observador</option>
                        <option value="EDITOR">Editor</option>
                      </select>
                      <button
                        onClick={() => handleRemove(p.granteeEmail)}
                        className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <XIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharingModal;
