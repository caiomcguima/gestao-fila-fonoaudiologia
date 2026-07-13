# GESTÃO DE FILA - FONOAUDIOLOGIA

## Referência de Design

Este projeto segue a identidade visual oficial do **Sistema Único de Saúde (SUS)** conforme Manual de Identidade Visual v1.1 (abril 2024).

---

## Filosofia de Design Escolhida: **Institucional Profissional com Acessibilidade**

### Design Movement
**Modernismo Administrativo Brasileiro** — Design limpo, funcional e acessível, inspirado em sistemas de saúde pública que priorizam clareza, eficiência e confiança.

### Core Principles
1. **Clareza Funcional**: Interface direta e sem ambiguidades, facilitando a entrada rápida de dados e consulta de informações
2. **Confiança Institucional**: Uso consistente da identidade SUS transmite profissionalismo e legitimidade
3. **Acessibilidade**: Contraste adequado, tipografia legível, navegação intuitiva para usuários de diferentes níveis de letramento digital
4. **Eficiência Operacional**: Layout que minimiza cliques e maximiza visibilidade das informações críticas

### Color Philosophy
- **Azul SUS Primário**: `#005BAA` (Pantone 287C / RGB 0, 91, 170) — Cor institucional que transmite confiança, segurança e profissionalismo
- **Neutros Funcionais**: Brancos, cinzas e pretos para máxima legibilidade
- **Vermelho de Alerta**: Para status críticos (Cancelado, Perdeu a Vaga)
- **Verde de Sucesso**: Para status positivos (Alta)
- **Amarelo de Atenção**: Para status em andamento (Em Atendimento)

### Layout Paradigm
- **Sidebar Persistente**: Navegação fixa à esquerda com logo SUS e menu principal
- **Área de Conteúdo Fluida**: Formulário de cadastro no topo, planilha de dados abaixo
- **Seções Claramente Delimitadas**: Separação visual entre entrada de dados e visualização

### Signature Elements
1. **Logo SUS Integrado**: Marca oficial no header/sidebar para reforçar identidade institucional
2. **Tabela Estruturada**: Planilha com linhas alternadas e hover states para melhor legibilidade
3. **Cards de Status**: Badges coloridas que indicam o estado de cada paciente visualmente

### Interaction Philosophy
- **Feedback Imediato**: Cada ação (gravar, buscar, exportar) fornece confirmação visual (toast notifications)
- **Modais Contextuais**: Diálogos para seleção de profissional e inserção de diagnóstico
- **Hover States Sutis**: Linhas da tabela destacam-se ao passar o mouse
- **Transições Suaves**: Animações de 150-200ms para abrir/fechar diálogos

### Animation
- Modais: Fade-in suave (150ms) com scale leve
- Toasts: Slide-in rápido (200ms) do canto inferior direito
- Hover em linhas: Mudança de background color (100ms)
- Transições de status: Fade entre cores (150ms)
- Respeitar `prefers-reduced-motion`

### Typography System
- **Fonte Principal**: Helvetica (conforme manual SUS) ou fallback para -apple-system, BlinkMacSystemFont, "Segoe UI"
- **Títulos (H1-H2)**: 24-32px, weight 700 (bold), letter-spacing -0.5px
- **Subtítulos (H3-H4)**: 16-20px, weight 600 (semibold)
- **Body Text**: 14-16px, weight 400 (regular), line-height 1.5
- **Labels e Inputs**: 14px, weight 500 (medium)
- **Badges/Status**: 12px, weight 600 (semibold), uppercase

### Brand Essence
**Gestão de Fila SUS**: Sistema confiável, transparente e eficiente para organizar atendimentos de fonoaudiologia, permitindo que gestores e profissionais acompanhem pacientes em tempo real com segurança e clareza.

**Personality**: Profissional, Confiável, Transparente

### Brand Voice
- **Headlines**: Diretas, sem jargão desnecessário. Ex: "Adicionar Paciente", "Fila de Espera"
- **CTAs**: Ação clara e objetiva. Ex: "Gravar Dados", "Exportar para PDF", "Buscar Paciente"
- **Microcopy**: Instruções breves e precisas. Ex: "Selecione a fonoaudióloga responsável", "Máximo 180 caracteres"
- **Tone**: Formal mas acessível, sem condescendência

### Wordmark & Logo
- **Uso**: Logo oficial do SUS no topo do sidebar/header
- **Tamanho**: Proporcional ao manual (mínimo 10mm em tela)
- **Alternativa**: Se necessário, usar versão monocromática em azul SUS

### Signature Brand Color
**Azul SUS**: `#005BAA` — Cor primária para botões, links, highlights e elementos interativos

---

## Paleta de Cores Completa

| Elemento | Hex | RGB | Uso |
|----------|-----|-----|-----|
| Azul SUS Primário | #005BAA | 0, 91, 170 | Botões, links, headers |
| Azul SUS Secundário | #003D7A | 0, 61, 122 | Hover states, backgrounds |
| Branco | #FFFFFF | 255, 255, 255 | Backgrounds, cards |
| Cinza Claro | #F5F5F5 | 245, 245, 245 | Backgrounds alternativos |
| Cinza Médio | #CCCCCC | 204, 204, 204 | Borders, dividers |
| Cinza Escuro | #666666 | 102, 102, 102 | Text secundário |
| Preto | #000000 | 0, 0, 0 | Text primário |
| Verde Sucesso | #27AE60 | 39, 174, 96 | Status "Alta" |
| Amarelo Atenção | #F39C12 | 243, 156, 18 | Status "Em Atendimento" |
| Vermelho Alerta | #E74C3C | 231, 76, 60 | Status "Cancelado", "Perdeu a Vaga" |
| Azul Info | #3498DB | 52, 152, 219 | Status "Aguardando" |

---

## Estrutura de Páginas

### 1. Home / Dashboard Principal
- Header com logo SUS + título "GESTÃO DE FILA - FONOAUDIOLOGIA"
- Sidebar com menu de navegação
- Seção de Cadastro de Paciente (formulário)
- Seção de Visualização de Fila (tabela com busca e filtros)

### 2. Componentes Principais
- **FormularioCadastro**: Inputs para DATA, DN, CPF, CNS, UBS, STATUS, DIAGNÓSTICO
- **TabelaPacientes**: Exibição de dados com busca e filtros
- **ModalSelecionarProfissional**: Diálogo para escolher fonoaudióloga
- **ModalDiagnostico**: Diálogo para inserir diagnóstico (máx 180 caracteres)
- **BotaoExportarPDF**: Exportar fila completa ou filtrada

---

## Decisões Técnicas

- **Armazenamento**: LocalStorage para persistência de dados no navegador
- **Exportação PDF**: Biblioteca `jspdf` + `html2canvas` ou similar
- **Validação**: Máscaras de input para CPF, CNS, DN
- **Responsividade**: Desktop-first (conforme requisito), mas com suporte a tablets

---

## Próximos Passos

1. Implementar formulário com validações
2. Criar tabela com dados de exemplo
3. Implementar busca e filtros
4. Adicionar exportação para PDF
5. Testar e refinar UX
