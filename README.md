# Açaí do Rei — Delivery & Gestor de Pedidos
## Modelo Oficial: Novaes Business (Catálogo, Pedidos e Delivery)

Site oficial e painel de gestão de delivery desenvolvido para o cliente **Açaí do Rei** em Canoas - RS, implementado no padrão de engenharia e regras de negócio da **NovaesWeb**.

---

### 👑 1. Identificação do Estabelecimento
- **Marca:** Açaí do Rei
- **Segmento:** Açaiteria Artesanal & Sobremesas Geladas
- **Localização:** Canoas - RS
- **Horário de Funcionamento:** Segunda a Sábado das 18h às 23h30
- **Identidade Visual:** Paleta Primária `#8b2cff` (Roxo Açaí Neon) e Secundária `#ec4899` (Rosa Pink Tropical)
- **Tema:** Dark Mode Premium de alto padrão com contraste e carregamento ultra rápido

---

### 💼 2. Condições Comerciais Contratadas (Plano Novaes Business)
- **Plano:** Novaes Business
- **Taxa de Criação do Projeto:** R$ 578,00
- **Mensalidade Operacional:** R$ 190,00 / mês
- **Rodadas de Revisão na Criação:** Até 2 rodadas
- **Franquia Mensal Inclusa:** 340 pedidos aceitos / mês
- **Tarifa de Excedente:** R$ 0,20 por pedido aceito acima da franquia (cobrado no mês seguinte)
- **Zero Bloqueio:** Atingir ou ultrapassar a franquia **NUNCA bloqueia novos pedidos**. O delivery continua funcionando ininterruptamente.
- **Deduplicação Técnica Estável:** Cada pedido é contabilizado uma única vez para a franquia.
- **Regra de Aceite:** Apenas pedidos **ACEITOS** consom a franquia. Pedidos rejeitados ou não respondidos **não** consomem.
- **Privacidade Total (Caderno 09):** Valores financeiros, faturamento ou dados pessoais de consumidores nunca são trafegados para o painel de franquias da NovaesWeb.

---

### 🚀 3. Funcionalidades da Loja Pública de Delivery
- **Cabeçalho:** Logo moderno com coroa neon, indicador em tempo real de status da loja (Aberto Agora / Fechado) e botão de carrinho flutuante com contador dinâmico.
- **Hero:** Slogan *"O melhor em açaí da sua região"*, badges de segurança, delivery rápido e açaí 100% puro.
- **Navegação por Categorias:** Filtros rápidos (Copos Tradicionais, Tigelas & Taças Gourmet, Barcas da Realeza, Linha Fit & Zero Açúcar, Cremes Tropicais & Cupuaçu, Smoothies & Shakes).
- **Customização de Produto:** Modal com seletor de tamanhos, complementos inclusos grátis (com limite por grupo), adicionais especiais pagos, e campo de observações do cliente.
- **Carrinho Lateral Responsivo:** Alternância entre Entrega em Domicílio (com taxa) e Retirada no Balcão (Grátis), controle de quantidade e subtotal.
- **Checkout Sem Fricção:** Coleta de nome, WhatsApp, endereço completo para entrega e forma de pagamento:
  - **Pix Manual:** Exibição da chave Pix oficial, botão de copiar com 1 clique e instrução de envio de comprovante.
  - **Dinheiro:** Opção de troco configurável.
  - **Cartão:** Maquininha sem fio no delivery ou no balcão.
- **Confirmação & Acompanhamento de Pedido:** Timeline de status em tempo real com botão de envio formatado direto para o WhatsApp da loja.

---

### 🛡️ 4. Funcionalidades do Painel do Lojista (Gestor de Pedidos)
- **Painel em Tempo Real:** Fila Kanban / Abas divididas em *Novos / Aguardando*, *Em Preparo*, *Prontos para Entrega/Balcão*, *Concluídos* e *Rejeitados*.
- **Alerta Sonoro Configurável:** Áudio sintetizado de alta fidelidade via Web Audio API que toca automaticamente a cada novo pedido (com botão de teste e silenciar).
- **Ações Operacionais:**
  - *Aceitar Pedido:* Move para preparo e dispara a função RPC segura `novaesweb_record_order_event` para a auditoria de franquia com deduplicação rigorosa.
  - *Avançar Status:* Pronto para entrega / Balcão e Concluir pedido.
  - *Rejeitar Pedido:* Permite informar motivo opcional e **não** consome a franquia.
- **Impressão de Comanda Térmica (80mm):** Modal com formatação exata de cupom térmico, dados do cliente, itens detalhados, complementos, observações em destaque e acionamento nativo de impressão via `window.print()`.
- **Gestão de Cardápio:** Listagem, busca, criação, edição, pausa e exclusão de produtos (respeitando o limite de até 200 produtos do Plano Business).
- **Configurações da Loja:** Horários de atendimento (Segunda a Sábado 18h às 23h30), modo aberto/fechado manual ou automático, taxa de entrega e chave Pix.
- **Usuários Gestores:** Até 2 administradores cadastrados conforme condições do Plano Business.
- **Aba Meu Plano & Consumo:** Embutido obrigatoriamente o componente oficial `StoreOrderUsageWidget`, exibindo a barra de progresso da franquia de 340 pedidos, alertas em 80% e 100%, e o selo de Garantia de Venda Contínua (Zero Bloqueio).

---

### 💻 5. Instruções de Execução Local

```bash
# Entrar na pasta do projeto
cd C:\Users\camil\.gemini\antigravity\scratch\acai-do-rei

# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev

# Executar testes automatizados de fluxo e regras comerciais
npm test

# Gerar build de produção
npm run build
```

---

### ⚙️ 6. Variáveis de Ambiente (`.env`)

```env
VITE_SUPABASE_URL=https://mabkzkawziqlmgfikwmh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_j6QPu4fgCRZHhOnUPEdyvA_ixP9ibtr
VITE_NOVAESWEB_STORE_ID=acai-do-rei-canoas
VITE_NOVAESWEB_NX_ID=NX-ACAIDOREI
```
