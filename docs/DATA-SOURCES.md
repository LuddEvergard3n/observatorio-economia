# Fontes e cobertura

O catálogo executável é `catalog/catalog.json`. Cada entrada contém código, unidade, frequência, provedor, URL, definição, transformação e observações. O manifesto publicado registra cobertura efetiva por país; o intervalo entre primeiro e último ponto não garante ausência de lacunas internas.

| Grupo | Origem e integração | Limites |
| --- | --- | --- |
| Atividade, população, infraestrutura e comparações | [Banco Mundial WDI API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation) | Metadados de cada série identificam produtores nacionais e internacionais; cobertura irregular. Não preencher lacunas. |
| Riqueza não humana por habitante | [Banco Mundial Wealth Accounts 2024](https://datacatalog.worldbank.org/search/dataset/0042066/wealth-accounting), API fonte 59 | Riqueza abrangente menos capital humano, ambos em US$ correntes e da mesma edição. Cobertura 1995–2020; não usar a diferença entre componentes reais encadeados. |
| Cobertura da coleta de resíduos | [Banco Mundial What a Waste 3.0](https://datacatalog.worldbank.org/search/dataset/0039597/what-a-waste-global-database) | Indicador nacional de população atendida. Cada país preserva o ano do Codebook; não é série anual contínua nem substitui população por domicílios ou peso de resíduos. |
| IPCA, INPC, Selic, PTAX, contas públicas e crédito | [BCB SGS](https://dadosabertos.bcb.gov.br/) | IPCA/INPC são produzidos pelo IBGE; BCB é republicador. Janela de cinco anos por chamada, intervalos recentes de dois anos nas atualizações. |
| IGP-M | [FGV IBRE](https://portalibre.fgv.br/igp), republicado no [SGS 189](https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarSeries&series=189) | Índice diferente do IPCA; início em junho de 1989. Não comparar como cestas idênticas. |
| PIB trimestral, indústria, trabalho e analfabetismo | [API SIDRA](https://apisidra.ibge.gov.br/) | Classificações e variáveis fixadas no catálogo. PNAD Contínua a partir de 2012, sem emenda à antiga PME. |
| IDH, educação, longevidade e RNB PPC | [PNUD HDR 2025](https://hdr.undp.org/data-center/documentation-and-downloads) | Edição congelada, histórico 1990–2023. PPC em dólares internacionais de 2021. Não mudar edição sem revisão metodológica. |
| Dívida do governo geral internacional | [IMF DataMapper API](https://www.imf.org/external/datamapper/api/v1/GGXWDG_NGDP/BRA) | API mistura origens observadas e estimadas. Rotulamos estimativa/base mista; excluímos anos a partir do ano corrente. Não equivale à definição nacional da DBGG. |
| Dívida pública federal | [Tesouro Transparente · Estoque da DPF](https://www.tesourotransparente.gov.br/ckan/dataset/estoque-da-divida-publica-federal) | CSV em reais correntes. Agregação mensal da dívida interna e externa em poder do mercado, convertida para R$ milhões; carteira do Banco Central excluída. Na validação de 27/10/2026, a série terminava em agosto de 2026. |
| Salário mínimo real | Cálculo sobre SGS 1619 e 188 | Salário nominal × INPC dez/2025 ÷ INPC do mês. Qualquer mês ausente no intervalo invalida o resultado. Período anterior ao real não é convertido silenciosamente. |

## Conceitos que não devem ser misturados

- PIB real anual, nominal em dólares, PPC por habitante e variação trimestral são séries distintas.
- A série trimestral principal compara o mesmo trimestre do ano anterior; a série dessazonalizada compara o trimestre imediatamente anterior.
- Desemprego, participação, nível de ocupação e pessoas ocupadas têm denominadores/unidades diferentes. Trimestres móveis mensais da PNAD não são trimestres independentes e não devem ser somados.
- A PTAX é taxa de referência diária, não cotação comercial instantânea de uma mesa de negociação.
- DBGG, DLSP e DPF não são intercambiáveis. Resultado primário/nominal BCB expressos como NFSP recebem fator −1 no catálogo para apresentar superávit positivo. Juros nominais conservam o sinal de despesa.
- Salário mínimo é distinto de rendimento médio do trabalho. Ambos aparecem em séries separadas.
- O analfabetismo internacional é 100 menos a alfabetização de adultos na mesma série. Isso não o torna idêntico a todas as definições nacionais.

## Pendências explícitas

- `roads-paved`: código histórico WDI não disponível na API consultada; requer edição arquivada e verificação dos universos nacionais.
- `formal-jobs`: o MTE publica tabelas mensais em XLSX e microdados TXT, sem endpoint agregado estável. O conector precisa preservar ajustes retroativos e a quebra de captação de 2020.
- `primary-imf`: indicador não retornado pelo DataMapper. O WEO de outubro de 2026 oferece XLSX oficial, mas o CDN recusou a coleta automatizada testada; o novo IMF Data API ainda exige conector e validação de unidades, edição e ano observado/projetado.
- `rail-efficiency`, `port-efficiency`, `waste-controlled`: exigem validação de cobertura, comparabilidade e agregação nacional para entrarem no catálogo recorrente. O pacote IDMI 2023 congelado não substitui essas lacunas por proxies; CPPI, em particular, é uma medida por porto, não um indicador nacional.
- `fraser`: o download é gratuito, mas as condições orientam que outros usuários sejam encaminhados ao arquivo original. Sem autorização inequívoca de redistribuição, os valores não são republicados; o XLSX também respondeu com desafio Cloudflare à coleta automatizada. Não há proxy substituta.

## Proveniência, revisão e direitos

Respostas aceitas recebem SHA-256 sobre os bytes originais, URL, ETag e Last-Modified quando fornecidos. Originais gzip ficam em `.cache/raw`; snapshots de evidência são arquivados pelo fluxo de publicação, com retenção limitada. `revisions.json` registra alterações e remoções detectadas entre coletas. A primeira coleta não recria vintages históricos.

Uma fonte com falha não sobrescreve o arquivo válido. O manifesto sinaliza a falha e a data de sucesso anterior. Mudanças políticas e metodológicas só entram na linha do tempo com fonte primária; não presumimos causalidade ou intenção a partir de coincidência temporal.

As bases mantêm suas condições próprias: [licenças BCB](https://dadosabertos.bcb.gov.br/), [termos do Banco Mundial](https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets), [termos FMI](https://www.imf.org/en/About/Terms-of-Use), [PNUD](https://hdr.undp.org/data-center/documentation-and-downloads) e [Fraser](https://efotw.org/economic-freedom/citations). Acesso público não dispensa atribuição nem transfere direitos sobre fontes terceiras. Os metadados preservam a autoria original; o painel não apresenta apoio institucional dessas organizações.
