
import React, { useState, useEffect } from 'react';
import { RackData, RackStatus } from '../types';
import { XIcon, CheckIcon } from './Icons';

interface RackModalProps {
  rack: RackData;
  onClose: () => void;
  onSave: (data: RackData) => void;
  isReadOnly?: boolean;
}

const STANDARD_MATERIALS = ["Granito", "Mármore", "Quartzo", "Porcelanato"];

const RackModal: React.FC<RackModalProps> = ({ rack, onClose, onSave, isReadOnly = false }) => {
  const [formData, setFormData] = useState<RackData>(rack);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(rack.photoUrl);
  
  const [materialSelect, setMaterialSelect] = useState<string>(() => {
    if (!rack.materialType) return "";
    return STANDARD_MATERIALS.includes(rack.materialType) ? rack.materialType : "Outros";
  });
  
  const [customMaterial, setCustomMaterial] = useState<string>(() => {
    if (!rack.materialType) return "";
    return STANDARD_MATERIALS.includes(rack.materialType) ? "" : rack.materialType;
  });

  useEffect(() => {
    setFormData(rack);
    setPreviewUrl(rack.photoUrl);
    const isStandard = rack.materialType && STANDARD_MATERIALS.includes(rack.materialType);
    setMaterialSelect(rack.materialType ? (isStandard ? rack.materialType : "Outros") : "");
    setCustomMaterial(isStandard ? "" : (rack.materialType || ""));
  }, [rack]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        setFormData({ ...formData, photoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMaterialSelectChange = (val: string) => {
    if (isReadOnly) return;
    setMaterialSelect(val);
    if (val !== "Outros") {
      setFormData({ ...formData, materialType: val });
      setCustomMaterial("");
    } else {
      setFormData({ ...formData, materialType: customMaterial });
    }
  };

  const handleCustomMaterialChange = (val: string) => {
    if (isReadOnly) return;
    setCustomMaterial(val);
    setFormData({ ...formData, materialType: val });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    onSave({
      ...formData,
      lastUpdated: new Date().toLocaleString('pt-BR'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col scale-in animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Cavalete #{rack.id}</h3>
            <p className="text-sm text-slate-500">
              {isReadOnly ? 'Visualizando detalhes do registro' : 'Gerenciar informações e status'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400">
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status do Cavalete</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['FREE', 'OCCUPIED', 'MAINTENANCE'] as RackStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => setFormData({ ...formData, status })}
                      className={`
                        py-2 text-[10px] font-bold rounded-lg border-2 transition
                        ${formData.status === status 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}
                        ${isReadOnly && formData.status !== status ? 'opacity-40 grayscale' : ''}
                      `}
                    >
                      {status === 'FREE' ? 'LIVRE' : status === 'OCCUPIED' ? 'OCUPADO' : 'MANUT.'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Cliente</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Nome do cliente"
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pedido / OS</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Nº do pedido"
                  value={formData.orderNumber || ''}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Material</label>
                <div className="space-y-2">
                  <select
                    disabled={isReadOnly}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                    value={materialSelect}
                    onChange={(e) => handleMaterialSelectChange(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {STANDARD_MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                    <option value="Outros">Outros</option>
                  </select>
                  
                  {materialSelect === "Outros" && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <input
                        type="text"
                        disabled={isReadOnly}
                        autoFocus
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                        placeholder="Descrição do material..."
                        value={customMaterial}
                        onChange={(e) => handleCustomMaterialChange(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Foto do Material</label>
                <div className="relative group aspect-video rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      {!isReadOnly && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <label className="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-lg font-bold text-sm shadow-xl">
                            Trocar Foto
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                          </label>
                        </div>
                      )}
                    </>
                  ) : (
                    <label className={`text-center p-4 ${isReadOnly ? '' : 'cursor-pointer'}`}>
                      <div className="bg-white p-3 rounded-full shadow-md inline-block mb-2 text-indigo-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-slate-400">
                        {isReadOnly ? 'SEM FOTO REGISTRADA' : 'CLIQUE PARA ADICIONAR FOTO'}
                      </p>
                      {!isReadOnly && <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />}
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Observações</label>
                <textarea
                  disabled={isReadOnly}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Notas internas..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition"
          >
            {isReadOnly ? 'Fechar' : 'Cancelar'}
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2 transition active:scale-95"
            >
              <CheckIcon />
              Salvar Alterações
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RackModal;
