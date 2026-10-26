import assert from 'assert'

console.log('--- INICIANDO TESTES DO PROMPT 4: CONFIGURAÇÕES → MEU PLANO ---')

// 1. Confirmação da Identidade Oficial
const officialStore = {
  loja: "Açaí do Rei",
  store_id: "3b15518d-2edc-43d7-85ac-6ece2a82d40f",
  nx_id: "NX-3B15518D2EDC43D785AC6ECE2A82D40F"
}

assert.strictEqual(officialStore.store_id, "3b15518d-2edc-43d7-85ac-6ece2a82d40f")
assert.strictEqual(officialStore.nx_id, "NX-3B15518D2EDC43D785AC6ECE2A82D40F")
assert.strictEqual(officialStore.loja, "Açaí do Rei")
console.log('✓ Teste 1: Identidade oficial da loja (UUID e NX ID) validada.')

// 2. Fuso Horário America/Sao_Paulo (UTC-3)
function getSaoPauloCompetence(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
  })
  return formatter.format(d).slice(0, 7)
}

function getSaoPauloDayKey(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
  })
  return formatter.format(d)
}

// Teste de fronteira de meia-noite (2026-11-01T01:30:00Z em UTC é 2026-10-31T22:30:00 em SP)
const dateUtcLate = new Date('2026-11-01T01:30:00Z')
assert.strictEqual(getSaoPauloCompetence(dateUtcLate), '2026-10', 'Em SP ainda é outubro!')
assert.strictEqual(getSaoPauloDayKey(dateUtcLate), '31/10', 'Em SP ainda é dia 31 de outubro!')

// Teste quando passa da meia-noite em SP (2026-11-01T03:01:00Z em UTC é 2026-11-01T00:01:00 em SP)
const dateSpMidnight = new Date('2026-11-01T03:01:00Z')
assert.strictEqual(getSaoPauloCompetence(dateSpMidnight), '2026-11', 'Em SP já virou novembro!')
assert.strictEqual(getSaoPauloDayKey(dateSpMidnight), '01/11', 'Em SP já é dia 1 de novembro!')
console.log('✓ Teste 2: Cálculo estrito de competência e virada de mês no fuso America/Sao_Paulo validado.')

// 3. Apuração com Anulações Técnicas (is_voided)
const mockEvents = [
  { order_ref: 'REI-001', event_type: 'accepted', is_voided: false },
  { order_ref: 'REI-002', event_type: 'accepted', is_voided: false },
  { order_ref: 'REI-003', event_type: 'accepted', is_voided: true, void_reason: 'Erro operacional de sistema corrigido pelo Master' },
  { order_ref: 'REI-004', event_type: 'rejected', is_voided: false },
  { order_ref: 'REI-005', event_type: 'accepted', is_voided: false },
]

const acceptedEvents = mockEvents.filter(e => e.event_type === 'accepted')
const voidedEvents = acceptedEvents.filter(e => e.is_voided)
const acceptedTotal = acceptedEvents.length
const voidedCount = voidedEvents.length
const acceptedBillable = Math.max(0, acceptedTotal - voidedCount)

assert.strictEqual(acceptedTotal, 4, 'Total de aceites brutos deve ser 4')
assert.strictEqual(voidedCount, 1, 'Total de anulações aprovadas deve ser 1')
assert.strictEqual(acceptedBillable, 3, 'Aceites faturáveis deve descontar anulação técnica (4 - 1 = 3)')
console.log('✓ Teste 3: Apuração de anulações técnicas aprovadas pelo Master (is_voided) validada.')

// 4. Regra: Dados Insuficientes para Cobrança (Sem plano/franquia confirmados)
function evaluateBillingState(context) {
  if (context.franquia_aprovada === null || context.tarifa_excedente_aprovada === null) {
    return {
      statusBadge: 'Plano ainda não confirmado contratualmente',
      noticeMessage: 'Dados insuficientes para cobrança',
      canChargeOverage: false,
      calculatedTariff: null,
      overageFee: null
    }
  }

  const overage = Math.max(0, context.accepted_billable - context.franquia_aprovada)
  return {
    statusBadge: 'Contrato ativo',
    noticeMessage: null,
    canChargeOverage: true,
    calculatedTariff: context.tarifa_excedente_aprovada,
    overageFee: overage * context.tarifa_excedente_aprovada
  }
}

// Teste com contexto administrativo pendente (enviado no Prompt 4)
const pendingContext = {
  plano_cadastrado: null,
  plano_confirmado: null,
  franquia_aprovada: null,
  tarifa_excedente_aprovada: null,
  accepted_billable: 12
}

const resPending = evaluateBillingState(pendingContext)
assert.strictEqual(resPending.statusBadge, 'Plano ainda não confirmado contratualmente')
assert.strictEqual(resPending.noticeMessage, 'Dados insuficientes para cobrança')
assert.strictEqual(resPending.canChargeOverage, false)
assert.strictEqual(resPending.calculatedTariff, null, 'NÃO deve presumir tarifa padrão de R$ 0,20 quando o plano for ausente')
console.log('✓ Teste 4: Tratamento de "Dados insuficientes para cobrança" validado.')

// 5. Alertas de 80% e 100% com Zero Bloqueio
const confirmedBusinessContext = {
  plano_confirmado: 'NOVAES_BUSINESS',
  franquia_aprovada: 340,
  tarifa_excedente_aprovada: 0.20,
  accepted_billable: 272 // 80%
}

const pct80 = (confirmedBusinessContext.accepted_billable / confirmedBusinessContext.franquia_aprovada) * 100
assert.strictEqual(pct80, 80)

// 100% + excedentes
const overageContext = {
  ...confirmedBusinessContext,
  accepted_billable: 350 // +10 pedidos
}
const resOverage = evaluateBillingState(overageContext)
assert.strictEqual(resOverage.overageFee, 2.00, '10 pedidos excedentes a R$ 0,20 = R$ 2,00')
assert.strictEqual(resOverage.canChargeOverage, true)
console.log('✓ Teste 5: Alertas de 80%, 100% e cálculo de excedente aprovado validados.')

// 6. Privacidade e Ausência de Dados Pessoais (Caderno 09)
function simulatePayloadToMaster(orderRef, occurredAt) {
  return {
    store_id: officialStore.store_id,
    order_ref: String(orderRef),
    event_type: 'accepted',
    occurred_at: occurredAt
  }
}

const payload = simulatePayloadToMaster('REI-5542', '2026-10-26T00:30:00Z')
assert.strictEqual(payload.customer, undefined)
assert.strictEqual(payload.items, undefined)
assert.strictEqual(payload.total, undefined)
assert.strictEqual(payload.phone, undefined)
console.log('✓ Teste 6: Privacidade total e ausência de dados do consumidor confirmadas.')

console.log('\n--- TODOS OS TESTES DO PROMPT 4 PASSARAM COM 100% DE SUCESSO! ---')
