export type IdmiVariant = 'gold_market' | 'ppp_reference'
export interface IdmiDimension { score: number | null; lower: number; upper: number; complete: boolean; missing: string[] }
export interface IdmiProfile {
  country: string; variant: IdmiVariant; reference_year: number; method: string; score: number | null;
  lower: number; upper: number; complete: boolean; missing_dimensions: string[];
  tax_dimension: string; dimensions: Record<string, IdmiDimension>;
}

export const idmiVersion = 'IDMI9 2023 · experimental'
export const idmiDimensions = [
  { id: 'D1', name: 'Capacidade material', indexed: true, note: 'Produção por pessoa na variante monetária selecionada.' },
  { id: 'D2', name: 'Poder de compra', indexed: true, note: 'Capacidade da pessoa mediana de custear uma cesta de oito grupos.' },
  { id: 'D3', name: 'Saúde', indexed: true, note: 'Vida saudável, mortalidade infantil e materna.' },
  { id: 'D4', name: 'Educação', indexed: true, note: 'Competências de estudantes e adultos, além de acesso e conclusão.' },
  { id: 'D5', name: 'Segurança', indexed: true, note: 'Homicídios e vitimização; ausência de dado não é segurança.' },
  { id: 'D6', name: 'Habitação', indexed: true, note: 'Espaço, condição física e conforto térmico.' },
  { id: 'D7', name: 'Infraestrutura', indexed: true, note: 'Sistemas terrestres, aéreos, marítimos, energia, água e telecomunicações.' },
  { id: 'D8', name: 'Emprego e produtividade', indexed: true, note: 'Subutilização do trabalho e produto por hora.' },
  { id: 'D10', name: 'Eficiência administrativa', indexed: true, note: 'Tempo, custo e previsibilidade de serviços não tributários.' },
  { id: 'D9', name: 'Qualidade tributária vivida', indexed: false, note: 'Painel separado, sem peso enquanto faltarem medidas observadas de pessoas e empresas.' },
] as const

/** Validate the frozen 2023 profile package before exposing it in the dashboard. */
export function isIdmiProfilePackage(value: unknown): value is IdmiProfile[] {
  return Array.isArray(value) && value.length > 0 && value.every(profile => {
    if (!profile || typeof profile !== 'object') return false
    const item = profile as Partial<IdmiProfile>
    return typeof item.country === 'string' && (item.variant === 'gold_market' || item.variant === 'ppp_reference') &&
      item.reference_year === 2023 && typeof item.complete === 'boolean' && Array.isArray(item.missing_dimensions) &&
      item.dimensions != null && typeof item.dimensions === 'object'
  })
}

/** Count only the nine dimensions that belong to the candidate index. */
export function completedIdmiDimensions(profile: IdmiProfile): number {
  return idmiDimensions.filter(dimension => dimension.indexed && profile.dimensions[dimension.id]?.complete).length
}
