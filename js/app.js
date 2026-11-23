/* Assistente de Pesquisa — Método Lógico (Volpato)
 * Aplicação 100% local: os dados ficam no navegador (localStorage)
 * e podem ser exportados/importados como arquivo .json.
 */
(function () {
  const { TIPOS_TRABALHO, TIPOS_LOGICOS, FASES, ETAPAS, ESTRUTURA_DOC } = window.METODO;
  const V = window.VERIFICADOR;
  const AU = window.AULAS;
  const PL = window.PLANEJADOR;
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
      } catch (e) {
        /* sem armazenamento local (janela privada, prévia): segue só na conta, se houver */
      }
      marcarSalvo();
      nuvem.agendar();
    };
    imediato ? f() : (timer = setTimeout(f, 400));
  }
  function marcarSalvo() {
    const el = $("#salvo");
    if (el) {
      el.textContent = (nuvem.ativo ? "Salvo na sua conta " : "Salvo neste navegador ") + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
  }

  /* ------------------------- armazenamento na conta ------------------------- */
  /* No visualizador de artefatos, cada pessoa guarda seus trabalhos numa área
   * privada do banco do artefato (data/users/<id>/…): só ela os vê. Um
   * documento por trabalho (dados gerais) e um por etapa (dados da etapa).
   * Fora do visualizador, tudo fica só no navegador. */
  const nuvem = {
    ativo: false,
    db: null,
    uid: null,
    ultimo: {}, // pid -> { chave: json já enviado }
    rodando: false,
    pendente: false,
    timer: null,
    async iniciar() {
      const [db, user] = await Promise.all([usar("db"), usar("user")]);
      if (!db || !user) return;
      let id = null;
      try {
        id = await user.id();
      } catch (e) {}
      if (!id) return;
      this.db = db;
      this.uid = id;
      let mudou = false;
      try {
        const snap = await db.collection(`data/users/${id}`).get();
        for (const d of snap.docs) {
          const meta = d.data();
          if (!meta || !meta.meta) continue;
          const local = store.projetos[d.id];
          const etapas = await db.doc(`data/users/${id}/${d.id}`).collection("etapas").get();
          const dados = {};
          const ult = { __meta: JSON.stringify(meta) };
          etapas.docs.forEach((e) => {
            const v = e.data();
            if (v) {
              dados[e.id] = v.dados || {};
              ult[e.id] = JSON.stringify(v.dados || {});
            }
          });
          if (!local || (meta.atualizado || 0) >= (local.atualizado || 0)) {
            store.projetos[d.id] = JSON.parse(JSON.stringify({ ...meta, dados }));
            this.ultimo[d.id] = ult;
            mudou = true;
          }
        }
      } catch (e) {
        return; // sem acesso à conta nesta visita: continua no navegador
      }
      this.ativo = true;
      if (mudou) {
        try {
          localStorage.setItem(CHAVE, JSON.stringify(store));
        } catch (e) {}
        const foco = document.activeElement;
        if (!foco || !/INPUT|TEXTAREA|SELECT/.test(foco.tagName)) rota();
      }
      marcarSalvo();
      this.agendar();
    },
    marcarTudo(p) {
      delete this.ultimo[p.id];
    },
    agendar() {
      if (!this.ativo) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.enviar(), 1200);
    },
    async enviar() {
      if (this.rodando) {
        this.pendente = true;
        return;
      }
      this.rodando = true;
      try {
        for (const p of Object.values(store.projetos)) {
          const ult = (this.ultimo[p.id] = this.ultimo[p.id] || {});
          const base = `data/users/${this.uid}/${p.id}`;
          const meta = { id: p.id, criado: p.criado, atualizado: p.atualizado || Date.now(), meta: p.meta, feito: p.feito || {} };
          const jm = JSON.stringify(meta);
          if (ult.__meta !== jm) {
            await this.db.doc(base).set(meta);
            ult.__meta = jm;
          }
          for (const [eid, dados] of Object.entries(p.dados || {})) {
            const j = JSON.stringify(dados);
            if (ult[eid] === j) continue;
            try {
              await this.db.doc(base).collection("etapas").doc(eid).set({ dados });
              ult[eid] = j;
            } catch (e) {
              if (e && e.code === "invalid_argument") aviso("Uma etapa ficou grande demais para salvar na conta. Exporte um backup (.json).");
              else throw e;
            }
          }
        }
      } catch (e) {
        if (e && (e.code === "revoked" || e.code === "not_granted")) this.ativo = false;
        else if (e && e.code === "quota_exceeded") aviso("O espaço de armazenamento está cheio. Exporte um backup e exclua trabalhos antigos.");
      } finally {
        this.rodando = false;
        if (this.pendente) {
          this.pendente = false;
          this.agendar();
        }
      }
    },
    async apagar(p) {
      if (!this.ativo) return;
      delete this.ultimo[p.id];
      const base = `data/users/${this.uid}/${p.id}`;
      try {
        const et = await this.db.doc(base).collection("etapas").get();
        for (const d of et.docs) await this.db.doc(base).collection("etapas").doc(d.id).delete();
        await this.db.doc(base).delete();
      } catch (e) {}
    },
  };

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

  function confirma(msg) {
    return new Promise((res) => {
      const fundo = document.createElement("div");
      fundo.className = "dialogo-fundo";
      fundo.innerHTML = `<div class="dialogo" role="dialog" aria-modal="true"><p></p><div class="botoes"><button type="button" class="btn" data-r="0">Cancelar</button><button type="button" class="btn primario" data-r="1">Confirmar</button></div></div>`;
      fundo.querySelector("p").textContent = msg;
      document.body.appendChild(fundo);
      fundo.querySelector("[data-r='1']").focus();
      fundo.addEventListener("click", (ev) => {
        const b = ev.target.closest("[data-r]");
        if (!b && ev.target !== fundo) return;
        fundo.remove();
        res(!!b && b.dataset.r === "1");
      });
    });
  }

  /* Recursos do visualizador de artefatos (claude.ai), quando existirem. */
  const EM_ARTEFATO = !!(window.claude && typeof window.claude.use === "function");
  const usar = (nome) => (EM_ARTEFATO ? Promise.resolve(window.claude.use(nome)).catch(() => null) : Promise.resolve(null));

  async function baixar(nome, conteudo, tipo) {
    const dl = await usar("downloads");
    if (dl) {
      try {
        await dl.save({ filename: nome, data: conteudo instanceof Blob ? conteudo : new Blob([conteudo], { type: tipo }) });
      } catch (e) {
        if (!e || e.code !== "declined") aviso("Não foi possível salvar o arquivo aqui.");
      }
      return;
    }
    const blob = conteudo instanceof Blob ? conteudo : new Blob([conteudo], { type: tipo });
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
    const h = rotaAtual.replace(/^#\/?/, "").split("/");
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
  let rotaAtual = EM_ARTEFATO ? "#/" : location.hash || "#/";
  function ir(h) {
    rotaAtual = h;
    if (!EM_ARTEFATO && location.hash !== h) {
      location.hash = h; // o hashchange chama rota()
      return;
    }
    rota();
  }
  if (!EM_ARTEFATO)
    window.addEventListener("hashchange", () => {
      rotaAtual = location.hash || "#/";
      rota();
    });
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest('a[href^="#/"]');
    if (!a || ev.button !== 0 || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    ir(a.getAttribute("href"));
  });

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
        (b.onclick = async () => {
          const p = store.projetos[b.dataset.apagar];
          if (await confirma(`Excluir “${p.meta.titulo || "Sem título"}”? Esta ação não pode ser desfeita.`)) {
            delete store.projetos[p.id];
            salvar(true);
            nuvem.apagar(p);
            telaInicio();
          }
        })
    );
  }

  function importar(ev) {
    const f = ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      try {
        const p = JSON.parse(r.result);
        if (!p.meta || !p.dados) throw new Error();
        if (store.projetos[p.id] && !(await confirma("Já existe um trabalho com este identificador. Substituir?"))) p.id = uid();
        nuvem.marcarTudo(p);
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
    const cab = `<div class="rotulo"><label for="${id}">${esc(c.rotulo)}</label>${imp}</div>${c.ajuda ? `<ul class="ajuda">${c.ajuda.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}`;
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
      case "delineamento":
        return `<div class="campo">${cab}${delineamentoHTML(p, v)}</div>`;
      case "teste":
        return `<div class="campo">${cab}${testeHTML(p, v || {})}</div>`;
      case "grafico":
        return `<div class="campo">${cab}${graficoHTML(p, v || {})}</div>`;
      case "planejador":
        return `<div class="campo">${planejadorHTML(p)}</div>`;
      case "fundamentacao":
        return `<div class="campo">${cab}${fundamentacaoHTML(p)}</div>`;
      case "resumo7":
        return `<div class="campo">${cab}${resumo7HTML(v || {})}</div>`;
      case "modelos-titulo":
        return `<div class="campo">${cab}${modelosTituloHTML(p)}</div>`;
      case "nota-qualificacao":
        return `<div class="campo">${cab}<textarea id="${id}" data-campo="${c.id}" rows="5">${esc(v)}</textarea><button type="button" class="btn pequeno" data-gerar-nota>Gerar a partir das marcações acima</button></div>`;
      case "declaracao-ia":
        return `<div class="campo">${cab}${declaracaoIAHTML(v || {})}</div>`;
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
            ${o.tipo === "interferencia" ? `<label>Direção do efeito esperado<input data-obj="direcao" value="${esc(o.direcao)}" placeholder="Ex.: reduzindo a taxa de respostas corretas"></label>` : ""}
            <label>Fenômeno / população teórica (opcional)<input data-obj="f" value="${esc(o.f)}" placeholder="Ex.: peixes; leitores iniciantes; textos argumentativos"></label>
            <div class="sugestao"><small>Sugestão gerada</small><p id="obj-sug">${esc(t.modelo(o.a, o.b, o.f))}</p><button type="button" class="btn pequeno" data-usar-sug>Usar sugestão</button>
              ${o.tipo !== "descritiva" ? `<small>Hipótese sugerida</small><p id="hip-sug">${esc(hipoteseSugerida(o))}</p><button type="button" class="btn pequeno" data-usar-hip>Usar como hipótese</button>` : ""}</div>
            <label>Objetivo (texto final)<textarea data-obj="texto" rows="3">${esc(o.texto)}</textarea></label>`
          : `<p class="nota">Escolha o tipo lógico para montar o objetivo.</p>`
      }
    </div>`;
  }

  function hipoteseSugerida(o) {
    const a = o.a || "[variável A]",
      b = o.b || "[variável B]";
    if (o.tipo === "interferencia") return `${a.charAt(0).toUpperCase() + a.slice(1)} interfere em ${b}${o.direcao ? ", " + o.direcao : ""}${o.f ? " em " + o.f : ""}.`;
    return `Há associação ${o.direcao || "positiva"} entre ${a} e ${b}${o.f ? " em " + o.f : ""}.`;
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
    const F = AU.FRASES[c.secao] || AU.FRASES.geral;
    const roteiro = AU.ROTEIROS[c.secao];
    const pendente = (it) => !((c.soTopicos ? it.topico : it.texto) || "").trim();
    const aberto = lista.findIndex(pendente);
    const ta = (i, k, rot, dica, rows, val) =>
      `<label class="ol-campo"><span>${rot}</span>${dica ? `<small>${esc(dica)}</small>` : ""}<textarea rows="${rows}" data-ol="${i}" data-k="${k}">${esc(val)}</textarea></label>`;
    return `<div class="outline">${lista
      .map(
        (it, i) => `<details class="ol-item" ${lista.length <= 2 || i === aberto ? "open" : ""}>
          <summary><span class="num">§${i + 1}</span><span class="ol-resumo">${esc(it.ideia || it.topico || it.item || "Novo parágrafo")}</span></summary>
          <div class="ol-corpo">
            <div class="ol-ops"><button type="button" class="icone" title="Subir" data-olmover="${i}" data-d="-1">↑</button><button type="button" class="icone" title="Descer" data-olmover="${i}" data-d="1">↓</button><button type="button" class="icone perigo" title="Remover" data-oldel="${i}">×</button></div>
            <div class="duas">
              <label class="ol-campo"><span>Ideia essencial</span><input data-ol="${i}" data-k="ideia" value="${esc(it.ideia)}" placeholder="palavra-chave: lacuna, relação com a teoria…"></label>
              <label class="ol-campo"><span>Item do outline (raciocínio)</span><input data-ol="${i}" data-k="item" value="${esc(it.item)}" placeholder="Mostrar que… / Demonstrar que…"></label>
            </div>
            ${ta(i, "topico", "Frase-tópico", F.topico, 2, it.topico)}
            ${
              c.soTopicos
                ? ""
                : `${ta(i, "sustentacao", "Frases de sustentação", F.sustentacao, 3, it.sustentacao)}
                   ${ta(i, "especificacao", "Frase de especificação", F.especificacao, 2, it.especificacao)}
                   ${ta(i, "transicao", "Frase de transição", F.transicao, 2, it.transicao)}
                   <div><button type="button" class="btn pequeno" data-olmontar="${i}">↧ Montar parágrafo com as frases acima</button></div>
                   ${ta(i, "texto", "Parágrafo final (revise a fluidez: retome termos-chave, use conectores só quando necessário)", "", 6, it.texto)}`
            }
          </div>
        </details>`
      )
      .join("")}</div>
      <div class="botoes"><button type="button" class="btn pequeno" data-oladd>+ Parágrafo</button>${
        roteiro ? `<button type="button" class="btn pequeno" data-olroteiro="${c.secao}">Carregar roteiro sugerido (${roteiro.length} itens)</button>` : ""
      }</div>
      ${c.soTopicos ? `<p class="nota">Aqui você planeja ideia, item e frase-tópico. As frases de sustentação, especificação e transição são redigidas na etapa seguinte.</p>` : ""}`;
  }

  /* ---- Auxiliares das aulas ---- */
  function tipoLogico(p) {
    return (val(p, "pr-tipo", "objetivo") || {}).tipo;
  }
  function delineamentoHTML(p, v) {
    const tl = tipoLogico(p);
    const d = AU.DELINEAMENTOS.find((x) => x.id === v);
    const e = estadoPlano(p);
    const motivo = (id) => PL.regraDe("modelo", id, e);
    return `<select data-campo-delin>${["<option value=''>— escolha —</option>"]
      .concat(
        AU.DELINEAMENTOS.map(
          (x) => `<option value="${x.id}" ${v === x.id ? "selected" : ""} ${motivo(x.id) && v !== x.id ? "disabled" : ""}>${esc(x.nome)}${motivo(x.id) ? " — incompatível" : ""}</option>`
        )
      )
      .join("")}</select>
      ${d ? `<p class="nota">${esc(d.usa)}</p>` : ""}
      ${v && motivo(v) ? `<p class="alerta aviso">${esc(motivo(v))}</p>` : ""}
      <p class="nota">Opções incompatíveis com o desenho da pesquisa aparecem desativadas. <a href="#/p/${p.id}/etapa/pr-desenho">Revisar o desenho</a></p>
      ${!tl ? `<p class="nota">Defina o tipo lógico na etapa “Variáveis, tipo lógico e objetivo” para ver quais modelos combinam.</p>` : ""}`;
  }
  function testeHTML(p, v0) {
    const e = estadoPlano(p);
    const der = PL.perguntaEstatistica(e);
    const v = { pergunta: v0.pergunta || der.pergunta, variavel: v0.variavel || e.variavel, grupos: v0.grupos || der.grupos };
    const perm = PL.perguntasPermitidas(e.tipo);
    const sel = (k, ops) =>
      `<select data-teste="${k}"><option value="">—</option>${ops
        .map(([a, b]) => {
          const m = k === "pergunta" ? perm[a] : null;
          return `<option value="${a}" ${v[k] === a ? "selected" : ""} ${m && v[k] !== a ? "disabled" : ""}>${esc(b)}${m ? " — incompatível" : ""}</option>`;
        })
        .join("")}</select>`;
    const avisoQuali = e.abordagem === "quali" ? `<p class="alerta info">Seu desenho é qualitativo: a análise indicada está no <a href="#/p/${p.id}/etapa/pr-desenho">Desenho da pesquisa</a>. Use este assistente só se houver quantificação.</p>` : "";
    const derivado = !v0.pergunta && der.pergunta ? `<p class="nota">Pré-preenchido a partir do desenho da pesquisa.</p>` : "";
    const rec = v.pergunta && v.variavel ? AU.recomendarTeste(v.pergunta, v.variavel, v.grupos || "2") : null;
    const mostraGrupos = v.pergunta === "comparar" && v.variavel && v.variavel !== "nominal";
    return `<div class="assistente">${avisoQuali}${derivado}
      <div class="tres">
        <label>Pergunta${sel("pergunta", [["descrever", "Descrever um grupo"], ["comparar", "Comparar grupos"], ["relacionar", "Relacionar duas variáveis"]])}</label>
        <label>Tipo da variável principal${sel("variavel", Object.entries(AU.VARIAVEIS).map(([k, x]) => [k, x.nome]))}</label>
        ${mostraGrupos ? `<label>Grupos${sel("grupos", [["2", "Dois grupos independentes"], ["pareado", "Mesmo grupo antes × depois"], ["3", "Três ou mais grupos"]])}</label>` : "<span></span>"}
      </div>
      ${v.variavel ? `<p class="nota"><b>${esc(AU.VARIAVEIS[v.variavel].nome)}</b> (ex.: ${esc(AU.VARIAVEIS[v.variavel].ex)}): ${esc(AU.VARIAVEIS[v.variavel].pode)}.</p>` : ""}
      ${
        rec
          ? `<div class="recomendacao"><dl>
              <dt>Análise</dt><dd>${esc(rec.teste)}</dd>
              <dt>Gráfico</dt><dd>${esc(rec.grafico)}</dd>
              <dt>Como relatar</dt><dd><code>${esc(rec.relato)}</code></dd>
              <dt>Na planilha</dt><dd><code>${esc(rec.planilha)}</code></dd></dl>
              <p class="nota">p &lt; 0,05 é uma convenção: indica que o resultado é improvável por acaso, não que é importante nem que está “provado”. p ≥ 0,05 não prova ausência de efeito.</p></div>`
          : ""
      }</div>`;
  }
  function graficoHTML(p, v) {
    const e = estadoPlano(p);
    const g = AU.GRAFICOS[v.objetivo];
    const m = (k) => PL.graficoPermitido(k, e);
    const ordenados = AU.OBJETIVOS_GRAFICO.slice().sort((a, b) => (m(a[0]) ? 1 : 0) - (m(b[0]) ? 1 : 0));
    return `<div class="assistente"><label>O que você quer mostrar?<select data-grafico><option value="">— escolha —</option>${ordenados
      .map(([k, n]) => `<option value="${k}" ${v.objetivo === k ? "selected" : ""} ${m(k) && v.objetivo !== k ? "disabled" : ""}>${esc(n)}${m(k) ? " — incompatível" : ""}</option>`)
      .join("")}</select></label>
      ${g ? `<div class="recomendacao"><b>${esc(g.nome)}</b><p>${esc(g.leitura)}</p><p class="nota">Exemplo: ${esc(g.ex)}</p></div>` : ""}
      ${v.objetivo && m(v.objetivo) ? `<p class="alerta aviso">${esc(m(v.objetivo))}</p>` : ""}
      ${e.abordagem ? `<p class="nota">As opções seguem o desenho da pesquisa (${{ quanti: "quantitativo", quali: "qualitativo", misto: "misto" }[e.abordagem]}).</p>` : ""}</div>`;
  }

  /* ---- Planejador do desenho ---- */
  function estadoPlano(p) {
    const plano = val(p, "pr-desenho", "plano") || {};
    const obj = val(p, "pr-tipo", "objetivo") || {};
    const teste = val(p, "p2", "teste") || {};
    return { ...plano, tipo: obj.tipo, modelo: val(p, "pr-delineamento", "modelo"), variavel: teste.variavel || plano.variavel };
  }
  function setResposta(p, pid, valor) {
    if (pid === "tipo") {
      const o = dadosEtapa(p, "pr-tipo");
      o.objetivo = { ...(o.objetivo || {}), tipo: valor || undefined };
    } else if (pid === "modelo") dadosEtapa(p, "pr-delineamento").modelo = valor || "";
    else if (pid === "variavel") {
      const d = dadosEtapa(p, "p2");
      d.teste = { ...(d.teste || {}), variavel: valor || "" };
    } else {
      const d = dadosEtapa(p, "pr-desenho");
      d.plano = { ...(d.plano || {}), [pid]: valor };
    }
  }
  function responder(p, pid, valor) {
    setResposta(p, pid, valor);
    return limparPlano(p);
  }
  function limparPlano(p) {
    const desfeitas = [];
    for (let i = 0; i < 12; i++) {
      const { invalidas } = PL.avaliar(estadoPlano(p));
      if (!invalidas.length) break;
      invalidas.forEach((x) => {
        desfeitas.push(x);
        if (x.pergunta === "tecnicas") setResposta(p, "tecnicas", (estadoPlano(p).tecnicas || []).filter((t) => t !== x.opcao));
        else setResposta(p, x.pergunta, "");
      });
    }
    p.atualizado = Date.now();
    salvar();
    return desfeitas;
  }
  let ultimasDesfeitas = [];
  function planejadorHTML(p) {
    if (PL.avaliar(estadoPlano(p)).invalidas.length) ultimasDesfeitas = ultimasDesfeitas.concat(limparPlano(p));
    const e = estadoPlano(p);
    const { visiveis, completo } = PL.avaliar(e);
    const total = PL.PERGUNTAS.filter((q) => !q.quando || q.quando(e)).length;
    const respondidas = visiveis.filter((q) => (q.multi ? (q.valor || []).length : q.valor)).length;
    const cards = visiveis
      .map((q, i) => {
        const marcado = (o) => (q.multi ? (q.valor || []).includes(o.id) : q.valor === o.id);
        const resp = q.multi ? (q.valor || []).length > 0 : !!q.valor;
        return `<section class="pl-pergunta ${resp ? "respondida" : "atual"}">
          <header><span class="pl-n">${i + 1}</span><div><h4>${esc(q.titulo)}</h4><small>${esc(q.ajuda)}</small></div>
          <span class="pl-cont">${q.possiveis} de ${q.opcoes.length} possíveis</span></header>
          <div class="pl-opcoes" role="${q.multi ? "group" : "radiogroup"}">${q.opcoes
            .map(
              (o) => `<button type="button" class="pl-op ${marcado(o) ? "on" : ""}" role="${q.multi ? "checkbox" : "radio"}" aria-checked="${marcado(o)}" ${o.motivo && !marcado(o) ? 'disabled aria-disabled="true"' : ""} data-pl-p="${q.id}" data-pl-o="${o.id}">
                <b>${esc(o.rotulo)}</b>${o.desc ? `<span>${esc(o.desc)}</span>` : ""}${o.motivo ? `<em>Incompatível: ${esc(o.motivo)}</em>` : ""}</button>`
            )
            .join("")}</div>
        </section>`;
      })
      .join("");
    const rec = PL.recomendar(e, AU, TIPOS_LOGICOS);
    const desf = ultimasDesfeitas.length
      ? `<div class="alerta aviso"><b>Escolhas desfeitas por incompatibilidade</b>${ultimasDesfeitas.map((x) => `<p>${esc(x.rotulo)}: ${esc(x.motivo)}</p>`).join("")}</div>`
      : "";
    ultimasDesfeitas = [];
    return `<div class="planejador">
      <div class="pl-topo"><div class="barra"><i style="width:${Math.round((respondidas / total) * 100)}%"></i></div><small>${respondidas} de ${total} respostas</small>
        ${respondidas ? `<button type="button" class="link" data-pl-reiniciar>Recomeçar</button>` : ""}</div>
      ${desf}
      <div class="pl-grade">
        <div class="pl-perguntas">${cards}</div>
        <aside class="pl-painel"><h4>Caminho da pesquisa até agora</h4>${
          rec.length ? rec.map((g) => `<div class="pl-rec"><b>${esc(g.titulo)}</b><ul>${g.itens.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("") : `<p class="vazio">As recomendações aparecem conforme você responde.</p>`
        }
        ${completo ? `<button type="button" class="btn primario pequeno" data-pl-levar>Levar sugestões para as etapas</button><p class="nota">Preenche só campos vazios: tipo lógico, delineamento, análise, suficiência da amostra e teste estatístico.</p>` : ""}
        </aside>
      </div></div>`;
  }
  function levarPlano(p) {
    const e = estadoPlano(p);
    const rec = PL.recomendar(e, AU, TIPOS_LOGICOS);
    const del = dadosEtapa(p, "pr-delineamento");
    const pega = (t) => (rec.find((g) => g.titulo === t) || { itens: [] }).itens.join("\n");
    const n = [];
    if (!(del.analise || "").trim() && pega("Análise")) {
      del.analise = pega("Análise");
      n.push("análise de dados");
    }
    if (!(del.suficiencia || "").trim() && pega("Amostra")) {
      del.suficiencia = pega("Amostra");
      n.push("amostra e suficiência");
    }
    if ((e.tecnicas || []).length && !(del.procedimentos || "").trim()) {
      const nomes = PL.PERGUNTAS.find((q) => q.id === "tecnicas").opcoes.filter((o) => e.tecnicas.includes(o.id)).map((o) => o.rotulo.toLowerCase());
      del.procedimentos = `Técnicas de elaboração dos dados: ${nomes.join(", ")}. Fonte: ${{ campo: "pesquisa de campo", laboratorio: "laboratório", documental: "documental/corpus" }[e.fonte] || "—"}.\n[Descreva instrumentos, protocolos e o passo a passo.]`;
      n.push("procedimentos");
    }
    const d2 = dadosEtapa(p, "p2");
    const der = PL.perguntaEstatistica(e);
    if (der.pergunta && !(d2.teste || {}).pergunta) {
      d2.teste = { ...(d2.teste || {}), ...der };
      n.push("teste estatístico");
    }
    p.atualizado = Date.now();
    salvar();
    aviso(n.length ? "Preenchido: " + n.join(", ") + "." : "Os campos dessas etapas já estavam preenchidos.");
  }
  function fundamentacaoHTML(p) {
    const tl = tipoLogico(p);
    if (!tl) return `<p class="vazio">Defina o tipo lógico da pesquisa (etapa “Variáveis, tipo lógico e objetivo”) para ver o que a fundamentação precisa mostrar.</p>`;
    return `<div class="recomendacao"><b>${esc(METODO.TIPOS_LOGICOS[tl].nome)}</b><ul>${AU.FUNDAMENTACAO[tl].map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <p class="nota">A hipótese não é um item separado: entra como consequência da fundamentação, junto ao objetivo.</p></div>`;
  }
  function resumo7HTML(v) {
    return `<div class="resumo7">${AU.RESUMO_MOVIMENTOS.map(
      ([k, n, d]) => `<label class="ol-campo"><span>${n}</span><small>${esc(d)}</small><textarea rows="2" data-r7="${k}">${esc(v[k])}</textarea></label>`
    ).join("")}<button type="button" class="btn pequeno" data-r7montar>↧ Montar resumo com os movimentos</button></div>`;
  }
  function modelosTituloHTML(p) {
    const acad = TIPOS_TRABALHO[p.meta.tipo].academico;
    return `<div class="tabela-rolavel"><table class="modelos"><thead><tr><th>Modelo</th><th>Estrutura</th><th>Exemplo</th></tr></thead><tbody>${AU.TITULO_MODELOS.map(
      ([m, e, x]) => `<tr><td>${esc(m)}</td><td>${esc(e)}</td><td>${esc(x)}</td></tr>`
    ).join("")}</tbody></table></div>
    <p class="nota">${acad ? "Em teses e dissertações, prefira estes modelos: preciso, enxuto, sem adornos, refletindo a contribuição final." : "Em artigos, Volpato recomenda expor a principal novidade (a conclusão) no título; os modelos acima servem quando a revista prefere títulos descritivos."}</p>`;
  }
  function declaracaoIAHTML(v) {
    return `<div class="assistente">
      <label class="check"><input type="checkbox" data-ia="usou" ${v.usou ? "checked" : ""}> Usei ferramentas de IA neste trabalho</label>
      ${
        v.usou
          ? `<div class="seg"><label><input type="radio" name="ia-modelo" data-ia="modelo" value="apoio" ${v.modelo !== "edicao" ? "checked" : ""}> Apoio técnico e editorial</label>
             <label><input type="radio" name="ia-modelo" data-ia="modelo" value="edicao" ${v.modelo === "edicao" ? "checked" : ""}> Só edição do texto final</label></div>
             <div class="checklist">${AU.IA_FUNCOES.map((f, i) => `<label><input type="checkbox" data-ia-funcao="${i}" ${(v.funcoes || [])[i] ? "checked" : ""}> ${esc(f)}</label>`).join("")}</div>
             <button type="button" class="btn pequeno" data-ia-gerar>Gerar declaração</button>
             <textarea rows="8" data-ia="texto">${esc(v.texto)}</textarea>`
          : `<p class="nota">Se não usou IA, deixe desmarcado — nada será incluído no documento.</p>`
      }</div>`;
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
    const porTipo = (t) => e.campos.find((x) => x.tipo === t);

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
        const h = $("#hip-sug");
        if (h) h.textContent = hipoteseSugerida(o);
      } else if (t.dataset.res) {
        const c = e.campos.find((x) => x.tipo === "resultados");
        const l = getValor(p, e, c) || [];
        const r = l.find((x) => x.id === t.dataset.res);
        if (r) r.texto = t.value;
        setValor(p, e, c, l);
      } else if (t.dataset.ol) {
        const c = porTipo("outline");
        const l = getValor(p, e, c) || [];
        l[+t.dataset.ol][t.dataset.k] = t.value;
        setValor(p, e, c, l);
        if (t.dataset.k === "ideia" || t.dataset.k === "topico") {
          const r = t.closest(".ol-item").querySelector(".ol-resumo");
          const it = l[+t.dataset.ol];
          if (r) r.textContent = it.ideia || it.topico || it.item || "Novo parágrafo";
        }
      } else if (t.dataset.r7) {
        const c = porTipo("resumo7");
        const o = getValor(p, e, c) || {};
        o[t.dataset.r7] = t.value;
        setValor(p, e, c, o);
      } else if (t.dataset.ia === "texto") {
        const c = porTipo("declaracao-ia");
        const o = getValor(p, e, c) || {};
        o.texto = t.value;
        setValor(p, e, c, o);
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
      else if (t.dataset.campoDelin !== undefined) {
        setValor(p, e, porTipo("delineamento"), t.value);
        rerender();
      } else if (t.dataset.teste) {
        const c = porTipo("teste");
        const o = getValor(p, e, c) || {};
        o[t.dataset.teste] = t.value;
        setValor(p, e, c, o);
        rerender();
      } else if (t.dataset.grafico !== undefined) {
        setValor(p, e, porTipo("grafico"), { objetivo: t.value });
        rerender();
      } else if (t.dataset.ia === "usou" || t.dataset.ia === "modelo") {
        const c = porTipo("declaracao-ia");
        const o = getValor(p, e, c) || {};
        if (t.dataset.ia === "usou") o.usou = t.checked;
        else o.modelo = t.value;
        setValor(p, e, c, o);
        if (t.dataset.ia === "usou") rerender();
      } else if (t.dataset.iaFuncao) {
        const c = porTipo("declaracao-ia");
        const o = getValor(p, e, c) || {};
        o.funcoes = o.funcoes || [];
        o.funcoes[+t.dataset.iaFuncao] = t.checked;
        setValor(p, e, c, o);
      }
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

    form.addEventListener("click", async (ev) => {
      const t = ev.target.closest("button");
      if (!t) return;
      const d = t.dataset;
      if (d.plP) {
        const e0 = estadoPlano(p);
        const q = PL.PERGUNTAS.find((x) => x.id === d.plP);
        let valor = d.plO;
        if (q.multi) {
          const l = e0[q.id] || [];
          valor = l.includes(d.plO) ? l.filter((x) => x !== d.plO) : l.concat(d.plO);
        } else if (e0[q.id] === d.plO) valor = "";
        ultimasDesfeitas = responder(p, q.id, valor);
        rerender();
        return;
      }
      if (d.plReiniciar !== undefined) {
        if (!(await confirma("Apagar todas as respostas do desenho da pesquisa? (o objetivo e o delineamento escolhidos também serão limpos)"))) return;
        ["tipo", "modelo", "variavel"].forEach((k) => setResposta(p, k, ""));
        dadosEtapa(p, "pr-desenho").plano = {};
        salvar();
        rerender();
        return;
      }
      if (d.plLevar !== undefined) {
        levarPlano(p);
        return;
      }
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
      } else if (d.usarHip !== undefined) {
        const o = getValor(p, e, porTipo("objetivo"));
        if (val(p, "pr-tipo", "hipotese") && !(await confirma("Substituir a hipótese já escrita?"))) return;
        dadosEtapa(p, "pr-tipo").hipotese = hipoteseSugerida(o);
        salvar();
        rerender();
      } else if (d.olmontar) {
        const c = porTipo("outline");
        const l = getValor(p, e, c);
        const it = l[+d.olmontar];
        const novo = [it.topico, it.sustentacao, it.especificacao, it.transicao].map((x) => (x || "").trim()).filter(Boolean).join(" ");
        if (!novo) return aviso("Escreva ao menos a frase-tópico.");
        if ((it.texto || "").trim() && it.texto.trim() !== novo && !(await confirma("Substituir o parágrafo final já escrito?"))) return;
        it.texto = novo;
        setValor(p, e, c, l);
        rerender();
      } else if (d.olroteiro) {
        const c = porTipo("outline");
        const l = getValor(p, e, c) || [];
        if (l.length && !(await confirma("Acrescentar o roteiro sugerido ao final dos parágrafos que você já tem?"))) return;
        AU.ROTEIROS[d.olroteiro].forEach((r) => l.push({ ...r }));
        setValor(p, e, c, l);
        rerender();
      } else if (d.r7montar !== undefined) {
        const o = getValor(p, e, porTipo("resumo7")) || {};
        const novo = AU.RESUMO_MOVIMENTOS.map(([k]) => (o[k] || "").trim()).filter(Boolean).join(" ");
        if (!novo) return aviso("Preencha ao menos um movimento.");
        const cr = campo("resumo");
        if ((getValor(p, e, cr) || "").trim() && !(await confirma("Substituir o resumo já escrito?"))) return;
        setValor(p, e, cr, novo);
        rerender();
      } else if (d.gerarNota !== undefined) {
        const marc = val(p, e.id, "construcao") || [];
        const secs = AU.QUALIFICACAO.construcao.filter((_, i) => marc[i]).map((x) => x.split(" (")[0]);
        if (!secs.length) return aviso("Marque as seções que ainda estão em construção.");
        const lista = secs.length > 1 ? secs.slice(0, -1).join(", ") + " e " + secs[secs.length - 1] : secs[0];
        setValor(p, e, campo("nota"), AU.QUALIFICACAO.nota.replace("{secoes}", lista));
        rerender();
      } else if (d.iaGerar !== undefined) {
        const c = porTipo("declaracao-ia");
        const o = getValor(p, e, c) || {};
        const fs = AU.IA_FUNCOES.filter((_, i) => (o.funcoes || [])[i]);
        if (!fs.length) return aviso("Marque as funções em que a IA foi usada.");
        const rom = ["i", "ii", "iii", "iv", "v", "vi"];
        const itens = fs.map((f, i) => `(${rom[i]}) ${f}`);
        const lista = itens.length > 1 ? itens.slice(0, -1).join("; ") + "; e " + itens[itens.length - 1] : fs[0];
        if ((o.texto || "").trim() && !(await confirma("Substituir o texto da declaração?"))) return;
        o.texto = AU.IA_MODELOS[o.modelo === "edicao" ? "edicao" : "apoio"].replace("{funcoes}", o.modelo === "edicao" ? fs.join(", ") : lista);
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
        if ((l[+d.oldel].texto || "").trim() && !(await confirma("Remover este parágrafo e seu texto?"))) return;
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
    const acad = TIPOS_TRABALHO[p.meta.tipo].academico;
    if (e.id === "pr-tipo") {
      const o = val(p, "pr-tipo", "objetivo") || {};
      out.push(...V.objetivo(o.texto, o.tipo));
      if (o.tipo && o.tipo !== "descritiva" && !(val(p, "pr-tipo", "hipotese") || "").trim())
        out.push({ nivel: "info", regra: "Hipótese ausente", trecho: "—", dica: "Pesquisas de associação e de interferência precisam de hipótese (relação esperada entre variáveis)." });
      if (o.tipo === "interferencia" && !(o.direcao || "").trim())
        out.push({ nivel: "info", regra: "Direção do efeito", trecho: "—", dica: "Em interferência, explicite a variável interferente, a afetada e a direção do efeito (aumenta, reduz…)." });
    }
    if (e.id === "pr-delineamento") out.push(...checarDelineamento(p));
    if (e.id === "p16") out.push(...V.legendas(val(p, "p16", "legendas")));
    if (e.id === "p17") out.push(...V.interpretacaoNosResultados(textoResultados(p)));
    if (e.id === "p28") out.push(...V.palavrasChave(val(p, "p28", "palavras"), val(p, "p30", "titulo") || p.meta.titulo, val(p, "p24", "objetivo") || (val(p, "pr-tipo", "objetivo") || {}).texto, AU.PALAVRAS_GENERICAS));
    (e.checar || []).forEach((k) => {
      if (k === "estilo")
        e.campos.forEach((c) => {
          const v = getValor(p, e, c);
          if (typeof v === "string") out.push(...V.estilo(v));
          if (Array.isArray(v) && c.tipo === "outline")
            v.forEach((it) => out.push(...V.estilo(textoItem(it))));
        });
      if (k === "conclusoes") out.push(...V.conclusoes(val(p, "p13", "conclusoes")));
      if (k === "objetivo") out.push(...V.objetivo(val(p, "p24", "objetivo"), tl));
      if (k === "titulo") out.push(...V.titulo(val(p, "p30", "titulo"), acad));
      if (k === "resumo") out.push(...V.resumo(val(p, "p28", "resumo"), p.meta.tipo).filter((a) => a.regra !== "Voz passiva" && a.regra !== "Impessoalidade"));
      if (k === "documento") verificarTudo(p).forEach((g) => g.alertas.forEach((a) => out.push({ ...a, regra: `${g.secao}: ${a.regra}` })));
    });
    if (e.id === "p5") out.push(...checarPiramide(val(p, "p5", "piramide")));
    return out;
  }
  function textoItem(x) {
    return (x.texto || "").trim() ? x.texto : [x.topico, x.sustentacao, x.especificacao, x.transicao].filter(Boolean).join(" ");
  }
  function textoResultados(p) {
    const l = val(p, "p17", "paragrafos") || [];
    return l.map(textoItem).join(" ") + " " + (val(p, "p17", "texto") || "");
  }
  function checarDelineamento(p) {
    const tl = tipoLogico(p);
    const m = val(p, "pr-delineamento", "modelo");
    const d = AU.DELINEAMENTOS.find((x) => x.id === m);
    if (!tl || !d || d.tipos.includes(tl)) return [];
    return [{ nivel: "aviso", regra: "Delineamento incoerente", trecho: d.nome, dica: `O modelo escolhido não corresponde ao tipo lógico “${TIPOS_LOGICOS[tl].nome}”. O delineamento deve ser deduzido do objetivo.` }];
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
    const paras = (l) =>
      (l || [])
        .map((x) =>
          x.texto && x.texto.trim()
            ? x.texto
            : [x.topico, x.sustentacao, x.especificacao, x.transicao].map((y) => (y || "").trim()).filter(Boolean).join(" ")
        )
        .filter((x) => x && x.trim());
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
    const pr = paras(val(p, "p17", "paragrafos"));
    s.resultados = { texto: pr.length ? pr.join("\n\n") : val(p, "p17", "texto") || "", legendas: (val(p, "p16", "legendas") || []).filter(Boolean) };
    s.discussao = paras(val(p, "p19", "outline"));
    s.marco = paras(val(p, "pmarco-outline", "outline"));
    const pc = paras(val(p, "pconclusao", "outline"));
    s.conclusoes = pc.length ? pc : (val(p, "p13", "conclusoes") || []).filter(Boolean);
    const ia = val(p, "pia", "declaracao") || {};
    s.ia = ia.usou && (ia.texto || "").trim() ? ia.texto : "";
    s.referencias = [...(val(p, "p27", "refs") || [])].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const nomes = { marco: "Marco teórico", ia: "Declaração de uso de Inteligência Artificial", introducao: "Introdução", metodos: acad ? "Material e métodos" : "Métodos", resultados: "Resultados", discussao: "Discussão", conclusoes: "Conclusões", referencias: "Referências", resumo: "Resumo" };
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
    const h = (k) => (acad && !["resumo", "referencias", "ia"].includes(k) ? `${++n} ${nomes[k].toUpperCase()}` : nomes[k]);
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
      } else if (k === "ia") {
        if (s.ia) out += `<h2>${h(k)}</h2>${paragrafos(s.ia)}`;
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
      else if (k === "ia") md += s.ia ? `\n## ${nomes.ia}\n\n${s.ia}\n` : "";
      else md += `## ${nomes[k]}\n\n` + s[k].join("\n\n") + "\n\n";
    });
    return md;
  }

  /* Gera um .docx de verdade (Word, LibreOffice, Google Docs) com JSZip. */
  function blocosDocumento(p) {
    const { ordem, s, nomes, acad } = montarDocumento(p);
    const b = [];
    let n = 0;
    const paras = (t, tipo = "p") =>
      String(t || "")
        .split(/\n\s*\n|\n/)
        .filter((x) => x.trim())
        .forEach((x) => b.push({ tipo, texto: x.trim() }));
    const h = (k) => (acad && !["resumo", "referencias", "ia"].includes(k) ? `${++n} ${nomes[k].toUpperCase()}` : nomes[k].toUpperCase());
    ordem.forEach((k) => {
      if (k === "titulo") {
        b.push({ tipo: "titulo", texto: s.titulo || "[Título]" });
        if (p.meta.autor) b.push({ tipo: "centro", texto: p.meta.autor });
        if (acad && (p.meta.orientador || p.meta.instituicao))
          b.push({ tipo: "centro", texto: [p.meta.orientador && "Orientação: " + p.meta.orientador, p.meta.instituicao].filter(Boolean).join(" · ") });
      } else if (k === "resumo") {
        b.push({ tipo: "h1", texto: "RESUMO" });
        paras(s.resumo.texto, "semrecuo");
        if (s.resumo.palavras) b.push({ tipo: "semrecuo", texto: "Palavras-chave: " + s.resumo.palavras, negritoInicio: "Palavras-chave:" });
        if (s.resumo.abstract) {
          b.push({ tipo: "h1", texto: "ABSTRACT" });
          paras(s.resumo.abstract, "semrecuo");
        }
      } else if (k === "metodos") {
        b.push({ tipo: "h1", texto: h(k) });
        s.metodos.forEach(([sub, t]) => {
          b.push({ tipo: "h2", texto: sub });
          paras(t);
        });
      } else if (k === "resultados") {
        b.push({ tipo: "h1", texto: h(k) });
        paras(s.resultados.texto);
        s.resultados.legendas.forEach((l) => b.push({ tipo: "legenda", texto: l }));
      } else if (k === "conclusoes") {
        b.push({ tipo: "h1", texto: h(k) });
        s.conclusoes.forEach((c) => paras(c));
      } else if (k === "referencias") {
        b.push({ tipo: "h1", texto: h(k) });
        s.referencias.forEach((r) => b.push({ tipo: "ref", texto: r }));
      } else if (k === "ia") {
        if (s.ia) {
          b.push({ tipo: "h1", texto: h(k) });
          paras(s.ia);
        }
      } else {
        b.push({ tipo: "h1", texto: h(k) });
        (s[k] || []).forEach((x) => paras(x));
      }
    });
    return b;
  }
  async function gerarDocx(p) {
    if (!window.JSZip) return null;
    const x = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const run = (t, extra = "") => `<w:r><w:rPr>${extra}</w:rPr><w:t xml:space="preserve">${x(t)}</w:t></w:r>`;
    const par = (bl) => {
      const estilo = { titulo: "Title", h1: "Heading1", h2: "Heading2", legenda: "Caption", ref: "Bibliography", centro: "Centro", semrecuo: "SemRecuo" }[bl.tipo];
      const pPr = estilo ? `<w:pPr><w:pStyle w:val="${estilo}"/></w:pPr>` : "";
      if (bl.negritoInicio) return `<w:p>${pPr}${run(bl.negritoInicio, "<w:b/>")}${run(bl.texto.slice(bl.negritoInicio.length))}</w:p>`;
      return `<w:p>${pPr}${run(bl.texto)}</w:p>`;
    };
    const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
    const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${W}><w:body>${blocosDocumento(p)
      .map(par)
      .join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1701" w:right="1134" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const fonte = '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>';
    const est = (id, nome, ppr, rpr) =>
      `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${nome}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr>${ppr}</w:pPr><w:rPr>${rpr}</w:rPr></w:style>`;
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ${W}><w:docDefaults><w:rPrDefault><w:rPr>${fonte}<w:sz w:val="24"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="0" w:line="360" w:lineRule="auto"/><w:ind w:firstLine="709"/><w:jc w:val="both"/></w:pPr><w:rPr>${fonte}<w:sz w:val="24"/></w:rPr></w:style>${[
      est("Title", "Title", '<w:spacing w:before="0" w:after="240"/><w:ind w:firstLine="0"/><w:jc w:val="center"/>', '<w:b/><w:caps/><w:sz w:val="28"/>'),
      est("Heading1", "heading 1", '<w:keepNext/><w:spacing w:before="360" w:after="240"/><w:ind w:firstLine="0"/><w:jc w:val="left"/><w:outlineLvl w:val="0"/>', "<w:b/>"),
      est("Heading2", "heading 2", '<w:keepNext/><w:spacing w:before="240" w:after="120"/><w:ind w:firstLine="0"/><w:jc w:val="left"/><w:outlineLvl w:val="1"/>', ""),
      est("Caption", "caption", '<w:spacing w:before="60" w:after="120" w:line="240" w:lineRule="auto"/><w:ind w:firstLine="0"/><w:jc w:val="left"/>', '<w:sz w:val="20"/>'),
      est("Bibliography", "Bibliography", '<w:spacing w:after="240" w:line="240" w:lineRule="auto"/><w:ind w:firstLine="0"/><w:jc w:val="left"/>', ""),
      est("Centro", "Centralizado", '<w:ind w:firstLine="0"/><w:jc w:val="center"/>', ""),
      est("SemRecuo", "Sem recuo", '<w:ind w:firstLine="0"/>', ""),
    ].join("")}</w:styles>`;
    const zip = new window.JSZip();
    zip.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
    zip.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    zip.file("word/_rels/document.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
    zip.file("word/document.xml", doc);
    zip.file("word/styles.xml", styles);
    return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }

  function telaDocumento(p) {
    moldura(
      p,
      `<div class="doc-barra"><h1>Documento final</h1>
        <div class="botoes">
          <button class="btn primario" data-exp="doc">Baixar para Word (.docx)</button>
          <button class="btn" data-exp="md">Markdown (.md)</button>
          ${EM_ARTEFATO ? "" : `<button class="btn" data-exp="print">Imprimir / PDF</button>`}
          <button class="btn leve" data-exp="json">Backup (.json)</button>
        </div></div>
      <p class="nota">O arquivo do Word sai com estilos (Título, Título 1 e 2, Legenda), Times New Roman 12, espaçamento 1,5, recuo de 1,25 cm e margens de 3 e 2 cm, pronto para você gerar o sumário e aplicar o modelo da instituição. O documento é montado automaticamente, na ordem de leitura, a partir do que você redigiu nas etapas (que seguiram a ordem lógica, de trás para frente). Edite o conteúdo nas etapas correspondentes. Ao abrir no Word, aplique o modelo/normas da sua instituição ou revista.</p>
      <article class="documento" id="documento">${docHTML(p)}</article>`
    );
    app.querySelectorAll("[data-exp]").forEach(
      (b) =>
        (b.onclick = async () => {
          const t = b.dataset.exp;
          if (t === "print") return window.print();
          if (t === "json") return baixar(nomeArquivo(p) + ".json", JSON.stringify(p, null, 2), "application/json");
          if (t === "md") return baixar(nomeArquivo(p) + ".md", docMarkdown(p), "text/markdown;charset=utf-8");
          const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(p.meta.titulo)}</title>
            <style>body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.5}h1{font-size:14pt;text-align:center}h2{font-size:12pt;text-transform:none;margin-top:18pt}h3{font-size:12pt;font-weight:normal;font-style:italic}p{text-align:justify;text-indent:1.25cm;margin:0 0 6pt}.doc-autor{text-align:center;text-indent:0}.ref{text-indent:0;text-align:left}.legenda{font-size:10pt;text-indent:0}</style></head><body>${docHTML(p, true)}</body></html>`;
          const docx = await gerarDocx(p).catch(() => null);
          if (docx) return baixar(nomeArquivo(p) + ".docx", docx, docx.type);
          baixar(nomeArquivo(p) + ".doc", "\ufeff" + html, "application/msword");
        })
    );
  }

  /* ------------------------------ verificador ------------------------------ */
  function verificarTudo(p) {
    const tl = (val(p, "pr-tipo", "objetivo") || {}).tipo;
    const g = [];
    const add = (secao, etapa, alertas) => alertas.length && g.push({ secao, etapa, alertas });
    const acad = TIPOS_TRABALHO[p.meta.tipo].academico;
    const est = (l) => (l || []).flatMap((x) => V.estilo(textoItem(x)));
    add("Título", "p30", V.titulo(val(p, "p30", "titulo") || p.meta.titulo, acad));
    add("Palavras-chave", "p28", V.palavrasChave(val(p, "p28", "palavras"), val(p, "p30", "titulo") || p.meta.titulo, val(p, "p24", "objetivo") || (val(p, "pr-tipo", "objetivo") || {}).texto, AU.PALAVRAS_GENERICAS));
    add("Delineamento", "pr-delineamento", checarDelineamento(p));
    add("Resumo", "p28", V.resumo(val(p, "p28", "resumo"), p.meta.tipo));
    add("Objetivo", "p24", V.objetivo(val(p, "p24", "objetivo") || (val(p, "pr-tipo", "objetivo") || {}).texto, tl));
    add("Conclusões", "p13", V.conclusoes(val(p, "p13", "conclusoes")));
    add("Introdução", "p26", est(val(p, "p25", "outline")));
    if (acad) add("Marco teórico", "pmarco", est(val(p, "pmarco-outline", "outline")));
    add("Métodos", "p18", ["sujeito", "estrategia", "procedimentos", "analise"].flatMap((k) => V.estilo(val(p, "p18", k) || "")));
    add("Resultados", "p17", V.estilo(textoResultados(p)).concat(V.interpretacaoNosResultados(textoResultados(p))));
    add("Figuras e tabelas", "p16", V.legendas(val(p, "p16", "legendas")));
    add("Discussão", "p23", est(val(p, "p19", "outline")));
    if (acad) add("Conclusão", "pconclusao", est(val(p, "pconclusao", "outline")));
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
  nuvem.iniciar();
})();
