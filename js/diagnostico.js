/*
 * Diagnóstico de decisões da pesquisa: objetivo, objetivos específicos,
 * hipótese, pergunta de pesquisa e conclusões.
 *
 * Cada problema traz: o que está errado (regra + trecho), POR QUE está
 * inadequado segundo a lógica da pesquisa, COMO corrigir e, quando possível,
 * uma SUGESTÃO de reescrita. As regras são heurísticas: apontam candidatos
 * a problema para o pesquisador julgar.
 *
 * ctx = { tipo, a, b, f, direcao, geral }
 */
(function () {
  const VERBO_TIPO = { descritiva: "Descrever", associacao: "Testar se há associação entre", interferencia: "Testar se" };

  const PREFIXO = /^\s*(o\s+)?(objetivo|propósito|intuito)\s+(geral\s+)?(deste|desta|do presente|da presente|do|da|nosso|nossa)?\s*(estudo|trabalho|projeto|pesquisa|tese|dissertação|artigo)?\s*(é|foi|será|consiste em)\s+/i;
  const nucleo = (t) => (t || "").trim().replace(PREFIXO, "").trim();
  const primeiraPalavra = (t) => (nucleo(t).match(/^[A-Za-zÀ-ú-]+/) || [""])[0];
  const raiz = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").slice(0, Math.max(4, Math.min(6, w.length - 1)));
  const contem = (texto, termo) => {
    const ps = (termo || "").split(/\s+/).filter((w) => w.length > 3 && !/^(para|como|entre|sobre|pelos|pelas|com|dos|das|uma|umas|uns)$/i.test(w));
    if (!ps.length) return true;
    const t = texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return ps.some((w) => t.includes(raiz(w)));
  };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const VAGOS = /^(analisar|estudar|investigar|avaliar|compreender|entender|conhecer|discutir|refletir|abordar|explorar|problematizar|examinar|pesquisar|observar|apresentar|tratar|debater|pensar)\b/i;
  const PROCEDIMENTO = /^(aplicar|realizar|coletar|entrevistar|fazer|levantar|catalogar|transcrever|tabular|selecionar|organizar|gravar|filmar|distribuir)\b/i;
  const PRODUTO = /^(elaborar|desenvolver|criar|construir|produzir|implementar|planejar|contribuir|melhorar|promover|incentivar|conscientizar|sensibilizar|valorizar|capacitar|fomentar|despertar|estimular|ajudar|auxiliar|oferecer|disponibilizar)\b/i;
  const PROPOR_PRODUTO = /^propor\b.*\b(material|sequência|sequencia|atividade|proposta didática|curso|oficina|guia|cartilha|aplicativo|app|plano de aula|jogo|recurso)/i;
  const VIES = /\b(comprovar|provar|demonstrar|mostrar|evidenciar|confirmar|defender|ratificar)\s+(que|a importância|a relevância|a eficácia|a necessidade)\b|\b(ressaltar|destacar|enfatizar)\s+a\s+(importância|relevância)\b/i;
  const CAUSAL = /\b(afeta|afetam|afetou|afetaram|afetar|influencia|influenciam|influenciou|influenciaram|influenciar|influência|efeito|efeitos|impacto|impacta|impactam|impactou|causa|causam|causou|causaram|determina|determinam|determinou|interfere|interferem|interferiu|interferir|interferência|melhora|melhoram|melhorou|piora|pioram|piorou|aumenta|aumentam|aumentou|aumentaram|reduz|reduzem|reduziu|reduziram|diminui|diminuem|diminuiu|diminuíram|eleva|elevam|elevou|leva a|levam a|levou a|provoca|provocam|provocou|contribui para|contribuiu para)\b/i;
  const RELACAO = /\b(associação|associad[oa]s?|relação|relaciona|relacionad[oa]s?|correlação|correlacionad[oa]s?|varia com|variam com|comparar|comparação|diferença entre|difere|diferem)\b/i;
  const LOCAL = /\b(munic[ií]pio|cidade de|estado d[oe]|regi[aã]o d[oe]|no brasil|brasileir[oa]s?|campus|escola estadual|escola municipal|universidade federal)\b/i;
  const OUTRO_VERBO = /\b(e|bem como|além de|assim como)\s+(descrever|analisar|caracterizar|testar|verificar|investigar|identificar|comparar|avaliar|propor|discutir|compreender|relacionar|mapear|examinar|elaborar|desenvolver|aplicar|propor)\b/i;
  const DIRECAO = /\b(aument\w*|reduz\w*|diminu\w*|elev\w*|melhor\w*|pior\w*|aceler\w*|retard\w*|ampli\w*|intensific\w*|enfraquec\w*|fortalec\w*|maior|menor|mais|menos|positiv\w*|negativ\w*)\b/i;
  const VALOR = /\b(importante|fundamental|essencial|necessári[oa]|deveria|deve ser|é preciso|imprescindível|relevante)\b/i;

  const P = (nivel, regra, trecho, porque, corrigir, sugestao) => ({ nivel, regra, trecho, porque, corrigir, sugestao: sugestao || "" });

  function sugerirPorTipo(texto, ctx) {
    if (ctx.tipo && ctx.a && (ctx.tipo === "descritiva" || ctx.b)) return window.METODO.TIPOS_LOGICOS[ctx.tipo].modelo(ctx.a, ctx.b, ctx.f);
    if (ctx.tipo === "descritiva") return nucleo(texto).replace(/^[A-Za-zÀ-ú-]+/, "Descrever");
    return "";
  }

  /* ---------------- Objetivo ---------------- */
  function objetivo(texto, ctx = {}, opts = {}) {
    const out = [];
    const t = nucleo(texto);
    if (!t) return out;
    const verbo = primeiraPalavra(texto);
    const tipo = ctx.tipo;

    if (/\?\s*$/.test(t) || /^(será que|como|por que|porque|qual|quais|quando|onde)\b/i.test(t))
      out.push(
        P("aviso", "Objetivo em forma de pergunta", t.slice(0, 50),
          "O objetivo é um enunciado afirmativo que diz que conhecimento a pesquisa vai produzir. A forma de pergunta pertence à pergunta de pesquisa.",
          "Comece por um verbo no infinitivo que revele a lógica: “Descrever…” ou “Testar se…”.",
          sugerirPorTipo(texto, ctx))
      );

    if (PROCEDIMENTO.test(t))
      out.push(
        P("aviso", "Procedimento no lugar do objetivo", verbo,
          "“" + verbo + "” descreve como os dados serão obtidos, não que conhecimento será produzido. Aplicar um questionário ou fazer entrevistas é o meio; o objetivo é o que você quer descobrir com isso.",
          "Pergunte-se: “para descobrir o quê vou fazer isso?”. A resposta é o objetivo; o procedimento vai para os Métodos.",
          sugerirPorTipo(texto, ctx))
      );
    else if (PRODUTO.test(t) || PROPOR_PRODUTO.test(t))
      out.push(
        P("aviso", "Meta de intervenção, não objetivo científico", verbo,
          "Elaborar um material, promover ou melhorar algo é uma meta de ação (ensino, extensão, produto). Ela não leva a uma conclusão sobre o mundo que possa ser verificada. “Contribuir para…” descreve a esperança de impacto, que é argumento de relevância.",
          "Se o interesse é saber se a intervenção funciona, o objetivo é de interferência: “Testar se [a intervenção] afeta [variável]”. Se é conhecer algo para depois elaborar o material, o objetivo é descritivo: “Descrever…”.",
          tipo ? sugerirPorTipo(texto, ctx) : "")
      );
    else if (VAGOS.test(t))
      out.push(
        P("aviso", "Verbo vago", verbo,
          "“" + verbo + "” diz que você vai trabalhar sobre o tema, não o que vai concluir. Sem saber se a pesquisa descreve algo ou testa uma relação, não dá para deduzir o delineamento, a análise nem o tipo de conclusão — e a banca não tem como avaliar se o objetivo foi atingido.",
          tipo === "descritiva"
            ? "Use “Descrever…” ou “Caracterizar…” e diga qual variável será descrita."
            : tipo === "associacao"
            ? "Use “Testar se há associação entre X e Y…”, nomeando as duas variáveis."
            : tipo === "interferencia"
            ? "Use “Testar se X afeta Y…”, nomeando a variável interferente e a afetada."
            : "Defina primeiro o tipo lógico (descrever, associar ou testar efeito); o verbo decorre dele.",
          sugerirPorTipo(texto, ctx))
      );

    const vies = t.match(VIES);
    if (vies)
      out.push(
        P("aviso", "Objetivo anuncia a conclusão", vies[0],
          "“" + vies[0] + "” pressupõe o resultado antes da pesquisa. Um objetivo científico precisa admitir que o resultado saia diferente do esperado; caso contrário, não há teste, só confirmação.",
          "Troque por “Testar se…” e leve o que você espera para a hipótese.",
          t.replace(VIES, "testar se").replace(/^./, (c) => c.toUpperCase()))
      );

    const outro = t.match(OUTRO_VERBO);
    if (outro && !opts.especifico)
      out.push(
        P("aviso", "Mais de um objetivo no mesmo enunciado", outro[0],
          "Cada objetivo leva a uma conclusão. Juntar dois no mesmo enunciado esconde qual é o principal e confunde delineamento, análise e Discussão.",
          "Mantenha como objetivo geral o que gera a conclusão mais ampla; transforme os demais em objetivos específicos (ou elimine os que não sustentam a conclusão).",
          sugerirPorTipo(texto, ctx) || t.split(OUTRO_VERBO)[0].replace(/[,;]\s*$/, "").trim() + ".")
      );

    if (tipo === "descritiva" && (/\btestar se\b|\bverificar se\b/i.test(t) || RELACAO.test(t) || CAUSAL.test(t)))
      out.push(
        P("aviso", "Incoerente com o tipo lógico (descritiva)", (t.match(/\btestar se\b|\bverificar se\b/i) || t.match(RELACAO) || t.match(CAUSAL))[0],
          "O desenho foi definido como descritivo, mas o objetivo testa relação, compara grupos ou fala em efeito. Comparar grupos já é associação (grupo × variável); falar em efeito é interferência. Objetivo e desenho precisam dizer a mesma coisa.",
          "Ou reescreva o objetivo para descrever uma variável, ou mude o tipo lógico no Desenho da pesquisa (e refaça o delineamento).",
          sugerirPorTipo(texto, ctx))
      );
    if ((tipo === "associacao" || tipo === "interferencia") && /^(descrever|caracterizar|mapear|identificar|levantar)\b/i.test(t))
      out.push(
        P("aviso", "Incoerente com o tipo lógico", verbo,
          "O desenho prevê testar uma relação entre variáveis, mas o objetivo só descreve. Se o objetivo é descritivo, não há hipótese a testar — e o delineamento escolhido sobra.",
          "Reescreva com “Testar se…”, nomeando as duas variáveis — ou mude o tipo lógico para descritiva.",
          sugerirPorTipo(texto, ctx))
      );
    if (tipo === "associacao" && CAUSAL.test(t))
      out.push(
        P("aviso", "Causalidade indevida", t.match(CAUSAL)[0],
          "Associação sem interferência mostra que variáveis variam juntas, não que uma produz a outra — uma terceira variável pode afetar ambas. Prometer efeito exige desenho de interferência (intervenção ou evento que isole a causa).",
          "Use “associação”, “relação”, “variam juntos”; ou, se você pode intervir ou há um evento natural, mude o tipo para interferência.",
          sugerirPorTipo(texto, ctx))
      );
    if (tipo === "interferencia" && !CAUSAL.test(t) && RELACAO.test(t))
      out.push(
        P("info", "Objetivo mais fraco que o desenho", t.match(RELACAO)[0],
          "O desenho é de interferência (testa efeito), mas o objetivo pede só associação. Ou o objetivo está aquém do que o delineamento permite concluir, ou o desenho está mais complexo do que o necessário.",
          "Se você quer saber se X altera Y, diga isso: “Testar se X afeta Y…”.",
          sugerirPorTipo(texto, ctx))
      );

    if ((tipo === "associacao" || tipo === "interferencia") && ctx.a && ctx.b && !opts.especifico) {
      const faltam = [ctx.a, ctx.b].filter((v) => !contem(t, v));
      if (faltam.length)
        out.push(
          P("aviso", "Variável ausente no objetivo", faltam.join(" / "),
            "Uma relação só pode ser testada entre variáveis nomeadas. Se o objetivo não diz quais são, o leitor não sabe o que será medido nem o que a conclusão vai relacionar.",
            "Nomeie as duas variáveis definidas no construtor (" + ctx.a + " e " + ctx.b + ").",
            sugerirPorTipo(texto, ctx))
        );
    }

    const loc = t.match(LOCAL);
    if (loc)
      out.push(
        P("info", "Local no objetivo", loc[0],
          "O local da coleta é um detalhe do sujeito/método. No objetivo ele transforma a pergunta científica numa pergunta local, e a conclusão parece valer só para aquele lugar.",
          "Retire o local do objetivo (ele vai para os Métodos), a menos que o próprio local seja o objeto teórico.")
      );

    const n = t.split(/\s+/).length;
    if (n > 40)
      out.push(
        P("info", "Objetivo longo", n + " palavras",
          "Objetivos longos costumam misturar contexto, justificativa e método. Isso dilui o que a pesquisa vai concluir.",
          "Deixe só: verbo lógico + variável(is) + fenômeno/população teórica. Contexto vai para a Introdução; procedimentos, para os Métodos.")
      );
    return out;
  }

  /* ---------------- Objetivos específicos ---------------- */
  function especificos(lista, ctx = {}) {
    const out = [];
    const l = (lista || []).filter((x) => x && x.trim());
    l.forEach((x, i) => {
      objetivo(x, ctx, { especifico: true }).forEach((pr) => {
        if (pr.regra === "Local no objetivo") return;
        out.push({ ...pr, regra: `Específico ${i + 1}: ${pr.regra}` });
      });
      if (ctx.geral && nucleo(x).toLowerCase() === nucleo(ctx.geral).toLowerCase())
        out.push(P("aviso", `Específico ${i + 1}: repete o objetivo geral`, x.slice(0, 50), "Objetivos específicos operacionalizam o geral; repeti-lo não acrescenta nada.", "Elimine-o ou transforme-o num passo necessário para responder ao geral."));
    });
    if (l.length > 5)
      out.push(P("info", "Muitos objetivos específicos", l.length + " itens", "Cada específico exige resultados próprios. Muitos itens costumam indicar falta de foco ou procedimentos listados como objetivos.", "Mantenha só os necessários para responder ao objetivo geral (geralmente 2 a 4)."));
    return out;
  }

  /* ---------------- Hipótese ---------------- */
  function hipotese(texto, ctx = {}) {
    const out = [];
    const t = (texto || "").trim();
    if (!t) return out;
    if (ctx.tipo === "descritiva")
      out.push(P("info", "Hipótese numa pesquisa descritiva", t.slice(0, 40), "Pesquisas descritivas não testam hipótese: elas caracterizam. Se você espera uma relação entre variáveis, a pesquisa é de associação.", "Apague a hipótese ou mude o tipo lógico no Desenho da pesquisa."));
    if (/\?\s*$/.test(t))
      out.push(P("aviso", "Hipótese em forma de pergunta", "?", "Hipótese é uma afirmação testável sobre a relação esperada. A pergunta já está na pergunta de pesquisa.", "Escreva como afirmação: “X aumenta Y”, “Há associação positiva entre X e Y”."));
    const v = t.match(VALOR);
    if (v)
      out.push(P("aviso", "Juízo de valor não testável", v[0], "“" + v[0] + "” expressa avaliação, não uma relação observável entre variáveis. Não há dado que confirme ou refute que algo é “importante”.", "Reescreva como relação entre variáveis mensuráveis."));
    if (ctx.tipo === "associacao" && CAUSAL.test(t))
      out.push(P("aviso", "Hipótese causal num desenho de associação", t.match(CAUSAL)[0], "O desenho não isola a causa; a hipótese não pode prometer efeito.", "Formule como associação: “Há associação positiva/negativa entre X e Y”.", ctx.a && ctx.b ? `Há associação entre ${ctx.a} e ${ctx.b}${ctx.f ? " em " + ctx.f : ""}.` : ""));
    if (ctx.tipo === "interferencia" && !DIRECAO.test(t))
      out.push(P("aviso", "Hipótese sem direção do efeito", "—", "Em interferência, a hipótese precisa dizer em que sentido X altera Y (aumenta, reduz…). Sem direção, qualquer diferença “confirmaria” a hipótese, e ela deixa de ser testável.", "Acrescente a direção esperada e justifique-a na Introdução.", ctx.a && ctx.b ? `${cap(ctx.a)} interfere em ${ctx.b}, ${ctx.direcao || "[aumentando/reduzindo…]"}.` : ""));
    if (/\b(pode|podem|poderia|possivelmente|talvez|de alguma forma|de algum modo)\b/i.test(t))
      out.push(P("info", "Hipótese indefinida", t.match(/\b(pode|podem|poderia|possivelmente|talvez|de alguma forma|de algum modo)\b/i)[0], "“Pode influenciar”, “de alguma forma” tornam a hipótese impossível de refutar: qualquer resultado a acomoda.", "Afirme a relação esperada de forma precisa; a incerteza é resolvida pelo teste, não pela redação."));
    return out;
  }

  /* ---------------- Pergunta de pesquisa ---------------- */
  function pergunta(texto, ctx = {}) {
    const out = [];
    const t = (texto || "").trim();
    if (!t) return out;
    if (!/\?\s*$/.test(t)) out.push(P("info", "Sem forma de pergunta", "—", "A pergunta científica precisa ser formulada como pergunta: é ela que o objetivo transforma em meta e a conclusão responde.", "Termine com “?” e deixe explícito o que se quer saber."));
    const v = t.match(VALOR);
    if (v) out.push(P("aviso", "Pergunta valorativa", v[0], "Perguntar se algo é “importante” ou “necessário” não tem resposta empírica: depende de valores, não de dados.", "Pergunte sobre o fenômeno observável: como ele é, com o que varia, o que o altera."));
    if (ctx.tipo === "descritiva" && (CAUSAL.test(t) || RELACAO.test(t)))
      out.push(P("aviso", "Pergunta incoerente com o tipo lógico", (t.match(CAUSAL) || t.match(RELACAO))[0], "A pergunta busca relação ou efeito, mas o desenho é descritivo.", "Ajuste a pergunta (“Como é X?”) ou o tipo lógico."));
    if (ctx.tipo === "associacao" && CAUSAL.test(t))
      out.push(P("aviso", "Pergunta causal num desenho de associação", t.match(CAUSAL)[0], "O desenho de associação não responde se X causa Y.", "Pergunte “X e Y variam juntos?” ou mude o desenho para interferência."));
    const loc = t.match(LOCAL);
    if (loc) out.push(P("info", "Pergunta local", loc[0], "Uma pergunta restrita ao local da coleta só interessa a quem está naquele local. A pergunta científica deve ser mais geral que os dados.", "Formule a pergunta sobre o fenômeno; o local entra como recorte do sujeito."));
    return out;
  }

  /* ---------------- Conclusões ---------------- */
  function conclusoes(lista, ctx = {}) {
    const out = [];
    (lista || []).forEach((c, i) => {
      if (!c || !c.trim()) return;
      if ((ctx.tipo === "descritiva" || ctx.tipo === "associacao") && CAUSAL.test(c))
        out.push(P("aviso", `Conclusão ${i + 1}: causalidade não sustentada`, c.match(CAUSAL)[0], "O delineamento não isola a causa, então os dados não sustentam que uma variável produz efeito na outra. A conclusão vai além do que o estudo permite.", ctx.tipo === "descritiva" ? "Conclua sobre como o fenômeno é (descrição)." : "Conclua sobre a associação (“X e Y variam juntos”)."));
      const passado = (c.match(/\b\w+(ou|aram|eram|iram)\b/gi) || []).filter((w) => w.length > 4);
      if (passado.length)
        out.push(P("info", `Conclusão ${i + 1}: tempo verbal`, passado.join(", "), "No passado, a conclusão parece valer só para a amostra estudada. Conclusões sobre o fenômeno/população vão no presente.", "Use o presente (“aumenta”, “está associado”), salvo se a conclusão é sobre um evento passado."));
      if (/\b(p\s*[<=>]|±|\d+[.,]\d+\s*%)/.test(c))
        out.push(P("aviso", `Conclusão ${i + 1}: é um resultado`, c.slice(0, 50), "Números são resultados. A conclusão é a proposição teórica que os dados sustentam.", "Escreva o que os números significam para o fenômeno."));
    });
    return out;
  }

  window.DIAG = { objetivo, especificos, hipotese, pergunta, conclusoes, nucleo };
})();
