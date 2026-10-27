import assert from 'assert'
import fs from 'fs'
import path from 'path'

console.log('--- INICIANDO TESTES DO RODAPÉ INSTITUCIONAL E CONTROLE DE VERSÃO (v5.2) ---')

const footerPath = path.resolve('src/components/Footer.tsx')
const footerContent = fs.readFileSync(footerPath, 'utf-8')

// 1. Remoção de "Franquia 340 Pedidos" do rodapé
assert.ok(!footerContent.includes('Franquia 340 Pedidos'), 'O rodapé NÃO deve conter "Franquia 340 Pedidos"')
assert.ok(!footerContent.includes('340 Pedidos'), 'O rodapé NÃO deve conter "340 Pedidos"')
console.log('✓ Teste 1: "Franquia 340 Pedidos" removido com sucesso do rodapé.')

// 2. Preservação de dados da loja em Canoas - RS
assert.ok(footerContent.includes('Canoas - RS'), 'Dados de localização devem ser preservados')
assert.ok(footerContent.includes('config.address'), 'Endereço da loja deve ser preservado')
assert.ok(footerContent.includes('config.phone'), 'WhatsApp/Telefone da loja deve ser preservado')
console.log('✓ Teste 2: Informações de contato e atendimento da loja preservadas.')

// 3. Assinatura Institucional Oficial com Coração e Link NovaesWeb
assert.ok(footerContent.includes('novaesweb-footer-signature'), 'Classe novaesweb-footer-signature presente')
assert.ok(footerContent.includes('novaesweb-heart'), 'Classe novaesweb-heart presente')
assert.ok(footerContent.includes('❤️'), 'Coração presente na assinatura')
assert.ok(footerContent.includes('https://novaesweb.com.br'), 'Link oficial NovaesWeb presente')
assert.ok(footerContent.includes('novaesweb-brand-link'), 'Classe novaesweb-brand-link presente')
console.log('✓ Teste 3: Assinatura oficial com coração e link NovaesWeb validada.')

// 4. Copyright e Versão v5.2 no Rodapé Público
assert.ok(footerContent.includes('novaesweb-copyright'), 'Classe novaesweb-copyright presente')
assert.ok(footerContent.includes('v5.2'), 'Versão v5.2 presente no rodapé público')
console.log('✓ Teste 4: Copyright com marcação v5.2 validada.')

// 5. Indicador de Versão v5.2 no Painel do Lojista
const adminHeaderPath = path.resolve('src/components/admin/AdminHeader.tsx')
const adminHeaderContent = fs.readFileSync(adminHeaderPath, 'utf-8')
assert.ok(adminHeaderContent.includes('novaesweb-version-badge'), 'Badge de versão no header do painel')
assert.ok(adminHeaderContent.includes('v5.2 • Sistema Atualizado'), 'Texto de sistema atualizado v5.2 no painel')
assert.ok(adminHeaderContent.includes('status-dot-green'), 'Ponto verde de status presente')

const appPath = path.resolve('src/App.tsx')
const appContent = fs.readFileSync(appPath, 'utf-8')
assert.ok(appContent.includes('novaesweb-version-badge'), 'Badge de versão no rodapé do painel')
assert.ok(appContent.includes('v5.2'), 'Versão v5.2 presente no painel')
console.log('✓ Teste 5: Indicador de versão v5.2 com status ativo no painel administrativo validado.')

// 6. Registro de Versão engine_version: '5.2' no Check-in
const connectServicePath = path.resolve('src/services/connectService.ts')
const connectServiceContent = fs.readFileSync(connectServicePath, 'utf-8')
assert.ok(connectServiceContent.includes("engine_version: '5.2'"), 'engine_version 5.2 enviada no check-in')
console.log('✓ Teste 6: Parâmetro engine_version: 5.2 integrado ao check-in técnico.')

console.log('\n--- TODOS OS TESTES DO RODAPÉ E VERSÃO v5.2 PASSARAM COM SUCESSO! ---')
