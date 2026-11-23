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

Recursos:

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
- VOLPATO, G. L. The Logic of Scientific Writing. *Revista de Sistemas de Informação da FSMA*, n. 7, p. 2–5, 2011.

Os textos do assistente são **resumos didáticos em paráfrase**, com indicação de fonte; não reproduzem as obras. Consulte os livros para o raciocínio completo e os exemplos.
