/* Assistente de Pesquisa — Método Lógico (Volpato)
 * Aplicação 100% local: os dados ficam no navegador (localStorage)
 * e podem ser exportados/importados como arquivo .json.
 */
(function () {
  const { TIPOS_TRABALHO, TIPOS_LOGICOS, FASES, ETAPAS, ESTRUTURA_DOC } = window.METODO;
  const V = window.VERIFICADOR;
  const CHAVE = "metodo-logico-v1";
  const $ = (s, el = document) => el.querySelector(s);
  const app = $("#app");

  /* ----------------------------- armazenamento ----------------------------- */
  let store = carregar();
  function carregar() {
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && s.projetos) return s;
    } catch (e) {}
    return { projetos: {} };
  }
  let timer;
  function salvar(imediato) {
    clearTimeout(timer);
    const f = () => {
      try {
        localStorage.setItem(CHAVE, JSON.stringify(store));
        marcarSalvo();
      } catch (e) {
        aviso("Não foi possível salvar no navegador. Exporte um backup (.json).");
      }
    };
    imediato ? f() : (timer = setTimeout(f, 400));
  }
  function marcarSalvo() {
    const el = $("#salvo");
    if (el) {
      el.textContent = "Salvo " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
  }

  /* ------------------------------- utilidades ------------------------------- */
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const etapaPorId = (id) => ETAPAS.find((e) => e.id === id);

  function etapasVisiveis(p) {
    return ETAPAS.filter((e) => !e.apenas || e.apenas.includes(p.meta.tipo));
  }
  function dadosEtapa(p, id) {
    return (p.dados[id] = p.dados[id] || {});
  }
  function chaveCampo(etapa, campo) {
    return campo.compartilhado || etapa.id;
  }
  function getValor(p, etapa, campo) {
    return dadosEtapa(p, chaveCampo(etapa, campo))[campo.id];
  }
  function setValor(p, etapa, campo, valor) {
    dadosEtapa(p, chaveCampo(etapa, campo))[campo.id] = valor;
    p.atualizado = Date.now();
    salvar();
  }
  function val(p, etapaId, campoId) {
    return (p.dados[etapaId] || {})[campoId];
  }

  function aviso(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  function baixar(nome, conteudo, tipo) {
    const blob = new Blob([conteudo], { type: tipo });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  }
  const nomeArquivo = (p) =>
    (p.meta.titulo || "pesquisa")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\w]+/g, "-")
      .slice(0, 50)
      .toLowerCase();

  /* --------------------------------- rotas --------------------------------- */
  function rota() {
    const h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "p" && store.projetos[h[1]]) {
      const p = store.projetos[h[1]];
      store.atual = p.id;
      if (h[2] === "etapa" && etapaPorId(h[3])) return telaEtapa(p, etapaPorId(h[3]));
      if (h[2] === "documento") return telaDocumento(p);
      if (h[2] === "verificar") return telaVerificar(p);
      if (h[2] === "config") return telaConfig(p);
      return telaVisao(p);
    }
    if (h[0] === "novo") return telaNovo();
    if (h[0] === "sobre") return telaSobre();
    return telaInicio();
  }
  window.addEventListener("hashchange", rota);
  const ir = (h) => (location.hash = h);

  /* ------------------------------ layout base ------------------------------ */
  function moldura(p, conteudo, etapaAtual) {
    const vis = etapasVisiveis(p);
    const feitos = vis.filter((e) => p.feito[e.id]).length;
    const pct = Math.round((feitos / vis.length) * 100);
    const nav = FASES.map((f) => {
      const es = vis.filter((e) => e.fase === f.id);
      const fe = es.filter((e) => p.feito[e.id]).length;
      return `<div class="fase">
        <div class="fase-nome"><span>${esc(f.nome)}</span><small>${fe}/${es.length}</small></div>
        ${es
          .map(
            (e) => `<a href="#/p/${p.id}/etapa/${e.id}" class="etapa-link ${etapaAtual === e.id ? "ativa" : ""} ${p.feito[e.id] ? "feita" : ""}">
              <span class="marca">${p.feito[e.id] ? "✓" : e.passo ?? "•"}</span><span>${esc(e.titulo)}</span></a>`
          )
          .join("")}
      </div>`;
    }).join("");
    app.innerHTML = `
      <header class="topo">
        <button class="icone menu-btn" aria-label="Abrir menu" data-acao="menu">☰</button>
        <a class="marca-app" href="#/">Método Lógico</a>
        <span class="proj-nome" title="${esc(p.meta.titulo)}">${esc(p.meta.titulo || "Sem título")}</span>
        <span class="salvo" id="salvo"></span>
        <nav class="acoes-topo">
          <a href="#/p/${p.id}" class="${!etapaAtual ? "on" : ""}">Visão geral</a>
          <a href="#/p/${p.id}/documento">Documento</a>
          <a href="#/p/${p.id}/verificar">Verificador</a>
          <a href="#/p/${p.id}/config" title="Dados do trabalho">⚙</a>
        </nav>
      </header>
      <div class="corpo">
        <aside class="lateral" id="lateral">
          <div class="progresso"><div class="barra"><i style="width:${pct}%"></i></div><small>${pct}% concluído · ${esc(TIPOS_TRABALHO[p.meta.tipo].nome)}</small></div>
          ${nav}
        </aside>
        <main class="principal" id="principal">${conteudo}</main>
      </div>`;
    $("[data-acao=menu]").onclick = () => $("#lateral").classList.toggle("aberta");
    window.scrollTo(0, 0);
  }

  /* --------------------------------- início -------------------------------- */
  function telaInicio() {
    const lista = Object.values(store.projetos).sort((a, b) => (b.atualizado || 0) - (a.atualizado || 0));
    app.innerHTML = `
      <div class="inicio">
        <section class="hero">
          <h1>Assistente de Pesquisa<br><span>pelo Método Lógico</span></h1>
          <p>Um roteiro passo a passo — do projeto à redação final de TCC, monografia, dissertação, tese ou artigo científico — baseado na obra de Gilson L. Volpato.</p>
          <div class="botoes">
            <a class="btn primario" href="#/novo">Começar novo trabalho</a>
            <label class="btn">Importar backup (.json)<input type="file" accept=".json,application/json" id="importar" hidden></label>
            <a class="btn leve" href="#/sobre">Como funciona</a>
          </div>
        </section>
        ${
          lista.length
            ? `<section><h2>Seus trabalhos</h2><div class="cartoes">${lista
                .map((p) => {
                  const vis = etapasVisiveis(p);
                  const pct = Math.round((vis.filter((e) => p.feito[e.id]).length / vis.length) * 100);
                  return `<article class="cartao">
                    <a href="#/p/${p.id}"><small>${esc(TIPOS_TRABALHO[p.meta.tipo].nome)}</small><h3>${esc(p.meta.titulo || "Sem título")}</h3></a>
                    <div class="barra"><i style="width:${pct}%"></i></div>
                    <div class="linha"><small>${pct}% · ${p.atualizado ? new Date(p.atualizado).toLocaleDateString("pt-BR") : ""}</small>
                    <button class="link perigo" data-apagar="${p.id}">Excluir</button></div>
                  </article>`;
                })
                .join("")}</div></section>`
            : ""
        }
        <section class="fluxo">
          <h2>O caminho</h2>
          <ol class="fases-resumo">${FASES.map((f) => `<li><b>${esc(f.nome)}</b><span>${esc(f.resumo)}</span></li>`).join("")}</ol>
        </section>
        <footer class="rodape">Os dados ficam apenas neste navegador. Exporte backups com frequência.</footer>
      </div>`;
    $("#importar").onchange = importar;
    app.querySelectorAll("[data-apagar]").forEach(
      (b) =>
        (b.onclick = () => {
          const p = store.projetos[b.dataset.apagar];
          if (confirm(`Excluir “${p.meta.titulo || "Sem título"}”? Esta ação não pode ser desfeita.`)) {
            delete store.projetos[p.id];
            salvar(true);
            telaInicio();
          }
        })
    );
  }

  function importar(ev) {
    const f = ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const p = JSON.parse(r.result);
        if (!p.meta || !p.dados) throw new Error();
        if (store.projetos[p.id] && !confirm("Já existe um trabalho com este identificador. Substituir?")) p.id = uid();
        p.feito = p.feito || {};
        store.projetos[p.id] = p;
        salvar(true);
        ir(`#/p/${p.id}`);
      } catch (e) {
        aviso("Arquivo inválido.");
      }
    };
    r.readAsText(f);
  }

  function formMeta(m = {}) {
    return `
      <label>Tipo de trabalho
        <select name="tipo">${Object.entries(TIPOS_TRABALHO)
          .map(([k, t]) => `<option value="${k}" ${m.tipo === k ? "selected" : ""}>${t.nome}</option>`)
          .join("")}</select></label>
      <label>Título provisório<input name="titulo" value="${esc(m.titulo)}" placeholder="Pode mudar depois — o título definitivo vem no fim (Passo 30)"></label>
      <div class="duas">
        <label>Autor(a)<input name="autor" value="${esc(m.autor)}"></label>
        <label>Orientador(a)<input name="orientador" value="${esc(m.orientador)}"></label>
      </div>
      <div class="duas">
        <label>Instituição / programa<input name="instituicao" value="${esc(m.instituicao)}"></label>
        <label>Área<input name="area" value="${esc(m.area)}"></label>
      </div>
      <label>Em que ponto você está?
        <select name="inicio">
          <option value="projeto">Ainda vou elaborar o projeto</option>
          <option value="execucao">Projeto pronto, vou coletar/analisar dados</option>
          <option value="historia">Já tenho os resultados</option>
          <option value="redacao">História clara, quero redigir</option>
        </select></label>`;
  }

  function telaNovo() {
    app.innerHTML = `<div class="inicio estreito">
      <a href="#/" class="voltar">← Voltar</a>
      <h1>Novo trabalho</h1>
      <form id="fnovo" class="form">${formMeta({ tipo: "dissertacao" })}<button class="btn primario">Criar</button></form></div>`;
    $("#fnovo").onsubmit = (ev) => {
      ev.preventDefault();
      const fd = Object.fromEntries(new FormData(ev.target));
      const id = uid();
      const inicio = fd.inicio;
      delete fd.inicio;
      store.projetos[id] = { id, criado: Date.now(), atualizado: Date.now(), meta: fd, dados: {}, feito: {} };
      salvar(true);
      const primeira = ETAPAS.find((e) => e.fase === inicio);
      ir(`#/p/${id}/etapa/${primeira.id}`);
    };
  }

  function telaConfig(p) {
    moldura(
      p,
      `<h1>Dados do trabalho</h1>
      <form id="fcfg" class="form">${formMeta(p.meta).replace(/<label>Em que ponto[\s\S]*<\/label>/, "")}
      <button class="btn primario">Salvar</button></form>
      <h2>Backup</h2>
      <p>Seus dados ficam só neste navegador. Exporte o arquivo para guardar ou levar a outro computador.</p>
      <div class="botoes"><button class="btn" id="bkp">Exportar backup (.json)</button></div>`
    );
    $("#fcfg").onsubmit = (ev) => {
      ev.preventDefault();
      Object.assign(p.meta, Object.fromEntries(new FormData(ev.target)));
      p.atualizado = Date.now();
      salvar(true);
      aviso("Dados atualizados.");
      rota();
    };
    $("#bkp").onclick = () => baixar(nomeArquivo(p) + ".json", JSON.stringify(p, null, 2), "application/json");
  }

  function telaSobre() {
    app.innerHTML = `<div class="inicio estreito texto-longo">
      <a href="#/" class="voltar">← Voltar</a>
      <h1>Como funciona</h1>
      <p>O assistente organiza a pesquisa na rotina do <b>Método Lógico</b> de Gilson L. Volpato. A ideia central é que cada decisão de redação decorre da lógica da ciência: o texto científico é um <b>argumento</b> que leva o leitor a aceitar suas conclusões.</p>
      <h2>Princípios</h2>
      <ul>
        <li><b>A redação começa no projeto.</b> Pergunta irrelevante ou método frágil não são salvos pelo texto.</li>
        <li><b>Três tipos lógicos de pesquisa:</b> descritiva, associação sem interferência e associação com interferência (causa–efeito). O tipo define objetivo, delineamento e conclusões possíveis.</li>
        <li><b>O texto conta uma história</b> — e a Pirâmide Lógica mostra como evidências sustentam conclusões cada vez mais gerais.</li>
        <li><b>Redija de trás para frente:</b> conclusões → resultados → métodos → discussão → objetivos → introdução → resumo → título.</li>
        <li><b>Outline são frases-tópico:</b> cada item é uma afirmação que vira um parágrafo.</li>
        <li><b>Estilo guiado pela lógica:</b> voz ativa, ordem direta, sem excessos, presente nas conclusões.</li>
      </ul>
      <h2>Fontes</h2>
      <ul>
        <li>Volpato, G. L. <i>Guia Prático para Redação Científica</i>.</li>
        <li>Volpato, G. L.; Barreto, R. E. <i>Elabore Projetos Científicos Competitivos</i>.</li>
        <li>Volpato, G. L. <i>Bases Teóricas para Redação Científica</i>.</li>
        <li>Volpato, G. L. <i>Ciência: da filosofia à publicação</i>.</li>
        <li>Volpato, G. L. <i>Estatística sem Dor</i>.</li>
      </ul>
      <p class="nota">Os textos do assistente são resumos didáticos; consulte os livros para o raciocínio completo e os exemplos. O verificador automático é heurístico: aponta candidatos a problema para você julgar.</p>
    </div>`;
  }

  /* ------------------------------ visão geral ------------------------------ */
  function telaVisao(p) {
    const vis = etapasVisiveis(p);
    const proxima = vis.find((e) => !p.feito[e.id]);
    const hist = (k) => esc(val(p, "p6", k) || "");
    const conc = val(p, "p13", "conclusoes") || [];
    const obj = val(p, "p24", "objetivo") || (val(p, "pr-tipo", "objetivo") || {}).texto;
    moldura(
      p,
      `<h1>${esc(p.meta.titulo || "Sem título")}</h1>
      <p class="sub">${esc(TIPOS_TRABALHO[p.meta.tipo].nome)}${p.meta.autor ? " · " + esc(p.meta.autor) : ""}${p.meta.orientador ? " · orient. " + esc(p.meta.orientador) : ""}</p>
      ${proxima ? `<div class="destaque"><div><small>Próximo passo</small><b>${esc(proxima.titulo)}</b></div><a class="btn primario" href="#/p/${p.id}/etapa/${proxima.id}">Continuar →</a></div>` : `<div class="destaque ok"><b>Todas as etapas concluídas.</b> Revise o documento final.</div>`}
      <div class="grade">
        <section class="painel"><h3>Objetivo</h3><p>${esc(obj) || "<span class=vazio>Defina na etapa “Variáveis, tipo lógico e objetivo”.</span>"}</p></section>
        <section class="painel"><h3>Conclusões</h3>${conc.length ? `<ol>${conc.map((c) => `<li>${esc(c)}</li>`).join("")}</ol>` : "<p class=vazio>Ainda não definidas (Passo 13).</p>"}</section>
      </div>
      <section class="painel"><h3>A história (Passo 6)</h3>
        <dl class="historia">
          <dt>Como começou</dt><dd>${hist("q1") || "—"}</dd>
          <dt>Aonde chegou</dt><dd>${hist("q2") || "—"}</dd>
          <dt>Como chegou</dt><dd>${hist("q3") || "—"}</dd>
          <dt>O que muda na ciência</dt><dd>${hist("q4") || "—"}</dd>
          <dt>Por que interessa</dt><dd>${hist("q5") || "—"}</dd>
        </dl></section>
      <section class="painel"><h3>Pirâmide Lógica</h3><div id="pir-visao"></div></section>
      <section><h3>Fases</h3><div class="fases-grade">${FASES.map((f) => {
        const es = vis.filter((e) => e.fase === f.id);
        const fe = es.filter((e) => p.feito[e.id]).length;
        return `<a class="fase-cartao" href="#/p/${p.id}/etapa/${es[0].id}"><b>${esc(f.nome)}</b><span>${esc(f.resumo)}</span><div class="barra"><i style="width:${(fe / es.length) * 100}%"></i></div></a>`;
      }).join("")}</div></section>`
    );
    desenharPiramide($("#pir-visao"), val(p, "p5", "piramide"), true);
  }

  /* --------------------------------- etapa --------------------------------- */
  function telaEtapa(p, e) {
    const vis = etapasVisiveis(p);
    const i = vis.indexOf(e);
    const ant = vis[i - 1];
    const prox = vis[i + 1];
    const fase = FASES.find((f) => f.id === e.fase);
    moldura(
      p,
      `<div class="cab-etapa">
        <small>${esc(fase.nome)}${e.passo ? ` · Passo ${e.passo}` : ""}</small>
        <h1>${esc(e.titulo)}</h1>
        <p class="fonte">${esc(e.fonte)}</p>
      </div>
      <div class="guia">
        <section class="bloco oque"><h3>O que fazer</h3><ul>${e.oque.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></section>
        <details class="bloco porque" ${e.campos.length ? "" : "open"}><summary>Por quê?</summary><p>${esc(e.porque)}</p></details>
        ${e.erros && e.erros.length ? `<details class="bloco erros"><summary>Armadilhas comuns</summary><ul>${e.erros.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></details>` : ""}
        ${e.id === "p11" ? diagramaTrasFrente() : ""}
      </div>
      <form class="form campos" id="campos" onsubmit="return false">${e.campos.map((c) => campoHTML(p, e, c)).join("")}</form>
      <div id="alertas"></div>
      <div class="rodape-etapa">
        ${ant ? `<a class="btn leve" href="#/p/${p.id}/etapa/${ant.id}">← ${esc(ant.titulo)}</a>` : "<span></span>"}
        <label class="concluir"><input type="checkbox" id="feito" ${p.feito[e.id] ? "checked" : ""}> Etapa concluída</label>
        ${prox ? `<a class="btn primario" id="prox" href="#/p/${p.id}/etapa/${prox.id}">${esc(prox.titulo)} →</a>` : `<a class="btn primario" href="#/p/${p.id}/documento">Ver documento →</a>`}
      </div>`,
      e.id
    );
    ligarCampos(p, e);
    $("#feito").onchange = (ev) => {
      p.feito[e.id] = ev.target.checked;
      salvar(true);
      const lk = $(`.etapa-link.ativa`);
      if (lk) lk.classList.toggle("feita", ev.target.checked);
    };
    atualizarAlertas(p, e);
  }

  function diagramaTrasFrente() {
    const ordem = ["Conclusões", "Resultados", "Métodos", "Discussão", "Objetivos", "Introdução", "Resumo", "Título"];
    return `<section class="bloco"><h3>Ordem de redação</h3><ol class="tras">${ordem
      .map((o, i) => `<li><span>${i + 1}</span>${o}</li>`)
      .join("")}</ol><p class="nota">Ordem de leitura do documento: Título → Resumo → Introdução → Métodos → Resultados → Discussão (→ Conclusões, em trabalhos acadêmicos).</p></section>`;
  }

  /* --------------------------------- campos -------------------------------- */
  function campoHTML(p, e, c) {
    const v = getValor(p, e, c);
    const id = `c-${c.id}`;
    const imp = c.importar && vazio(v) ? `<button type="button" class="link" data-importar="${c.id}">↧ Trazer do que já foi preenchido</button>` : "";
    const cab = `<div class="rotulo"><label for="${id}">${esc(c.rotulo)}</label>${imp}</div>`;
    switch (c.tipo) {
      case "text":
        return `<div class="campo">${cab}<input id="${id}" data-campo="${c.id}" value="${esc(v)}" placeholder="${esc(c.ph || "")}"></div>`;
      case "textarea":
        return `<div class="campo">${cab}<textarea id="${id}" data-campo="${c.id}" rows="${c.grande ? 14 : 4}" placeholder="${esc(c.ph || "")}">${esc(v)}</textarea><small class="contador" data-contador="${c.id}"></small></div>`;
      case "select":
        return `<div class="campo">${cab}<select id="${id}" data-campo="${c.id}"><option value="">— escolha —</option>${c.opcoes
          .map((o) => `<option ${v === o ? "selected" : ""}>${esc(o)}</option>`)
          .join("")}</select></div>`;
      case "list":
        return `<div class="campo">${cab}<div class="lista" data-lista="${c.id}">${(v || [])
          .map((x, i) => itemLista(c, x, i))
          .join("")}</div><button type="button" class="btn pequeno" data-add="${c.id}">+ Adicionar</button></div>`;
      case "checklist":
        return `<div class="campo">${cab}<div class="checklist">${c.itens
          .map((it, i) => `<label><input type="checkbox" data-check="${c.id}" data-i="${i}" ${(v || [])[i] ? "checked" : ""}> ${esc(it)}</label>`)
          .join("")}</div></div>`;
      case "objetivo":
        return construtorObjetivo(v || {});
      case "resultados":
        return `<div class="campo">${cab}${resultadosHTML(c, v || [])}</div>`;
      case "piramide":
        return `<div class="campo">${cab}${piramideEditor(v || { nos: [] })}</div>`;
      case "outline":
        return `<div class="campo">${cab}${outlineHTML(c, v || [])}</div>`;
      case "referencias":
        return `<div class="campo">${cab}<p class="nota">Uma referência por linha, no formato da norma adotada (ABNT NBR 6023 ou da revista). A lista será ordenada alfabeticamente no documento.</p><textarea data-campo="${c.id}" data-refs="1" rows="12">${esc((v || []).join("\n"))}</textarea></div>`;
      default:
        return "";
    }
  }
  const vazio = (v) => v == null || v === "" || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length);

  function itemLista(c, x, i) {
    return `<div class="item"><span class="num">${i + 1}</span><textarea rows="1" data-item="${c.id}" data-i="${i}" placeholder="${esc(c.ph || "")}">${esc(x)}</textarea>
      <span class="ops"><button type="button" class="icone" title="Subir" data-mover="${c.id}" data-i="${i}" data-d="-1">↑</button><button type="button" class="icone" title="Descer" data-mover="${c.id}" data-i="${i}" data-d="1">↓</button><button type="button" class="icone perigo" title="Remover" data-del="${c.id}" data-i="${i}">×</button></span></div>`;
  }

  function construtorObjetivo(o) {
    const t = TIPOS_LOGICOS[o.tipo];
    const rotA = o.tipo === "interferencia" ? "Variável independente (causa)" : o.tipo === "descritiva" ? "O que será descrito" : "Variável A";
    const rotB = o.tipo === "interferencia" ? "Variável dependente (efeito)" : "Variável B";
    return `<div class="campo objetivo">
      <div class="rotulo"><label>Tipo lógico da pesquisa</label></div>
      <div class="tipos-logicos">${Object.entries(TIPOS_LOGICOS)
        .map(
          ([k, tl]) => `<label class="tipo-logico ${o.tipo === k ? "on" : ""}"><input type="radio" name="tipoLogico" value="${k}" ${o.tipo === k ? "checked" : ""}><b>${tl.nome}</b><small>${esc(tl.explica)}</small></label>`
        )
        .join("")}</div>
      ${
        t
          ? `<div class="duas">
              <label>${rotA}<input data-obj="a" value="${esc(o.a)}"></label>
              ${o.tipo !== "descritiva" ? `<label>${rotB}<input data-obj="b" value="${esc(o.b)}"></label>` : "<span></span>"}
            </div>
            <label>Fenômeno / população teórica (opcional)<input data-obj="f" value="${esc(o.f)}" placeholder="Ex.: peixes; leitores iniciantes; textos argumentativos"></label>
            <div class="sugestao"><small>Sugestão gerada</small><p id="obj-sug">${esc(t.modelo(o.a, o.b, o.f))}</p><button type="button" class="btn pequeno" data-usar-sug>Usar sugestão</button></div>
            <label>Objetivo (texto final)<textarea data-obj="texto" rows="3">${esc(o.texto)}</textarea></label>`
          : `<p class="nota">Escolha o tipo lógico para montar o objetivo.</p>`
      }
    </div>`;
  }

  function resultadosHTML(c, lista) {
    const modo = c.modo;
    const itens = modo === "forca" ? lista.filter((r) => r.naHistoria !== false) : lista;
    if (modo === "forca" && !itens.length) return `<p class="vazio">Nenhum resultado marcado como parte da história no Passo 3.</p>`;
    return `<div class="resultados">${itens
      .map((r) => {
        if (modo === "forca")
          return `<div class="res forca-${r.forca || "nd"}"><p>${esc(r.texto)}</p>
            <div class="seg">${["forte", "fraca"]
              .map((f) => `<label><input type="radio" name="f-${r.id}" data-forca="${r.id}" value="${f}" ${r.forca === f ? "checked" : ""}> Sustentação ${f}</label>`)
              .join("")}</div></div>`;
        return `<div class="res ${r.naHistoria === false ? "fora" : ""}"><textarea rows="2" data-res="${r.id}" placeholder="Descreva o resultado. Ex.: Peixes sob luz vermelha buscaram o alimento mais rápido.">${esc(r.texto)}</textarea>
          <div class="seg"><label><input type="checkbox" data-hist="${r.id}" ${r.naHistoria !== false ? "checked" : ""}> Faz parte da história</label><button type="button" class="link perigo" data-resdel="${r.id}">remover</button></div></div>`;
      })
      .join("")}</div>${modo === "historia" ? `<button type="button" class="btn pequeno" data-resadd>+ Resultado</button>` : ""}`;
  }

  function outlineHTML(c, lista) {
    return `<div class="outline">${lista
      .map(
        (it, i) => `<div class="ol-item">
          <div class="ol-top"><span class="num">§${i + 1}</span><input data-ol="${i}" data-k="topico" value="${esc(it.topico)}" placeholder="Frase-tópico (afirmação)">
          <span class="ops"><button type="button" class="icone" data-olmover="${i}" data-d="-1">↑</button><button type="button" class="icone" data-olmover="${i}" data-d="1">↓</button><button type="button" class="icone perigo" data-oldel="${i}">×</button></span></div>
          ${c.soTopicos ? "" : `<textarea rows="5" data-ol="${i}" data-k="texto" placeholder="Parágrafo: comece pela frase-tópico e sustente-a com dados, exemplos ou literatura.">${esc(it.texto)}</textarea>`}
        </div>`
      )
      .join("")}</div><button type="button" class="btn pequeno" data-oladd>+ Parágrafo</button>
      ${c.soTopicos ? `<p class="nota">Aqui você planeja só as frases-tópico. Os parágrafos são redigidos na etapa seguinte.</p>` : ""}`;
  }

  /* ---- Pirâmide lógica ---- */
  const TIPO_NO = {
    original: "Resultado original",
    literatura: "Literatura da área",
    publico: "Domínio público",
    conclusao: "Conclusão",
  };
  function niveis(pir) {
    const nos = pir.nos || [];
    const mapa = Object.fromEntries(nos.map((n) => [n.id, n]));
    const memo = {};
    const nivel = (n, pilha = new Set()) => {
      if (memo[n.id] != null) return memo[n.id];
      if (n.tipo !== "conclusao" || !n.base || !n.base.length || pilha.has(n.id)) return (memo[n.id] = n.tipo === "conclusao" ? 1 : 0);
      pilha.add(n.id);
      const m = Math.max(...n.base.map((b) => (mapa[b] ? nivel(mapa[b], pilha) : 0)));
      return (memo[n.id] = m + 1);
    };
    nos.forEach((n) => nivel(n));
    return memo;
  }
  function piramideEditor(pir) {
    const nos = pir.nos || [];
    const ev = nos.filter((n) => n.tipo !== "conclusao");
    const co = nos.filter((n) => n.tipo === "conclusao");
    return `<div class="pir-diagrama" id="pir-diag"></div>
      <div class="pir-edit">
        <div><h4>Base: evidências</h4>
          ${ev
            .map(
              (n) => `<div class="no-edit"><select data-notipo="${n.id}">${["original", "literatura", "publico"]
                .map((t) => `<option value="${t}" ${n.tipo === t ? "selected" : ""}>${TIPO_NO[t]}</option>`)
                .join("")}</select><textarea rows="2" data-notexto="${n.id}">${esc(n.texto)}</textarea><button type="button" class="icone perigo" data-nodel="${n.id}">×</button></div>`
            )
            .join("")}
          <button type="button" class="btn pequeno" data-noadd="original">+ Evidência</button>
        </div>
        <div><h4>Conclusões</h4>
          ${co
            .map(
              (n) => `<div class="no-edit conc"><textarea rows="2" data-notexto="${n.id}" placeholder="Conclusão">${esc(n.texto)}</textarea><button type="button" class="icone perigo" data-nodel="${n.id}">×</button>
                <div class="base-sel"><small>Sustentada por:</small>${nos
                  .filter((o) => o.id !== n.id)
                  .map(
                    (o) => `<label title="${esc(o.texto)}"><input type="checkbox" data-base="${n.id}" value="${o.id}" ${(n.base || []).includes(o.id) ? "checked" : ""}> ${esc((o.texto || "(vazio)").slice(0, 50))}</label>`
                  )
                  .join("")}</div></div>`
            )
            .join("")}
          <button type="button" class="btn pequeno" data-noadd="conclusao">+ Conclusão</button>
        </div>
      </div>`;
  }

  function desenharPiramide(alvo, pir, compacto) {
    if (!alvo) return;
    const nos = (pir && pir.nos) || [];
    if (!nos.length) {
      alvo.innerHTML = `<p class="vazio">A pirâmide aparecerá aqui. Adicione evidências na base e conclusões que se apoiam nelas.</p>`;
      return;
    }
    const nv = niveis(pir);
    const max = Math.max(...Object.values(nv));
    let html = "";
    for (let l = max; l >= 0; l--) {
      const linha = nos.filter((n) => nv[n.id] === l);
      if (!linha.length) continue;
      html += `<div class="pir-linha" data-nivel="${l}">${linha
        .map((n) => `<div class="pir-no t-${n.tipo} ${l === max && n.tipo === "conclusao" ? "pir-topo" : ""}" data-no="${n.id}"><small>${TIPO_NO[n.tipo]}</small>${esc(n.texto || "…")}</div>`)
        .join("")}</div>`;
    }
    alvo.innerHTML = `<div class="pir-wrap ${compacto ? "compacto" : ""}"><svg class="pir-svg"></svg>${html}</div>`;
    requestAnimationFrame(() => linhas(alvo, nos));
  }
  function linhas(alvo, nos) {
    const wrap = alvo.querySelector(".pir-wrap");
    const svg = alvo.querySelector(".pir-svg");
    if (!wrap || !svg) return;
    const r0 = wrap.getBoundingClientRect();
    svg.setAttribute("width", r0.width);
    svg.setAttribute("height", r0.height);
    let d = "";
    nos.forEach((n) =>
      (n.base || []).forEach((b) => {
        const a = wrap.querySelector(`[data-no="${n.id}"]`);
        const c = wrap.querySelector(`[data-no="${b}"]`);
        if (!a || !c) return;
        const ra = a.getBoundingClientRect();
        const rc = c.getBoundingClientRect();
        const x1 = ra.left + ra.width / 2 - r0.left,
          y1 = ra.bottom - r0.top;
        const x2 = rc.left + rc.width / 2 - r0.left,
          y2 = rc.top - r0.top;
        d += `<path d="M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}"/>`;
      })
    );
    svg.innerHTML = d;
  }

  /* -------------------------- eventos dos campos -------------------------- */
  function ligarCampos(p, e) {
    const form = $("#campos");
    const campo = (id) => e.campos.find((c) => c.id === id);
    const rerender = () => {
      const y = window.scrollY;
      telaEtapa(p, e);
      window.scrollTo(0, y);
    };
    const contadores = () =>
      form.querySelectorAll("[data-contador]").forEach((s) => {
        const t = form.querySelector(`[data-campo="${s.dataset.contador}"]`);
        s.textContent = t && t.value ? `${V.contarPalavras(t.value)} palavras` : "";
      });
    contadores();

    // Pirâmide
    const pc = e.campos.find((c) => c.tipo === "piramide");
    if (pc) desenharPiramide($("#pir-diag"), getValor(p, e, pc));

    form.addEventListener("input", (ev) => {
      const t = ev.target;
      if (t.dataset.campo) {
        const c = campo(t.dataset.campo);
        setValor(p, e, c, t.dataset.refs ? t.value.split("\n").filter((l) => l.trim()) : t.value);
        contadores();
      } else if (t.dataset.item) {
        const c = campo(t.dataset.item);
        const l = getValor(p, e, c) || [];
        l[+t.dataset.i] = t.value;
        setValor(p, e, c, l);
        autoAltura(t);
      } else if (t.dataset.obj) {
        const c = e.campos.find((x) => x.tipo === "objetivo");
        const o = getValor(p, e, c) || {};
        o[t.dataset.obj] = t.value;
        setValor(p, e, c, o);
        const s = $("#obj-sug");
        if (s && TIPOS_LOGICOS[o.tipo]) s.textContent = TIPOS_LOGICOS[o.tipo].modelo(o.a, o.b, o.f);
      } else if (t.dataset.res) {
        const c = e.campos.find((x) => x.tipo === "resultados");
        const l = getValor(p, e, c) || [];
        const r = l.find((x) => x.id === t.dataset.res);
        if (r) r.texto = t.value;
        setValor(p, e, c, l);
      } else if (t.dataset.ol) {
        const c = e.campos.find((x) => x.tipo === "outline");
        const l = getValor(p, e, c) || [];
        l[+t.dataset.ol][t.dataset.k] = t.value;
        setValor(p, e, c, l);
      } else if (t.dataset.notexto) {
        const pir = getValor(p, e, pc);
        pir.nos.find((n) => n.id === t.dataset.notexto).texto = t.value;
        setValor(p, e, pc, pir);
        desenharPiramide($("#pir-diag"), pir);
      }
      agendarAlertas(p, e);
    });

    form.addEventListener("change", (ev) => {
      const t = ev.target;
      if (t.dataset.campo && t.tagName === "SELECT") setValor(p, e, campo(t.dataset.campo), t.value);
      else if (t.dataset.check) {
        const c = campo(t.dataset.check);
        const l = getValor(p, e, c) || [];
        l[+t.dataset.i] = t.checked;
        setValor(p, e, c, l);
      } else if (t.name === "tipoLogico") {
        const c = e.campos.find((x) => x.tipo === "objetivo");
        const o = getValor(p, e, c) || {};
        o.tipo = t.value;
        setValor(p, e, c, o);
        rerender();
      } else if (t.dataset.hist) {
        const c = e.campos.find((x) => x.tipo === "resultados");
        const l = getValor(p, e, c);
        l.find((x) => x.id === t.dataset.hist).naHistoria = t.checked;
        setValor(p, e, c, l);
        t.closest(".res").classList.toggle("fora", !t.checked);
      } else if (t.dataset.forca) {
        const c = e.campos.find((x) => x.tipo === "resultados");
        const l = getValor(p, e, c);
        l.find((x) => x.id === t.dataset.forca).forca = t.value;
        setValor(p, e, c, l);
        t.closest(".res").className = `res forca-${t.value}`;
      } else if (t.dataset.notipo) {
        const pir = getValor(p, e, pc);
        pir.nos.find((n) => n.id === t.dataset.notipo).tipo = t.value;
        setValor(p, e, pc, pir);
        desenharPiramide($("#pir-diag"), pir);
      } else if (t.dataset.base) {
        const pir = getValor(p, e, pc);
        const n = pir.nos.find((x) => x.id === t.dataset.base);
        n.base = n.base || [];
        if (t.checked) n.base.push(t.value);
        else n.base = n.base.filter((b) => b !== t.value);
        setValor(p, e, pc, pir);
        desenharPiramide($("#pir-diag"), pir);
      }
      agendarAlertas(p, e);
    });

    form.addEventListener("click", (ev) => {
      const t = ev.target.closest("button");
      if (!t) return;
      const d = t.dataset;
      if (d.add) {
        const c = campo(d.add);
        const l = getValor(p, e, c) || [];
        l.push("");
        setValor(p, e, c, l);
        rerender();
        const itens = form.querySelectorAll(`[data-item="${d.add}"]`);
        if (itens.length) itens[itens.length - 1].focus();
      } else if (d.del) {
        const c = campo(d.del);
        const l = getValor(p, e, c);
        l.splice(+d.i, 1);
        setValor(p, e, c, l);
        rerender();
      } else if (d.mover) {
        const c = campo(d.mover);
        const l = getValor(p, e, c);
        const i = +d.i,
          j = i + +d.d;
        if (j < 0 || j >= l.length) return;
        [l[i], l[j]] = [l[j], l[i]];
        setValor(p, e, c, l);
        rerender();
      } else if (d.usarSug !== undefined) {
        const c = e.campos.find((x) => x.tipo === "objetivo");
        const o = getValor(p, e, c);
        o.texto = TIPOS_LOGICOS[o.tipo].modelo(o.a, o.b, o.f);
        setValor(p, e, c, o);
        rerender();
      } else if (d.resadd !== undefined) {
        const c = e.campos.find((x) => x.tipo === "resultados");
        const l = getValor(p, e, c) || [];
        l.push({ id: uid(), texto: "", naHistoria: true });
        setValor(p, e, c, l);
        rerender();
      } else if (d.resdel) {
        const c = e.campos.find((x) => x.tipo === "resultados");
        setValor(p, e, c, getValor(p, e, c).filter((r) => r.id !== d.resdel));
        rerender();
      } else if (d.oladd !== undefined) {
        const c = e.campos.find((x) => x.tipo === "outline");
        const l = getValor(p, e, c) || [];
        l.push({ topico: "", texto: "" });
        setValor(p, e, c, l);
        rerender();
      } else if (d.oldel) {
        const c = e.campos.find((x) => x.tipo === "outline");
        const l = getValor(p, e, c);
        if ((l[+d.oldel].texto || "").trim() && !confirm("Remover este parágrafo e seu texto?")) return;
        l.splice(+d.oldel, 1);
        setValor(p, e, c, l);
        rerender();
      } else if (d.olmover) {
        const c = e.campos.find((x) => x.tipo === "outline");
        const l = getValor(p, e, c);
        const i = +d.olmover,
          j = i + +d.d;
        if (j < 0 || j >= l.length) return;
        [l[i], l[j]] = [l[j], l[i]];
        setValor(p, e, c, l);
        rerender();
      } else if (d.noadd) {
        const pir = getValor(p, e, pc) || { nos: [] };
        pir.nos.push({ id: uid(), tipo: d.noadd, texto: "", base: [] });
        setValor(p, e, pc, pir);
        rerender();
      } else if (d.nodel) {
        const pir = getValor(p, e, pc);
        pir.nos = pir.nos.filter((n) => n.id !== d.nodel);
        pir.nos.forEach((n) => n.base && (n.base = n.base.filter((b) => b !== d.nodel)));
        setValor(p, e, pc, pir);
        rerender();
      } else if (d.importar) {
        const c = campo(d.importar);
        setValor(p, e, c, valorImportado(p, c));
        rerender();
      }
    });
    form.querySelectorAll("textarea[data-item]").forEach(autoAltura);
  }
  function autoAltura(t) {
    t.style.height = "auto";
    t.style.height = t.scrollHeight + 2 + "px";
  }

  function valorImportado(p, c) {
    if (c.importar === "resultados-historia") {
      return (val(p, "p3", "resultados") || [])
        .filter((r) => r.naHistoria !== false && r.texto)
        .sort((a, b) => (a.forca === "forte" ? -1 : 0) - (b.forca === "forte" ? -1 : 0))
        .map((r) => r.texto + (r.forca ? ` [${r.forca}]` : ""));
    }
    const [eid, cid] = c.importar.split(".");
    const v = val(p, eid, cid);
    if (v && typeof v === "object" && !Array.isArray(v)) return v.texto || "";
    return v || "";
  }

  /* ------------------------------- alertas -------------------------------- */
  let tAlert;
  function agendarAlertas(p, e) {
    clearTimeout(tAlert);
    tAlert = setTimeout(() => atualizarAlertas(p, e), 600);
  }
  function alertasDaEtapa(p, e) {
    const out = [];
    const tl = (val(p, "pr-tipo", "objetivo") || {}).tipo;
    if (e.id === "pr-tipo") {
      const o = val(p, "pr-tipo", "objetivo") || {};
      out.push(...V.objetivo(o.texto, o.tipo));
    }
    (e.checar || []).forEach((k) => {
      if (k === "estilo")
        e.campos.forEach((c) => {
          const v = getValor(p, e, c);
          if (typeof v === "string") out.push(...V.estilo(v));
          if (Array.isArray(v) && c.tipo === "outline") v.forEach((it) => out.push(...V.estilo(it.texto || "")));
        });
      if (k === "conclusoes") out.push(...V.conclusoes(val(p, "p13", "conclusoes")));
      if (k === "objetivo") out.push(...V.objetivo(val(p, "p24", "objetivo"), tl));
      if (k === "titulo") out.push(...V.titulo(val(p, "p30", "titulo")));
      if (k === "resumo") out.push(...V.resumo(val(p, "p28", "resumo"), p.meta.tipo).filter((a) => a.regra !== "Voz passiva" && a.regra !== "Impessoalidade"));
      if (k === "documento") verificarTudo(p).forEach((g) => g.alertas.forEach((a) => out.push({ ...a, regra: `${g.secao}: ${a.regra}` })));
    });
    if (e.id === "p5") out.push(...checarPiramide(val(p, "p5", "piramide")));
    return out;
  }
  function checarPiramide(pir) {
    const a = [];
    const nos = (pir && pir.nos) || [];
    nos
      .filter((n) => n.tipo === "conclusao" && !(n.base || []).length)
      .forEach((n) => a.push({ nivel: "aviso", regra: "Conclusão sem sustentação", trecho: (n.texto || "").slice(0, 60), dica: "Indique em quais evidências ou conclusões ela se apoia." }));
    const tops = nos.filter((n) => n.tipo === "conclusao" && !nos.some((o) => (o.base || []).includes(n.id)));
    if (tops.length > 1) a.push({ nivel: "info", regra: "Mais de um topo", trecho: `${tops.length} conclusões no topo`, dica: "Existe uma conclusão mais geral que englobe as demais? Ela será o eixo do texto." });
    if (nos.length && !nos.some((n) => n.tipo === "original")) a.push({ nivel: "aviso", regra: "Sem dados originais", trecho: "—", dica: "A pirâmide precisa de seus resultados na base." });
    return a;
  }
  function alertasHTML(lista) {
    if (!lista.length) return "";
    return `<section class="alertas"><h3>Verificador lógico <small>${lista.length} ponto(s) para avaliar</small></h3>${lista
      .map((a) => `<div class="alerta ${a.nivel}"><b>${esc(a.regra)}</b> <code>${esc(a.trecho)}</code><p>${esc(a.dica)}</p></div>`)
      .join("")}<p class="nota">Alertas automáticos são sugestões: decida com base na lógica do seu argumento.</p></section>`;
  }
  function atualizarAlertas(p, e) {
    const el = $("#alertas");
    if (el) el.innerHTML = alertasHTML(alertasDaEtapa(p, e));
  }

  /* ------------------------------ documento ------------------------------- */
  function montarDocumento(p) {
    const acad = TIPOS_TRABALHO[p.meta.tipo].academico;
    const ordem = ESTRUTURA_DOC[acad ? "academico" : "artigo"];
    const paras = (l) => (l || []).map((x) => (x.texto && x.texto.trim() ? x.texto : x.topico)).filter((x) => x && x.trim());
    const s = {};
    s.titulo = val(p, "p30", "titulo") || p.meta.titulo || "";
    s.resumo = { texto: val(p, "p28", "resumo") || "", palavras: val(p, "p28", "palavras") || "", abstract: val(p, "p28", "abstract") || "" };
    const intro = paras(val(p, "p25", "outline"));
    const obj = val(p, "p24", "objetivo") || (val(p, "pr-tipo", "objetivo") || {}).texto;
    s.introducao = obj ? intro.concat([obj]) : intro;
    s.metodos = [
      ["Sujeito do estudo", val(p, "p18", "sujeito")],
      ["Delineamento", val(p, "p18", "estrategia")],
      ["Procedimentos", val(p, "p18", "procedimentos")],
      ["Análise dos dados", val(p, "p18", "analise")],
    ].filter(([, t]) => t && t.trim());
    s.resultados = { texto: val(p, "p17", "texto") || "", legendas: (val(p, "p16", "legendas") || []).filter(Boolean) };
    s.discussao = paras(val(p, "p19", "outline"));
    s.conclusoes = (val(p, "p13", "conclusoes") || []).filter(Boolean);
    s.referencias = [...(val(p, "p27", "refs") || [])].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const nomes = { introducao: "Introdução", metodos: acad ? "Material e métodos" : "Métodos", resultados: "Resultados", discussao: "Discussão", conclusoes: "Conclusões", referencias: "Referências", resumo: "Resumo" };
    return { ordem, s, nomes, acad };
  }

  function docHTML(p, paraWord) {
    const { ordem, s, nomes, acad } = montarDocumento(p);
    let n = 0;
    const paragrafos = (t) =>
      String(t || "")
        .split(/\n\s*\n|\n/)
        .filter((x) => x.trim())
        .map((x) => `<p>${esc(x)}</p>`)
        .join("");
    const h = (k) => (acad && k !== "resumo" && k !== "referencias" ? `${++n} ${nomes[k].toUpperCase()}` : nomes[k]);
    const falta = (k) => (paraWord ? "" : `<p class="falta">[${nomes[k]} ainda não redigido(a)]</p>`);
    let out = "";
    ordem.forEach((k) => {
      if (k === "titulo") {
        out += `<h1 class="doc-titulo">${esc(s.titulo || "[Título]")}</h1>`;
        if (p.meta.autor) out += `<p class="doc-autor">${esc(p.meta.autor)}</p>`;
        if (acad && (p.meta.orientador || p.meta.instituicao))
          out += `<p class="doc-autor">${esc([p.meta.orientador && "Orientação: " + p.meta.orientador, p.meta.instituicao].filter(Boolean).join(" · "))}</p>`;
      } else if (k === "resumo") {
        out += `<h2>${h(k)}</h2>` + (s.resumo.texto ? paragrafos(s.resumo.texto) : falta(k));
        if (s.resumo.palavras) out += `<p><b>Palavras-chave:</b> ${esc(s.resumo.palavras)}</p>`;
        if (s.resumo.abstract) out += `<h2>Abstract</h2>${paragrafos(s.resumo.abstract)}`;
      } else if (k === "metodos") {
        out += `<h2>${h(k)}</h2>`;
        out += s.metodos.length ? s.metodos.map(([sub, t]) => `<h3>${esc(sub)}</h3>${paragrafos(t)}`).join("") : falta(k);
      } else if (k === "resultados") {
        out += `<h2>${h(k)}</h2>` + (s.resultados.texto ? paragrafos(s.resultados.texto) : falta(k));
        s.resultados.legendas.forEach((l) => (out += `<p class="legenda">${esc(l)}</p>`));
      } else if (k === "conclusoes") {
        out += `<h2>${h(k)}</h2>` + (s.conclusoes.length ? s.conclusoes.map((c) => `<p>${esc(c)}</p>`).join("") : falta(k));
      } else if (k === "referencias") {
        out += `<h2>${h(k)}</h2>` + (s.referencias.length ? s.referencias.map((r) => `<p class="ref">${esc(r)}</p>`).join("") : falta(k));
      } else {
        const l = s[k];
        out += `<h2>${h(k)}</h2>` + (l.length ? l.map((x) => paragrafos(x)).join("") : falta(k));
      }
    });
    return out;
  }

  function docMarkdown(p) {
    const { ordem, s, nomes } = montarDocumento(p);
    let md = "";
    ordem.forEach((k) => {
      if (k === "titulo") md += `# ${s.titulo}\n\n${p.meta.autor ? p.meta.autor + "\n\n" : ""}`;
      else if (k === "resumo") md += `## Resumo\n\n${s.resumo.texto}\n\n${s.resumo.palavras ? "**Palavras-chave:** " + s.resumo.palavras + "\n\n" : ""}${s.resumo.abstract ? "## Abstract\n\n" + s.resumo.abstract + "\n\n" : ""}`;
      else if (k === "metodos") md += `## ${nomes[k]}\n\n` + s.metodos.map(([a, t]) => `### ${a}\n\n${t}\n\n`).join("");
      else if (k === "resultados") md += `## Resultados\n\n${s.resultados.texto}\n\n` + s.resultados.legendas.map((l) => `*${l}*\n\n`).join("");
      else if (k === "conclusoes") md += `## Conclusões\n\n` + s.conclusoes.map((c, i) => `${i + 1}. ${c}`).join("\n") + "\n\n";
      else if (k === "referencias") md += `## Referências\n\n` + s.referencias.join("\n\n") + "\n";
      else md += `## ${nomes[k]}\n\n` + s[k].join("\n\n") + "\n\n";
    });
    return md;
  }

  function telaDocumento(p) {
    moldura(
      p,
      `<div class="doc-barra"><h1>Documento final</h1>
        <div class="botoes">
          <button class="btn primario" data-exp="doc">Baixar para Word (.doc)</button>
          <button class="btn" data-exp="md">Markdown (.md)</button>
          <button class="btn" data-exp="print">Imprimir / PDF</button>
          <button class="btn leve" data-exp="json">Backup (.json)</button>
        </div></div>
      <p class="nota">O documento é montado automaticamente, na ordem de leitura, a partir do que você redigiu nas etapas (que seguiram a ordem lógica, de trás para frente). Edite o conteúdo nas etapas correspondentes. Ao abrir no Word, aplique o modelo/normas da sua instituição ou revista.</p>
      <article class="documento" id="documento">${docHTML(p)}</article>`
    );
    app.querySelectorAll("[data-exp]").forEach(
      (b) =>
        (b.onclick = () => {
          const t = b.dataset.exp;
          if (t === "print") return window.print();
          if (t === "json") return baixar(nomeArquivo(p) + ".json", JSON.stringify(p, null, 2), "application/json");
          if (t === "md") return baixar(nomeArquivo(p) + ".md", docMarkdown(p), "text/markdown;charset=utf-8");
          const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(p.meta.titulo)}</title>
            <style>body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.5}h1{font-size:14pt;text-align:center}h2{font-size:12pt;text-transform:none;margin-top:18pt}h3{font-size:12pt;font-weight:normal;font-style:italic}p{text-align:justify;text-indent:1.25cm;margin:0 0 6pt}.doc-autor{text-align:center;text-indent:0}.ref{text-indent:0;text-align:left}.legenda{font-size:10pt;text-indent:0}</style></head><body>${docHTML(p, true)}</body></html>`;
          baixar(nomeArquivo(p) + ".doc", "﻿" + html, "application/msword");
        })
    );
  }

  /* ------------------------------ verificador ------------------------------ */
  function verificarTudo(p) {
    const tl = (val(p, "pr-tipo", "objetivo") || {}).tipo;
    const g = [];
    const add = (secao, etapa, alertas) => alertas.length && g.push({ secao, etapa, alertas });
    add("Título", "p30", V.titulo(val(p, "p30", "titulo") || p.meta.titulo));
    add("Resumo", "p28", V.resumo(val(p, "p28", "resumo"), p.meta.tipo));
    add("Objetivo", "p24", V.objetivo(val(p, "p24", "objetivo") || (val(p, "pr-tipo", "objetivo") || {}).texto, tl));
    add("Conclusões", "p13", V.conclusoes(val(p, "p13", "conclusoes")));
    add("Introdução", "p26", (val(p, "p25", "outline") || []).flatMap((x) => V.estilo(x.texto || "")));
    add("Métodos", "p18", ["sujeito", "estrategia", "procedimentos", "analise"].flatMap((k) => V.estilo(val(p, "p18", k) || "")));
    add("Resultados", "p17", V.estilo(val(p, "p17", "texto")));
    add("Discussão", "p23", (val(p, "p19", "outline") || []).flatMap((x) => V.estilo(x.texto || "")));
    add("Pirâmide Lógica", "p5", checarPiramide(val(p, "p5", "piramide")));
    return g;
  }
  function telaVerificar(p) {
    const g = verificarTudo(p);
    const total = g.reduce((s, x) => s + x.alertas.length, 0);
    moldura(
      p,
      `<h1>Verificador lógico e de estilo</h1>
      <p class="nota">Varre o texto em busca de pontos que contrariam princípios do Método Lógico: voz passiva e impessoalidade, excesso de palavras, frases longas, referências ambíguas, objetivo incoerente com o tipo lógico, conclusões no passado, título descritivo ou com foco na amostra, e pirâmide sem sustentação. É uma ajuda heurística — a decisão é sua.</p>
      ${
        total
          ? g
              .map(
                (x) => `<section class="painel"><h3>${esc(x.secao)} <small>${x.alertas.length}</small> <a class="link" href="#/p/${p.id}/etapa/${x.etapa}">editar →</a></h3>${x.alertas
                  .map((a) => `<div class="alerta ${a.nivel}"><b>${esc(a.regra)}</b> <code>${esc(a.trecho)}</code><p>${esc(a.dica)}</p></div>`)
                  .join("")}</section>`
              )
              .join("")
          : `<div class="destaque ok"><b>Nenhum alerta encontrado.</b> Lembre-se: o verificador não substitui a revisão crítica (Passos 31–33).</div>`
      }`
    );
  }

  window.addEventListener("resize", () => {
    const d = $("#pir-diag") || $("#pir-visao");
    if (d && store.atual) {
      const p = store.projetos[store.atual];
      desenharPiramide(d, val(p, "p5", "piramide"), d.id === "pir-visao");
    }
  });

  rota();
})();
