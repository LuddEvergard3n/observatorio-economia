# Operação e publicação

## GitHub Pages e atualização

`.github/workflows/publish.yml` publica a branch `main` via GitHub Actions. A branch `data` guarda os snapshots e revisões mais recentes, sem alterar o histórico do código. O build começa pelo código atual e restaura `public/data` da branch de dados.

O agendamento é `17 * * * *` (UTC). Atualizações de fontes ocorrem no agendamento ou na execução manual com `refresh=true`; um push de código republica os dados preservados, sem uma rodada extra de chamadas. O GitHub pode atrasar ou suspender agendamentos por inatividade. A interface avisa quando o manifesto tem mais de três horas; a data de cada série continua visível. [Limitações oficiais do agendamento](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

Coleta serial, intervalo mínimo de um segundo por host, até três tentativas para HTTP 429/5xx, respeito ao Retry-After até 30 segundos (acima disso, adiar para outra execução), limite de resposta de 32 MiB. Timeout de cabeçalhos de 60 segundos. Respostas HTML não são interpretadas como dados. Falhas preservam a última série válida, com indicação no manifesto; se nenhuma série estiver pronta, o processo falha.

BCB atualiza dois anos recentes, começando no primeiro dia do mês. Reconciliação completa: domingo entre 03:00–03:59 de Brasília ou execução manual com `full=true`. Outras bases devolvem séries completas. Respostas são reutilizadas dentro da execução; ETag e Last-Modified permitem requisições condicionais quando o provedor oferece suporte.

Não há garantia de que todas as fontes publicarão a cada hora. A coleta central evita chamadas de cada visitante às APIs.

Abas abertas verificam o manifesto estático a cada hora e preservam a versão visível se a conexão falhar. Selic, IPCA e dívida bruta mantêm duas casas decimais no panorama; a PTAX mantém quatro.

## Verificação

```sh
npm run validate
npm run test:e2e
dotnet run --project collector -- --only ipca
```

Os testes determinísticos não dependem das APIs. A coleta é uma verificação de integração separada. O build verifica TypeScript e produz `dist/`; teste de navegador verifica navegação, tabelas, downloads, ausência de chamadas externas e largura de 390 pixels. A inspeção visual deve complementar os testes, particularmente quando gráficos ou estilos mudarem.

Em telas pequenas, a navegação fechada fica oculta também para foco e tecnologias assistivas, não apenas deslocada para fora da tela. Escape fecha o menu; os controles possuem rótulos acessíveis e há link para pular ao conteúdo.

## Configuração inicial

1. Criar repositório público e enviar `main`.
2. Em Pages, selecionar GitHub Actions como fonte de publicação.
3. Permitir que o job de coleta grave a branch `data`; não conceder permissões administrativas ao workflow.
4. Aguardar a execução concluída e conferir HTML, manifesto, série de exemplo e navegação no endereço publicado.

São usados apenas `GITHUB_TOKEN` e os tokens temporários internos do Pages; nenhuma chave de dados privada é necessária. O job de publicação recebe `pages:write` e `id-token:write`; o job de coleta recebe `contents:write` para a branch de dados. Não executar este workflow privilegiado sobre código de pull requests não revisados.

## Retenção e recuperação

- `public/data/series`: último conjunto válido de cada série.
- `public/data/revisions.json`: diferenças detectadas em relação às coletas anteriores.
- `.cache/http`: cache condicional de transporte; não é a fonte de verdade.
- `.cache/raw`: respostas originais gzip identificadas por SHA-256, fora do site.
- Artefato `source-evidence-*`: snapshots de dados, catálogo, termos/fontes e originais nas execuções de domingo ou manuais, retidos por 90 dias.

Retenção de artefatos é limitada, não um arquivo permanente de todas as respostas horárias. Para auditoria além de 90 dias, baixar os arquivos necessários antes de expirarem. Histórico normalizado fica na branch `data`. Um provedor pode revisar observações sem oferecer versões anteriores; só podemos comparar versões efetivamente coletadas.

Para recuperar, escolher um commit válido da branch `data`, examinar seus arquivos e publicar uma nova revisão normal. Não fazer force-push nem apagar o histórico. Falhas de fonte não requerem apagar cache ou séries. Reprocessar a série específica com `--only`, ou executar reconciliação integral após corrigir o conector.

## Suposições e pendências

- Países foram escolhidos como referências de escala, região e estrutura; não formam um grupo estatisticamente homogêneo.
- Limite superior de consulta permanece em 2026 até alteração explícita do catálogo e interface.
- Nenhuma política de geração de previsões próprias foi implementada.
- DPF, Novo Caged e componentes incompletos do IDMI continuam identificados como pendentes. O painel não deve ser descrito como uma base historicamente completa.
