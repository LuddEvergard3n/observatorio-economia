# IDMI 2023 · integração experimental

Esta seção integra a edição congelada **IDMI9 2023 experimental** desenvolvida no projeto metodológico do autor. Ela substitui a antiga demonstração local de oito dimensões; as versões não são numericamente comparáveis.

## O que o Observatório publica

- Perfis de 2023 para as 12 economias do painel, nas variantes **ouro de mercado** e **onça de referência PPC**.
- Nove dimensões indexadas: capacidade material, poder de compra, saúde, educação, segurança, habitação, infraestrutura, emprego e produtividade e eficiência administrativa não tributária.
- A dimensão de qualidade tributária vivida (D9) em painel separado, sem peso na agregação enquanto não houver medidas comparáveis de pessoas e empresas.
- Cobertura por dimensão e os componentes faltantes de cada perfil.
- Limites matemáticos inferior e superior apenas como diagnóstico de lacunas.

O pacote vem de uma execução de 2023 com 217 economias e duas variantes monetárias. O painel restringe a consulta aos 12 países já cobertos pelo Observatório. O arquivo publicado é `public/data/idmi-2023-profiles.json`; ele é uma fotografia versionada, não uma saída da coleta horária.

## Regra de publicação

Nenhum país tem nota IDMI completa na edição integrada. O campo de pontuação central é nulo e o painel mostra `—` em vez de criar uma média das dimensões disponíveis.

Uma nota requer evidência admissível nas nove dimensões indexadas. Dados ausentes permanecem desconhecidos, sem redistribuir pesos. Infraestrutura comprovadamente inexistente pode receber zero, mas somente quando a ausência é documentada; falta de fonte não é inexistência.

Os limites exibidos não são notas, intervalos de confiança, previsão nem ranking:

```text
limite inferior: desconhecidos = 0
limite superior: desconhecidos = 100
```

O método candidato agrega dimensões completas por:

```text
IDMI9 = (Σ (1/9) × √D_i)²
```

## Unidade monetária e poder de compra

Na variante principal, valores monetários anuais são expressos em onças troy equivalentes de ouro de mercado; para 2023 a execução registrada usa US$ 1.943 por onça. A variante PPC usa uma onça de referência convencional, derivada de dólares internacionais constantes de 2021. Elas não representam a mesma coisa e não devem ser misturadas numa comparação numérica.

Poder de compra não usa PIB médio nem renda mediana isolada. A definição exige a capacidade da pessoa mediana, ponderada por pessoas, de custear uma cesta de oito grupos no mesmo período, com custos e créditos específicos. Pobreza e insuficiência devem ser apresentadas separadamente.

## Limitações explícitas

As principais lacunas para notas completas são cesta domiciliar e microdados harmonizados, vitimização, qualidade habitacional, acesso e confiabilidade de infraestrutura, experiência tributária e medidas administrativas comparáveis. A edição não imputa essas medidas nem usa proxies para preencher componentes obrigatórios.

As fontes, os anos efetivos, hashes e estados de cada observação pertencem ao projeto metodológico de origem. O Observatório preserva a autoria, a versão e a limitação da execução; não apresenta endosso de Banco Mundial, OIT, OMS, OCDE, ONU ou qualquer outra fonte.
