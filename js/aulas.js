/*
 * Conteúdo das aulas de Metodologia da Pesquisa em Linguística Aplicada
 * (PPgEL/UFRN, 2025.2 — Prof. Paulo Henrique Duque), que aplica o Método
 * Lógico de Volpato à redação de TCC, dissertação, tese e artigo.
 *
 * Aqui ficam: roteiros de outline por seção, a função de cada tipo de frase
 * do parágrafo científico, a fundamentação por tipo lógico, delineamentos
 * A–H, escolha de gráficos e testes estatísticos, modelos de título/resumo,
 * checklist de qualificação e declaração de uso de IA.
 */
(function () {
  const AULAS = "Duque — Metodologia da Pesquisa em LA (UFRN, 2025.2)";

  /* ---------- Função de cada frase do parágrafo, por seção ---------- */
  const FRASES = {
    introducao: {
      topico: "Declara o fenômeno, o problema ou a lacuna. Ex.: “O discurso político digital é altamente metafórico.”",
      sustentacao: "Prova vem da literatura: citações e dados de contexto que mostram o estado atual do conhecimento.",
      especificacao: "Interpreta a relevância e a necessidade lógica de investigar. Ex.: “Essas lacunas indicam a necessidade de…”",
      transicao: "Conecta ao próximo passo do argumento (lacuna → objeto → tipo de pesquisa → objetivo).",
    },
    marco: {
      topico: "Define um conceito, princípio ou categoria. Ex.: “A Teoria X explica a relação entre…”",
      sustentacao: "Premissas conceituais: definições, comparações entre autores — integradas ao raciocínio, não ‘Fulano diz que’.",
      especificacao: "Delimita o uso no estudo: “Neste trabalho, adotam-se as categorias de… para classificar…”",
      transicao: "Prepara o próximo conceito ou a ponte com o método (o que será medido/codificado).",
    },
    metodos: {
      topico: "Ação lógica da pesquisa. Ex.: “Para responder à pergunta, realizou-se análise de corpus com base em…”",
      sustentacao: "Prova vem da coerência racional: detalhamento do procedimento, critérios, números.",
      especificacao: "Justifica a adequação ou reconhece limites: “Esse recorte garante comparabilidade, embora restrinja…”",
      transicao: "Encaminha para a próxima subseção (objeto → delineamento → elaboração → análise).",
    },
    resultados: {
      topico: "Constatação direta derivada dos dados, sem interpretação. Ex.: “Metáforas verticais ocorreram em 72% das postagens.”",
      sustentacao: "Prova vem dos dados: frequências, médias, excertos, tabelas e figuras (sempre citadas no texto).",
      especificacao: "Padrões, recortes e variações — o que os dados sugerem, sem ainda generalizar.",
      transicao: "Encaminha para o próximo bloco de dados ou, no fim, para a Discussão.",
    },
    discussao: {
      topico: "Interpretação central do achado. Ex.: “A predominância de X confirma o vínculo entre…”",
      sustentacao: "Prova vem da teoria e da lógica: retome dados, confronte com a teoria e a literatura.",
      especificacao: "Implicações teóricas e limites: confirma, amplia ou desafia a teoria — e até onde.",
      transicao: "Conduz ao próximo movimento (teoria → literatura → divergências → limites → implicações).",
    },
    conclusao: {
      topico: "Resposta sintética à pergunta científica.",
      sustentacao: "Retomada dos principais resultados e argumentos que sustentam a resposta (sem repetir dados em detalhe).",
      especificacao: "Implicação teórica, contribuição e abertura para novas investigações.",
      transicao: "Fecha o texto (opcional).",
    },
    geral: {
      topico: "A afirmação que o parágrafo vai demonstrar (mini-conclusão verificável). Evite frases anunciativas (“Neste parágrafo, trataremos…”).",
      sustentacao: "Provas: dados, exemplos, autores, observações. Responde: por que isso é verdadeiro?",
      especificacao: "Interpretação, implicação, limite — o que a prova demonstra.",
      transicao: "Liga ao parágrafo seguinte (reforço, contraste, consequência ou síntese).",
    },
  };

  /* ---------- Roteiros de outline por seção ---------- */
  const R = (ideia, item, topico) => ({ ideia, item, topico: topico || "" });
  const ROTEIROS = {
    introducao: [
      R("Fenômeno e relevância", "Apresentar o fenômeno, o contexto em que ocorre e por que importa (teórica, social ou empiricamente)."),
      R("Conhecimento essencial", "Apresentar só o conhecimento mínimo que sustenta o raciocínio — articular o que se sabe, sem listar autores."),
      R("Estado da arte", "Sintetizar de forma integrada o que a área já consolidou e onde está o limite do saber (termina em “Apesar disso…”)."),
      R("Lacuna", "Explicitar o ponto que permanece sem explicação, como consequência lógica do estado da arte, e por que resolvê-lo importa."),
      R("Objeto de estudo", "Definir a variável teórica (e as operacionais) como resposta necessária à lacuna."),
      R("Tipo de pesquisa e recortes", "Indicar se é caracterização, associação ou interferência e justificar os recortes (corpus, período, gênero etc.)."),
      R("Objetivo (e hipótese)", "Enunciar o objetivo geral (e específicos) como conclusão inevitável do argumento; hipótese, se houver; contribuição esperada."),
    ],
    marco: [
      R("Quadro teórico geral", "Apresentar a teoria central e por que ela é compatível com o problema (princípio organizador)."),
      R("Conceitos fundamentais", "Definir cada categoria central, com suas subcategorias, e relacioná-las entre si (do mais geral ao mais específico)."),
      R("Estrutura conceitual do objeto", "Explicar como o objeto é composto: propriedades, dimensões de análise e relações internas."),
      R("Estudos correlatos", "Analisar criticamente estudos essenciais: convergências, divergências, limitações conceituais e implicações para a pesquisa."),
      R("Integração teoria–método", "Mostrar como os conceitos serão operacionalizados: corpus, unidades de análise, indicadores, critérios de codificação."),
    ],
    metodos: [
      R("Objeto: fenômeno", "Descrever o fenômeno, evento, corpus ou unidade empírica observada."),
      R("Objeto: fontes e tipo", "Indicar a origem das evidências (campo, laboratório, bibliográfica/documental) e o contexto (local, instituição, período)."),
      R("Objeto: unidade, população e amostra", "Definir a unidade de análise, a população, a amostra, critérios de inclusão/exclusão e a estratégia de amostragem."),
      R("Delineamento: tipo lógico e modelo", "Identificar o tipo lógico e o modelo de delineamento (A–H) e justificar por que é o mais coerente com a pergunta."),
      R("Delineamento: variáveis", "Indicar as variáveis teóricas e operacionais e mostrar a coerência entre modelo e hipótese."),
      R("Elaboração dos dados", "Técnicas (documentação direta/indireta), instrumentos e protocolos, passo a passo, critérios técnicos e éticos."),
      R("Contexto e limites da produção dos dados", "Condições de tempo, espaço e situação da coleta e o que isso limita."),
      R("Análise: tipo e procedimentos", "Qualitativa, quantitativa ou mista; procedimentos passo a passo e justificativa da técnica."),
      R("Análise: recursos e validação", "Softwares (papel limitado) e estratégias de rigor (dupla codificação, triangulação, pressupostos estatísticos)."),
      R("Análise: relação com a pergunta", "Mostrar como a análise responde à pergunta ou testa a hipótese."),
    ],
    resultados: [
      R("Abertura", "Informar o que será apresentado e como os dados estão organizados (ex.: conforme os objetivos específicos); tipo de dado e N."),
      R("Achado 1", "Declarar o dado principal do 1º bloco (objetivo, variável ou categoria) e expô-lo em tabela/figura/excertos."),
      R("Achado 2", "Declarar o dado principal do 2º bloco."),
      R("Exemplos qualitativos (opcional)", "Apresentar trechos/registros que mostram os padrões, com contexto, e explicar o que cada um evidencia."),
      R("Contraste entre grupos (opcional)", "Constatar diferenças entre grupos, momentos ou contextos, com tabela/gráfico comparativo."),
      R("Síntese dos resultados", "Resumir os achados principais, sem interpretar, e encaminhar para a Discussão."),
    ],
    discussao: [
      R("Retomada", "Retomar a pergunta científica e resumir os resultados centrais para a resposta."),
      R("Inferência lógica", "Explicar o que os dados mostram: a resposta interpretativa à pergunta."),
      R("Validação pela teoria", "Mostrar se a teoria adotada prevê o resultado — se é corroborada, ampliada ou questionada."),
      R("Diálogo com a literatura", "Comparar com estudos anteriores: convergências e divergências."),
      R("Justificação das diferenças", "Se divergir, explicar logicamente por quê (corpus, contexto, amostra, abordagem)."),
      R("Limites da resposta", "Indicar até onde os dados permitem generalizar (escopo, método, corpus, tempo)."),
      R("Implicações", "Mostrar o avanço: novas explicações, refinamento teórico, reformulações conceituais."),
      R("Novas perguntas", "Propor investigações futuras a partir dos limites e implicações."),
      R("Fechamento", "Recapitular o raciocínio e mostrar como ele responde à pergunta."),
    ],
    conclusao: [
      R("Resposta à pergunta", "Responder sinteticamente à pergunta científica."),
      R("Sustentação", "Retomar os resultados e argumentos que sustentam a resposta."),
      R("Contribuição", "Explicitar o que a pesquisa acrescenta ao conhecimento da área."),
      R("Perspectivas", "Apontar implicações e novas investigações."),
    ],
  };

  /* ---------- Fundamentação do objetivo por tipo lógico ---------- */
  const FUNDAMENTACAO = {
    descritiva: [
      "Necessidade científica da descrição: qual o ganho real para a área? (não basta “ainda não foi feito”).",
      "Diferencial metodológico (se já existe caracterização): por que o novo método traz benefício concreto.",
      "Diferencial de contexto: por que outro grupo, variedade, gênero ou faixa etária representa avanço.",
      "Não compare grupos: comparação configura outro tipo de pergunta (associação).",
    ],
    associacao: [
      "Importância científica da associação (ex.: uma variável difícil de medir pode ser indicada pela outra; a literatura sugere o padrão).",
      "Forma esperada da associação (aumenta–aumenta, aumenta–diminui, presença–ausência) e por que faz sentido.",
      "Por que não é causalidade: ambas podem ser afetadas por uma terceira variável ou ter comportamento paralelo.",
      "Relevância contextual ou empírica (nova comunidade, variedade, situação), sempre na lógica associativa.",
    ],
    interferencia: [
      "Importância de investigar o efeito (identificar causas, validar mecanismos, prever comportamentos, testar teorias).",
      "Justificativa da direção do efeito esperado (aumento, redução, aceleração…) à luz da literatura.",
      "Mecanismo plausível: como o efeito pode ocorrer (variáveis intermediárias).",
      "Por que é interferência e não mera associação (literatura indica efeito, a variável pode ser manipulada etc.).",
    ],
  };

  /* ---------- Delineamentos A–H ---------- */
  const DELINEAMENTOS = [
    { id: "A", nome: "A — Amostragem simples", tipos: ["descritiva", "associacao"], usa: "Observar e descrever variáveis numa amostra (ou associação interna entre variáveis dessa amostra)." },
    { id: "B", nome: "B — Grupos independentes (corte transversal)", tipos: ["associacao"], usa: "Comparar grupos ou variáveis num mesmo momento, sem manipulação." },
    { id: "H", nome: "H — Complexificação com subgrupos", tipos: ["associacao"], usa: "Comparar subgrupos combinando mais de um fator, sem manipulação." },
    { id: "C", nome: "C — Um grupo ao longo do tempo (longitudinal simples)", tipos: ["interferencia"], usa: "Acompanhar o mesmo grupo e avaliar o efeito do tempo." },
    { id: "D", nome: "D — Interferência natural (contexto)", tipos: ["interferencia"], usa: "Avaliar o efeito de um fator que ocorre naturalmente (não planejado)." },
    { id: "E", nome: "E — Intervenção em grupo único", tipos: ["interferencia"], usa: "Antes e depois de uma intervenção no mesmo grupo." },
    { id: "F", nome: "F — Grupos paralelos com intervenção (quase-experimental)", tipos: ["interferencia"], usa: "Comparar grupo com intervenção e grupo sem intervenção, acompanhados simultaneamente." },
    { id: "G", nome: "G — Grupos independentes em sequência temporal (coorte)", tipos: ["interferencia"], usa: "Comparar grupos diferentes em momentos sucessivos." },
  ];

  /* ---------- Tipos de variável ---------- */
  const VARIAVEIS = {
    nominal: { nome: "Nominal", ex: "gênero; tipo de pronome (tu/você); curso", pode: "contar frequências, moda — não calcular média" },
    ordinal: { nome: "Ordinal", ex: "satisfação 1–5; escolaridade", pode: "mediana, moda, percentis, ranking — evitar médias e razões" },
    intervalar: { nome: "Intervalar", ex: "temperatura °C; ano de nascimento", pode: "média, desvio-padrão, correlação — não usar razões" },
    razao: { nome: "Razão (proporcional)", ex: "tempo de leitura; idade; nº de ocorrências", pode: "todas as operações: média, razões, porcentagens" },
  };

  /* ---------- Escolha do teste estatístico ---------- */
  function recomendarTeste(pergunta, variavel, grupos) {
    const num = variavel === "intervalar" || variavel === "razao";
    if (pergunta === "descrever") {
      if (variavel === "nominal") return t("Frequências e porcentagens; moda", "Barras (categorias) ou setores (até 5–6 categorias)", "n (%) por categoria", "=CONT.SE(intervalo; critério)");
      if (variavel === "ordinal") return t("Mediana, moda, percentis (quartis)", "Barras ordenadas ou boxplot", "Mediana (Q1–Q3)", "=MED(intervalo); =QUARTIL(intervalo; 1)");
      return t("Média e desvio-padrão (ou mediana, se assimétrica); intervalo de confiança da média", "Histograma ou boxplot", "M = 12,4; DP = 3,1; IC95% [11,2; 13,6]", "=MÉDIA(); =DESVPAD(); =INT.CONFIANÇA.T(0,05; DP; n)");
    }
    if (pergunta === "comparar") {
      if (variavel === "nominal") return t("Qui-quadrado (χ²) de independência", "Colunas ou barras empilhadas", "χ²(1, N = 40) = 7,62, p = 0,006", "=TESTE.QUI(observados; esperados) — ou calculadora on-line");
      if (variavel === "ordinal" || !num) return grupos === "3"
        ? t("Kruskal-Wallis (não paramétrico)", "Boxplot por grupo", "H(2) = 6,1, p = 0,047", "Use JASP, R ou calculadora on-line")
        : t("Mann-Whitney (não paramétrico)", "Boxplot por grupo", "U = 112, p = 0,03", "Use JASP, R ou calculadora on-line");
      if (grupos === "3") return t("ANOVA (+ post hoc de Tukey se significativa)", "Barras com erro-padrão ou boxplot", "F(2, 45) = 4,32, p = 0,019", "Dados › Análise de Dados › ANOVA: fator único");
      if (grupos === "pareado") return t("Teste t pareado (antes × depois no mesmo grupo)", "Barras com erro-padrão ou linhas ligando antes–depois", "t(19) = 3,10, p = 0,006", "=TESTE.T(antes; depois; 2; 1)");
      return t("Teste t de Student para amostras independentes", "Barras com erro-padrão (±)", "t(38) = 2,45, p = 0,019", "=TESTE.T(grupo1; grupo2; 2; 3)  (variâncias diferentes)");
    }
    if (pergunta === "relacionar") {
      if (variavel === "nominal") return t("Qui-quadrado (χ²) de associação", "Barras empilhadas", "χ²(2, N = 90) = 9,1, p = 0,011", "=TESTE.QUI(observados; esperados)");
      if (variavel === "ordinal") return t("Correlação de Spearman (rs)", "Dispersão (linha de tendência opcional)", "rs(28) = 0,52, p = 0,004", "Calculadora on-line (ex.: GraphPad)");
      return t("Correlação de Pearson (r); regressão, se quiser prever", "Dispersão (scatter plot)", "r(28) = –0,71, p < 0,001", "=CORREL(intervalo1; intervalo2)  (o p exige calculadora on-line)");
    }
    return null;
    function t(teste, grafico, relato, planilha) {
      return { teste, grafico, relato, planilha };
    }
  }

  /* ---------- Escolha do gráfico ---------- */
  const GRAFICOS = {
    comparar_categorias: { nome: "Gráfico de barras", leitura: "Cada barra é uma categoria independente; os espaços indicam que não há continuidade.", ex: "Número de artigos publicados por país." },
    distribuicao: { nome: "Histograma", leitura: "Barras contíguas representam faixas de um valor contínuo.", ex: "Distribuição das notas de uma turma." },
    composicao_tempo: { nome: "Colunas empilhadas", leitura: "Cada coluna é um total dividido em partes.", ex: "Participação de grupos num total mensal." },
    composicao: { nome: "Setores (pizza)", leitura: "O círculo é 100%; cada fatia é uma proporção. Só para até 5–6 categorias; ruim para comparar valores próximos.", ex: "Distribuição das respostas A, B, C." },
    tendencia: { nome: "Linhas", leitura: "Pontos conectados em sequência temporal.", ex: "Evolução mensal de um comportamento." },
    relacao: { nome: "Dispersão", leitura: "Cada ponto relaciona duas variáveis; revela correlação e outliers.", ex: "Horas de estudo × nota." },
    comparar_distribuicoes: { nome: "Boxplot", leitura: "Mediana, quartis (caixa), bigodes e outliers; caixa alta = dados espalhados.", ex: "Notas de três turmas." },
    frequencia_palavras: { nome: "Nuvem de palavras", leitura: "Tamanho = frequência. Bom para explorar, fraco para provar.", ex: "Termos mais usados em respostas abertas." },
    relacoes_palavras: { nome: "Similitude / coocorrência", leitura: "Nós = palavras; linhas = aparecem juntas; espessura = força da relação.", ex: "Núcleos temáticos em entrevistas." },
    agrupamentos: { nome: "Dendrograma", leitura: "Junções baixas = itens muito semelhantes; caixas = clusters.", ex: "Categorias emergentes numa análise." },
    eixos_sentido: { nome: "Análise Fatorial por Correspondência (AFC)", leitura: "Proximidade no plano = associação de contexto; eixos = dimensões de variação do discurso.", ex: "Comparar discursos de perfis diferentes." },
    rede_conceitos: { nome: "Rede semântica / mapa conceitual", leitura: "Setas indicam relações (é um, tem, faz) entre conceitos.", ex: "Estrutura de categorias de um tema." },
    espaco: { nome: "Mapa de pontos", leitura: "Localização e intensidade de um fenômeno no espaço.", ex: "Distribuição de um indicador por município." },
    processo: { nome: "Figura: fluxograma ou esquema", leitura: "Mostra processo, estrutura ou modelo.", ex: "Fluxo de análise dos dados." },
    numeros_exatos: { nome: "Tabela", leitura: "Números exatos, muitos dados em linhas e colunas para comparação precisa.", ex: "Frequência de categorias por grupo." },
    texto_qualitativo: { nome: "Quadro", leitura: "Texto curto e comparativo: categorias, exemplos, definições.", ex: "Exemplos de metáforas por categoria." },
  };
  const OBJETIVOS_GRAFICO = [
    ["comparar_categorias", "Comparar quantidades entre categorias/grupos"],
    ["distribuicao", "Mostrar a distribuição de um valor contínuo"],
    ["comparar_distribuicoes", "Comparar distribuições entre grupos"],
    ["composicao", "Mostrar partes de um todo (poucas categorias)"],
    ["composicao_tempo", "Comparar composições ao longo do tempo"],
    ["tendencia", "Mostrar tendência no tempo"],
    ["relacao", "Relação entre duas variáveis numéricas"],
    ["numeros_exatos", "Apresentar números exatos para consulta"],
    ["texto_qualitativo", "Organizar categorias, exemplos ou definições (texto)"],
    ["processo", "Mostrar um processo, estrutura ou modelo"],
    ["frequencia_palavras", "Explorar palavras mais frequentes num corpus"],
    ["relacoes_palavras", "Mostrar relações entre palavras/conceitos num corpus"],
    ["agrupamentos", "Mostrar agrupamentos (clusters)"],
    ["eixos_sentido", "Mostrar eixos de sentido entre grupos/discursos"],
    ["rede_conceitos", "Representar uma estrutura conceitual"],
    ["espaco", "Mostrar distribuição geográfica"],
  ];

  /* ---------- Título, resumo, palavras-chave ---------- */
  const TITULO_MODELOS = [
    ["Descritivo", "A caracterização de X em Y", "A caracterização de metáforas conceptuais sobre eventos climáticos em reportagens de divulgação científica"],
    ["Associação", "Associação entre X e Y em Z", "Associação entre domínios conceptuais e avaliações de risco em discursos jornalísticos sobre clima"],
    ["Com teoria", "X como categoria Z", "Metáforas de colapso como esquemas conceptuais de ameaça na construção discursiva da crise climática"],
    ["Com recorte", "X em Y produzidos por Z", "Padrões de mapeamento metafórico em notícias ambientais produzidas por veículos de divulgação científica brasileiros"],
    ["Com subtítulo", "O QUÊ (categoria teórica): COMO/ONDE (recorte, corpus, abordagem)", "Metáforas de colapso na crise climática: um estudo de domínios conceptuais em reportagens de divulgação científica"],
  ];
  const RESUMO_MOVIMENTOS = [
    ["problema", "Problema", "O fenômeno e sua complexidade (1 frase)."],
    ["lacuna", "Lacuna", "O que não se sabia e torna a pesquisa necessária."],
    ["objetivo", "Objetivo", "A pergunta que guia o estudo — consequência da lacuna."],
    ["tipo", "Tipo de pesquisa", "Caracterização, associação ou interferência."],
    ["metodo", "Método", "Corpus/participantes, procedimentos, categorias, critérios."],
    ["resultados", "Resultados", "Os principais achados, sintéticos."],
    ["conclusao", "Conclusão", "A afirmação científica final (a tese, se houver)."],
  ];
  const PALAVRAS_GENERICAS = ["linguagem", "contexto", "língua portuguesa", "pesquisa", "estudo", "análise", "educação", "ensino", "comunicação", "sociedade"];

  /* ---------- Qualificação e declaração de IA ---------- */
  const QUALIFICACAO = {
    definitivo: ["Problema científico", "Lacuna científica (derivada do estado da arte)", "Objetivo geral e específicos", "Introdução como argumento completo", "Marco Teórico (arquitetura conceitual)", "Métodos justificados, exequíveis e replicáveis"],
    construcao: ["Resultados (parciais: tabelas provisórias, primeiras tendências)", "Discussão (tópicos, hipóteses de interpretação)", "Conclusão (hipótese de contribuição)", "Título (versão preliminar)"],
    nota: "Nota ao avaliador:\nAs seções {secoes} encontram-se em construção, de acordo com a diretriz metodológica de que esses elementos dependem do desenvolvimento integral da análise. As partes concluídas constituem a argumentação lógica necessária para avaliação da consistência científica da pesquisa.",
  };
  const IA_MODELOS = {
    apoio:
      "Durante o processo de elaboração desta pesquisa, foram utilizados recursos de Inteligência Artificial (IA) generativa para apoio técnico e editorial, restritos às seguintes funções: {funcoes}.\nA IA não foi utilizada para gerar conteúdo científico original, formular hipóteses, construir argumentos teóricos, interpretar dados ou elaborar análises. Todo o conteúdo analítico, teórico e interpretativo resulta de decisões da autora/do autor, com base na literatura especializada e nos dados coletados.\nO uso de IA não implica coautoria e está em conformidade com as diretrizes éticas da instituição e com padrões reconhecidos internacionalmente para transparência no uso de ferramentas digitais.",
    edicao:
      "O conteúdo deste trabalho é integralmente de autoria do(a) pesquisador(a). Ferramentas de Inteligência Artificial foram empregadas apenas para apoio à redação final, com funções de {funcoes}. Em nenhum momento houve geração automática de trechos científicos sem revisão crítica. Todas as decisões metodológicas, teóricas e analíticas são de responsabilidade exclusiva do(a) autor(a).",
  };
  const IA_FUNCOES = [
    "reorganização de trechos já escritos para melhoria da fluidez",
    "identificação de inconsistências de coesão textual",
    "sugestões de estruturação de capítulos",
    "revisão linguística e estilística",
    "checagem de coerência textual",
    "organização de referências",
  ];

  window.AULAS = {
    FONTE: AULAS,
    FRASES,
    ROTEIROS,
    FUNDAMENTACAO,
    DELINEAMENTOS,
    VARIAVEIS,
    recomendarTeste,
    GRAFICOS,
    OBJETIVOS_GRAFICO,
    TITULO_MODELOS,
    RESUMO_MOVIMENTOS,
    PALAVRAS_GENERICAS,
    QUALIFICACAO,
    IA_MODELOS,
    IA_FUNCOES,
  };
})();
