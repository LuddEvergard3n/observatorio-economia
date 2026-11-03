export type TaxChangeKind = 'creation' | 'replacement' | 'new-incidence' | 'authorization' | 'transition'

export interface TaxChange {
  year: number
  name: string
  kind: TaxChangeKind
  proposal: string
  proposer: string
  president: string
  law: string
  rate: string
  observedCost: string
  costReference: string
  url: string
}

/** Federal creations and nationally authorized new incidences since 1991, kept separate from mere rate increases. */
export const taxChanges: TaxChange[] = [
  { year: 1991, name: 'Cofins', kind: 'replacement', proposal: 'PLP 91/1991', proposer: 'Poder Executivo', president: 'Fernando Collor', law: 'LC 70/1991', rate: '2% na criação', observedCost: 'R$ 581,946 bi', costReference: 'PIS/Cofins combinados em 2025; a Receita não separa este total por lei de origem', url: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=233767' },
  { year: 1993, name: 'IPMF', kind: 'creation', proposal: 'PLP 153/1993', proposer: 'Poder Executivo', president: 'Itamar Franco', law: 'LC 77/1993', rate: '0,25%', observedCost: 'R$ 3,699 bi', costReference: 'arrecadação de 1994; cobrança encerrada', url: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=234089' },
  { year: 1996, name: 'CPMF', kind: 'creation', proposal: 'PL 2.317/1996', proposer: 'Poder Executivo', president: 'Fernando Henrique Cardoso', law: 'Lei 9.311/1996', rate: '0,20% na criação; 0,38% ao final', observedCost: 'R$ 37,2 bi', costReference: 'arrecadação de 2007; cobrança encerrada', url: 'https://www2.camara.leg.br/legin/fed/lei/1996/lei-9311-24-outubro-1996-348539-norma-pl.html' },
  { year: 2000, name: 'Cide-Remessas', kind: 'creation', proposal: 'PL 2.978/2000', proposer: 'Poder Executivo', president: 'Fernando Henrique Cardoso', law: 'Lei 10.168/2000', rate: '10% em remessas abrangidas', observedCost: 'Sem total isolado', costReference: 'não há série nacional oficial separada e contínua no conjunto consultado', url: 'https://www2.camara.leg.br/legin/fed/lei/2000/lei-10168-29-dezembro-2000-363261-norma-pl.html' },
  { year: 2001, name: 'Cide-Combustíveis', kind: 'creation', proposal: 'PL 5.907/2001', proposer: 'Poder Executivo', president: 'Fernando Henrique Cardoso', law: 'Lei 10.336/2001', rate: 'valor por unidade; alíquota pode ser reduzida e restabelecida', observedCost: 'Repasse indireto', costReference: 'incide na importação e comercialização e pode compor o preço dos combustíveis', url: 'https://www2.camara.leg.br/legin/fed/lei/2001/lei-10336-19-dezembro-2001-428889-norma-pl.html' },
  { year: 2002, name: 'Cosip/CIP', kind: 'authorization', proposal: 'PEC 3/2002 no Senado · PEC 559/2002 na Câmara', proposer: 'Senador Álvaro Dias; PEC apensada do dep. Juquinha', president: 'Fernando Henrique Cardoso', law: 'EC 39/2002', rate: 'definida por lei de cada município ou do DF', observedCost: 'Varia por município', costReference: 'a emenda autorizou a cobrança; não criou uma tarifa nacional uniforme', url: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=59119' },
  { year: 2003, name: 'Contribuição previdenciária de servidores inativos', kind: 'new-incidence', proposal: 'PEC 40/2003', proposer: 'Poder Executivo', president: 'Luiz Inácio Lula da Silva', law: 'EC 41/2003', rate: 'sobre a parcela que excede o limite constitucional aplicável', observedCost: 'Sem total nacional isolado', costReference: 'incidência depende do ente, remuneração e regime próprio', url: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=113716' },
  { year: 2004, name: 'PIS/Pasep-Importação e Cofins-Importação', kind: 'creation', proposal: 'MP 164/2004', proposer: 'Poder Executivo', president: 'Luiz Inácio Lula da Silva', law: 'Lei 10.865/2004', rate: '1,65% e 7,6% na criação; regras atuais variam', observedCost: 'Embutido na importação', costReference: 'não confundir com o total combinado de PIS/Cofins sobre operações domésticas', url: 'https://www.camara.leg.br/noticias/45591-mp-164-04-cria-o-pis-e-a-cofins-importacao/' },
  { year: 2023, name: 'IBS, CBS e Imposto Seletivo', kind: 'transition', proposal: 'PEC 45/2019; PLP 68/2024', proposer: 'Dep. Baleia Rossi; regulamentação proposta pelo Poder Executivo', president: 'Luiz Inácio Lula da Silva', law: 'EC 132/2023 · LC 214/2025', rate: 'transição iniciada em 2026; alíquotas de referência ainda calibradas', observedCost: 'Ainda não observado integralmente', costReference: 'substituem cinco tributos; contar só as criações superestima o aumento da carga', url: 'https://www.camara.leg.br/noticias/978257-reforma-tributaria-vai-gerar-crescimento-economico-para-o-pais-diz-autor-da-proposta/' },
  { year: 2024, name: 'Adicional da CSLL · tributação mínima global', kind: 'new-incidence', proposal: 'MP 1.262/2024 · PL 3.817/2024', proposer: 'Poder Executivo', president: 'Luiz Inácio Lula da Silva', law: 'Lei 15.079/2024', rate: 'até completar 15% para grupos multinacionais abrangidos', observedCost: 'Não recai diretamente sobre famílias', costReference: 'incidência restrita a grandes grupos multinacionais no escopo da regra GloBE', url: 'https://www2.camara.leg.br/legin/fed/lei/2024/lei-15079-27-dezembro-2024-796831-norma-pl.html' },
]
