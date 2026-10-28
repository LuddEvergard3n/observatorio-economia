# IDMI 0.2 experimental

Índice de Desenvolvimento Material e Institucional, metodologia autoral fornecida pelo responsável pelo projeto. Não é indicador oficial do PNUD, Banco Mundial ou Fraser.

## Versão 0.2

Infraestrutura combina cinco componentes por média geométrica: transporte e logística, água e saneamento, energia, resíduos e digital. Transporte combina rodovias pavimentadas e desempenho logístico. Portos e eficiência ferroviária permanecem no catálogo, mas não recebem média nacional artificial nesta versão. A mudança foi aprovada pelo responsável pelo projeto em 28/10/2026 e não torna comparáveis resultados calculados em versões diferentes.

## Normalização

Pontuações internas `s` ficam em 1–100. Limites são fixos por versão, sem recalibração conforme o melhor país de cada ano:

```text
positivo: s = 1 + 99 × clip((x − L)/(U − L), 0, 1)
inverso:  s = 1 + 99 × clip((U − x)/(U − L), 0, 1)
log: substituir x, L e U pelos respectivos logaritmos, após limitar x a [L,U]
G = exp(sum(w_i × ln(s_i)) / sum(w_i))
escala pública = 100 × (G − 1)/99
```

Ausência não vira pontuação mínima. Para notas agregadas, todos os componentes devem estar disponíveis, no mesmo ano e país. Não há interpolação, transporte de anos anteriores ou reponderação para excluir componentes faltantes.

Resultados geométricos são limitados numericamente ao intervalo 1–100 para impedir que arredondamentos de ponto flutuante invalidem agregações subsequentes nos extremos da escala.

## Oito dimensões, pesos iguais

| Dimensão | Regra |
| --- | --- |
| W, riqueza | Patrimônio não humano por habitante, US$ 10 mil–1 milhão, log. Capital produzido, natural e ativos externos líquidos, excluindo capital humano. Exige base monetária compatível; componentes reais encadeados CWON não são aditivos. |
| P, poder de compra | RNB por habitante PPC, 100–75.000 dólares internacionais, log; base HDR 2025/PPC 2021. |
| S, saúde | Expectativa de vida 20–85 anos. |
| E, educação | Média aritmética das pontuações de anos médios de estudo (0–15) e esperados (0–18). |
| V, segurança | Média geométrica das escalas inversas log de homicídios (0,5–30) e mortes no trânsito (2–30), por 100 mil. |
| H, habitação | População urbana em assentamentos precários, 0–50%, inversa. Não mede aluguel/renda. |
| I, infraestrutura | Média geométrica dos cinco componentes abaixo. |
| L, liberdade econômica | Fraser EFW 0–10, normalizado para 1–100. Dados e nota geral não publicados enquanto direitos estiverem pendentes. |

`IDMI = 100 × (((W×P×S×E×V×H×I×L)^(1/8)) − 1)/99`.

## Infraestrutura

Esta versão usa **cinco componentes**. A logística é incorporada ao transporte; portos e eficiência ferroviária continuam visíveis no catálogo, mas não recebem uma média nacional artificial.

- Transporte e logística: média geométrica de rodovias pavimentadas (%) e desempenho logístico (LPI, 1–5).
- Água e saneamento: água potável gerenciada com segurança (%) e saneamento seguro (%), pesos 65%/35%.
- Energia: média geométrica de acesso à eletricidade (%), tecnologias limpas de cocção (%), consumo elétrico (500–8.000 kWh/habitante, log) e perdas (5–25%, inversa).
- Resíduos: média geométrica da coleta regular e da gestão controlada (%), exigindo cobertura nacional comparável, sem extrapolar cidades selecionadas.
- Digital: média geométrica de usuários de internet (%) e banda larga fixa (0–40 assinaturas por 100 habitantes).

Percentuais positivos usam limites 0–100. Os cinco blocos têm pesos iguais na agregação. As faixas de energia e de banda larga são escolhas experimentais, não padrões universais validados. O software não deve publicar ranking como se essas decisões estivessem cientificamente estabelecidas.

## Publicação e limites

A interface publica os componentes calculáveis e sua cobertura. Não há ranking geral com dados incompletos. A análise formal de sensibilidade e a validação empírica do índice ainda não foram realizadas; antes de liberar ranking, devem avaliar pesos, limites, correlações entre dimensões e estabilidade das posições. Mudanças geram nova versão e recálculo separado, preservando a anterior.

Implementação: `src/lib/idmi.ts`. Testes: `tests/web/calculations.test.ts`.
