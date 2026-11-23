/*
 * Verificador lógico e de estilo (heurístico, para português).
 * Aponta CANDIDATOS a problema segundo os princípios do Método Lógico
 * (Volpato). Não substitui a leitura crítica: cada alerta deve ser julgado
 * pelo autor.
 */
(function () {
  const contarPalavras = (t) => (t || "").trim().split(/\s+/).filter(Boolean).length;
  const frases = (t) =>
    (t || "")
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/)
      .map((s) => s.trim())
      .filter(Boolean);

  const PROLIXAS = [
    [/\bcausou (um )?aumento\b/gi, "‘aumentou’"],
    [/\bcausou (uma )?redução\b/gi, "‘reduziu’"],
    [/\bo objetivo d(este|o presente) (estudo|trabalho) (foi|é)\b/gi, "‘Testamos se…’ / ‘Descrevemos…’"],
    [/\bcomo é (bem )?(sabido|conhecido)\b/gi, "cite a fonte ou omita"],
    [/\b(é|vale) (importante )?(ressaltar|salientar|destacar|frisar|lembrar) que\b/gi, "vá direto à informação"],
    [/\bno presente (estudo|trabalho)\b/gi, "‘aqui’ / ‘neste estudo’ ou omita"],
    [/\ba nível de\b/gi, "‘em’ / ‘no nível de’"],
    [/\bcom o (intuito|objetivo|propósito) de\b/gi, "‘para’"],
    [/\bpor meio d[oa] qual\b/gi, "simplifique a frase"],
    [/\brealizou-se (um|uma)\b/gi, "use o verbo da ação"],
    [/\bfoi realizad[oa] (um|uma)\b/gi, "use o verbo da ação"],
    [/\bde forma a\b/gi, "‘para’"],
    [/\bno sentido de\b/gi, "‘para’"],
    [/\bdevido ao fato de( que)?\b/gi, "‘porque’"],
  ];

  const PASSIVA_ANALITICA = /\b(foi|foram|é|são|será|serão|era|eram|seja|sejam|fosse|fossem|tem sido|têm sido)\s+(\w+(?:ad|id)[oa]s?)\b/gi;
  const PASSIVA_SINTETICA = /\b(\w{3,}(?:ou|aram|eram|iram|a|e|am|em))-se\b/gi;
  const AMBIGUOS = /^(Isso|Isto|Este|Esta|Esse|Essa|Aquele|Aquilo)\b(?!\s+(estudo|trabalho|resultado|efeito|achado|padrão|dado|método|grupo|modelo|fenômeno|aumento|processo))/;
  const TEMPO_PASSADO_CONCLUSAO = /\b\w+(ou|aram|eram|iram)\b/gi;
  const LOCAL = /\b(munic[ií]pio|cidade de|estado d[oe]|regi[aã]o d[oe]|no brasil|brasileir[oa]s?|campus|escola estadual|escola municipal)\b/gi;
  const METODO_TITULO = /^\s*(estudo|an[aá]lise|avalia[cç][aã]o|investiga[cç][aã]o|levantamento|considera[cç][oõ]es|uma abordagem|contribui[cç][aã]o)\b/i;
  const ABREV = /\b[A-Z]{2,6}s?\b/g;

  function estilo(texto) {
    const alertas = [];
    if (!texto || !texto.trim()) return alertas;
    let m;

    const passivas = new Set();
    while ((m = PASSIVA_ANALITICA.exec(texto))) passivas.add(m[0]);
    passivas.forEach((p) =>
      alertas.push({ nivel: "aviso", regra: "Voz passiva", trecho: p, dica: "Prefira a voz ativa e a ordem direta (sujeito–verbo–complemento), salvo quando o agente é irrelevante." })
    );

    const sint = new Set();
    while ((m = PASSIVA_SINTETICA.exec(texto))) sint.add(m[0]);
    sint.forEach((p) =>
      alertas.push({ nivel: "info", regra: "Impessoalidade", trecho: p, dica: "Volpato prefere a 1ª pessoa (‘observamos’, ‘concluímos’), pois o autor assume a interpretação. Muitos programas aceitam a forma impessoal (‘observa-se’): o importante é manter um padrão consistente e não usá-la para esconder quem conclui." })
    );

    PROLIXAS.forEach(([re, sug]) => {
      const achado = texto.match(re);
      if (achado) achado.forEach((a) => alertas.push({ nivel: "aviso", regra: "Excesso de palavras", trecho: a, dica: `Simplifique: ${sug}.` }));
    });

    const sig = texto.match(/estatisticamente significa\w*/gi);
    if (sig && sig.length > 1)
      alertas.push({ nivel: "info", regra: "Repetição", trecho: `“estatisticamente significativo” ×${sig.length}`, dica: "Basta informar o critério de significância uma vez; depois, afirme o efeito diretamente." });

    frases(texto).forEach((f) => {
      const n = contarPalavras(f);
      if (n > 40) alertas.push({ nivel: "info", regra: "Frase longa", trecho: f.slice(0, 90) + "…", dica: `${n} palavras. Frases curtas e diretas facilitam a leitura.` });
      if (AMBIGUOS.test(f)) alertas.push({ nivel: "info", regra: "Referência ambígua", trecho: f.slice(0, 60) + "…", dica: "Pronome demonstrativo no início da frase: o leitor saberá exatamente a que se refere? Considere repetir o substantivo." });
    });

    const REGRAS_AULAS = [
      [/\b(neste|no presente) (parágrafo|capítulo|tópico|item|seção)[^.]{0,40}\b(trataremos|abordaremos|discutiremos|será (abordad|tratad|discutid))/gi, "Frase-tópico anunciativa", "Em vez de anunciar o assunto, afirme a ideia que o parágrafo vai demonstrar."],
      [/\b[A-ZÁÉÍÓÚ][a-zà-ú]+( e [A-ZÁÉÍÓÚ][a-zà-ú]+| et al\.)? \(\d{4}[a-z]?\) (diz|dizem|afirma|afirmam|considera|consideram|pensa|pensam|acha|acham) que\b/g, "Citação apenas reportada", "A ideia é sua; o autor é a base. Ex.: “Metáforas são compreendidas aqui como estruturas conceptuais (Lakoff, 1993), o que explica…”"],
      [/\bsegundo (diversos|vários|muitos|alguns) autores\b/gi, "Citação vaga", "Cite quem demonstrou o quê — ou elimine: uma citação genérica não sustenta nada."],
      [/\b(como (podemos|pode-se) (ver|observar|notar)|vejamos( alguns exemplos)?)\b/gi, "Expressão informal", "Prefira “Observa-se que…” ou “A Figura 1 mostra que…”; o exemplo deve sustentar uma afirmação, não ser anunciado."],
    ];
    REGRAS_AULAS.forEach(([re, regra, dica]) => {
      const achado = texto.match(re);
      if (achado) achado.forEach((a) => alertas.push({ nivel: "aviso", regra, trecho: a, dica }));
    });

    return alertas;
  }

  function palavrasChave(str, titulo, objetivo, genericas) {
    const a = [];
    if (!str || !str.trim()) return a;
    const lista = str.split(/[;,.]/).map((x) => x.trim().toLowerCase()).filter(Boolean);
    if (lista.length < 3 || lista.length > 5) a.push({ nivel: "aviso", regra: "Quantidade de palavras-chave", trecho: `${lista.length}`, dica: "Use de 3 a 5 palavras-chave." });
    const gen = lista.filter((x) => (genericas || []).includes(x));
    if (gen.length) a.push({ nivel: "aviso", regra: "Palavra-chave genérica", trecho: gen.join(", "), dica: "Termos amplos não indexam bem. Prefira o conceito central, a categoria analítica, o recorte e o método." });
    const base = ((titulo || "") + " " + (objetivo || "")).toLowerCase();
    if (base.trim()) {
      const fora = lista.filter((x) => !x.split(/\s+/).some((w) => w.length > 3 && base.includes(w.slice(0, Math.max(4, w.length - 2)))));
      if (fora.length) a.push({ nivel: "info", regra: "Palavra-chave fora do título/objetivo", trecho: fora.join(", "), dica: "Palavras-chave devem refletir conceitos que aparecem no título, no objetivo e no texto." });
    }
    return a;
  }

  function legendas(lista) {
    const a = [];
    (lista || []).forEach((l) => {
      const semNumero = l.replace(/^\s*(figura|gráfico|grafico|tabela|quadro)\s*\d+\s*[.–—:-]?\s*/i, "");
      if (contarPalavras(semNumero) < 4 || /^\s*(resultados?|dados|gráfico|figura)\s*\.?\s*$/i.test(semNumero))
        a.push({ nivel: "aviso", regra: "Título vago", trecho: l.slice(0, 60), dica: "O título deve permitir entender o elemento fora do texto: conteúdo, variável e escopo (ex.: “Distribuição percentual das categorias argumentativas por grupo escolar”)." });
    });
    return a;
  }

  function interpretacaoNosResultados(texto) {
    const m = (texto || "").match(/\b(confirma(m)?|corrobora(m)?|comprova(m)?|demonstra(m)? que|isso (se deve|ocorre porque)|explica-se|de acordo com [A-ZÁÉÍÓÚ][a-zà-ú]+ \(\d{4}\))/g);
    return m
      ? [{ nivel: "info", regra: "Interpretação nos Resultados", trecho: [...new Set(m)].join(", "), dica: "Resultados apresentam evidências; a interpretação e o confronto com teoria e literatura vão para a Discussão." }]
      : [];
  }

  function titulo(t, academico) {
    const a = [];
    if (!t || !t.trim()) return a;
    const n = contarPalavras(t);
    if (n > (academico ? 25 : 15)) a.push({ nivel: "aviso", regra: "Título longo", trecho: `${n} palavras`, dica: "Faça o título o mais curto possível, mantendo a novidade." });
    if (METODO_TITULO.test(t)) a.push({ nivel: "aviso", regra: "Título descritivo", trecho: t.match(METODO_TITULO)[0], dica: "Exponha a descoberta/conclusão em vez de descrever a atividade (‘Estudo de…’)." });
    const loc = t.match(LOCAL);
    if (loc)
      a.push(
        academico
          ? { nivel: "info", regra: "Recorte no título", trecho: loc.join(", "), dica: "Em trabalhos acadêmicos o recorte empírico pode estar no título ou no subtítulo; confira se ele é necessário e se o foco continua no objeto teórico." }
          : { nivel: "aviso", regra: "Foco na amostra", trecho: loc.join(", "), dica: "Foque no fenômeno, não no local da coleta — salvo se o local for o próprio objeto teórico." }
      );
    const partes = t.split(":");
    if (partes.length > 1 && contarPalavras(partes.slice(1).join(":")) > 20) a.push({ nivel: "aviso", regra: "Subtítulo longo", trecho: `${contarPalavras(partes.slice(1).join(":"))} palavras`, dica: "Subtítulo = COMO/ONDE, em até ~1,5 linha, sem detalhes metodológicos excessivos." });
    const ab = (t.match(ABREV) || []).filter((x) => !["DNA", "RNA"].includes(x));
    if (ab.length) a.push({ nivel: "aviso", regra: "Abreviaturas", trecho: ab.join(", "), dica: "Evite abreviaturas no título, mesmo as comuns na área." });
    if (/\b(versus|vs\.?|compara[cç][aã]o|comparativ[oa])\b/i.test(t)) a.push({ nivel: "info", regra: "Comparação no título", trecho: "comparação", dica: "Prefira a lógica da conclusão à descrição da comparação feita." });
    if (/\?$/.test(t.trim())) a.push({ nivel: "info", regra: "Título-pergunta", trecho: "?", dica: "Pergunta esconde a resposta; se possível, exponha a conclusão." });
    return a;
  }

  function resumo(t, tipoTrabalho) {
    const a = [];
    if (!t || !t.trim()) return a;
    const n = contarPalavras(t);
    a.push({ nivel: "info", regra: "Extensão", trecho: `${n} palavras`, dica: "Resumo criativo (Volpato): essência em ~100 palavras. Depois ajuste ao exigido — ABNT NBR 6028: 150–500 (trabalhos acadêmicos) e 100–250 (artigos), ou o limite da revista." });
    if (tipoTrabalho !== "artigo" && n < 150) a.push({ nivel: "aviso", regra: "Abaixo do mínimo ABNT", trecho: `${n} palavras`, dica: "Trabalhos acadêmicos costumam exigir 150–500 palavras (confira a norma do programa)." });
    if (!/\b(conclu|demonstr|mostr|sugere|indica|revel|aument|reduz|afeta|depende|associa)\w*/i.test(t))
      a.push({ nivel: "aviso", regra: "Sem conclusão aparente", trecho: "—", dica: "O resumo deve mostrar aonde você chegou, não só o que fez." });
    return a.concat(estilo(t));
  }

  function conclusoes(lista) {
    const a = [];
    (lista || []).forEach((c, i) => {
      const passado = (c.match(TEMPO_PASSADO_CONCLUSAO) || []).filter((w) => w.length > 4);
      if (passado.length)
        a.push({ nivel: "info", regra: `Conclusão ${i + 1}: tempo verbal`, trecho: passado.join(", "), dica: "Conclusões sobre a população/fenômeno vão no presente. Use o passado só se a conclusão for sobre um evento passado." });
      if (/\b(p\s*[<=>]|±|\d+[.,]\d+\s*%)/.test(c))
        a.push({ nivel: "aviso", regra: `Conclusão ${i + 1}: parece resultado`, trecho: c.slice(0, 60), dica: "Conclusão é uma proposição teórica apoiada nos dados, não a repetição de um número." });
    });
    return a;
  }

  function objetivo(texto, tipoLogico) {
    const a = [];
    if (!texto || !texto.trim()) return a;
    if (/^\s*(analisar|estudar|investigar|avaliar|abordar|discutir|refletir)\b/i.test(texto))
      a.push({ nivel: "aviso", regra: "Verbo vago", trecho: texto.split(/\s/)[0], dica: "Use um verbo que revele a lógica: ‘Descrever…’ (descritiva) ou ‘Testar se…’ (hipótese)." });
    if (tipoLogico === "descritiva" && /\b(testar|verificar) se\b/i.test(texto))
      a.push({ nivel: "aviso", regra: "Incoerência lógica", trecho: "testar se", dica: "Pesquisa marcada como descritiva, mas o objetivo testa uma hipótese." });
    if (tipoLogico && tipoLogico !== "descritiva" && /^\s*(descrever|caracterizar)\b/i.test(texto))
      a.push({ nivel: "aviso", regra: "Incoerência lógica", trecho: texto.split(/\s/)[0], dica: "Pesquisa marcada como de associação, mas o objetivo é descritivo." });
    if (tipoLogico === "associacao" && /\b(afeta|influencia|causa|determina|efeito)\b/i.test(texto))
      a.push({ nivel: "aviso", regra: "Causalidade indevida", trecho: "afeta/efeito", dica: "Associação sem interferência não permite afirmar que uma variável afeta a outra." });
    const loc = texto.match(LOCAL);
    if (loc) a.push({ nivel: "info", regra: "Local no objetivo", trecho: loc.join(", "), dica: "O local da coleta é detalhe do sujeito/método, não do objetivo teórico." });
    return a;
  }

  window.VERIFICADOR = { estilo, titulo, resumo, conclusoes, objetivo, palavrasChave, legendas, interpretacaoNosResultados, contarPalavras };
})();
