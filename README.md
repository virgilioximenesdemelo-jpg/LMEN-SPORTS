# LMEN SPORTS — Loja Oficial de Artigos Esportivos

> "Seu estilo. Seu esporte. Sua identidade."

Uma aplicação web **FULL-STACK** de alta performance desenvolvida para a **LMEN SPORTS / LMENSPORTES**, loja especializada em futebol, moda esportiva, treino e lifestyle.

---

## ⚽ Funcionalidades Principais

- **Identidade Visual Autêntica LMEN SPORTS**:
  - Logotipo oficial com silhueta dinâmica do jogador chutando a bola e moldura tipográfica `LMEN - SPORTS`.
  - Versões para desktop, mobile, favicon SVG e suporte a **Modo Escuro (Dark Mode)** e **Modo Claro**.
- **Catálogo Esportivo Completo (50+ Produtos)**:
  - Camisas de times oficiais & retrô
  - Chuteiras profissionais de campo (FG) com placa de carbono
  - Chuteiras society (TF) com amortecimento para grama sintética
  - Tênis de corrida com tecnologia NitroFoam
  - Camisas oversized streetwear (algodão 240g)
  - Shorts 2 em 1 de alta compressão com bolso para celular
  - Meiões antiderrapantes com grip de silicone profissional
  - Bonés snapback de sarja pesada
  - Agasalhos corta-vento hidrorrepelentes (DWR)
  - Acessórios, bolsas térmicas e caneleiras de baixo volume
- **13 Categorias Estruturadas**:
  - Futebol, Chuteiras, Society, Tênis, Camisas, Oversized, Shorts, Meias, Meiões, Bonés, Agasalhos, Acessórios, Ofertas.
- **Filtros Avançados e Busca Inteligente**:
  - Filtro dinâmico por categoria, marca, faixa de preço (R$ 50 a R$ 600+), tamanhos (PP-XG / 38-44), gênero, disponibilidade em estoque.
  - Ordenação por: Mais Relevantes, Mais Vendidos, Menor Preço, Maior Preço, Melhor Avaliados e Lançamentos.
  - Modal de busca instantânea com sugestões populares.
- **Página de Produto Profissional**:
  - Galeria de imagens com miniaturas selecionáveis
  - Seletor de cores e tamanhos em tempo real
  - Guia de tamanhos com modal de medidas (peito, tórax, comprimento, tabela BR/US/EUR)
  - Cálculo de frete por CEP (Correios SEDEX, PAC e Transportadora com rastreio de frete grátis)
  - Abas com Descrição, Características, Composição, Cuidados e Envio
  - Avaliações de clientes com selo de **Compra Verificada** e envio de novos reviews
- **Carrinho & Checkout Completo**:
  - Slide-out Cart Drawer com barra de progresso para Frete Grátis
  - Sistema de cupons de desconto (`LMEN10`, `PRIMEIRACOMPRA`, `FRETEGRATIS`, `FUTEBOL20`)
  - Checkout em 4 etapas: Identificação, Endereço (autocompletar via CEP), Entrega e Pagamento
  - **Pagamento via PIX**: QR Code SVG dinâmico, código Copia e Cola, timer de expiração e simulação de aprovação instantânea
  - **Cartão de Crédito**: parcelamento em até 10x sem juros com ambiente seguro
- **Rastreamento de Pedidos em Tempo Real (`/pedido/:id`)**:
  - Linha do tempo: Pedido Realizado ➔ Pagamento Aprovado ➔ Pedido Preparado ➔ Pedido Enviado ➔ Em Trânsito ➔ Entregue
  - Código de rastreamento oficial dos Correios/Transportadora
- **Painel Administrativo Completo (`/admin`)**:
  - Dashboard de vendas do dia, volume de pedidos, ticket médio e clientes cadastrados
  - Gráficos de vendas semanais e divisão de faturamento por categoria
  - CRUD completo de produtos (adicionar, editar, alterar preços, estoque e fotos)
  - Alerta visual de estoque baixo e controle de reposição
  - Gerenciamento de status de pedidos (de Pendente até Entregue/Cancelado)
  - Configurações da loja (alteração da barra de anúncios do topo, valor de frete grátis, WhatsApp e redes sociais)

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, TypeScript (TSX)
- **Persistência**: Arquivo JSON com cache em memória e sincronização atômica em disco (`data/database.json`), pronto para migração direta para PostgreSQL / Supabase
- **SEO & Performance**: OpenGraph, Twitter Cards, Meta tags em português do Brasil e Schema.org `Product` JSON-LD estruturado

---

## 🚀 Instalação e Execução Local

### 1. Clonar repositório e instalar dependências:
```bash
npm install
```

### 2. Configurar variáveis de ambiente:
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 3. Executar o servidor full-stack de desenvolvimento:
```bash
npm run dev
```
O servidor Express iniciará com os middlewares do Vite em `http://localhost:3000`.

### 4. Build para produção:
```bash
npm run build
npm start
```

---

## 🔐 Acesso Administrativo

- **URL**: `/admin` ou clique no botão **ADMIN** no cabeçalho
- **E-mail Padrão**: `admin@lmensports.com.br`
- **Senha Padrão**: `admin_lmen_2026_sports` (ou `admin` em ambiente de testes)

---

## 📦 Estrutura de Arquivos

```
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── server.ts                  # Servidor Express Full-Stack com API REST
├── src/
│   ├── App.tsx               # Roteamento e orquestração de estados
│   ├── types/                # Definições completas TypeScript
│   ├── data/                 # Catálogo inicial de 50+ produtos e categorias
│   ├── context/              # CartContext, FavoritesContext, ThemeContext, AuthContext
│   ├── services/             # Cliente de API frontend
│   ├── components/
│   │   ├── common/           # LmenLogo, Header, Footer, AnnouncementBar, SearchModal, etc.
│   │   ├── product/          # ProductCard, ProductReviews, SizeGuideModal, ShippingCalculator
│   │   └── cart/             # CartDrawer
│   └── views/                # HomeView, CategoryView, ProductDetailView, CheckoutView, etc.
└── public/
    └── favicon.svg           # Ícone oficial da LMEN SPORTS
```
