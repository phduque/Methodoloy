/*
 * Planejador do desenho da pesquisa.
 *
 * Funciona como um funil: cada resposta abre as perguntas seguintes, mantém
 * as opções compatíveis e desativa as incompatíveis, sempre com o motivo.
 * Regras derivadas do Método Lógico (Volpato; Volpato & Barreto) e das aulas
 * de Metodologia (tipos lógicos, delineamentos A–H, fontes, técnicas,
 * amostragem, suficiência e análise).
 *
 * Estado (e): { tipo, abordagem, manipulacao, fonte, modelo, grupos,
 *               tecnicas: [], generalizar, variavel }
 */
(function () {
  const ok = null;
  const QUANTI = (e) => e.abordagem === "quanti" || e.abordagem === "misto";
  const QUALI = (e) => e.abordagem === "quali" || e.abordagem === "misto";

  const PERGUNTAS = [
    {
      id: "tipo",
      titulo: "O que a pesquisa quer saber?",
      ajuda: "Define o tipo lógico — e, com ele, se há hipótese e que conclusões são possíveis.",
      opcoes: [
        { id: "descritiva", rotulo: "Como é X?", desc: "Descrever/caracterizar uma variável ou fenômeno. Sem hipótese.", regra: () => ok },
        { id: "associacao", rotulo: "X e Y variam juntos?", desc: "Associação sem interferência: relação entre variáveis, sem afirmar causa.", regra: () => ok },
        { id: "interferencia", rotulo: "X altera Y?", desc: "Associação com interferência: efeito de uma variável sobre outra (causa–efeito).", regra: () => ok },
      ],
    },
    {
      id: "abordagem",
      titulo: "Que tipo de dado responde à pergunta?",
      ajuda: "Números (contagens, medidas, escalas), sentidos (falas, textos, observações interpretadas) ou os dois.",
      opcoes: [
        { id: "quanti", rotulo: "Quantitativo", desc: "Frequências, médias, proporções, escalas.", regra: () => ok },
        { id: "quali", rotulo: "Qualitativo", desc: "Categorias interpretativas, sentidos, padrões discursivos.", regra: () => ok },
        { id: "misto", rotulo: "Misto", desc: "Categorização qualitativa + quantificação (ex.: frequência de categorias).", regra: () => ok },
      ],
    },
    {
      id: "manipulacao",
      titulo: "Como a possível causa acontece?",
      ajuda: "Para afirmar que X altera Y é preciso isolar X: introduzindo-o você mesmo ou aproveitando um evento que o introduz.",
      quando: (e) => e.tipo === "interferencia",
      opcoes: [
        { id: "planejada", rotulo: "Eu introduzo ou controlo X", desc: "Intervenção, oficina, tarefa, condição experimental.", regra: () => ok },
        { id: "natural", rotulo: "X ocorre por si", desc: "Um evento, uma política, a passagem do tempo, uma mudança de contexto.", regra: () => ok },
        {
          id: "nao",
          rotulo: "Só posso observar X e Y como estão",
          desc: "Sem intervenção nem evento identificável.",
          regra: () => "Sem intervenção nem evento que introduza X, não há como isolar a causa: a pesquisa passa a ser de associação sem interferência. Mude a primeira resposta.",
        },
      ],
    },
    {
      id: "fonte",
      titulo: "De onde vêm os dados?",
      ajuda: "Fonte das evidências empíricas.",
      opcoes: [
        { id: "campo", rotulo: "Campo", desc: "Situações reais: sala de aula, comunidade, interações.", regra: () => ok },
        { id: "laboratorio", rotulo: "Laboratório", desc: "Contexto controlado: experimento, tarefa, teste.", regra: () => ok },
        {
          id: "documental",
          rotulo: "Documental / corpus",
          desc: "Textos, documentos, arquivos, corpus já existentes.",
          regra: (e) => (e.tipo === "interferencia" && e.manipulacao === "planejada" ? "Uma intervenção planejada produz dados novos; documentos já existentes não podem receber a intervenção." : ok),
        },
      ],
    },
    {
      id: "modelo",
      titulo: "Como os dados serão organizados? (delineamento)",
      ajuda: "Modelos de delineamento A–H. Só aparecem habilitados os que combinam com as respostas anteriores.",
      opcoes: [
        {
          id: "A",
          rotulo: "A — Uma amostra",
          desc: "Observa-se uma amostra; descreve variáveis ou relaciona variáveis dentro dela.",
          regra: (e) => (e.tipo === "interferencia" ? "Uma amostra observada uma vez não isola efeito causal." : ok),
        },
        {
          id: "B",
          rotulo: "B — Grupos independentes, mesmo momento",
          desc: "Comparar grupos já existentes (corte transversal).",
          regra: (e) =>
            e.tipo === "descritiva"
              ? "Comparar grupos já é testar associação (grupo × variável). Para descrever, use A."
              : e.tipo === "interferencia"
              ? "Grupos já existentes, sem intervenção nem evento: só permite associação."
              : ok,
        },
        {
          id: "H",
          rotulo: "H — Subgrupos combinando fatores",
          desc: "Comparar subgrupos cruzando mais de um fator, sem manipulação.",
          regra: (e) => (e.tipo !== "associacao" ? "Cruzar fatores sem manipulação é um desenho de associação." : ok),
        },
        {
          id: "C",
          rotulo: "C — Um grupo ao longo do tempo",
          desc: "Longitudinal: o mesmo grupo acompanhado em vários momentos.",
          regra: (e) =>
            e.tipo !== "interferencia"
              ? "Acompanhar o efeito do tempo é um desenho de interferência."
              : e.manipulacao === "planejada"
              ? "Com intervenção planejada, use E (antes–depois) ou F (com grupo de comparação)."
              : ok,
        },
        {
          id: "D",
          rotulo: "D — Interferência natural",
          desc: "Comparar antes/depois ou com/sem um fator que ocorreu naturalmente.",
          regra: (e) =>
            e.tipo !== "interferencia" ? "Só se aplica a pesquisas de interferência." : e.manipulacao === "planejada" ? "Você controla a intervenção: use E ou F." : ok,
        },
        {
          id: "E",
          rotulo: "E — Intervenção em um grupo (antes × depois)",
          desc: "Mede-se, intervém-se e mede-se de novo o mesmo grupo.",
          regra: (e) =>
            e.tipo !== "interferencia"
              ? "Intervenção só faz sentido para testar interferência."
              : e.manipulacao && e.manipulacao !== "planejada"
              ? "Exige uma intervenção introduzida por você."
              : e.fonte === "documental"
              ? "Não é possível intervir em documentos já produzidos."
              : ok,
        },
        {
          id: "F",
          rotulo: "F — Grupo com intervenção × grupo sem",
          desc: "Quase-experimental: grupos paralelos acompanhados ao mesmo tempo.",
          regra: (e) =>
            e.tipo !== "interferencia"
              ? "Intervenção só faz sentido para testar interferência."
              : e.manipulacao && e.manipulacao !== "planejada"
              ? "Exige uma intervenção introduzida por você."
              : e.fonte === "documental"
              ? "Não é possível intervir em documentos já produzidos."
              : ok,
        },
        {
          id: "G",
          rotulo: "G — Grupos diferentes em sequência no tempo",
          desc: "Coortes: grupos distintos observados em momentos sucessivos.",
          regra: (e) => (e.tipo !== "interferencia" ? "Comparar coortes no tempo é um desenho de interferência (efeito do momento)." : ok),
        },
      ],
    },
    {
      id: "grupos",
      titulo: "Quantos grupos serão comparados?",
      ajuda: "Define o teste de comparação.",
      quando: (e) => ["B", "F", "G", "D"].includes(e.modelo),
      opcoes: [
        { id: "2", rotulo: "Dois", desc: "", regra: () => ok },
        { id: "3", rotulo: "Três ou mais", desc: "", regra: () => ok },
      ],
    },
    {
      id: "tecnicas",
      multi: true,
      titulo: "Como os dados serão elaborados? (marque todas as técnicas)",
      ajuda: "Documentação direta (entrevista, observação, questionário, tarefa) ou indireta (documentos, corpus).",
      opcoes: [
        {
          id: "corpus",
          rotulo: "Corpus / documentos",
          desc: "Textos, arquivos, postagens, documentos.",
          regra: (e) => (["E", "F"].includes(e.modelo) ? "Num desenho com intervenção, a evidência do efeito precisa ser produzida antes e depois dela (o corpus pode complementar)." : ok),
        },
        {
          id: "entrevista",
          rotulo: "Entrevista",
          desc: "Estruturada, semiestruturada ou aberta.",
          regra: (e) => (e.fonte === "documental" ? "Fonte documental: os dados já existem, não são produzidos com participantes." : ok),
        },
        {
          id: "questionario",
          rotulo: "Questionário / escala",
          desc: "Perguntas fechadas, escalas Likert, perguntas abertas.",
          regra: (e) => (e.fonte === "documental" ? "Fonte documental: os dados já existem, não são produzidos com participantes." : ok),
        },
        {
          id: "observacao",
          rotulo: "Observação",
          desc: "Direta, participante ou sistemática, com registro.",
          regra: (e) => (e.fonte === "documental" ? "Fonte documental: não há situação a observar." : ok),
        },
        {
          id: "tarefa",
          rotulo: "Tarefa / teste / experimento",
          desc: "Produção ou desempenho sob condições definidas.",
          regra: (e) => (e.fonte === "documental" ? "Fonte documental: não há participantes para realizar a tarefa." : ok),
        },
        {
          id: "gravacao",
          rotulo: "Gravação de interações",
          desc: "Áudio ou vídeo transcrito.",
          regra: (e) => (e.fonte === "documental" ? "Fonte documental: use gravações já existentes como corpus." : ok),
        },
      ],
    },
    {
      id: "generalizar",
      titulo: "Que tipo de generalização você pretende?",
      ajuda: "Define a amostragem e o critério de suficiência da amostra.",
      opcoes: [
        {
          id: "estatistica",
          rotulo: "Estatística",
          desc: "Estimar para uma população, com margem de erro.",
          regra: (e) => (e.abordagem === "quali" ? "Generalização estatística exige dados quantitativos." : ok),
        },
        { id: "analitica", rotulo: "Teórica / analítica", desc: "Compreender o fenômeno em profundidade e generalizar para a teoria.", regra: () => ok },
      ],
    },
    {
      id: "variavel",
      titulo: "Qual o tipo da variável principal (a que será medida)?",
      ajuda: "Determina as operações estatísticas permitidas.",
      quando: (e) => QUANTI(e),
      opcoes: [
        { id: "nominal", rotulo: "Nominal", desc: "Categorias sem ordem (tipo de pronome, curso).", regra: () => ok },
        { id: "ordinal", rotulo: "Ordinal", desc: "Categorias com ordem (escala 1–5, escolaridade).", regra: () => ok },
        { id: "intervalar", rotulo: "Intervalar", desc: "Escala com intervalos iguais, zero arbitrário.", regra: () => ok },
        { id: "razao", rotulo: "Razão", desc: "Medida com zero real (tempo, idade, nº de ocorrências).", regra: () => ok },
      ],
    },
  ];

  /* Pergunta estatística derivada do desenho (para o assistente de teste). */
  function perguntaEstatistica(e) {
    if (e.tipo === "descritiva") return { pergunta: "descrever" };
    if (e.tipo === "associacao") {
      if (e.modelo === "A") return { pergunta: "relacionar" };
      if (e.modelo === "B" || e.modelo === "H") return { pergunta: "comparar", grupos: e.grupos || "2" };
      return { pergunta: "relacionar" };
    }
    if (e.tipo === "interferencia") {
      if (e.modelo === "E" || e.modelo === "C") return { pergunta: "comparar", grupos: "pareado" };
      return { pergunta: "comparar", grupos: e.grupos || "2" };
    }
    return {};
  }

  /* Perguntas estatísticas compatíveis com o tipo lógico (filtra o assistente de teste). */
  function perguntasPermitidas(tipo) {
    if (tipo === "descritiva") return { descrever: ok, comparar: "Comparar grupos é associação, não descrição.", relacionar: "Relacionar variáveis é associação, não descrição." };
    if (tipo === "associacao") return { descrever: ok, comparar: ok, relacionar: ok };
    if (tipo === "interferencia")
      return { descrever: ok, comparar: ok, relacionar: "Correlação não isola causa; no desenho de interferência compare as condições (antes × depois, com × sem)." };
    return { descrever: ok, comparar: ok, relacionar: ok };
  }

  /* Gráficos por abordagem e desenho. */
  const GRAF_QUANTI = ["comparar_categorias", "distribuicao", "comparar_distribuicoes", "composicao", "composicao_tempo", "tendencia", "relacao", "numeros_exatos", "espaco", "processo"];
  const GRAF_QUALI = ["texto_qualitativo", "frequencia_palavras", "relacoes_palavras", "agrupamentos", "eixos_sentido", "rede_conceitos", "processo", "numeros_exatos"];
  function graficoPermitido(id, e) {
    if (!e.abordagem) return ok;
    const lista = e.abordagem === "quanti" ? GRAF_QUANTI : e.abordagem === "quali" ? GRAF_QUALI : GRAF_QUANTI.concat(GRAF_QUALI);
    if (!lista.includes(id)) return e.abordagem === "quanti" ? "Representação de dados textuais/qualitativos: não combina com dados só quantitativos." : "Exige dados numéricos; sua abordagem é qualitativa.";
    if (id === "relacao" && e.tipo && e.tipo !== "associacao") return "Dispersão mostra relação entre duas variáveis numéricas: é para desenhos de associação.";
    if (id === "tendencia" && e.modelo && !["C", "E", "G", "D"].includes(e.modelo)) return "Linhas mostram mudança no tempo; seu delineamento não acompanha o tempo.";
    return ok;
  }

  function regraDe(pid, oid, e) {
    const q = PERGUNTAS.find((x) => x.id === pid);
    const o = q && q.opcoes.find((x) => x.id === oid);
    return o ? o.regra(e) : ok;
  }

  /* Avalia o estado: perguntas visíveis, opções com compatibilidade e
   * respostas que deixaram de ser compatíveis (para serem desfeitas). */
  function avaliar(e) {
    const visiveis = [];
    const invalidas = [];
    for (const q of PERGUNTAS) {
      if (q.quando && !q.quando(e)) continue;
      const opcoes = q.opcoes.map((o) => ({ ...o, motivo: o.regra(e) }));
      const valor = e[q.id];
      if (q.multi) {
        (valor || []).forEach((v) => {
          const o = opcoes.find((x) => x.id === v);
          if (o && o.motivo) invalidas.push({ pergunta: q.id, opcao: v, rotulo: o.rotulo, motivo: o.motivo });
        });
      } else if (valor) {
        const o = opcoes.find((x) => x.id === valor);
        if (o && o.motivo) invalidas.push({ pergunta: q.id, opcao: valor, rotulo: o.rotulo, motivo: o.motivo });
      }
      visiveis.push({ ...q, opcoes, valor, possiveis: opcoes.filter((o) => !o.motivo).length });
      const respondida = q.multi ? (valor || []).length > 0 : !!valor;
      if (!respondida) break; // funil: a próxima só aparece depois desta
    }
    return { visiveis, invalidas, completo: visiveis.length && visiveis.every((q) => (q.multi ? (q.valor || []).length : q.valor)) };
  }

  /* Recomendações a partir do que já foi respondido. */
  function recomendar(e, AU, TL) {
    const r = [];
    if (e.tipo) {
      const t = TL[e.tipo];
      r.push({
        titulo: "Objetivo e hipótese",
        itens: [
          `Tipo lógico: ${t.nome}.`,
          e.tipo === "descritiva" ? "Sem hipótese. Verbo do objetivo: descrever, caracterizar." : "Exige hipótese. Objetivo com “testar se…”.",
          e.tipo === "interferencia" ? "Explicite a variável interferente, a afetada e a direção do efeito." : null,
          `Título: modelo ${e.tipo === "descritiva" ? "“A caracterização de X em Y”" : e.tipo === "associacao" ? "“Associação entre X e Y em Z”" : "“Efeito de X sobre Y em Z” ou com teoria/recorte"}.`,
        ].filter(Boolean),
      });
    }
    if (e.abordagem || e.generalizar || e.fonte) {
      const am = [];
      if (e.fonte === "documental") am.push("Seleção do corpus por critérios explícitos (período, gênero, veículo, autoria) e regras de inclusão/exclusão.");
      if (e.generalizar === "estatistica") am.push("Amostragem probabilística: aleatória simples, estratificada, sistemática ou por conglomerados.");
      if (e.generalizar === "analitica") am.push("Amostragem intencional (casos ricos em informação), teórica ou bola de neve; justifique a escolha.");
      if (e.abordagem === "quanti") am.push("Suficiência: estabilidade dos resultados (coleta em blocos até a média/proporção variar pouco) e margem de erro.");
      if (e.abordagem === "quali") am.push("Suficiência: saturação teórica (encerrar quando novos dados não trazem categorias novas) — descreva quando ocorreu.");
      if (e.abordagem === "misto") am.push("Suficiência: saturação na parte qualitativa e estabilidade/margem de erro na quantitativa.");
      if (am.length) r.push({ titulo: "Amostra", itens: am });
    }
    if (e.abordagem) {
      const an = [];
      if (QUALI(e)) {
        an.push(
          e.tipo === "descritiva"
            ? "Qualitativa: codificação e categorização (análise de conteúdo, análise temática ou do discurso) para caracterizar o fenômeno."
            : e.tipo === "associacao"
            ? "Qualitativa: matriz categoria × grupo/contexto e análise de coocorrência de categorias."
            : "Qualitativa: comparar categorias antes × depois ou entre condições."
        );
        an.push("Rigor: dupla codificação independente, triangulação, auditoria; softwares como IRaMuTeQ, NVivo, Atlas.ti (apoio, não substituto da interpretação).");
      }
      if (QUANTI(e)) {
        const pe = perguntaEstatistica(e);
        if (e.variavel && pe.pergunta) {
          const rec = AU.recomendarTeste(pe.pergunta, e.variavel, pe.grupos || "2");
          if (rec) an.push(`Quantitativa: ${rec.teste}. Relate como: ${rec.relato}. Gráfico: ${rec.grafico}.`);
        } else an.push("Quantitativa: responda ao tipo da variável para ver o teste indicado.");
        an.push(e.generalizar === "estatistica" ? "Nível inferencial: intervalos de confiança e testes de hipótese." : "Nível descritivo (médias, proporções, dispersão), salvo se houver hipótese a testar.");
      }
      r.push({ titulo: "Análise", itens: an });
    }
    if (e.abordagem) {
      const gs = AU.OBJETIVOS_GRAFICO.filter(([id]) => !graficoPermitido(id, e)).map(([id]) => AU.GRAFICOS[id].nome);
      r.push({ titulo: "Elementos gráficos compatíveis", itens: [gs.join(" · ")] });
    }
    return r;
  }

  window.PLANEJADOR = { PERGUNTAS, avaliar, recomendar, regraDe, perguntaEstatistica, perguntasPermitidas, graficoPermitido };
})();
