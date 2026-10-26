import assert from 'node:assert'

console.log('--- INICIANDO TESTES DO SISTEMA AÇAÍ DO REI (NOVAES BUSINESS) ---')

// 1. Teste de cálculo de frete e balcão
function calculateOrderTotal(subtotal, deliveryType, deliveryFee = 5.0) {
  const fee = deliveryType === 'delivery' ? deliveryFee : 0.0
  return {
    subtotal,
    fee,
    total: subtotal + fee,
  }
}

const testDelivery = calculateOrderTotal(28.4, 'delivery', 5.0)
assert.strictEqual(testDelivery.fee, 5.0, 'Taxa de entrega deve ser R$ 5,00 para modalidade delivery')
assert.strictEqual(testDelivery.total, 33.4, 'Total do delivery deve somar subtotal + frete')
console.log('✓ Teste 1: Cálculo de frete para entrega em domicílio validado.')

const testPickup = calculateOrderTotal(28.4, 'pickup', 5.0)
assert.strictEqual(testPickup.fee, 0.0, 'Taxa para retirada no balcão deve ser R$ 0,00 (Grátis)')
assert.strictEqual(testPickup.total, 28.4, 'Total para retirada no balcão deve ser estritamente igual ao subtotal')
console.log('✓ Teste 2: Cálculo para retirada no balcão (grátis) validado.')

// 2. Teste de Deduplicação Técnica Estável de Pedidos Aceitos
const reportedOrdersSet = new Set()

function simulateReportOrderAccepted(orderId) {
  if (reportedOrdersSet.has(orderId)) {
    return { success: true, deduplicated: true }
  }
  reportedOrdersSet.add(orderId)
  return { success: true, deduplicated: false }
}

const orderId = 'REI-1099'
const firstAttempt = simulateReportOrderAccepted(orderId)
assert.strictEqual(firstAttempt.deduplicated, false, 'Primeiro aceite deve ser contabilizado')

const secondAttempt = simulateReportOrderAccepted(orderId)
assert.strictEqual(secondAttempt.deduplicated, true, 'Segundo clique/tentativa no mesmo pedido deve ser deduplicado (não contabilizado novamente)')
assert.strictEqual(reportedOrdersSet.size, 1, 'Total no set deve permanecer exatamente 1')
console.log('✓ Teste 3: Deduplicação técnica de aceite validada.')

// 3. Teste de Regras de Contagem e Faturamento da Franquia (340 pedidos / Zero Bloqueio)
function calculateFranchiseUsage(acceptedCount, franchise = 340, tariff = 0.20) {
  const remaining = Math.max(0, franchise - acceptedCount)
  const overage = acceptedCount > franchise ? acceptedCount - franchise : 0
  const overageFee = overage * tariff
  const percentage = Math.round((acceptedCount / franchise) * 100)
  const alert80 = percentage >= 80 && percentage < 100
  const alert100 = percentage >= 100
  const isZeroBloqueio = overage > 0

  return {
    franchise,
    acceptedCount,
    remaining,
    overage,
    overageFee,
    percentage,
    alert80,
    alert100,
    isZeroBloqueio,
  }
}

// Cenário Normal (100 pedidos)
const usageNormal = calculateFranchiseUsage(100)
assert.strictEqual(usageNormal.remaining, 240)
assert.strictEqual(usageNormal.overage, 0)
assert.strictEqual(usageNormal.overageFee, 0)
assert.strictEqual(usageNormal.alert80, false)
console.log('✓ Teste 4: Consumo normal dentro da franquia validado.')

// Cenário 80% (272 pedidos)
const usage80 = calculateFranchiseUsage(272)
assert.strictEqual(usage80.alert80, true)
assert.strictEqual(usage80.remaining, 68)
console.log('✓ Teste 5: Alerta visual de 80% da franquia validado.')

// Cenário 100% e Excedente Zero Bloqueio (360 pedidos = +20 excedentes a R$ 0,20 = R$ 4,00)
const usageExcedente = calculateFranchiseUsage(360)
assert.strictEqual(usageExcedente.remaining, 0)
assert.strictEqual(usageExcedente.overage, 20)
assert.strictEqual(usageExcedente.overageFee, 4.0)
assert.strictEqual(usageExcedente.isZeroBloqueio, true)
console.log('✓ Teste 6: Garantia de Zero Bloqueio e tarifa de excedente (+20 pedidos = R$ 4,00) validada.')

// 4. Teste de Limites do Plano Business
const MAX_PRODUCTS_LIMIT = 200
const MAX_ADMINS_LIMIT = 2

function canAddProduct(currentCount) {
  return currentCount < MAX_PRODUCTS_LIMIT
}

assert.strictEqual(canAddProduct(199), true, 'Deve permitir adicionar até 199 produtos')
assert.strictEqual(canAddProduct(200), false, 'Não deve permitir exceder 200 produtos no plano Business')
console.log('✓ Teste 7: Limite de até 200 produtos ativos do Plano Business validado.')

console.log('\n--- TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! ---')
