/*
 * Conteúdo metodológico do assistente.
 *
 * Baseado (em paráfrase, com indicação de fonte) nas obras de Gilson L. Volpato:
 *  - Guia Prático para Redação Científica (rotina de 40 passos do Método Lógico)
 *  - Volpato & Barreto. Elabore Projetos Científicos Competitivos
 *  - Bases Teóricas para Redação Científica
 *  - Ciência: da filosofia à publicação
 *  - Estatística sem Dor
 *
 * Cada etapa tem: o que fazer, por que fazer, armadilhas comuns e os campos
 * que o pesquisador preenche. Os textos são resumos didáticos — consulte os
 * livros para o raciocínio completo.
 */

const GUIA = "Volpato — Guia Prático para Redação Científica";
const PROJ = "Volpato & Barreto — Elabore Projetos Científicos Competitivos";
const BASES = "Volpato — Bases Teóricas para Redação Científica";
const EST = "Volpato — Estatística sem Dor";
const AULA = window.AULAS.FONTE;

const TIPOS_TRABALHO = {
  tcc: { nome: "TCC", academico: true },
  monografia: { nome: "Monografia", academico: true },
  dissertacao: { nome: "Dissertação de mestrado", academico: true },
  tese: { nome: "Tese de doutorado", academico: true },
  artigo: { nome: "Artigo científico", academico: false },
};

const TIPOS_LOGICOS = {
  descritiva: {
    nome: "Descritiva (sem hipótese)",
    explica:
      "Descreve uma ou mais variáveis, sem testar relação entre elas. Ex.: descrever a estrutura do DNA; caracterizar o perfil de leitura de universitários.",
    verbos: ["Descrever", "Caracterizar", "Identificar", "Mapear", "Propor"],
    modelo: (a, b, f) => `Descrever ${a || "[variável]"}${f ? " em " + f : ""}.`,
  },
  associacao: {
    nome: "Associação sem interferência",
    explica:
      "Testa se duas ou mais variáveis variam juntas, sem afirmar que uma causa a outra (pode haver uma terceira variável afetando ambas).",
    verbos: ["Testar se", "Verificar se"],
    modelo: (a, b, f) =>
      `Testar se há associação entre ${a || "[variável A]"} e ${b || "[variável B]"}${f ? " em " + f : ""}.`,
  },
  interferencia: {
    nome: "Associação com interferência (causa–efeito)",
    explica:
      "Testa se uma variável (independente) altera outra (dependente). Exige controle das demais variáveis — geralmente manipulação experimental.",
    verbos: ["Testar se", "Verificar se"],
    modelo: (a, b, f) =>
      `Testar se ${a || "[variável independente]"} afeta ${b || "[variável dependente]"}${f ? " em " + f : ""}.`,
  },
};

/* ------------------------------------------------------------------ */
/* Fases e etapas                                                      */
/* ------------------------------------------------------------------ */

const FASES = [
  {
    id: "projeto",
    nome: "1. Projeto de pesquisa",
    resumo:
      "Antes de coletar dados: escolher uma pergunta que a ciência queira responder, definir o tipo lógico da pesquisa e deduzir o delineamento a partir do objetivo.",
  },
  {
    id: "execucao",
    nome: "2. Execução e análise",
    resumo: "Executar o projeto com rigor e analisar os dados por diferentes ângulos (Passos 1–2).",
  },
  {
    id: "historia",
    nome: "3. Encontre sua história",
    resumo:
      "Conectar os resultados num discurso coerente, separar evidências fortes e fracas e construir a Pirâmide Lógica (Passos 3–5).",
  },
  {
    id: "planejamento",
    nome: "4. Entenda e planeje",
    resumo:
      "Ter a história clara, escolher o veículo, reunir informação, criar tempo de imersão e entender a redação de trás para frente (Passos 6–12).",
  },
  {
    id: "redacao",
    nome: "5. Redação (de trás para frente)",
    resumo:
      "Conclusões → Resultados → Métodos → Discussão → Objetivos → Introdução → Resumo → Título (Passos 13–30).",
  },
  {
    id: "acabamento",
    nome: "6. Acabamento e debate",
    resumo: "Revisar, ouvir críticas, ajustar às normas, submeter/defender e acompanhar o impacto (Passos 31–40).",
  },
];

/*
 * Tipos de campo:
 *  text, textarea, select, list, checklist, objetivo, resultados,
 *  piramide, outline, referencias, info
 */
