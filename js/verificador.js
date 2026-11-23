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
      alertas.push({ nivel: "aviso", regra: "Impessoalidade", trecho: p, dica: "Construções como ‘observou-se’, ‘conclui-se’ sugerem que os dados impõem a conclusão. Considere a 1ª pessoa (‘observamos’, ‘concluímos’)." })
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

    return alertas;
  }

  function titulo(t) {
    const a = [];
    if (!t || !t.trim()) return a;
    const n = contarPalavras(t);
    if (n > 15) a.push({ nivel: "aviso", regra: "Título longo", trecho: `${n} palavras`, dica: "Faça o título o mais curto possível, mantendo a novidade." });
    if (METODO_TITULO.test(t)) a.push({ nivel: "aviso", regra: "Título descritivo", trecho: t.match(METODO_TITULO)[0], dica: "Exponha a descoberta/conclusão em vez de descrever a atividade (‘Estudo de…’)." });
    const loc = t.match(LOCAL);
    if (loc) a.push({ nivel: "aviso", regra: "Foco na amostra", trecho: loc.join(", "), dica: "Foque no fenômeno, não no local da coleta — salvo se o local for o próprio objeto teórico." });
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

  window.VERIFICADOR = { estilo, titulo, resumo, conclusoes, objetivo, contarPalavras };
})();
