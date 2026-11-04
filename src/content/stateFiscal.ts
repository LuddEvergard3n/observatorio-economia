export interface StateFiscalSnapshot { uf: string; name: string; revenueMillions: number; transferMillions: number }

export const stateFiscalYear = 2023

/** Frozen common-year snapshot from Receita Federal collection and STN cash transfers to state governments. */
export const stateFiscalSnapshot: StateFiscalSnapshot[] = [
  { uf:'AC', name:'Acre', revenueMillions:2093.7, transferMillions:6159.4 },
  { uf:'AL', name:'Alagoas', revenueMillions:8872.6, transferMillions:7344.0 },
  { uf:'AM', name:'Amazonas', revenueMillions:22829.8, transferMillions:7324.2 },
  { uf:'AP', name:'Amapá', revenueMillions:2032.3, transferMillions:6164.9 },
  { uf:'BA', name:'Bahia', revenueMillions:48212.0, transferMillions:18997.8 },
  { uf:'CE', name:'Ceará', revenueMillions:34717.2, transferMillions:13164.8 },
  { uf:'DF', name:'Distrito Federal', revenueMillions:166708.0, transferMillions:3817.4 },
  { uf:'ES', name:'Espírito Santo', revenueMillions:38181.5, transferMillions:5939.2 },
  { uf:'GO', name:'Goiás', revenueMillions:36718.7, transferMillions:7120.6 },
  { uf:'MA', name:'Maranhão', revenueMillions:12667.0, transferMillions:12315.4 },
  { uf:'MG', name:'Minas Gerais', revenueMillions:152193.8, transferMillions:12790.4 },
  { uf:'MS', name:'Mato Grosso do Sul', revenueMillions:15905.9, transferMillions:3133.5 },
  { uf:'MT', name:'Mato Grosso', revenueMillions:25006.5, transferMillions:5509.3 },
  { uf:'PA', name:'Pará', revenueMillions:21156.3, transferMillions:13463.3 },
  { uf:'PB', name:'Paraíba', revenueMillions:11526.1, transferMillions:8297.2 },
  { uf:'PE', name:'Pernambuco', revenueMillions:35894.8, transferMillions:13678.7 },
  { uf:'PI', name:'Piauí', revenueMillions:7896.9, transferMillions:7661.0 },
  { uf:'PR', name:'Paraná', revenueMillions:106848.6, transferMillions:9974.9 },
  { uf:'RJ', name:'Rio de Janeiro', revenueMillions:409750.0, transferMillions:32948.5 },
  { uf:'RN', name:'Rio Grande do Norte', revenueMillions:10340.5, transferMillions:7324.3 },
  { uf:'RO', name:'Rondônia', revenueMillions:7559.5, transferMillions:5440.5 },
  { uf:'RR', name:'Roraima', revenueMillions:1985.2, transferMillions:4837.7 },
  { uf:'RS', name:'Rio Grande do Sul', revenueMillions:108959.5, transferMillions:8290.5 },
  { uf:'SC', name:'Santa Catarina', revenueMillions:112994.2, transferMillions:4991.7 },
  { uf:'SE', name:'Sergipe', revenueMillions:6869.0, transferMillions:6845.4 },
  { uf:'SP', name:'São Paulo', revenueMillions:904983.7, transferMillions:19530.5 },
  { uf:'TO', name:'Tocantins', revenueMillions:5216.8, transferMillions:6960.7 },
]
