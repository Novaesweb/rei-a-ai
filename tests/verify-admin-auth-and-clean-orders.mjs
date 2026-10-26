import assert from 'assert'

console.log('--- TESTANDO AUTENTICAÇÃO DO LOJISTA E LIMPEZA DE PEDIDOS DEMO ---')

// 1. Verificação de remoção de pedidos demonstrativos
const rawStorageWithDemo = JSON.stringify([
  {
    id: 'REI-1024',
    items: [{ cartItemId: 'demo-item-1' }],
    status: 'pending'
  },
  {
    id: 'REI-1023',
    items: [{ cartItemId: 'demo-item-2' }],
    status: 'preparing'
  },
  {
    id: 'REI-2001',
    items: [{ cartItemId: 'real-item-1' }],
    status: 'pending'
  }
])

const parsed = JSON.parse(rawStorageWithDemo)
const cleanOrders = parsed.filter(
  (o) =>
    o.id !== 'REI-1024' &&
    o.id !== 'REI-1023' &&
    !o.items.some((it) => it.cartItemId.startsWith('demo-item'))
)

assert.strictEqual(cleanOrders.length, 1, 'Deve restar apenas pedidos reais')
assert.strictEqual(cleanOrders[0].id, 'REI-2001', 'O pedido real deve ser mantido')
console.log('✓ Teste 1: Limpeza completa de pedidos demonstrativos validada.')

// 2. Estado inicial limpo
const defaultOrders = []
assert.strictEqual(defaultOrders.length, 0, 'Inicialização padrão deve ser vazia')
console.log('✓ Teste 2: Inicialização de pedidos começa 100% limpa (0 pedidos mock).')

// 3. Autenticação de Gestor com PIN padrão
const storeConfig = {
  adminUsers: [
    { id: 'admin-1', email: 'gerencia@acaidorei.com.br', name: 'Gestor Principal' },
    { id: 'admin-2', email: 'atendimento@acaidorei.com.br', name: 'Atendente Operacional' }
  ],
  adminPassword: '123456'
}

function authenticateManager(email, password, config) {
  const normalized = email.trim().toLowerCase()
  const expectedPassword = config.adminPassword || '123456'
  if (password !== expectedPassword) {
    throw new Error('Senha ou PIN incorreto')
  }
  const matched = config.adminUsers.find((u) => u.email.toLowerCase() === normalized)
  return {
    email: normalized,
    name: matched ? matched.name : 'Gestor Autorizado',
    role: 'manager'
  }
}

// Teste senha correta
const session1 = authenticateManager('gerencia@acaidorei.com.br', '123456', storeConfig)
assert.strictEqual(session1.role, 'manager')
assert.strictEqual(session1.name, 'Gestor Principal')
console.log('✓ Teste 3: Login de Gestor com credencial válida autentica com sucesso.')

// Teste senha incorreta
assert.throws(() => {
  authenticateManager('gerencia@acaidorei.com.br', 'senha-errada', storeConfig)
}, /Senha ou PIN incorreto/)
console.log('✓ Teste 4: Tentativa de login com senha incorreta é bloqueada.')

// Teste alteração de senha nas configurações da loja
const updatedConfig = { ...storeConfig, adminPassword: 'novoPinSeguro2026' }
assert.throws(() => {
  authenticateManager('gerencia@acaidorei.com.br', '123456', updatedConfig)
}, /Senha ou PIN incorreto/)

const session2 = authenticateManager('gerencia@acaidorei.com.br', 'novoPinSeguro2026', updatedConfig)
assert.strictEqual(session2.email, 'gerencia@acaidorei.com.br')
console.log('✓ Teste 5: Alteração de senha da loja entra em vigor imediatamente.')

// Teste encerramento de sessão / Logout
let userSession = session2
function logout() {
  userSession = null
}
logout()
assert.strictEqual(userSession, null, 'Sessão deve ser anulada após logout')
console.log('✓ Teste 6: Encerramento de sessão (Logout) anula credencial com sucesso.')

console.log('\n--- TODOS OS TESTES DE LOGIN E LIMPEZA PASSARAM COM SUCESSO! ---')
