# Observatório da Economia Brasileira

Painel público da economia brasileira e de 11 países de comparação: Estados Unidos, Chile, Argentina, Paraguai, Uruguai, México, Colômbia, Peru, China, Índia e África do Sul.

**Site:** https://luddevergard3n.github.io/observatorio-economia/

O intervalo de consulta é 1988–2026, respeitando a cobertura de cada fonte. Não existe preenchimento artificial de anos ausentes. Datas de referência, coleta e mudanças metodológicas são distintas. A atualização horária consulta as fontes; não transforma pesquisas mensais ou anuais em medições em tempo real.

## Recursos

- Panorama com PIB, IPCA, Selic, desemprego, dólar PTAX e dívida bruta.
- Catálogo por área, pesquisa, comparações entre 12 países e filtros compartilháveis por URL.
- Gráficos Apache ECharts, tabela acessível, exportações CSV/JSON/PNG e temas claro/escuro.
- Histórico de leis e mudanças metodológicas com documentos primários. Anotações não estabelecem causalidade.
- IDMI autoral em seção separada: perfis congelados da edição experimental de 2023, com nove dimensões indexadas, variantes monetárias e lacunas explícitas. Nenhuma nota geral é publicada sem evidência completa.
- Coletor C# com preservação do último conjunto válido, hashes de respostas e registro de revisões.

## Requisitos e comandos

Node.js 24 e .NET SDK 10. O `package-lock.json` fixa as versões instaladas. O coletor usa somente a biblioteca padrão do .NET.

```sh
npm ci
npm run dev
npm run validate
npm run test:e2e
npm run collect
npm run build
npm run preview
```

`dev` abre o servidor em `http://127.0.0.1:5173`; `preview` serve a compilação em `http://127.0.0.1:4173`. Não abrir o HTML diretamente por `file://`. Os testes de navegador usam Microsoft Edge instalado, tanto localmente quanto na imagem oficial Ubuntu 24.04 do GitHub Actions.

```sh
dotnet run --project collector -- --only ipca,usd
dotnet run --project collector -- --full
dotnet run --project collector -- --as-of 2026-10-26 --output .cache/snapshot
```

`--as-of` limita os períodos de referência; **não reconstrói o que a instituição sabia naquela data**. As fontes consultadas são suas versões atuais. `--only` mantém as outras séries do último manifesto. Para cálculos derivados, coletar primeiro suas entradas ou partir de um snapshot válido.

## Estrutura

```text
catalog/                 Definições, fontes, unidades e disponibilidade
collector/               Coleta C#, validação e proveniência
src/components/          Apresentação, gráficos, tabela e componentes shadcn/ui
src/content/             Eventos históricos documentados
src/lib/                 Dados, formatos e matemática do IDMI
src/pages/               Telas do painel
public/data/             Séries normalizadas, manifesto e revisões
tests/CollectorChecks/   Verificações determinísticas do coletor
tests/web/               Testes de matemática e exportação
tests/browser/           Navegação, downloads e responsividade
docs/                    Metodologia, fontes e operação
.github/workflows/       Atualização horária e publicação no GitHub Pages
```

Não há diretório `include/`: este projeto não possui cabeçalhos C/C++.

## Decisões e dependências

- **C#/.NET 10:** coletor auditável, sem serviço próprio e sem bibliotecas externas de processamento de dados.
- **React/TypeScript e Vite:** interface estática compatível com GitHub Pages. A escolha web permite ECharts e shadcn/ui solicitados, preservando C# na coleta.
- **shadcn/ui, Radix UI, Tailwind CSS:** controles acessíveis e componentes locais; não misturamos vários sistemas visuais. `class-variance-authority`, `clsx` e `tailwind-merge` são auxiliares dos componentes gerados.
- **Apache ECharts:** séries temporais, lacunas, zoom e anotações. Carregado separadamente quando necessário; seu pacote comprimido ainda é significativo, cerca de 191 kB gzip nesta versão.
- **Lucide React:** ícones SVG, sem fontes remotas.
- **Vitest e Playwright:** verificações de cálculos e comportamento real da interface.
- O navegador consulta somente arquivos estáticos do próprio site. Não multiplica requisições às APIs conforme o número de visitantes. Não há analytics, contas, cookies de rastreamento ou segredos no frontend; apenas a preferência visual é guardada localmente.

## Dados, limitações e publicação

Leia [fontes e cobertura](docs/DATA-SOURCES.md), [mudanças metodológicas e contexto político](docs/METHODOLOGY-CHANGES.md), [metodologia IDMI](docs/IDMI.md) e [operação](docs/OPERATIONS.md).

O catálogo inclui integrações pendentes, identificadas no painel. Isso não equivale a cobertura completa de todas as métricas desde 1988. Em particular: DPF/Tesouro, saldo Novo Caged, resultado primário internacional, patrimônio não humano e alguns componentes de infraestrutura precisam de integração ou validação adicional. Dados Fraser não são redistribuídos nesta versão.

Banco Mundial e FMI podem harmonizar estatísticas nacionais; não são automaticamente medições independentes do IBGE. O IGP-M da FGV é uma fonte distinta, mas mede outra cesta. Uma mudança documentada de método não demonstra, por si, manipulação política.

O código desta versão não recebeu uma licença de redistribuição escolhida pelo autor. Componentes de terceiros mantêm suas licenças originais, identificadas no lockfile e nos pacotes. Dados possuem condições próprias, descritas na documentação das fontes. Não presumir que publicação no GitHub concede direitos sobre qualquer base.
