# Fontes e cobertura

O catálogo executável é `catalog/catalog.json`. Cada entrada contém código, unidade, frequência, provedor, URL, definição, transformação e observações. O manifesto publicado registra cobertura efetiva por país; o intervalo entre primeiro e último ponto não garante ausência de lacunas internas.

Cada página de detalhe reaproveita essa definição em um bloco de leitura simples: o que o indicador mede, como ler unidade e frequência e qual cuidado evita interpretações erradas. A ressalva técnica continua no mesmo catálogo para que explicação e coleta não divirjam.

| Grupo | Origem e integração | Limites |
| --- | --- | --- |
| Atividade, população, infraestrutura e comparações | [Banco Mundial WDI API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation) | Metadados de cada série identificam produtores nacionais e internacionais; cobertura irregular. Não preencher lacunas. |
| Produtividade do trabalho | [Banco Mundial · WDI](https://data.worldbank.org/indicator/SL.GDP.PCAP.EM.KD) | PIB por pessoa ocupada em PPC constante de 2021. O emprego usa estimativas de OIT, ONU e outras fontes; valores recentes podem ser preliminares. |
| Pobreza a US$ 8,30/dia | [Banco Mundial · PIP/WDI](https://data.worldbank.org/indicator/SI.POV.UMIC) | PPC de 2021. Os anos de pesquisa não coincidem entre todos os países; rankings de redução só são comparáveis quando fixam a mesma janela. |
| Riqueza não humana por habitante | [Banco Mundial Wealth Accounts 2024](https://datacatalog.worldbank.org/search/dataset/0042066/wealth-accounting), API fonte 59 | Riqueza abrangente menos capital humano, ambos em US$ correntes e da mesma edição. Cobertura 1995–2020; não usar a diferença entre componentes reais encadeados. |
| Cobertura da coleta de resíduos | [Banco Mundial What a Waste 3.0](https://datacatalog.worldbank.org/search/dataset/0039597/what-a-waste-global-database) | Indicador nacional de população atendida. Cada país preserva o ano do Codebook; não é série anual contínua nem substitui população por domicílios ou peso de resíduos. |
| Atendimento por rede coletora de esgoto | [Ministério das Cidades · SINISA](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/sinisa/resultados-sinisa/resultados-sinisa) | Brasil, 2023: 59,70% da população total. Fonte consolidada por UF/Macrorregião/Brasil, aba Atendimento, linha TOTAL NACIONAL. O hash do XLSX de origem fica na proveniência da série. |
| Domicílios com coleta e tratamento de esgoto | [Ministério das Cidades · SINISA](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/sinisa/resultados-sinisa/resultados-sinisa) | Brasil, 2023: 45,51% dos domicílios totais. A definição e o denominador diferem da rede coletora e do saneamento gerenciado com segurança. |
| IPCA, INPC, Selic, PTAX, contas públicas e crédito | [BCB SGS](https://dadosabertos.bcb.gov.br/) | IPCA/INPC são produzidos pelo IBGE; BCB é republicador. Janela de cinco anos por chamada, intervalos recentes de dois anos nas atualizações. |
| IGP-M | [FGV IBRE](https://portalibre.fgv.br/igp), republicado no [SGS 189](https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarSeries&series=189) | Índice diferente do IPCA; início em junho de 1989. Não comparar como cestas idênticas. |
| PIB trimestral, indústria, trabalho e analfabetismo | [API SIDRA](https://apisidra.ibge.gov.br/) | Classificações e variáveis fixadas no catálogo. PNAD Contínua a partir de 2012, sem emenda à antiga PME. |
| Saldo de vínculos formais | [MTE · Novo Caged](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/estatisticas-trabalho/novo-caged) | Brasil, jul/2024 a ago/2026: Tabela 2 de cada competência, linha Brasil, coluna de saldo mensal sem ajuste. É fluxo de admissões menos desligamentos, não estoque nem pessoas ocupadas. O ZIP de origem e seu hash ficam na proveniência; o arquivo de out/2025 traz título interno incorretamente repetindo setembro. |
| IDH, educação, longevidade e RNB PPC | [PNUD HDR 2025](https://hdr.undp.org/data-center/documentation-and-downloads) | Edição congelada, histórico 1990–2023. PPC em dólares internacionais de 2021. Não mudar edição sem revisão metodológica. |
| Dívida do governo geral internacional | [IMF DataMapper API](https://www.imf.org/external/datamapper/api/v1/GGXWDG_NGDP/BRA) | API mistura origens observadas e estimadas. Rotulamos estimativa/base mista; excluímos anos a partir do ano corrente. Não equivale à definição nacional da DBGG. |
| Resultado primário internacional | [FMI · Fiscal Monitor](https://www.imf.org/external/datamapper/datasets/FM), série `GGXONLB_G01_GDP_PT` | Governo geral, em % do PIB. O ano corrente é marcado como estimativa; anos anteriores são o histórico publicado pela edição de outubro de 2026 e ainda podem conter estimativas da equipe ou revisões. Não equivale ao resultado nominal. |
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
- PIB por pessoa ocupada mede produtividade média aparente, não salário, horas trabalhadas nem produtividade total dos fatores.
- Na dívida, 82,9% do PIB em setembro de 2026 é a DBGG observada na definição do BCB. Os 97,8% do FMI são projeção anual de 2026 no conceito internacional; não são uma observação mensal equivalente.

## Auditoria de governos e medidas tributárias

A linha do tempo registra resultados negativos e positivos sem transformar coincidência temporal em causalidade. Cada item informa o governo em exercício, o responsável institucional e a fonte primária. Comparações recebidas como imagem são tratadas como alegações até serem reproduzidas em uma série oficial.

Para tributação, a classificação distingue: criação de incidência, aumento de alíquota, ampliação de base, prorrogação, substituição de tributos e desoneração. O inventário é uma seleção auditada e não exaustiva das principais medidas federais desde 1991; não pretende listar cada ajuste setorial, decreto de alíquota, decisão judicial ou norma infralegal. A EC 132/2023 e a LC 214/2025 são mostradas como reforma com substituição gradual de tributos, e não como três cobranças adicionais isoladas.

### Inventário tributário desde 1991

A página `#taxes` usa atos do Planalto, fichas de tramitação da Câmara, Receita Federal, Tesouro Nacional e Ipea. “Autor” significa o autor formal da proposição. Emenda constitucional é promulgada pelo Congresso e, portanto, o presidente mostrado é contexto de governo, não autoridade sancionadora.

O “custo observado” só exibe arrecadação quando a fonte publica um valor compatível. Quando um tributo é municipal, não tem série isolada ou ainda está em transição, a ausência é declarada em vez de estimar um custo por cidadão. Os marcos de carga tributária de 1991 e 2024/2025 pertencem a edições metodológicas diferentes e não formam, sozinhos, uma série homogênea.

O gráfico anual de poder de compra reutiliza a série mensal do IPCA (SGS 433, origem IBGE). Para cada ano completo, calcula a variação do poder de compra do mesmo valor nominal; não converte cruzeiros de 1991 em reais e não mistura inflação com evolução salarial.

O arrecadômetro toma como base fixa os R$ 4.127.232 milhões da carga tributária bruta do governo geral em 2025, publicados como dado preliminar pela STN no Boletim CTB 2025. O navegador multiplica esse total pela fração transcorrida do calendário atual e mostra os ritmos equivalentes por dia e segundo. Não há consulta ao Impostômetro, extrapolação de sazonalidade ou alegação de arrecadação oficial instantânea.

O comparador por UF usa 2023, último exercício completo comum na edição consultada das duas bases. A [Receita Federal](https://www.gov.br/receitafederal/dados/arrecadacao-estado.csv/view) fornece valores mensais por tributo e UF; o painel soma os 12 meses e todas as rubricas publicadas. O [Tesouro Nacional](https://www.tesourotransparente.gov.br/ckan/dataset/transferencias-da-uniao-total-por-estado) fornece, em R$ milhões correntes e regime de caixa, transferências obrigatórias e discricionárias; o painel soma as duas categorias nos 12 meses. O retrato congelado, consultado em 03/11/2026, contém as 27 UFs, R$ 2.318.120,1 milhões arrecadados e R$ 260.025,8 milhões transferidos.

A razão “transferido ÷ arrecadado” não é balanço de quanto cada população pagou e recebeu. A arrecadação é atribuída ao local do recolhimento e pode se concentrar na sede da empresa; a série do Tesouro cobre governos estaduais, não municípios, benefícios sociais, salários federais, compras, obras ou demais gastos diretos da União. Valores acima de 100% indicam apenas que as transferências deste recorte superaram a arrecadação federal registrada na UF naquele ano.

## Pendências explícitas

- `roads-paved`: código histórico WDI não disponível na API consultada; requer edição arquivada e verificação dos universos nacionais.
- `formal-jobs`: a primeira cobertura auditada é jul/2024 a ago/2026. A extensão para trás exige arquivos oficiais por competência e tratamento explícito de ajustes retroativos; a quebra de captação de 2020 continua indicada na linha do tempo.
- `rail-efficiency`, `port-efficiency`, `waste-controlled`: exigem validação de cobertura, comparabilidade e agregação nacional para entrarem no catálogo recorrente. O pacote IDMI 2023 congelado não substitui essas lacunas por proxies. O CPPI 2025 recebido traz resultados por porto e uma série 2020–2025, mas não uma agregação nacional ponderada e, portanto, não substitui essa pendência.
- As planilhas SINISA 2023 de resíduos, águas pluviais e gestão municipal recebidas foram auditadas. Elas contêm registros municipais, com participação e campos não calculáveis; não foram usadas para calcular uma taxa nacional por média simples. A cópia adicional da planilha de gestão municipal tem o mesmo SHA-256 da primeira.
- `fraser`: o arquivo EFW 2026 recebido contém o painel anual internacional até 2024, mas o download é gratuito e as condições orientam que outros usuários sejam encaminhados ao arquivo original. Sem autorização inequívoca de redistribuição, os valores não são republicados; não há proxy substituta.

## Proveniência, revisão e direitos

Respostas aceitas recebem SHA-256 sobre os bytes originais, URL, ETag e Last-Modified quando fornecidos. Originais gzip ficam em `.cache/raw`; snapshots de evidência são arquivados pelo fluxo de publicação, com retenção limitada. `revisions.json` registra alterações e remoções detectadas entre coletas. A primeira coleta não recria vintages históricos.

Uma fonte com falha não sobrescreve o arquivo válido. O manifesto sinaliza a falha e a data de sucesso anterior. Mudanças políticas e metodológicas só entram na linha do tempo com fonte primária; não presumimos causalidade ou intenção a partir de coincidência temporal.

As bases mantêm suas condições próprias: [licenças BCB](https://dadosabertos.bcb.gov.br/), [termos do Banco Mundial](https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets), [termos FMI](https://www.imf.org/en/About/Terms-of-Use), [PNUD](https://hdr.undp.org/data-center/documentation-and-downloads) e [Fraser](https://efotw.org/economic-freedom/citations). Acesso público não dispensa atribuição nem transfere direitos sobre fontes terceiras. Os metadados preservam a autoria original; o painel não apresenta apoio institucional dessas organizações.
