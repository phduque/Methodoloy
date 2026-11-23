# Método Lógico — Assistente de Pesquisa

Programa com interface amigável que conduz o pesquisador, passo a passo, **do projeto à redação final** de TCC, monografia, dissertação, tese ou artigo científico, seguindo o **Método Lógico** de Gilson L. Volpato.

## Como usar

Não precisa instalar nada. Baixe/clone o repositório e abra `index.html` no navegador (Chrome, Edge, Firefox ou Safari).

> Os dados ficam salvos **no próprio navegador** (localStorage). Use *Documento → Backup (.json)* com frequência para guardar seu trabalho ou levá-lo a outro computador, e *Importar backup* na tela inicial para recuperá-lo.

Para publicar on-line (opcional): ative o GitHub Pages neste repositório (Settings → Pages → branch e pasta raiz).

## O que o programa faz

| Fase | Etapas | Base |
|---|---|---|
| 1. Projeto de pesquisa | pergunta e nível de ciência; variáveis, **tipo lógico** e objetivo (construtor automático); delineamento deduzido do objetivo; redação e submissão do projeto | *Elabore Projetos Científicos Competitivos* |
| 2. Execução e análise | diário de coleta; análise por vários ângulos | *Guia Prático*, Passos 1–2; *Estatística sem Dor* |
| 3. Encontre sua história | resultados que entram (ou não) na história; força das evidências; **Pirâmide Lógica** visual | Passos 3–5 |
| 4. Entenda e planeje | as 5 perguntas da história; exposição oral; veículo e normas; tempo de imersão; redação de trás para frente; outline e parágrafos | Passos 6–12 |
| 5. Redação (de trás para frente) | conclusões → resultados → figuras/tabelas → métodos → discussão → objetivos → introdução → literatura → resumo → estilo → título | Passos 13–30 |
| 6. Acabamento e debate | revisão, críticas, normas; cover letter, revisores e resposta (artigo) **ou** preparação da defesa (trabalhos acadêmicos); divulgação e impacto | Passos 31–40 |

Recursos (incluindo o material das aulas de Metodologia da Pesquisa em Linguística Aplicada — PPgEL/UFRN, 2025.2):

- **Desenho da pesquisa em funil** (nova etapa): perguntas encadeadas — o que se quer saber, tipo de dado, como a causa acontece, fonte, delineamento A–H, grupos, técnicas, generalização, tipo de variável. Cada resposta abre a próxima, desativa as opções incompatíveis com o motivo e desfaz escolhas posteriores que deixem de ser possíveis. Um painel mostra o caminho resultante (objetivo, amostra, suficiência, análise, teste, gráficos), e as etapas de delineamento, teste estatístico e gráficos passam a mostrar só as opções compatíveis.
- **Parágrafo científico em 4 frases**: para cada item do outline — ideia essencial, item (“Mostrar que…”), frase-tópico, sustentação, especificação e transição —, com a função de cada frase explicada por seção e o botão “Montar parágrafo”.
- **Roteiros de outline prontos**: Introdução (7 blocos), Marco Teórico (5), Métodos (objeto → delineamento → elaboração → análise), Resultados, Discussão (9 parágrafos) e Conclusão.
- **Marco Teórico e Conclusão** como capítulos (trabalhos acadêmicos); **fundamentação do objetivo por tipo lógico**; hipótese com variável interferente, afetada e direção do efeito.
- **Delineamentos A–H** com checagem de coerência com o tipo lógico; critério de suficiência da amostra (estabilidade ou saturação).
- **Assistente de teste estatístico** (pergunta × tipo de variável × grupos → análise, gráfico, forma de relatar, fórmula de planilha) e **assistente de escolha de gráfico** (barras, histograma, boxplot, dispersão, nuvem, similitude, AFC etc.).
- **Resumo em 7 movimentos**, modelos de título (com subtítulo), checagem de palavras-chave, **preparação da qualificação** (com nota ao avaliador) e **declaração de uso de IA**.

- **Guia em cada etapa**: o que fazer, por quê e armadilhas comuns, com a fonte (livro/passo).
- **Construtor de objetivo** a partir do tipo lógico (descritiva, associação, causa–efeito).
- **Pirâmide Lógica** interativa: evidências na base, conclusões encadeadas, desenho automático.
- **Outline por frases-tópico** que viram parágrafos (Introdução e Discussão).
- **Verificador lógico e de estilo** (heurístico): voz passiva e impessoalidade, excesso de palavras, frases longas, pronomes ambíguos, objetivo incoerente com o tipo lógico, conclusões no passado, título descritivo/com foco na amostra/abreviaturas, extensão do resumo (Volpato e ABNT NBR 6028), pirâmide sem sustentação.
- **Documento final montado automaticamente** na ordem de leitura e exportável para **Word (.doc)**, **Markdown** e **PDF** (impressão).
- Vários trabalhos em paralelo, progresso por fase, modo claro/escuro, uso no celular.

## Estrutura

```
index.html          página do aplicativo
css/estilo.css      aparência
js/planejador.js    regras de compatibilidade do desenho da pesquisa (o funil)
js/aulas.js         conteúdo das aulas (roteiros, frases, delineamentos, testes, gráficos, modelos)
js/metodo.js        conteúdo metodológico (fases, etapas, campos) — edite aqui para ajustar o roteiro
js/verificador.js   regras do verificador lógico/estilo
js/app.js           interface, armazenamento e exportação
```

## Fontes

- VOLPATO, G. L. *Guia Prático para Redação Científica*.
- VOLPATO, G. L.; BARRETO, R. E. *Elabore Projetos Científicos Competitivos*.
- VOLPATO, G. L. *Bases Teóricas para Redação Científica*.
- VOLPATO, G. L. *Ciência: da filosofia à publicação*.
- VOLPATO, G. L. *Estatística sem Dor*.
- DUQUE, P. H. Metodologia da Pesquisa em Linguística Aplicada (material de aula). PPgEL/UFRN, 2025.2.
- VOLPATO, G. L. The Logic of Scientific Writing. *Revista de Sistemas de Informação da FSMA*, n. 7, p. 2–5, 2011.

Os textos do assistente são **resumos didáticos em paráfrase**, com indicação de fonte; não reproduzem as obras. Consulte os livros para o raciocínio completo e os exemplos.
