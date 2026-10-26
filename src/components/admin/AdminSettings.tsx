import React, { useState } from 'react'
import {
  Save,
  Clock,
  MapPin,
  QrCode,
  Users,
  ShieldCheck,
  Power,
  DollarSign,
  Phone,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'

export const AdminSettings: React.FC = () => {
  const { config, updateConfig, isStoreOpenNow } = useStore()

  const [savedSuccess, setSavedSuccess] = useState(false)

  // Local form state
  const [name, setName] = useState(config.name)
  const [tagline, setTagline] = useState(config.tagline)
  const [city, setCity] = useState(config.city)
  const [state, setState] = useState(config.state)
  const [address, setAddress] = useState(config.address)
  const [phone, setPhone] = useState(config.phone)
  const [whatsapp, setWhatsapp] = useState(config.whatsapp)
  const [pixKey, setPixKey] = useState(config.pixKey)
  const [pixBeneficiary, setPixBeneficiary] = useState(config.pixBeneficiary)
  const [deliveryFee, setDeliveryFee] = useState(String(config.deliveryFee))
  const [manualOverride, setManualOverride] = useState(config.manualOpenOverride)

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault()

    updateConfig({
      name: name.trim(),
      tagline: tagline.trim(),
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      pixKey: pixKey.trim(),
      pixBeneficiary: pixBeneficiary.trim(),
      deliveryFee: parseFloat(deliveryFee.replace(',', '.')) || 0,
      manualOpenOverride: manualOverride,
    })

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {/* Notificação de Sucesso */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>Configurações salvas e aplicadas com sucesso!</span>
        </div>
      )}

      {/* Bloco 1: Status Operacional da Loja */}
      <div className="p-6 rounded-3xl bg-[#130d26] border border-[#281c52] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#231846]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] flex items-center justify-center text-white">
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Status da Loja no Momento</h3>
              <p className="text-xs text-slate-400">
                Controle se a loja aceita pedidos agora no site público
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isStoreOpenNow
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              }`}
            />
            <span className="text-xs font-bold text-white">
              {isStoreOpenNow ? 'Aberta no Site' : 'Fechada no Site'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setManualOverride('auto')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              manualOverride === 'auto'
                ? 'bg-gradient-to-r from-[#8b2cff]/20 to-[#ec4899]/20 border-[#ec4899] text-white'
                : 'bg-[#181133] border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
            }`}
          >
            <div className="text-xs font-bold">Automático (Recomendado)</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Abre/fecha conforme o horário (Seg-Sáb 18h às 23h30)
            </div>
          </button>

          <button
            type="button"
            onClick={() => setManualOverride('open')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              manualOverride === 'open'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-[#181133] border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
            }`}
          >
            <div className="text-xs font-bold">Forçar Aberta</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Receber pedidos mesmo fora do expediente programado
            </div>
          </button>

          <button
            type="button"
            onClick={() => setManualOverride('closed')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              manualOverride === 'closed'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-[#181133] border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
            }`}
          >
            <div className="text-xs font-bold">Pausa / Fechada</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Pausar recebimento em dias de folga ou manutenção
            </div>
          </button>
        </div>
      </div>

      {/* Bloco 2: Dados Comerciais e Endereço */}
      <div className="p-6 rounded-3xl bg-[#130d26] border border-[#281c52] space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#8b2cff]" />
          <span>Localização & Atendimento</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Nome Fantasia da Loja</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Slogan Promocional</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] text-slate-400 block mb-1">
              Endereço Comercial / Retirada no Balcão
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Cidade</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Estado (UF)</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">WhatsApp Comercial (com DDD e 55)</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Telefone / WhatsApp Formatado</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
            />
          </div>
        </div>
      </div>

      {/* Bloco 3: Pagamento Pix & Delivery */}
      <div className="p-6 rounded-3xl bg-[#130d26] border border-[#281c52] space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-emerald-400" />
          <span>Configuração Pix Manual & Taxa de Entrega</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Chave Pix do Estabelecimento</label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Nome do Beneficiário Pix</label>
            <input
              type="text"
              value={pixBeneficiary}
              onChange={(e) => setPixBeneficiary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Taxa de Entrega Padrão (R$)</label>
            <input
              type="text"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
            />
          </div>
        </div>
      </div>

      {/* Bloco 4: Usuários Administradores (Limite Business: 2) */}
      <div className="p-6 rounded-3xl bg-[#130d26] border border-[#281c52] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8b2cff]" />
            <h3 className="text-base font-bold text-white">Usuários Gestores da Loja</h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#8b2cff]/20 text-[#c4b5fd] font-bold border border-[#8b2cff]/40">
            2 de 2 Gestores Ativos (Limite Business)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {config.adminUsers.map((user, idx) => (
            <div
              key={user.id}
              className="p-3.5 rounded-2xl bg-[#181133] border border-[#2b1f58] flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block">{user.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Ativo
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Botão Salvar Geral */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-90 text-white font-extrabold text-xs shadow-neon-primary transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Todas as Configurações</span>
        </button>
      </div>
    </form>
  )
}
