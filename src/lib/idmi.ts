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
  { id: 'D3', name: 'Saúde', indexed: true, note: 'Expectativa de vida saudável (HALE); ano efetivo de 2021.' },
  { id: 'D4', name: 'Educação', indexed: true, note: 'Leitura no PISA e alfabetização no PIAAC, com pesos internos iguais.' },
  { id: 'D5', name: 'Segurança letal', indexed: true, note: 'Taxa de homicídios intencionais; ausência de dado não é segurança.' },
  { id: 'D6', name: 'Espaço habitacional', indexed: true, note: 'Superlotação pela regra de quartos do Eurostat.' },
  { id: 'D7', name: 'Eletricidade e acesso ferroviário', indexed: true, note: 'Cobertura elétrica anual e acesso a estação ferroviária em serviço.' },
  { id: 'D8', name: 'Trabalho e produtividade', indexed: true, note: 'Subutilização do trabalho (LU4) e produto por hora, com pesos internos iguais.' },
  { id: 'D10', name: 'Serviços administrativos', indexed: true, note: 'Satisfação de usuários recentes com serviços administrativos não tributários.' },
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
