# Método Lógico — Assistente de Pesquisa

Programa com interface amigável que conduz o pesquisador, passo a passo, **do projeto à redação final** de TCC, monografia, dissertação, tese ou artigo científico, seguindo o **Método Lógico** de Gilson L. Volpato.

## Como usar

### Instalador para Windows (.exe)
1. Execute `Metodo-Logico-Instalador.exe` (gerado com `scripts/gerar_instalador.sh`, que usa o NSIS; sai em `dist/`).
2. Não pede administrador: instala em `%LOCALAPPDATA%\Programs\MetodoLogico`, cria atalhos no menu Iniciar e na área de trabalho e aparece em *Configurações → Aplicativos* para desinstalar.
3. O atalho abre o programa numa janela própria do Microsoft Edge (ou do Chrome, se não houver Edge), sem internet.
4. Como o instalador não tem assinatura digital, o Windows pode mostrar “O Windows protegeu o computador”: clique em *Mais informações → Executar assim mesmo*.
5. Para atualizar, execute a versão nova por cima; os trabalhos continuam salvos no navegador.

### No computador (sem internet)
1. Baixe o pacote `Metodo-Logico.zip` (gerado com `python3 scripts/empacotar.py`, em `dist/`) e descompacte numa pasta fixa.
2. Abra com dois cliques: `Abrir Metodo Logico (Windows).bat`, `Abrir Metodo Logico (Mac).command` ou `abrir-metodo-logico-linux.sh`. O programa abre numa janela própria do Edge/Chrome, como um aplicativo. Também funciona abrindo `index.html` direto no navegador.
3. Veja `LEIA-ME.txt` para criar atalho na área de trabalho, fazer backup e atualizar.

### Como aplicativo instalável (PWA)
Hospedado num endereço https (por exemplo, GitHub Pages, Netlify ou o servidor da instituição), o Chrome e o Edge mostram **Instalar aplicativo** na barra de endereço. Ele ganha ícone próprio, janela própria e funciona sem internet (`manifest.webmanifest` + `sw.js`).

### Dados
Os trabalhos ficam salvos no navegador do computador. Exporte backups com frequência (*Documento → Backup (.json)*) e use *Importar backup* para recuperá-los ou levá-los a outro computador.

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
- **Diagnóstico de decisões erradas**, logo abaixo de cada campo e atualizado enquanto se digita: pergunta de pesquisa, objetivo, objetivos específicos, hipótese e conclusões. Para cada problema mostra *por que está inadequado*, *como corrigir* e, quando possível, uma reescrita sugerida (botão “Usar sugestão”). Detecta, entre outros: verbo vago (“analisar”, “investigar”), procedimento no lugar do objetivo (“aplicar questionário”), meta de intervenção (“elaborar material”, “contribuir para”), objetivo que anuncia a conclusão (“comprovar que”), mais de um objetivo no mesmo enunciado, incoerência com o tipo lógico, causalidade indevida, variável ausente, hipótese sem direção, não testável ou indefinida, e conclusões que vão além do delineamento.
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
manifest.webmanifest, sw.js, icones/   instalação como aplicativo (PWA) e uso offline
vendor/jszip.min.js biblioteca JSZip 3.10.1 (MIT/GPLv3) para gerar o .docx sem internet
atalhos/            atalhos de abertura (Windows, Mac, Linux) e LEIA-ME do pacote
scripts/empacotar.py  gera dist/Metodo-Logico.zip
windows/            script NSIS do instalador (instalador.nsi) e ícone .ico
scripts/gerar_instalador.sh  gera dist/Metodo-Logico-Instalador.exe
js/diagnostico.js   diagnóstico de objetivo, hipótese, pergunta e conclusões (por que está inadequado + como corrigir)
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
