import assert from 'assert'
import fs from 'fs'
import path from 'path'

console.log('--- INICIANDO TESTES DA GRADE DE CATEGORIAS EM QUADRADOS (IDEIA 1) ---')

const catGridPath = path.resolve('src/components/CategoryGrid.tsx')
const catGridContent = fs.readFileSync(catGridPath, 'utf-8')

// 1. Verificação do layout em 2 colunas no celular (estilo Burger House)
assert.ok(catGridContent.includes('grid-cols-2'), 'Deve possuir grid-cols-2 para celular')
assert.ok(catGridContent.includes('Categorias'), 'Deve exibir título Categorias')
assert.ok(catGridContent.includes('Toque para abrir'), 'Deve exibir texto Toque para abrir')
console.log('✓ Teste 1: Layout em 2 colunas no mobile e cabeçalho oficial validados.')

// 2. Verificação de imagens centrais com cantos arredondados e sombras
assert.ok(catGridContent.includes('rounded-2xl'), 'Thumbnail central deve ter cantos arredondados rounded-2xl')
assert.ok(catGridContent.includes('category.image'), 'Deve renderizar a foto de capa da categoria')
console.log('✓ Teste 2: Thumbnail central estilizado com foto da categoria validado.')

// 3. Verificação do botão de retorno ao cardápio na visualização focada
const appPath = path.resolve('src/App.tsx')
const appContent = fs.readFileSync(appPath, 'utf-8')
assert.ok(appContent.includes('CategoryGrid'), 'CategoryGrid integrado no App.tsx')
assert.ok(appContent.includes('Voltar para Categorias'), 'Botão Voltar para Categorias presente')
assert.ok(appContent.includes('setSelectedCategoryFilter(null)'), 'Ação de reset para a grade de categorias presente')
console.log('✓ Teste 3: Navegação focada com retorno às categorias validada.')

// 4. Verificação de imagens nas categorias padrão
const initialDataPath = path.resolve('src/data/initialData.ts')
const initialDataContent = fs.readFileSync(initialDataPath, 'utf-8')
assert.ok(initialDataContent.includes('/images/copo-500.jpg'), 'Foto de Copos presente')
assert.ok(initialDataContent.includes('/images/acai-strawberry-blueberry.jpg'), 'Foto de Tigelas presente')
assert.ok(initialDataContent.includes('/images/acai-tray-toppings.jpg'), 'Foto de Barcas presente')
assert.ok(initialDataContent.includes('/images/acai-berry-bowl.jpg'), 'Foto de Linha Fit presente')
assert.ok(initialDataContent.includes('/images/creme-cupuacu-castanhas.jpg'), 'Foto de Cremes presente')
assert.ok(initialDataContent.includes('/images/milkshake.jpg'), 'Foto de Smoothies presente')
console.log('✓ Teste 4: Imagens apetitosas configuradas em todas as 6 categorias padrão.')

console.log('\n--- TODOS OS TESTES DA GRADE DE CATEGORIAS PASSARAM COM SUCESSO! ---')
