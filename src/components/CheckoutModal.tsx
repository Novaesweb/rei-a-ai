import React, { useState } from 'react'
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Copy,
  Check,
  Truck,
  Store,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useStore } from '../context/StoreContext'
import { DeliveryType, PaymentMethod, CustomerInfo } from '../types'

interface CheckoutModalProps {
  onClose: () => void
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const { config, cart, cartSubtotal, placeOrder } = useStore()

  // Form State
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [referencePoint, setReferencePoint] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [needChange, setNeedChange] = useState(false)
  const [changeFor, setChangeFor] = useState('')
  const [copiedPix, setCopiedPix] = useState(false)
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState('')

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const deliveryFee = deliveryType === 'delivery' ? config.deliveryFee : 0
  const finalTotal = cartSubtotal + deliveryFee

  const copyPixKey = () => {
    navigator.clipboard.writeText(config.pixKey)
    setCopiedPix(true)
    setTimeout(() => setCopiedPix(false), 2500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!name.trim()) {
      setFormError('Por favor, informe seu nome completo.')
      return
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      setFormError('Por favor, informe um WhatsApp válido para contato.')
      return
    }

    if (deliveryType === 'delivery') {
      if (!neighborhood.trim() || !street.trim() || !number.trim()) {
        setFormError('Por favor, preencha o endereço completo de entrega (Bairro, Rua e Número).')
        return
      }
    }

    const customer: CustomerInfo = {
      name: name.trim(),
      phone: phone.trim(),
      neighborhood: deliveryType === 'delivery' ? neighborhood.trim() : undefined,
      street: deliveryType === 'delivery' ? street.trim() : undefined,
      number: deliveryType === 'delivery' ? number.trim() : undefined,
      complement: deliveryType === 'delivery' ? complement.trim() : undefined,
      referencePoint: deliveryType === 'delivery' ? referencePoint.trim() : undefined,
    }

    const changeVal = paymentMethod === 'money' && needChange ? Number(changeFor) || undefined : undefined

    // Executa criação do pedido
    const newOrder = placeOrder({
      deliveryType,
      customer,
      paymentMethod,
      changeFor: changeVal,
      notes: notes.trim() || undefined,
    })

    // Efeito de confete comemorativo
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b2cff', '#ec4899', '#f59e0b', '#10b981'],
      })
    } catch {
      // Ignora erro se não suportado
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-[#130d26] border border-[#281c52] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#231846] bg-[#160e2e] flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit']">
              Finalizar Pedido
            </h2>
            <p className="text-xs text-slate-400">
              Açaí do Rei • Canoas - RS
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#201545] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Modalidade de Entrega */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              1. Como deseja receber?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  deliveryType === 'delivery'
                    ? 'bg-gradient-to-r from-[#8b2cff]/20 to-[#ec4899]/20 border-[#ec4899] text-white shadow-sm'
                    : 'bg-[#181133] border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    deliveryType === 'delivery'
                      ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white'
                      : 'bg-[#100b24] text-slate-400'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Entrega em Casa</div>
                  <div className="text-[11px] text-[#f472b6] font-semibold">
                    Taxa: {formatBRL(config.deliveryFee)}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  deliveryType === 'pickup'
                    ? 'bg-gradient-to-r from-[#8b2cff]/20 to-[#ec4899]/20 border-[#ec4899] text-white shadow-sm'
                    : 'bg-[#181133] border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    deliveryType === 'pickup'
                      ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white'
                      : 'bg-[#100b24] text-slate-400'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Retirar no Balcão</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Sem taxa (Grátis)
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Dados de Contato */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              2. Seus Dados de Contato
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Seu Nome *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#8b2cff]"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">WhatsApp com DDD *</label>
                <input
                  type="tel"
                  required
                  placeholder="(51) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#8b2cff]"
                />
              </div>
            </div>
          </div>

          {/* 3. Endereço de Entrega (se aplicável) */}
          {deliveryType === 'delivery' && (
            <div className="p-4 rounded-2xl bg-[#181133] border border-[#2b1f58] space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-white block">
                3. Endereço de Entrega em {config.city} - {config.state}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Marechal Rondon, Centro, Igara..."
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#120d26] border border-[#251a4a] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#120d26] border border-[#251a4a] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Rua / Avenida *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rua Santos Ferreira"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#120d26] border border-[#251a4a] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Complemento</label>
                  <input
                    type="text"
                    placeholder="Apto 402, Bloco B, Casa dos fundos"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#120d26] border border-[#251a4a] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Ponto de Referência</label>
                  <input
                    type="text"
                    placeholder="Próximo à praça..."
                    value={referencePoint}
                    onChange={(e) => setReferencePoint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#120d26] border border-[#251a4a] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Forma de Pagamento */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              {deliveryType === 'delivery' ? '4. Forma de Pagamento' : '3. Forma de Pagamento no Balcão'}
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'pix'
                    ? 'bg-gradient-to-b from-[#8b2cff]/30 to-[#ec4899]/30 border-[#ec4899] text-white shadow-sm'
                    : 'bg-[#181133] border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
                }`}
              >
                <QrCode className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <span className="text-xs font-bold block">Pix</span>
                <span className="text-[10px] text-emerald-300 block">Mais Rápido</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-gradient-to-b from-[#8b2cff]/30 to-[#ec4899]/30 border-[#ec4899] text-white shadow-sm'
                    : 'bg-[#181133] border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#a855f7]" />
                <span className="text-xs font-bold block">Cartão</span>
                <span className="text-[10px] text-slate-400 block">Maquininha</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('money')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'money'
                    ? 'bg-gradient-to-b from-[#8b2cff]/30 to-[#ec4899]/30 border-[#ec4899] text-white shadow-sm'
                    : 'bg-[#181133] border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <span className="text-xs font-bold block">Dinheiro</span>
                <span className="text-[10px] text-slate-400 block">Com Troco</span>
              </button>
            </div>

            {/* Detalhes do Pix Manual */}
            {paymentMethod === 'pix' && (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    <span>Pagamento via Chave Pix Oficial</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Manual
                  </span>
                </div>

                <div className="p-3 bg-[#0c081a] rounded-xl border border-emerald-500/30 flex items-center justify-between gap-2">
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-slate-400 block">Chave Pix (E-mail):</span>
                    <span className="text-xs font-mono font-bold text-white truncate block">
                      {config.pixKey}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyPixKey}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-colors"
                  >
                    {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed">
                  Beneficiário: <b className="text-white">{config.pixBeneficiary}</b>
                  <br />
                  <span className="text-slate-400">
                    Após concluir o pedido, você receberá o link para encaminhar o comprovante diretamente no WhatsApp da loja para agilizar a preparação.
                  </span>
                </div>
              </div>
            )}

            {/* Detalhes do Dinheiro com Troco */}
            {paymentMethod === 'money' && (
              <div className="p-4 rounded-2xl bg-[#181133] border border-[#2b1f58] space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needChange}
                    onChange={(e) => setNeedChange(e.target.checked)}
                    className="w-4 h-4 rounded text-[#8b2cff] focus:ring-[#8b2cff] bg-[#0c081a] border-[#2b1f58]"
                  />
                  <span className="text-xs text-white font-semibold">
                    Precisa de troco para quanto?
                  </span>
                </label>

                {needChange && (
                  <div className="pt-1">
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Troco para qual valor? (Total: {formatBRL(finalTotal)})
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 50 ou 100"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className="w-full sm:w-48 px-3 py-2 rounded-xl bg-[#120d26] border border-[#251a4a] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Detalhes do Cartão na Maquininha */}
            {paymentMethod === 'card' && (
              <div className="p-3.5 rounded-2xl bg-[#181133] border border-[#2b1f58] text-xs text-slate-300">
                Nosso entregador levará a maquininha sem fio. Aceitamos cartões de Crédito, Débito e aproximação (NFC).
              </div>
            )}
          </div>

          {/* Resumo Financeiro */}
          <div className="p-4 rounded-2xl bg-[#0f0921] border border-[#231846] space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal dos Itens ({cart.length})</span>
              <span className="text-white font-medium">{formatBRL(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxa de Entrega ({deliveryType === 'delivery' ? 'Canoas' : 'Balcão'})</span>
              <span className={deliveryFee === 0 ? 'text-emerald-400 font-bold' : 'text-white font-medium'}>
                {deliveryFee === 0 ? 'Grátis' : formatBRL(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#231846] text-sm font-black text-white">
              <span>Total a Pagar</span>
              <span className="text-base font-black bg-gradient-to-r from-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
                {formatBRL(finalTotal)}
              </span>
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-95 text-white font-black text-sm shadow-neon-primary transition-all active:scale-[0.98]"
          >
            <span>Confirmar e Enviar Pedido</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
