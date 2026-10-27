# IDMI 0.1 experimental

Índice de Desenvolvimento Material e Institucional, metodologia autoral fornecida pelo responsável pelo projeto. Não é indicador oficial do PNUD, Banco Mundial ou Fraser.

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

## Oito dimensões, pesos iguais

| Dimensão | Regra |
| --- | --- |
| W, riqueza | Patrimônio não humano por habitante, US$ 10 mil–1 milhão, log. Capital produzido, natural e ativos externos líquidos, excluindo capital humano. Exige base monetária compatível; componentes reais encadeados CWON não são aditivos. |
| P, poder de compra | RNB por habitante PPC, 100–75.000 dólares internacionais, log; base HDR 2025/PPC 2021. |
| S, saúde | Expectativa de vida 20–85 anos. |
| E, educação | Média aritmética das pontuações de anos médios de estudo (0–15) e esperados (0–18). |
| V, segurança | Média geométrica das escalas inversas log de homicídios (0,5–30) e mortes no trânsito (2–30), por 100 mil. |
| H, habitação | População urbana em assentamentos precários, 0–50%, inversa. Não mede aluguel/renda. |
| I, infraestrutura | Média geométrica dos seis componentes abaixo. |
| L, liberdade econômica | Fraser EFW 0–10, normalizado para 1–100. Dados e nota geral não publicados enquanto direitos estiverem pendentes. |

`IDMI = 100 × (((W×P×S×E×V×H×I×L)^(1/8)) − 1)/99`.

## Infraestrutura

Mantida a opção de **seis componentes**, com portos separados. A proposta alternativa de cinco blocos dos anexos não é usada nesta versão.

- Transporte: média geométrica de rodovias pavimentadas (%) e eficiência ferroviária, pesos 50%/50%. Faixa ferroviária proposta: 0,02–0,50 MJ/t.km, inversa.
- Água e saneamento: água potável gerenciada com segurança (%) e saneamento seguro (%), pesos 65%/35%.
- Portos: CPPI, faixa proposta −500 a +500; ainda exige regra nacional e tratamento documentado para países sem litoral. Não atribuir zero pela ausência de porto marítimo.
- Energia: média geométrica de acesso à eletricidade (%), tecnologias limpas de cocção (%), consumo elétrico (500–8.000 kWh/habitante, log) e perdas (5–25%, inversa).
- Resíduos: média geométrica da coleta regular e da gestão controlada (%), exigindo cobertura nacional comparável, sem extrapolar cidades selecionadas.
- Digital: média geométrica de usuários de internet (%) e banda larga fixa (0–40 assinaturas por 100 habitantes).

Percentuais positivos usam limites 0–100. Os seis blocos têm pesos iguais na agregação. As faixas ferroviária, portuária, de energia e de banda larga são escolhas experimentais, não padrões universais validados. O software não deve publicar ranking como se essas decisões estivessem cientificamente estabelecidas.

## Publicação e limites

A interface publica os componentes calculáveis e sua cobertura. Não há ranking geral com dados incompletos. A análise formal de sensibilidade e a validação empírica do índice ainda não foram realizadas; antes de liberar ranking, devem avaliar pesos, limites, correlações entre dimensões e estabilidade das posições. Mudanças geram nova versão e recálculo separado, preservando a anterior.

Implementação: `src/lib/idmi.ts`. Testes: `tests/web/calculations.test.ts`.
