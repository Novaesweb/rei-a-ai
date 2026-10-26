import assert from 'node:assert'

console.log('--- INICIANDO TESTES DO PROMPT 5 (CONTAGEM DE PEDIDOS & FRANQUIA) ---')

// 1. Simulação do Banco de Dados e Fila de Eventos de Ciclo de Vida
const countedAcceptedOrders = new Set()
const eventLog = []

function recordOrderEventSimulation(payload) {
  // Verificação estrita de privacidade (Caderno 09)
  const forbiddenKeys = ['cart', 'items', 'total', 'subtotal', 'customer_name', 'customer_phone', 'customer_address']
  for (const k of forbiddenKeys) {
    if (k in payload) {
      throw new Error(`VIOLAÇÃO DE PRIVACIDADE: ${k} não pode ser enviado para a auditoria da franquia!`)
    }
  }

  assert.ok(payload.p_store_id, 'p_store_id é obrigatório')
  assert.ok(payload.p_order_ref, 'p_order_ref é obrigatório')
  assert.ok(payload.p_event_type, 'p_event_type é obrigatório')

  const orderRef = payload.p_order_ref
  const eventType = payload.p_event_type
  let alreadyCounted = countedAcceptedOrders.has(orderRef)

  eventLog.push({ ...payload, loggedAt: new Date().toISOString() })

  if (eventType === 'accepted') {
    if (alreadyCounted) {
      return { recorded: true, already_counted: true, event_type: eventType }
    }
    countedAcceptedOrders.add(orderRef)
    return { recorded: true, already_counted: false, event_type: eventType }
  }

  // Eventos 'cancelled', 'rejected', 'delivered', 'hidden' não removem nem criam novo aceite
  return { recorded: true, already_counted: alreadyCounted, event_type: eventType }
}

// 2. Teste 1: Aceite Único
const res1 = recordOrderEventSimulation({
  p_store_id: 'acai-do-rei-uuid',
  p_order_ref: 'REI-2001',
  p_event_type: 'accepted',
  p_status_from: 'pending',
  p_status_to: 'preparing',
  p_occurred_at: new Date().toISOString(),
})
assert.strictEqual(res1.already_counted, false)
assert.strictEqual(countedAcceptedOrders.size, 1, 'Contador de pedidos aceitos deve ser 1')
console.log('✓ Teste 1: Aceite inicial contabilizado com sucesso.')

// 3. Teste 2: Aceite Repetido / Deduplicação (idempotência)
const res2 = recordOrderEventSimulation({
  p_store_id: 'acai-do-rei-uuid',
  p_order_ref: 'REI-2001',
  p_event_type: 'accepted',
  p_status_from: 'preparing',
  p_status_to: 'preparing',
  p_occurred_at: new Date().toISOString(),
})
assert.strictEqual(res2.already_counted, true)
assert.strictEqual(countedAcceptedOrders.size, 1, 'Contador deve permanecer exatamente 1 após reenvio')
console.log('✓ Teste 2: Deduplicação garantida (já contado, não incrementa).')

// 4. Teste 3: Rejeição Antes do Aceite
const resReject = recordOrderEventSimulation({
  p_store_id: 'acai-do-rei-uuid',
  p_order_ref: 'REI-2002',
  p_event_type: 'rejected',
  p_status_from: 'pending',
  p_status_to: 'rejected',
  p_occurred_at: new Date().toISOString(),
})
assert.strictEqual(countedAcceptedOrders.has('REI-2002'), false)
assert.strictEqual(countedAcceptedOrders.size, 1, 'Pedidos rejeitados não entram na contagem faturável')
console.log('✓ Teste 3: Pedido rejeitado não consome a franquia.')

// 5. Teste 4: Pedido Aceito e Depois Cancelado (Continua Faturável)
const resCancel = recordOrderEventSimulation({
  p_store_id: 'acai-do-rei-uuid',
  p_order_ref: 'REI-2001',
  p_event_type: 'cancelled',
  p_status_from: 'preparing',
  p_status_to: 'cancelled',
  p_reason_category: 'cliente_desistiu',
  p_occurred_at: new Date().toISOString(),
})
assert.strictEqual(countedAcceptedOrders.has('REI-2001'), true)
assert.strictEqual(countedAcceptedOrders.size, 1, 'Pedido cancelado após aceite continua contabilizado na franquia')
console.log('✓ Teste 4: Regra 3 (Cancelado após aceite continua faturável) validada.')

// 6. Teste 5: Ocultação / Exclusão no Painel (Continua Contabilizado)
const resHidden = recordOrderEventSimulation({
  p_store_id: 'acai-do-rei-uuid',
  p_order_ref: 'REI-2001',
  p_event_type: 'hidden',
  p_occurred_at: new Date().toISOString(),
})
assert.strictEqual(countedAcceptedOrders.has('REI-2001'), true)
assert.strictEqual(countedAcceptedOrders.size, 1, 'Ocultar ou excluir no painel não remove da contagem')
console.log('✓ Teste 5: Regra 4 (Ocultação não reduz contagem de franquia) validada.')

// 7. Teste 6: Zero Bloqueio e Tarifa de Excedente do Plano Business
function evaluateBusinessOverage(acceptedCount) {
  const franchise = 340
  const tariff = 0.20
  const overage = Math.max(0, acceptedCount - franchise)
  const fee = overage * tariff
  const isZeroBloqueio = overage > 0

  return { franchise, acceptedCount, overage, fee, isZeroBloqueio }
}

const sim350 = evaluateBusinessOverage(350) // 10 pedidos excedentes
assert.strictEqual(sim350.overage, 10)
assert.strictEqual(sim350.fee, 2.00) // 10 * 0.20
assert.strictEqual(sim350.isZeroBloqueio, true)
console.log('✓ Teste 6: Zero Bloqueio e faturamento de excedente (R$ 0,20 por pedido) validados.')

console.log('\n--- TODOS OS TESTES DO PROMPT 5 PASSARAM COM 100% DE SUCESSO! ---')