const ETAPAS = [
  /* ============================ PROJETO ============================ */
  {
    id: "pr-pergunta",
    fase: "projeto",
    titulo: "Pergunta de pesquisa e nível de ciência",
    fonte: `${PROJ}, caps. 2–3; ${GUIA}, Passo 1`,
    oque: [
      "Defina em que nível de debate científico você quer entrar (veículo internacional de alto impacto, internacional, regional, institucional).",
      "Examine artigos recentes de veículos desse nível no seu tema: que conclusões são consideradas novidade, que técnicas são usadas, que tamanho amostral é aceito.",
      "Formule uma pergunta cuja resposta mude algo no conhecimento da área — não apenas uma pergunta local.",
    ],
    porque:
      "A redação começa na escolha do projeto. Um projeto com pergunta irrelevante ou metodologia frágil já nasce limitado, por melhor que seja o texto. Quem define o que é conhecimento científico relevante é a comunidade de cientistas — por isso é preciso 'ouvi-los' lendo o que publicam.",
    erros: [
      "Escolher o tema por gosto pessoal sem verificar se a área considera a pergunta relevante.",
      "Enfatizar o local da coleta como se fosse o objeto da pesquisa (a conclusão deve ser mais geral que os dados).",
      "Usar técnicas ou N muito abaixo do que se publica no nível pretendido.",
    ],
    campos: [
      { id: "tema", tipo: "text", rotulo: "Tema geral", ph: "Ex.: efeito da cor do ambiente sobre o apetite" },
      { id: "pergunta", tipo: "textarea", rotulo: "Pergunta de pesquisa", ph: "Uma pergunta clara, que possa ser respondida com evidência empírica." },
      {
        id: "nivel",
        tipo: "select",
        rotulo: "Nível do debate que deseja alcançar",
        opcoes: [
          "Internacional de alto impacto (interessa a várias áreas)",
          "Internacional de impacto (interessa à especialidade)",
          "Regional (país/continente)",
          "Institucional / local",
        ],
      },
      {
        id: "artigos",
        tipo: "list",
        rotulo: "Artigos-modelo analisados (referência — novidade da conclusão — técnica — N)",
        ph: "Silva et al. 2023 — mostra X pela 1ª vez — RT-PCR — N=20",
      },
      { id: "relevancia", tipo: "textarea", rotulo: "O que a resposta muda na ciência?", ph: "Por que um cientista de fora do seu grupo se interessaria pela resposta?" },
    ],
  },
  {
    id: "pr-desenho",
    fase: "projeto",
    titulo: "Desenho da pesquisa (assistente)",
    fonte: `${PROJ}, caps. 4–5; ${AULA}`,
    oque: [
      "Responda às perguntas na ordem. Cada resposta abre a próxima e desativa as opções que deixaram de ser compatíveis, com o motivo.",
      "Se mudar uma resposta anterior, as escolhas seguintes que ficarem incompatíveis são desfeitas e o assistente avisa.",
      "Ao final, leve as sugestões para as etapas (objetivo, delineamento, análise, teste e gráficos já chegam filtrados).",
    ],
    porque:
      "O delineamento é deduzido do objetivo: o tipo lógico, a possibilidade de intervir, a fonte dos dados e o tipo de generalização eliminam caminhos e deixam só os que podem, de fato, responder à pergunta.",
    erros: ["Escolher a técnica (entrevista, questionário) antes de saber o que a pergunta exige.", "Prometer causa–efeito sem intervenção nem evento que isole a causa."],
    campos: [{ id: "plano", tipo: "planejador", rotulo: "Desenho da pesquisa" }],
  },
  {
    id: "pr-tipo",
    fase: "projeto",
    titulo: "Variáveis, tipo lógico e objetivo",
    fonte: `${PROJ}, cap. 4; ${BASES}; ${AULA}`,
    oque: [
      "Liste as variáveis que você vai estudar (teóricas e, depois, como cada uma será observada).",
      "Classifique a pesquisa num dos três tipos lógicos: descritiva, associação sem interferência ou associação com interferência (causa–efeito).",
      "Escreva o objetivo teórico com o verbo coerente com esse tipo lógico. O assistente gera uma proposta que você pode editar.",
      "Com hipótese, o objetivo costuma trazer um “se…” (testar se…). Em interferência, deixe explícitas a variável interferente, a variável afetada e a direção do efeito.",
    ],
    porque:
      "Todo objetivo empírico cai numa de três lógicas. Descrever não exige hipótese; testar associação ou interferência exige. Um objetivo bem classificado determina o delineamento, a análise e o tipo de conclusão possível — e evita prometer causa quando o estudo só permite associação.",
    erros: [
      "Objetivo com verbos vagos ('analisar', 'estudar', 'investigar') que não deixam claro o que será concluído.",
      "Concluir causa–efeito a partir de um delineamento só correlacional.",
      "Colocar no objetivo detalhes de procedimento (técnica, local) em vez das variáveis teóricas.",
    ],
    campos: [
      { id: "variaveis", tipo: "list", rotulo: "Variáveis do estudo", ph: "Ex.: cor do ambiente; ingestão de alimento" },
      { id: "objetivo", tipo: "objetivo", rotulo: "Construtor de objetivo" },
      { id: "hipotese", tipo: "textarea", rotulo: "Hipótese (se não for descritiva)", ph: "Ex.: O aumento da carga de memória interfere na precisão dos julgamentos de gramaticalidade, reduzindo a taxa de respostas corretas." },
      { id: "especificos", tipo: "list", rotulo: "Objetivos específicos (se o seu programa exigir)", ph: "Cada um também deve ter um tipo lógico claro." },
    ],
  },
  {
    id: "pr-delineamento",
    fase: "projeto",
    titulo: "Delineamento deduzido do objetivo",
    fonte: `${PROJ}, cap. 5; ${EST}; ${AULA}`,
    oque: [
      "Descritiva: defina as variáveis a descrever, o tamanho da amostra e como obter a amostra sem viés (aleatorização, estratificação).",
      "Com hipótese: defina variável independente e dependente, grupos/condições, controles, aleatorização, réplicas e o que precisa ser mantido constante.",
      "Separe a estratégia (delineamento, nível das ideias) dos procedimentos específicos (técnicas, questionários, equipamentos).",
      "Escolha o modelo técnico de delineamento (A–H) compatível com o tipo lógico.",
      "Planeje a análise de dados já aqui — ela decorre do delineamento.",
      "Defina o critério de suficiência da amostra: estabilidade dos resultados (quantitativo) ou saturação teórica (qualitativo). Não existe “número mágico”.",
    ],
    porque:
      "O delineamento é a estratégia intelectual para descrever ou testar a hipótese. Ele é deduzido do objetivo: se o objetivo está claro, o delineamento praticamente se impõe. Muitos confundem delineamento com técnica de medida.",
    erros: [
      "Escolher a técnica antes de saber qual variável precisa ser medida.",
      "Ausência de grupo controle ou de controle de variáveis confundidoras.",
      "N definido por conveniência, sem comparação com a literatura do nível pretendido.",
    ],
    campos: [
      { id: "sujeito", tipo: "textarea", rotulo: "Sujeito / população / corpus do estudo" },
      { id: "modelo", tipo: "delineamento", rotulo: "Modelo de delineamento (A–H)" },
      { id: "estrategia", tipo: "textarea", rotulo: "Estratégia (grupos, condições, controles, aleatorização, réplicas)" },
      { id: "amostra", tipo: "textarea", rotulo: "Tamanho amostral e justificativa", ph: "Ex.: N=20 por grupo, compatível com estudos publicados (15–25)." },
      { id: "procedimentos", tipo: "textarea", rotulo: "Procedimentos específicos (como medir cada variável)" },
      { id: "analise", tipo: "textarea", rotulo: "Análise de dados planejada" },
      { id: "suficiencia", tipo: "textarea", rotulo: "Critério de suficiência da amostra", ph: "Ex.: coleta em blocos de 5 casos até a média variar menos de 5% entre blocos; ou saturação teórica — encerrar quando novas entrevistas não trouxerem categorias novas." },
    ],
  },
  {
    id: "pr-redacao",
    fase: "projeto",
    titulo: "Redação e submissão do projeto",
    fonte: `${PROJ}, caps. 6–8`,
    oque: [
      "Redija nesta ordem: objetivo → material e métodos → introdução → resumo → título → referências.",
      "A introdução do projeto deve fundamentar o objetivo: contexto amplo, lacuna, e por que vale a pena responder a pergunta.",
      "Descanse o texto, revise, peça crítica de colegas, obtenha aprovação ética (CEP/CEUA, Plataforma Brasil) e submeta.",
    ],
    porque:
      "O projeto é o argumento de que a pergunta é relevante e de que o método é capaz de respondê-la. A ordem de redação parte do que você tem mais claro (o objetivo) para aquilo que só faz sentido depois dele (a introdução).",
    erros: [
      "Separar 'introdução' e 'justificativa' como se fossem argumentos diferentes — a introdução já é a justificativa do objetivo.",
      "Introdução enciclopédica, que fala das variáveis em vez de explicar por que relacioná-las.",
    ],
    campos: [
      { id: "intro_outline", tipo: "outline", rotulo: "Outline da introdução do projeto (uma frase-tópico por parágrafo)" },
      { id: "cronograma", tipo: "list", rotulo: "Cronograma (etapa — período)", ph: "Coleta piloto — mar/2027" },
      {
        id: "etica",
        tipo: "checklist",
        rotulo: "Encaminhamentos",
        itens: [
          "Texto descansou e foi revisado",
          "Colegas/orientador criticaram o projeto",
          "Submetido ao comitê de ética (se aplicável)",
          "Orçamento e viabilidade conferidos",
          "Projeto submetido/aprovado",
        ],
      },
    ],
  },

  /* ============================ EXECUÇÃO ============================ */
  {
    id: "p1",
    passo: 1,
    fase: "execucao",
    titulo: "Execute o projeto com zelo",
    fonte: `${GUIA}, Passo 1`,
    oque: [
      "Execute o delineamento exatamente como planejado; registre qualquer desvio.",
      "Mantenha um diário de coleta: datas, condições, ocorrências, perdas amostrais.",
    ],
    porque:
      "A base empírica é o que dá credibilidade à ciência. Um belo projeto mal executado perde a qualidade; não há meio-termo que não comprometa a pesquisa.",
    erros: ["Mudar procedimentos no meio da coleta sem registrar.", "Não anotar perdas amostrais e seus motivos."],
    campos: [
      { id: "diario", tipo: "textarea", rotulo: "Diário de coleta", grande: true },
      { id: "desvios", tipo: "list", rotulo: "Desvios do planejado e como foram tratados" },
    ],
  },
  {
    id: "p2",
    passo: 2,
    fase: "execucao",
    titulo: "Analise os resultados",
    fonte: `${GUIA}, Passo 2; ${EST}; ${AULA}`,
    oque: [
      "Faça você mesmo a análise: o estatístico ajuda na técnica, mas quem sabe o que perguntar aos dados é o pesquisador.",
      "Olhe os dados por vários ângulos antes de decidir o que eles dizem.",
      "Defina o nível da análise: descritivo (o que vejo?), inferencial (o que posso afirmar sobre a população?) ou explicativo (há relação entre variáveis?).",
      "Escolha o teste pela pergunta + tipo de variável + delineamento — nunca pelo software.",
    ],
    porque:
      "O salto dos dados às conclusões não é automático: envolve técnica, criatividade e ousadia. Muitos manuscritos 'renascem' quando os dados são vistos de outro ângulo.",
    erros: [
      "Mandar a planilha ao estatístico com um 'analisa pra mim?'.",
      "Concluir ausência de efeito apenas porque a média não diferiu (ausência de evidência não é evidência de ausência).",
      "Calcular média de variável nominal ou ordinal.",
      "Ler p < 0,05 como prova ou como medida de importância; ler p ≥ 0,05 como prova de que não há relação.",
    ],
    campos: [
      {
        id: "angulos",
        tipo: "checklist",
        rotulo: "Ângulos já examinados",
        itens: [
          "Dados brutos e individuais (não só médias)",
          "Diferenças, variações percentuais ou dados transformados (log, raiz, arco-seno)",
          "Variabilidade (dispersão), não só tendência central",
          "Abordagem paramétrica e não paramétrica, conforme a distribuição",
          "Recortes de tempo/subgrupos relevantes",
          "Categorias ou hierarquias (dados qualitativos)",
          "Resultados que contrariam a expectativa",
        ],
      },
      { id: "teste", tipo: "teste", rotulo: "Assistente de escolha do teste estatístico" },
      { id: "notas", tipo: "textarea", rotulo: "Anotações da análise", grande: true },
    ],
  },

  /* ============================ HISTÓRIA ============================ */
  {
    id: "p3",
    passo: 3,
    fase: "historia",
    titulo: "Defina a história com seus resultados",
    fonte: `${GUIA}, Passo 3`,
    oque: [
      "Liste todos os resultados obtidos.",
      "Marque quais se conectam numa explicação coerente do fenômeno e quais ficam fora de contexto.",
      "Não esconda o que contraria seu discurso — mas também não precisa apresentar o que não tem relação com ele.",
    ],
    porque:
      "O texto científico conta uma história: uma explicação construída a partir de evidências incompletas. Como numa palestra, é preciso um discurso coeso, e nem todo resultado obtido faz parte dele.",
    erros: ["Relatar todos os resultados na ordem em que foram coletados, como um relatório."],
    campos: [{ id: "resultados", tipo: "resultados", modo: "historia", rotulo: "Resultados obtidos" }],
  },
  {
    id: "p4",
    passo: 4,
    fase: "historia",
    titulo: "Identifique a força das evidências",
    fonte: `${GUIA}, Passo 4`,
    oque: [
      "Para cada resultado que entrou na história, indique se ele sustenta o discurso de forma forte ou como coadjuvante.",
      "Os fortes serão destacados (figuras, repetição, posição de destaque); os coadjuvantes aparecem de forma mais discreta.",
    ],
    porque:
      "Sem distinguir sustentações fortes e fracas não é possível sequer decidir a forma de apresentar os resultados (Passo 15) — e o leitor não percebe o que é essencial.",
    erros: [],
    campos: [{ id: "resultados", tipo: "resultados", modo: "forca", rotulo: "Resultados da história", compartilhado: "p3" }],
  },
  {
    id: "p5",
    passo: 5,
    fase: "historia",
    titulo: "Construa a Pirâmide Lógica",
    fonte: `${GUIA}, Passo 5 (fig. 6)`,
    oque: [
      "Na base, coloque as evidências: seus resultados originais, literatura básica da área e conhecimento de domínio público.",
      "Combine evidências para gerar conclusões; combine conclusões para gerar conclusões mais gerais.",
      "No topo fica a conclusão mais geral, que engloba as demais.",
    ],
    porque:
      "Conectar-se à ciência não é comparar seus dados com os de outros, mas inserir seu discurso no discurso aceito, como quem entra numa conversa sem quebrá-la. A Pirâmide Lógica espelha esse argumento e servirá de guia para todo o texto.",
    erros: [
      "Conclusões que não se apoiam em nenhuma evidência da base.",
      "Usar conclusões da literatura que não têm base empírica sólida no trabalho citado.",
    ],
    campos: [{ id: "piramide", tipo: "piramide", rotulo: "Pirâmide Lógica" }],
  },

  /* ============================ PLANEJAMENTO ============================ */
  {
    id: "p6",
    passo: 6,
    fase: "planejamento",
    titulo: "Certifique-se de sua história",
    fonte: `${GUIA}, Passo 6`,
    oque: ["Responda às cinco perguntas abaixo de forma breve e precisa."],
    porque:
      "Sem clareza sobre a história, não se redige um texto de excelência. Prefira poucas conclusões (de 1 a 3), de maior alcance — as demais costumam ser intermediárias.",
    erros: ["Ter muitas conclusões de mesmo peso, sem hierarquia."],
    campos: [
      { id: "q1", tipo: "textarea", rotulo: "1. Como começou essa história? (o que levou ao objetivo)" },
      { id: "q2", tipo: "textarea", rotulo: "2. Aonde você chegou? (principais conclusões)" },
      { id: "q3", tipo: "textarea", rotulo: "3. Como chegou aí? (resultados e informações cruciais)" },
      { id: "q4", tipo: "textarea", rotulo: "4. O que isso muda na ciência?" },
      { id: "q5", tipo: "textarea", rotulo: "5. Por que o mundo se interessaria por isso?" },
    ],
  },
  {
    id: "p7",
    passo: 7,
    fase: "planejamento",
    titulo: "Compreenda sua história",
    fonte: `${GUIA}, Passo 7`,
    oque: [
      "Exponha a história em voz alta várias vezes — para colegas ou para a parede.",
      "Mostre por que fez o estudo, aonde chegou e o que permitiu chegar lá, deixando clara a novidade.",
    ],
    porque:
      "Muitas vezes achamos que sabemos algo e não sabemos. Expor oralmente revela os pontos em que não conseguimos fundamentar o que dizemos.",
    erros: [],
    campos: [
      { id: "exposicoes", tipo: "list", rotulo: "Exposições feitas (para quem — o que ficou confuso)", ph: "Orientador — não soube explicar por que a variável X importa" },
    ],
  },
  {
    id: "p8",
    passo: 8,
    fase: "planejamento",
    titulo: "Escolha e conheça o veículo",
    fonte: `${GUIA}, Passo 8`,
    oque: [
      "Artigo: escolha a revista compatível com o nível das suas conclusões e leia artigos recentes e as normas para autores.",
      "TCC/monografia/dissertação/tese: leia as normas do programa/instituição (geralmente ABNT NBR 14724, 6023, 10520, 6028) e trabalhos aprovados recentemente.",
    ],
    porque:
      "Cada veículo tem público, extensão e formato próprios. Conhecê-lo antes de redigir evita retrabalho.",
    erros: [],
    campos: [
      { id: "veiculo", tipo: "text", rotulo: "Revista ou programa/instituição" },
      { id: "normas", tipo: "textarea", rotulo: "Exigências principais (limites de palavras, seções, norma de citação, formato do resumo)" },
      { id: "modelos", tipo: "list", rotulo: "Trabalhos-modelo do veículo" },
    ],
  },
  {
    id: "p9",
    passo: 9,
    fase: "planejamento",
    titulo: "Junte toda a informação necessária",
    fonte: `${GUIA}, Passo 9`,
    oque: [
      "Reúna resultados finais, figuras preliminares, métodos detalhados e a literatura essencial antes de começar a redigir.",
    ],
    porque: "A redação em imersão não pode ser interrompida para buscar informação.",
    erros: [],
    campos: [
      {
        id: "reunido",
        tipo: "checklist",
        rotulo: "Material reunido",
        itens: [
          "Resultados finais e análises",
          "Esboços de figuras e tabelas",
          "Detalhes de métodos (equipamentos, datas, N, perdas)",
          "Literatura-chave lida e anotada",
          "Normas do veículo",
        ],
      },
    ],
  },
  {
    id: "p10",
    passo: 10,
    fase: "planejamento",
    titulo: "Crie tempo",
    fonte: `${GUIA}, Passo 10`,
    oque: [
      "Reserve um bloco contínuo para redigir o texto fundamental de uma vez (referência do autor: cerca de 8 h para um artigo e 40 h para uma tese, depois de todos os passos anteriores feitos).",
      "Deixe para períodos curtos posteriores os ajustes de estilo, figuras finais e literatura complementar.",
    ],
    porque:
      "Escrever o texto fundamental aos pedaços quebra a coerência argumentativa. A redação é só a materialização de ideias que já estão claras.",
    erros: ["Tentar redigir antes de ter a história clara (Passos 3–7)."],
    campos: [{ id: "agenda", tipo: "list", rotulo: "Blocos de imersão agendados", ph: "12/03 — 8h–17h — Resultados, Métodos e Discussão" }],
  },
  {
    id: "p11",
    passo: 11,
    fase: "planejamento",
    titulo: "Prepare-se para redigir de trás para frente",
    fonte: `${GUIA}, Passo 11`,
    info: true,
    oque: [
      "Ordem de redação: Conclusões → Resultados → Métodos → Discussão → Objetivos → Introdução → Resumo → Título.",
      "A ordem de leitura (Título, Resumo, Introdução, Métodos, Resultados, Discussão) é diferente da ordem lógica de construção.",
    ],
    porque:
      "Você só sabe que introdução escrever quando sabe a que conclusão quer chegar. Os resultados apresentados são os necessários para as conclusões; os métodos, os necessários para os resultados; a discussão defende as conclusões; a introdução prepara o leitor para o objetivo.",
    erros: ["Começar pela introdução e 'descobrir' a pesquisa enquanto escreve."],
    campos: [],
  },
  {
    id: "p12",
    passo: 12,
    fase: "planejamento",
    titulo: "Prepare-se para outline e parágrafos",
    fonte: `${GUIA}, Passo 12`,
    oque: [
      "Outline é o plano do argumento, não um sumário de assuntos: cada item é uma afirmação (frase-tópico) que vira um parágrafo.",
      "Em cada parágrafo, a 1ª frase traz a ideia; as seguintes a sustentam com exemplos, dados ou literatura.",
      "Pratique abaixo com um tema que você domina.",
    ],
    porque:
      "Parágrafos que apenas empilham informações ('Fulano viu X. Beltrano viu Y.') não fundamentam nada. A frase-tópico garante foco e encadeamento.",
    erros: ["Itens de outline em forma de tema ('Cor e apetite') em vez de afirmação ('A cor do ambiente altera o apetite')."],
    campos: [{ id: "treino", tipo: "outline", rotulo: "Exercício de outline" }],
  },

  /* ============================ REDAÇÃO ============================ */
  {
    id: "p13",
    passo: 13,
    fase: "redacao",
    titulo: "Escreva as principais conclusões",
    fonte: `${GUIA}, Passo 13`,
    oque: [
      "Escreva cada conclusão em tópicos numerados.",
      "Hierarquize: identifique as mais restritas, as mais gerais e a mais geral de todas (consulte a Pirâmide Lógica).",
    ],
    porque: "As conclusões são o destino do texto; todo o restante existe para sustentá-las.",
    erros: ["Conclusão no passado ('aumentou') quando se refere à população — conclusões gerais vão no presente.", "Conclusão que apenas repete um resultado."],
    checar: ["conclusoes"],
    campos: [
      { id: "conclusoes", tipo: "list", rotulo: "Conclusões (da mais geral para as mais restritas)", ph: "O ambiente vermelho aumenta o apetite em peixes." },
    ],
  },
  {
    id: "p14",
    passo: 14,
    fase: "redacao",
    titulo: "Selecione os resultados necessários",
    fonte: `${GUIA}, Passo 14`,
    oque: [
      "Liste apenas os resultados necessários para sustentar as conclusões.",
      "Identifique os fundamentais e os coadjuvantes (veja o Passo 4).",
      "Defina a sequência mais estratégica de apresentação.",
    ],
    porque: "Informação que não sustenta as conclusões desvia o leitor; um resultado não necessário enfraquece o texto.",
    erros: [],
    campos: [{ id: "selecionados", tipo: "list", rotulo: "Resultados na ordem de apresentação", importar: "resultados-historia" }],
  },
  {
    id: "p15",
    passo: 15,
    fase: "redacao",
    titulo: "Defina a melhor forma de apresentar cada resultado",
    fonte: `${GUIA}, Passo 15; ${AULA}`,
    oque: [
      "Resultados mais fortes → figuras (chamam atenção).",
      "Coadjuvantes → texto ou tabela (formato menos chamativo).",
      "Tabela = números exatos; gráfico = padrão visual (tendência, comparação, proporção); quadro = texto qualitativo; figura = processo/estrutura.",
      "Dois ou três números simples não pedem gráfico: use o texto.",
    ],
    porque: "A forma de apresentação comunica a importância relativa de cada evidência.",
    erros: ["Repetir o mesmo dado em tabela, figura e texto."],
    campos: [
      { id: "escolha", tipo: "grafico", rotulo: "Qual gráfico ou elemento usar?" },
      { id: "formas", tipo: "list", rotulo: "Resultado → forma (figura / tabela / quadro / texto)", ph: "Ingestão por cor → Figura 1 (barras com erro-padrão)" },
    ],
  },
  {
    id: "p16",
    passo: 16,
    fase: "redacao",
    titulo: "Faça figuras e tabelas",
    fonte: `${GUIA}, Passo 16; ${AULA}`,
    oque: [
      "Ordem: apresente o dado no texto → insira a tabela/figura → comente o que o leitor deve observar.",
      "Título autoexplicativo (conteúdo, variável e escopo). Ruim: “Gráfico 1 – Resultados”. Melhor: “Gráfico 1 – Distribuição percentual das categorias argumentativas por grupo escolar”.",
      "Durante a imersão basta um esboço indicando o que será enfatizado; o acabamento vem depois.",
      "Escreva as legendas. Indique significância estatística no gráfico/tabela e o teste na legenda.",
      "O leitor deve captar a informação principal sem estudar o gráfico.",
    ],
    porque: "Figuras e tabelas são frequentemente lidas antes do texto; precisam ser autoexplicativas.",
    erros: ["Seguir costumes da área que prejudicam a clareza."],
    campos: [{ id: "legendas", tipo: "list", rotulo: "Figuras/tabelas e legendas", ph: "Figura 1. Peixes em ambiente vermelho buscaram o alimento mais rapidamente…" }],
  },
  {
    id: "p17",
    passo: 17,
    fase: "redacao",
    titulo: "Redija os Resultados",
    fonte: `${GUIA}, Passo 17`,
    oque: [
      "Escreva o texto dos resultados na sequência definida no Passo 14.",
      "Destaque o que importa para as conclusões; refira figuras e tabelas sem repetir todos os números.",
      "Cada parágrafo é uma constatação empírica: tópico (dado principal) → sustentação (tabela, números, excertos) → especificação (padrões, recortes) → transição.",
      "Use “Observa-se que…” ou “A Figura 1 mostra que…”, não “como podemos ver”.",
    ],
    porque: "A seção de resultados apresenta a base empírica das conclusões — nem mais, nem menos.",
    erros: ["Discutir ou interpretar com literatura na seção de resultados (a menos que o veículo junte Resultados e Discussão)."],
    checar: ["estilo"],
    campos: [
      { id: "paragrafos", tipo: "outline", secao: "resultados", rotulo: "Parágrafos dos Resultados" },
      { id: "texto", tipo: "textarea", rotulo: "…ou redija em texto corrido (usado se não houver parágrafos acima)", grande: true },
    ],
  },
  {
    id: "p18",
    passo: 18,
    fase: "redacao",
    titulo: "Redija os Métodos",
    fonte: `${GUIA}, Passo 18; ${AULA}`,
    oque: [
      "Escreva separadamente: (a) objeto de estudo; (b) delineamento; (c) elaboração dos dados; (d) análise dos dados.",
      "Não é lista técnica: é a demonstração lógica de que a estratégia empírica responde à pergunta (objeto → pergunta → delineamento → elaboração → análise → resposta).",
      "Inclua só os procedimentos que geraram os dados apresentados (e os que possam ter afetado o sujeito estudado).",
      "Organize na sequência mais fácil para o leitor.",
    ],
    porque: "Os métodos validam os resultados: o leitor deve entender a lógica do teste e poder reproduzi-lo.",
    erros: ["Incluir informação que não sustenta nada (nome do laboratório, marcas irrelevantes).", "Misturar delineamento com detalhes de técnica."],
    checar: ["estilo"],
    campos: [
      { id: "sujeito", tipo: "textarea", rotulo: "(a) Objeto de estudo", importar: "pr-delineamento.sujeito", grande: true,
        ajuda: ["Fenômeno ou unidade empírica observada", "Fontes: campo, laboratório ou bibliográfica/documental", "Contexto: local, instituição, período", "Unidade de análise", "População, amostra, inclusão/exclusão, estratégia de amostragem e representatividade"] },
      { id: "estrategia", tipo: "textarea", rotulo: "(b) Delineamento da pesquisa", importar: "pr-delineamento.estrategia", grande: true,
        ajuda: ["Tipo lógico (caracterização, associação sem / com interferência)", "Modelo técnico (A–H) e por que é o mais coerente", "Variáveis teóricas e operacionais", "Coerência entre modelo e hipótese"] },
      { id: "procedimentos", tipo: "textarea", rotulo: "(c) Elaboração dos dados", importar: "pr-delineamento.procedimentos", grande: true,
        ajuda: ["Técnicas: documentação direta (entrevista, observação, questionário) ou indireta (documentos, corpus)", "Instrumentos e protocolos (roteiros, fichas, softwares)", "Procedimentos passo a passo, em ordem cronológica", "Critérios éticos (consentimento, anonimato, comitê) e de confiabilidade", "Contexto da produção dos dados e limites"] },
      { id: "analise", tipo: "textarea", rotulo: "(d) Análise dos dados", importar: "pr-delineamento.analise", grande: true,
        ajuda: ["Tipo de análise (qualitativa, quantitativa, mista) coerente com o tipo lógico", "Procedimentos passo a passo e justificativa da técnica", "Softwares (NVivo, IRaMuTeQ, R, JASP, Excel…) com papel limitado", "Validação: dupla codificação, triangulação, saturação; pressupostos, alfa de Cronbach", "Como a análise responde à pergunta / testa a hipótese"] },
    ],
  },
  {
    id: "p19",
    passo: 19,
    fase: "redacao",
    titulo: "Faça o outline da Discussão",
    fonte: `${GUIA}, Passo 19; ${AULA}`,
    oque: [
      "Cada item do outline é uma frase-tópico afirmativa que se tornará um parágrafo.",
      "Sugestão de sequência: (1) principais conclusões e generalização; (2) validade dos métodos e resultados; (3) argumentos que sustentam cada conclusão; (4) o que muda na ciência; (5) limitações como portas para estudos futuros.",
      "Roteiro das aulas (9 parágrafos): retomada → inferência lógica → validação pela teoria → diálogo com a literatura → justificação das divergências → limites → implicações → novas perguntas → fechamento. Use “Carregar roteiro sugerido”.",
      "Para cada item, escreva a ideia essencial, o item do outline (“Mostrar que…”) e a frase-tópico (a afirmação).",
    ],
    porque: "A Discussão defende as conclusões: mostra por que são válidas e como alteram o conhecimento atual.",
    erros: ["Discussão que compara resultado a resultado com a literatura ('concordando com Fulano…') sem argumentar."],
    campos: [{ id: "outline", tipo: "outline", rotulo: "Outline da Discussão", secao: "discussao", soTopicos: true }],
  },
  {
    id: "p20",
    passo: 20,
    fase: "redacao",
    titulo: "Discussão: prepare o primeiro parágrafo",
    fonte: `${GUIA}, Passo 20`,
    oque: [
      "Faça um mini-outline do 1º parágrafo: cada informação será uma frase.",
      "Ele deve apresentar logo as principais conclusões e sua generalização — o leitor precisa saber de imediato aonde você chegou.",
    ],
    porque: "O primeiro parágrafo da Discussão é o mais lido depois do Resumo.",
    erros: ["Começar a Discussão repetindo os resultados ou o objetivo."],
    campos: [{ id: "frases", tipo: "list", rotulo: "Frases do primeiro parágrafo" }],
  },
  {
    id: "p21",
    passo: 21,
    fase: "redacao",
    titulo: "Discussão: fundamente métodos e resultados",
    fonte: `${GUIA}, Passo 21`,
    oque: [
      "Explique por que seus métodos são válidos e como validam os resultados.",
      "Saiba por que seus resultados são válidos.",
      "Identifique bases metodológicas, epistemológicas e de conteúdo que sustentam procedimentos e resultados.",
    ],
    porque: "Um revisor só aceita a conclusão se aceitar a evidência; antecipe as objeções.",
    erros: [],
    campos: [
      { id: "validade_metodos", tipo: "textarea", rotulo: "Por que os métodos são válidos" },
      { id: "validade_resultados", tipo: "textarea", rotulo: "Por que os resultados são válidos" },
    ],
  },
  {
    id: "p22",
    passo: 22,
    fase: "redacao",
    titulo: "Discussão: generalize e supere limitações",
    fonte: `${GUIA}, Passo 22`,
    oque: [
      "Saiba como a pesquisa sustenta as generalizações do 1º parágrafo.",
      "Enumere os pontos fortes das conclusões e o que elas mudam na ciência.",
      "Use as limitações para abrir portas a estudos futuros, não para pedir desculpas.",
    ],
    porque: "A força da ciência está na generalidade das conclusões, dentro do que as evidências permitem.",
    erros: ["Seção de 'limitações' defensiva que enfraquece o próprio estudo."],
    campos: [
      { id: "generalizacoes", tipo: "list", rotulo: "Generalizações e o que as sustenta" },
      { id: "fortes", tipo: "list", rotulo: "Pontos fortes" },
      { id: "limitacoes", tipo: "list", rotulo: "Limitações → perguntas futuras" },
    ],
  },
  {
    id: "p23",
    passo: 23,
    fase: "redacao",
    titulo: "Redija a Discussão",
    fonte: `${GUIA}, Passo 23; ${AULA}`,
    oque: [
      "Redija cada parágrafo a partir das frases-tópico do outline (Passo 19): tópico → sustentação → especificação → transição. Use “Montar parágrafo” e depois ajuste o texto.",
      "A citação nunca é o centro da frase: a ideia é sua; o autor citado é a base ou o contraste. Evite “Fulano diz que…”.",
      "Verifique se os parágrafos se conectam entre si e com a Pirâmide Lógica.",
    ],
    porque: "Parágrafos conclusivos, com informações conectadas, constroem a defesa das conclusões.",
    erros: [],
    checar: ["estilo"],
    campos: [{ id: "outline", tipo: "outline", rotulo: "Parágrafos da Discussão", compartilhado: "p19", secao: "discussao" }],
  },
  {
    id: "pconclusao",
    fase: "redacao",
    titulo: "Redija a Conclusão",
    fonte: `${AULA}; ${GUIA}, Passo 13`,
    apenas: ["tcc", "monografia", "dissertacao", "tese"],
    oque: [
      "Responda sinteticamente à pergunta científica, retome os resultados e argumentos que sustentam a resposta, explicite a contribuição e aponte novas investigações.",
      "Use as conclusões do Passo 13 (da mais geral para as mais restritas) como eixo.",
    ],
    porque: "A conclusão fecha o raciocínio lógico: mostra a relação necessária entre dados, teoria e implicações — o que a pesquisa acrescenta ao conhecimento.",
    erros: ["Repetir os resultados em detalhe.", "Trazer informação nova que não foi discutida.", "Conclusões no passado quando se referem ao fenômeno em geral."],
    checar: ["estilo"],
    campos: [{ id: "outline", tipo: "outline", secao: "conclusao", rotulo: "Parágrafos da Conclusão" }],
  },
  {
    id: "p24",
    passo: 24,
    fase: "redacao",
    titulo: "Redija os Objetivos",
    fonte: `${GUIA}, Passo 24; ${PROJ}, cap. 4`,
    oque: [
      "Redija o(s) objetivo(s) de forma coerente com o tipo lógico e com as conclusões a que chegou.",
      "Prefira a forma direta: 'Testamos se…', 'Descrevemos…'.",
    ],
    porque: "O objetivo é a ponte entre a introdução e as conclusões: a conclusão responde exatamente ao objetivo.",
    erros: ["Objetivo que não corresponde às conclusões apresentadas."],
    checar: ["objetivo"],
    campos: [{ id: "objetivo", tipo: "textarea", rotulo: "Objetivo(s)", importar: "pr-tipo.objetivo" }],
  },
  {
    id: "p25",
    passo: 25,
    fase: "redacao",
    titulo: "Faça o outline da Introdução",
    fonte: `${GUIA}, Passo 25; ${AULA}`,
    oque: [
      "Selecione só as informações necessárias para fundamentar o objetivo.",
      "Roteiro das aulas (7 blocos): fenômeno e relevância → conhecimento essencial → estado da arte → lacuna → objeto → tipo de pesquisa e recortes → objetivo (e hipótese).",
      "Organize do contexto amplo para a lacuna e daí para o objetivo (funil).",
      "Explique por que vale relacionar as variáveis — não descreva cada variável isoladamente.",
    ],
    porque: "A introdução contextualiza a pesquisa num quadro científico amplo, apresenta a pergunta e valida o objetivo.",
    erros: ["Introdução-enciclopédia, com tudo que se sabe sobre cada variável."],
    campos: [
      { id: "fund", tipo: "fundamentacao", rotulo: "O que a fundamentação precisa mostrar (pelo seu tipo lógico)" },
      { id: "outline", tipo: "outline", rotulo: "Outline da Introdução", secao: "introducao", soTopicos: true },
    ],
  },
  {
    id: "p26",
    passo: 26,
    fase: "redacao",
    titulo: "Redija a Introdução",
    fonte: `${GUIA}, Passo 26; ${AULA}`,
    oque: [
      "Transforme cada item do outline num parágrafo: tópico → sustentação (a prova vem da literatura) → especificação (relevância, necessidade lógica) → transição.",
      "Confira se os parágrafos estão bem conectados e terminam no objetivo. Se o leitor não consegue prever o objetivo e a hipótese a partir da fundamentação, a Introdução está inadequada.",
      "A revisão de literatura não é uma seção da Introdução: aqui entra só o estado da arte que leva à lacuna. Estudos correlatos vão para o Marco Teórico; a comparação com a literatura, para a Discussão.",
    ],
    porque: "Seguir estritamente o outline mantém a introdução curta e focada.",
    erros: [],
    checar: ["estilo"],
    campos: [{ id: "outline", tipo: "outline", rotulo: "Parágrafos da Introdução", compartilhado: "p25", secao: "introducao" }],
  },
  {
    id: "pmarco-outline",
    fase: "redacao",
    titulo: "Faça o outline do Marco Teórico",
    fonte: AULA,
    apenas: ["tcc", "monografia", "dissertacao", "tese"],
    oque: [
      "Organize só as lentes teóricas necessárias e suficientes para fundamentar o problema, sustentar a pergunta, ancorar o objeto e justificar o delineamento.",
      "Roteiro: quadro teórico geral → conceitos fundamentais → estrutura conceitual do objeto → estudos correlatos → integração teoria–método.",
      "Hierarquia: teoria central → conceitos derivados → categorias operacionais. Cada conceito prepara o próximo.",
    ],
    porque:
      "O Marco Teórico é a ponte conceitual entre a Introdução e os Métodos: estabelece o vocabulário da pesquisa e deve permitir ao leitor prever a metodologia. O objetivo deve soar como consequência lógica dele.",
    erros: [
      "Inventário de autores ou história do conceito (“quem disse o quê, quando”).",
      "Incluir teorias que não são usadas na pesquisa.",
      "Repetir o que já foi dito na Introdução ou trazer detalhes de método.",
    ],
    campos: [{ id: "outline", tipo: "outline", secao: "marco", soTopicos: true, rotulo: "Outline do Marco Teórico" }],
  },
  {
    id: "pmarco",
    fase: "redacao",
    titulo: "Redija o Marco Teórico",
    fonte: AULA,
    apenas: ["tcc", "monografia", "dissertacao", "tese"],
    oque: [
      "Redação explicativa, não compilatória: ensine o raciocínio teórico em vez de apenas citar quem o disse.",
      "Use verbos cognitivos e relacionais (explicar, fundamentar, derivar, implicar, relacionar), não verbos de fala (dizer, afirmar, considerar).",
      "Transforme citações em raciocínio: em vez de “Lakoff (1993) diz que metáforas são conceptuais”, escreva “Metáforas são compreendidas aqui como estruturas conceptuais (Lakoff, 1993) que orientam a cognição”.",
    ],
    porque: "O referencial define como o mundo será interpretado (premissas teóricas); a Discussão mostra se os resultados confirmam, ampliam ou refutam essa explicação.",
    erros: ["“Segundo diversos autores…” — citação vaga que não sustenta nada.", "Citações empilhadas sem relação lógica."],
    checar: ["estilo"],
    campos: [{ id: "outline", tipo: "outline", secao: "marco", compartilhado: "pmarco-outline", rotulo: "Parágrafos do Marco Teórico" }],
  },
  {
    id: "p27",
    passo: 27,
    fase: "redacao",
    titulo: "Complemente a literatura",
    fonte: `${GUIA}, Passo 27`,
    oque: [
      "Inclua as referências adicionais que sustentam afirmações do texto.",
      "Cite trabalhos com base empírica sólida; prefira a fonte original.",
    ],
    porque: "Cada afirmação não óbvia precisa de sustentação — dos seus dados ou da literatura.",
    erros: ["Citar para 'enfeitar' em vez de sustentar uma premissa necessária."],
    campos: [{ id: "refs", tipo: "referencias", rotulo: "Referências" }],
  },
  {
    id: "p28",
    passo: 28,
    fase: "redacao",
    titulo: "Redija o Resumo",
    fonte: `${GUIA}, Passo 28; ${AULA}`,
    oque: [
      "Trabalhos acadêmicos (aulas): resumo como mini-artigo em 7 movimentos — problema → lacuna → objetivo → tipo de pesquisa → método → resultados → conclusão. Preencha os movimentos e use “Montar resumo”.",
      "Resumo criativo: a essência do estudo em poucas frases — (1) contexto necessário para entender as conclusões; (2) principais achados/conclusões; (3) implicação ou novidade.",
      "Ajuste depois ao formato exigido (resumo estruturado, limites da ABNT NBR 6028 ou da revista).",
    ],
    porque: "O resumo decide se o trabalho será lido; ele precisa mostrar a conclusão, não esconder.",
    erros: [
      "Resumo que só descreve o que foi feito ('foram analisados…') sem dizer o que foi concluído.",
      "Citações, revisão de literatura, justificativas longas ou enumeração de capítulos no resumo.",
      "Palavras-chave genéricas (“linguagem”, “contexto”) ou que não aparecem no título/objetivo.",
    ],
    checar: ["resumo", "estilo"],
    campos: [
      { id: "movimentos", tipo: "resumo7", rotulo: "Os 7 movimentos do resumo" },
      { id: "resumo", tipo: "textarea", rotulo: "Resumo", secao: "resumo" },
      { id: "palavras", tipo: "text", rotulo: "Palavras-chave", ph: "3 a 5, da mais geral à mais específica, separadas por ponto e vírgula: conceito central; categoria analítica; recorte; método" },
      { id: "abstract", tipo: "textarea", rotulo: "Abstract (se exigido)" },
    ],
  },
  {
    id: "p29",
    passo: 29,
    fase: "redacao",
    titulo: "Traga o texto para o estilo científico",
    fonte: `${GUIA}, Passo 29 (Parte 1, cap. 2)`,
    oque: [
      "Revise frase por frase com os princípios abaixo — o verificador automático ajuda a localizar candidatos.",
      "Elimine excessos ('causou aumento' → 'aumentou'); use palavras simples; prefira ordem direta e voz ativa.",
      "Garanta conexões lógicas entre ideias, sem dupla interpretação de pronomes ('este', 'isso').",
      "Tempos verbais: passado nos métodos e resultados; presente nas conclusões gerais.",
      "Primeira pessoa é legítima: o autor assume a conclusão como sua interpretação.",
    ],
    porque:
      "O estilo científico não é camisa de força: é guiado pela lógica. A voz passiva e a 3ª pessoa impessoal sugerem que os dados impõem a conclusão — mas conclusões são interpretações de cientistas.",
    erros: ["Repetir 'estatisticamente significativo' a cada frase.", "Digressões que desviam do argumento."],
    checar: ["documento"],
    campos: [],
  },
  {
    id: "p30",
    passo: 30,
    fase: "redacao",
    titulo: "Construa o Título",
    fonte: `${GUIA}, Passo 30; ${AULA}`,
    oque: [
      "Trabalhos acadêmicos (aulas): o título reúne objeto teórico + ação científica (caracterização, associação…) + recorte empírico; se ficar longo, use subtítulo (título = O QUÊ; subtítulo = COMO/ONDE). Veja os modelos abaixo.",
      "Exponha a principal novidade — de preferência a conclusão.",
      "Priorize variáveis teóricas; generalize no limite do possível; foque no fenômeno, não na amostra.",
      "Curto, palavras simples, sem abreviaturas, sem método nem comparações.",
    ],
    porque: "O título é o letreiro do trabalho: deve atrair sem enganar.",
    erros: ["'Estudo/análise/avaliação de…' — descreve a atividade, não a descoberta.", "Destacar cidade/estado quando a conclusão é geral."],
    checar: ["titulo"],
    campos: [
      { id: "modelos", tipo: "modelos-titulo", rotulo: "Modelos de título" },
      { id: "titulo", tipo: "text", rotulo: "Título", secao: "titulo" },
      { id: "alternativas", tipo: "list", rotulo: "Versões alternativas" },
    ],
  },

  /* ============================ ACABAMENTO ============================ */
  {
    id: "p31",
    passo: 31,
    fase: "acabamento",
    titulo: "Revise tudo",
    fonte: `${GUIA}, Passo 31`,
    oque: ["Deixe o texto descansar (dias a semanas) e volte a ele com olhos novos.", "Procure erros de digitação, de construção, de conteúdo e de lógica."],
    porque: "Acostumados ao próprio texto, deixamos de enxergar os erros. Cada erro encontrado é uma melhoria.",
    erros: [],
    campos: [
      {
        id: "revisao",
        tipo: "checklist",
        rotulo: "Revisões",
        itens: ["Texto descansou", "Leitura completa em voz alta", "Coerência com a Pirâmide Lógica", "Números conferidos com tabelas/figuras", "Referências conferidas"],
      },
    ],
  },
  {
    id: "p32",
    passo: 32,
    fase: "acabamento",
    titulo: "Peça críticas de colegas",
    fonte: `${GUIA}, Passo 32`,
    oque: ["Peça leitura crítica a colegas (inclusive de fora da sua especialidade)."],
    porque: "É mais difícil criticar o próprio texto: aceitamos tanto nossa interpretação que não vemos alternativas.",
    erros: [],
    campos: [{ id: "criticas", tipo: "list", rotulo: "Críticas recebidas (quem — crítica)" }],
  },
  {
    id: "p33",
    passo: 33,
    fase: "acabamento",
    titulo: "Melhore o manuscrito",
    fonte: `${GUIA}, Passo 33`,
    oque: ["Avalie cada crítica com honestidade intelectual e decida o que acatar."],
    porque: "A responsabilidade pelo texto é sua; reduza o lado emocional e mantenha o foco em melhorar a pesquisa.",
    erros: [],
    campos: [{ id: "decisoes", tipo: "list", rotulo: "Crítica → decisão" }],
  },
  {
    id: "p34",
    passo: 34,
    fase: "acabamento",
    titulo: "Inclua os adendos necessários",
    fonte: `${GUIA}, Passo 34`,
    oque: ["Prepare anexos, apêndices, material suplementar, dados brutos, vídeos etc. no formato exigido."],
    porque: "Adendos permitem verificar e reproduzir o estudo sem sobrecarregar o texto principal.",
    erros: [],
    campos: [{ id: "adendos", tipo: "list", rotulo: "Adendos" }],
  },
  {
    id: "p35",
    passo: 35,
    fase: "acabamento",
    titulo: "Coloque nas normas",
    fonte: `${GUIA}, Passo 35`,
    oque: [
      "Artigo: siga as instruções para autores da revista.",
      "Trabalho acadêmico: elementos pré-textuais, formatação, citações e referências conforme ABNT/programa.",
    ],
    porque: "Não dependa do acerto de editores ou da banca para corrigir a padronização.",
    erros: [],
    campos: [
      {
        id: "normas",
        tipo: "checklist",
        rotulo: "Conferência de normas",
        itens: [
          "Elementos pré-textuais (capa, folha de rosto, ficha, resumo/abstract, sumário)",
          "Formatação (fonte, margens, espaçamento, numeração)",
          "Citações no texto (NBR 10520 ou norma da revista)",
          "Lista de referências (NBR 6023 ou norma da revista)",
          "Figuras e tabelas numeradas e citadas no texto",
        ],
      },
    ],
  },
  {
    id: "p36",
    passo: 36,
    fase: "acabamento",
    titulo: "Redija a carta ao editor (cover letter)",
    fonte: `${GUIA}, Passo 36`,
    apenas: ["artigo"],
    oque: ["Apresente ao editor a novidade e por que ela interessa aos leitores da revista."],
    porque: "Editores fazem triagem rápida; a carta ajuda a mostrar o valor do trabalho.",
    erros: ["Carta que só resume os métodos."],
    campos: [{ id: "carta", tipo: "textarea", rotulo: "Cover letter", grande: true }],
  },
  {
    id: "p37",
    passo: 37,
    fase: "acabamento",
    titulo: "Indique revisores",
    fonte: `${GUIA}, Passo 37`,
    apenas: ["artigo"],
    oque: ["Indique especialistas capazes de melhorar seu trabalho — sejam ou não seus amigos."],
    porque: "Um bom revisor ajuda a melhorar o texto.",
    erros: [],
    campos: [{ id: "revisores", tipo: "list", rotulo: "Revisores (nome — instituição — motivo)" }],
  },
  {
    id: "p38",
    passo: 38,
    fase: "acabamento",
    titulo: "Responda aos revisores e editores",
    fonte: `${GUIA}, Passo 38`,
    apenas: ["artigo"],
    oque: ["Responda ponto a ponto, com respeito e argumentos; indique onde o texto foi alterado."],
    porque: "A revisão por pares é parte do debate científico, não um ataque pessoal.",
    erros: [],
    campos: [{ id: "respostas", tipo: "list", rotulo: "Comentário → resposta → alteração" }],
  },
  {
    id: "pqualificacao",
    fase: "acabamento",
    titulo: "Prepare a qualificação",
    fonte: AULA,
    apenas: ["dissertacao", "tese"],
    oque: [
      "A qualificação avalia a solidez lógica da pesquisa, não os resultados: o que compõe a argumentação prévia precisa estar consolidado.",
      "Marque o que está pronto. O que depende da coleta e da análise pode estar em construção, desde que o percurso metodológico esteja claro.",
      "Gere a nota ao avaliador indicando as seções em construção.",
    ],
    porque: "Problema, lacuna e objetivo sustentam tudo o mais; se mudarem depois da qualificação, toda a lógica da pesquisa se desloca.",
    erros: ["Levar à banca um problema ou uma lacuna ainda instáveis."],
    campos: [
      { id: "definitivo", tipo: "checklist", rotulo: "Deve estar DEFINITIVO", itens: window.AULAS.QUALIFICACAO.definitivo },
      { id: "construcao", tipo: "checklist", rotulo: "Pode estar EM CONSTRUÇÃO (marque o que ainda falta)", itens: window.AULAS.QUALIFICACAO.construcao },
      { id: "nota", tipo: "nota-qualificacao", rotulo: "Nota ao avaliador" },
    ],
  },
  {
    id: "pdefesa",
    fase: "acabamento",
    titulo: "Prepare a defesa",
    fonte: `Adaptação dos Passos 7, 36–38 do ${GUIA} para trabalhos acadêmicos`,
    apenas: ["tcc", "monografia", "dissertacao", "tese"],
    oque: [
      "Monte a apresentação a partir da história (Passo 6): do que começou à conclusão mais geral.",
      "Antecipe as perguntas da banca com base nos Passos 21–22 (validade e limitações).",
      "Responda à banca como a revisores: ponto a ponto, com argumentos.",
    ],
    porque: "A defesa é o debate científico do trabalho acadêmico.",
    erros: ["Apresentação que repete o sumário em vez de contar a história."],
    campos: [
      { id: "roteiro", tipo: "outline", rotulo: "Roteiro da apresentação (uma ideia por slide)", soTopicos: true },
      { id: "perguntas", tipo: "list", rotulo: "Perguntas prováveis → resposta" },
    ],
  },
  {
    id: "pia",
    fase: "acabamento",
    titulo: "Declare o uso de Inteligência Artificial",
    fonte: AULA,
    oque: [
      "Se usou IA, declare de forma transparente, específica e delimitada, numa seção “Declaração de uso de Inteligência Artificial” (no fim ou onde o programa/revista pedir).",
      "Deixe claro que a IA não produziu raciocínio científico, não formulou argumentos nem executou passos da análise, e que não há coautoria.",
    ],
    porque: "Transparência é integridade científica; a autoria intelectual — decisões teóricas, metodológicas e analíticas — é sempre do pesquisador.",
    erros: ["“A IA escreveu partes do texto.”", "“A IA construiu o marco teórico.”", "“A IA analisou os dados.” — caracterizam autoria indevida."],
    campos: [{ id: "declaracao", tipo: "declaracao-ia", rotulo: "Declaração" }],
  },
  {
    id: "p39",
    passo: 39,
    fase: "acabamento",
    titulo: "Divulgue seu trabalho",
    fonte: `${GUIA}, Passo 39`,
    oque: ["Apresente em eventos, envie a pesquisadores da área, use repositórios e redes acadêmicas."],
    porque: "O cientista quer que seus pares debatam e aceitem seu achado.",
    erros: [],
    campos: [{ id: "divulgacao", tipo: "list", rotulo: "Ações de divulgação" }],
  },
  {
    id: "p40",
    passo: 40,
    fase: "acabamento",
    titulo: "Acompanhe o impacto",
    fonte: `${GUIA}, Passo 40`,
    oque: ["Acompanhe quem cita o trabalho e como; use isso para planejar a próxima pesquisa."],
    porque: "O valor de um estudo está na força e generalidade das conclusões e na qualidade da pergunta que responde.",
    erros: [],
    campos: [{ id: "impacto", tipo: "list", rotulo: "Citações / repercussões" }],
  },
];

/* Ordem das seções no documento final (ordem de leitura). */
const ESTRUTURA_DOC = {
  artigo: ["titulo", "resumo", "introducao", "metodos", "resultados", "discussao", "referencias", "ia"],
  academico: ["titulo", "resumo", "introducao", "marco", "metodos", "resultados", "discussao", "conclusoes", "referencias", "ia"],
};

window.METODO = { TIPOS_TRABALHO, TIPOS_LOGICOS, FASES, ETAPAS, ESTRUTURA_DOC };
