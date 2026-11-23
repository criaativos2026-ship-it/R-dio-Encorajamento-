/* Controle Interação — Rádio Encorajamento
   App estático (sem dependências). Os dados ficam no localStorage do aparelho. */
(function () {
  'use strict';

  // ---------- Configuração ----------
  // Coloque o arquivo oficial da logo neste caminho (veja assets/logo/README.md).
  var LOGO_SRC = 'assets/logo/logo.svg';
  var STORE_KEY = 'controle-interacao:v1';

  // Itens de exemplo — ajuste à rotina real da equipe.
  var CHECKLISTS = {
    montagem: {
      title: 'Montagem',
      intro: 'Preparação do estúdio e da transmissão antes do culto.',
      groups: [
        { name: 'Estrutura', items: [
          ['m-mesa', 'Posicionar e ligar a mesa de som'],
          ['m-energia', 'Conferir réguas de energia e cabos no chão (fita)'],
          ['m-mics', 'Montar pedestais e microfones'],
          ['m-fones', 'Conectar fones de retorno']
        ]},
        { name: 'Conexão', items: [
          ['m-net', 'Testar internet (cabo e Wi-Fi reserva)'],
          ['m-pc', 'Ligar computador e abrir o software de transmissão'],
          ['m-stream', 'Conferir chave/servidor de transmissão']
        ]},
        { name: 'Testes', items: [
          ['m-audio', 'Passagem de som com todos os microfones'],
          ['m-nivel', 'Ajustar níveis (sem picos no vermelho)'],
          ['m-teste', 'Transmissão de teste ouvida em outro aparelho'],
          ['m-ok', 'Avisar a liderança: rádio pronta']
        ]}
      ]
    },
    desmontagem: {
      title: 'Desmontagem',
      intro: 'Encerramento da transmissão e organização do espaço.',
      groups: [
        { name: 'Transmissão', items: [
          ['d-fim', 'Encerrar a transmissão'],
          ['d-grav', 'Salvar e nomear a gravação'],
          ['d-pc', 'Desligar computador e software']
        ]},
        { name: 'Equipamentos', items: [
          ['d-mesa', 'Zerar faders e desligar a mesa'],
          ['d-mics', 'Guardar microfones nos estojos'],
          ['d-cabos', 'Enrolar cabos (sem nós) e guardar'],
          ['d-energia', 'Desligar réguas de energia']
        ]},
        { name: 'Espaço', items: [
          ['d-limpo', 'Deixar o espaço limpo e organizado'],
          ['d-chave', 'Trancar armário e devolver chaves']
        ]}
      ]
    }
  };

  var ROLES = ['Operador(a) de áudio', 'Locutor(a)', 'Transmissão', 'Apoio', 'Coordenação'];
  var SEVERITY = { baixa: ['Baixa', 'badge-neutral'], media: ['Média', 'badge-warn'], alta: ['Alta', 'badge-crit'] };

  // ---------- Estado ----------
  function blank() {
    return { user: null, checks: { montagem: {}, desmontagem: {} }, problems: [], notices: [], history: [] };
  }
  var state;
  try { state = Object.assign(blank(), JSON.parse(localStorage.getItem(STORE_KEY)) || {}); }
  catch (e) { state = blank(); }
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  function log(type, text) {
    state.history.unshift({ type: type, text: text, by: state.user ? state.user.name : '—', at: Date.now() });
    state.history = state.history.slice(0, 300);
  }

  // ---------- Utilidades ----------
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function when(t) {
    var d = new Date(t), now = new Date();
    var hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return 'Hoje, ' + hm;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ', ' + hm;
  }
  function initials(n) { return n.trim().split(/\s+/).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase(); }
  function progress(key) {
    var total = 0, done = 0;
    CHECKLISTS[key].groups.forEach(function (g) { g.items.forEach(function (it) { total++; if (state.checks[key][it[0]]) done++; }); });
    return { total: total, done: done, pct: total ? Math.round(done / total * 100) : 0 };
  }
  function openProblems() { return state.problems.filter(function (p) { return p.status !== 'resolvido'; }); }

  var I = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    up: '<path d="M4 7h16M4 12h10M4 17h6"/><path d="M17 20v-8m0 0l-3 3m3-3l3 3"/>',
    down: '<path d="M4 7h16M4 12h10M4 17h6"/><path d="M17 12v8m0 0l-3-3m3 3l3-3"/>',
    alert: '<path d="M12 3l9.5 17H2.5z"/><path d="M12 10v4m0 3v.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    mega: '<path d="M3 10v4h4l7 4V6L7 10z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
    out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[name] + '</svg>'; }

  // Logo: usa o arquivo oficial se existir; senão, mostra um espaço reservado (nunca uma logo inventada).
  function logo(cls) {
    return '<div class="logo ' + (cls || '') + '">' +
      '<img src="' + LOGO_SRC + '" alt="Missão Encorajamento" onerror="this.nextElementSibling.classList.remove(\'hidden\');this.remove()">' +
      '<span class="logo-fallback hidden" title="Adicione a logo oficial em ' + LOGO_SRC + '">Logo oficial</span></div>';
  }

  // ---------- Telas ----------
  var NAV = [
    ['painel', 'Painel', 'home'],
    ['montagem', 'Montagem', 'up'],
    ['desmontagem', 'Desmontagem', 'down'],
    ['central', 'Central', 'alert'],
    ['historico', 'Histórico', 'clock']
  ];

  function viewLogin() {
    return '<div class="login">' +
      '<section class="login-brand">' + logo('logo-lg') +
        '<div><div class="rule"></div><h1>Controle Interação</h1>' +
        '<p class="lead">Rádio Encorajamento · ferramenta da equipe de serviço da Missão Encorajamento para organizar cada transmissão com excelência.</p></div>' +
        '<p class="eyebrow" style="color:inherit;opacity:.7">Equipe de serviço</p>' +
      '</section>' +
      '<section class="login-form"><form id="login-form" autocomplete="on">' +
        '<div><h2>Identifique-se</h2><p class="muted" style="margin-top:4px">Seu nome fica registrado nas atividades que você concluir.</p></div>' +
        '<div class="field"><label for="f-name">Nome</label><input class="input" id="f-name" name="name" required maxlength="60" placeholder="Como a equipe te chama"></div>' +
        '<div class="field"><label for="f-role">Função hoje</label><select class="input" id="f-role" name="role">' +
          ROLES.map(function (r) { return '<option>' + r + '</option>'; }).join('') + '</select></div>' +
        '<button class="btn btn-primary btn-block" type="submit">Entrar</button>' +
      '</form></section></div>';
  }

  function ringStat(key) {
    var p = progress(key), c = CHECKLISTS[key];
    return '<a class="card card-pad stat" href="#/' + key + '" style="text-decoration:none;color:inherit">' +
      '<div class="ring' + (p.pct === 100 ? ' done' : '') + '" style="--p:' + p.pct + '" data-label="' + p.pct + '%"></div>' +
      '<div><p class="eyebrow">' + c.title + '</p><p style="font-weight:650;margin-top:2px">' + p.done + ' de ' + p.total + ' etapas</p>' +
      '<p class="muted" style="font-size:.8rem">' + (p.pct === 100 ? 'Concluída' : p.done ? 'Em andamento' : 'Não iniciada') + '</p></div></a>';
  }

  function viewPainel() {
    var open = openProblems(), crit = open.filter(function (p) { return p.severity === 'alta'; }).length;
    var hour = new Date().getHours(), greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    return head(greet + ', ' + esc(state.user.name.split(' ')[0]), 'Visão geral do serviço da Rádio Encorajamento.') +
      '<div class="grid grid-3">' + ringStat('montagem') + ringStat('desmontagem') +
        '<a class="card card-pad stat" href="#/central" style="text-decoration:none;color:inherit">' +
          '<div class="big-num" style="color:' + (open.length ? 'var(--crit)' : 'var(--ok)') + '">' + open.length + '</div>' +
          '<div><p class="eyebrow">Problemas abertos</p><p class="muted" style="font-size:.8rem;margin-top:2px">' +
          (open.length ? crit + ' de prioridade alta' : 'Tudo em ordem') + '</p></div></a>' +
      '</div>' +
      '<div class="grid grid-2" style="margin-top:16px">' +
        '<section class="card"><div class="card-head"><h2>Atividade recente</h2><a class="btn btn-ghost btn-sm" href="#/historico">Ver tudo</a></div>' +
          timeline(state.history.slice(0, 6)) + '</section>' +
        '<section class="card"><div class="card-head"><h2>Comunicados</h2><a class="btn btn-ghost btn-sm" href="#/central?tab=comunicados">Abrir</a></div>' +
          noticeList(state.notices.slice(0, 3)) + '</section>' +
      '</div>';
  }

  function viewChecklist(key) {
    var c = CHECKLISTS[key], p = progress(key);
    var body = c.groups.map(function (g) {
      return '<div class="check-group"><h3 class="eyebrow">' + g.name + '</h3>' + g.items.map(function (it) {
        var done = state.checks[key][it[0]];
        return '<label class="check"><input type="checkbox" data-check="' + key + '" value="' + it[0] + '"' + (done ? ' checked' : '') + '>' +
          '<span class="box">' + icon('check') + '</span><span class="txt"><span class="label">' + it[1] + '</span>' +
          (done ? '<span class="meta" style="display:block">' + esc(done.by) + ' · ' + when(done.at) + '</span>' : '') + '</span></label>';
      }).join('') + '</div>';
    }).join('');
    return head('Checklist de ' + c.title.toLowerCase(), c.intro,
        '<button class="btn btn-ghost btn-sm" data-reset="' + key + '">Reiniciar checklist</button>') +
      '<section class="card"><div class="card-pad" style="display:grid;gap:8px">' +
        '<div style="display:flex;justify-content:space-between;font-size:.85rem"><strong>' + p.done + ' de ' + p.total + ' concluídas</strong><span class="muted">' + p.pct + '%</span></div>' +
        '<div class="progress' + (p.pct === 100 ? ' done' : '') + '"><span style="width:' + p.pct + '%"></span></div></div>' +
        body + '</section>';
  }

  function viewCentral(tab) {
    tab = tab === 'comunicados' ? 'comunicados' : 'problemas';
    var tabs = '<div class="tabs" role="tablist">' +
      '<button role="tab" aria-selected="' + (tab === 'problemas') + '" data-tab="problemas">Problemas</button>' +
      '<button role="tab" aria-selected="' + (tab === 'comunicados') + '" data-tab="comunicados">Comunicados</button></div>';
    var content;
    if (tab === 'problemas') {
      var sorted = state.problems.slice().sort(function (a, b) { return (a.status === 'resolvido') - (b.status === 'resolvido') || b.at - a.at; });
      content = '<div class="grid grid-2">' +
        '<section class="card"><div class="card-head"><h2>Registros</h2><span class="badge badge-brand">' + openProblems().length + ' abertos</span></div>' +
          (sorted.length ? '<div class="list">' + sorted.map(problemRow).join('') + '</div>' : '<p class="empty">Nenhum problema registrado.</p>') + '</section>' +
        '<section class="card"><div class="card-head"><h2>Registrar problema</h2></div><form id="problem-form" class="form-grid">' +
          '<div class="field"><label for="p-title">O que aconteceu?</label><input class="input" id="p-title" required maxlength="90" placeholder="Ex.: microfone 2 com chiado"></div>' +
          '<div class="field"><label for="p-desc">Detalhes</label><textarea class="input" id="p-desc" maxlength="500" placeholder="Onde, quando, o que já foi tentado"></textarea></div>' +
          '<div class="field"><label for="p-sev">Prioridade</label><select class="input" id="p-sev"><option value="baixa">Baixa</option><option value="media" selected>Média</option><option value="alta">Alta — impede a transmissão</option></select></div>' +
          '<button class="btn btn-primary" type="submit">Registrar</button></form></section></div>';
    } else {
      content = '<div class="grid grid-2">' +
        '<section class="card"><div class="card-head"><h2>Mural da equipe</h2></div>' + noticeList(state.notices) + '</section>' +
        '<section class="card"><div class="card-head"><h2>Novo comunicado</h2></div><form id="notice-form" class="form-grid">' +
          '<div class="field"><label for="n-title">Título</label><input class="input" id="n-title" required maxlength="90"></div>' +
          '<div class="field"><label for="n-body">Mensagem</label><textarea class="input" id="n-body" required maxlength="800"></textarea></div>' +
          '<button class="btn btn-primary" type="submit">Publicar</button></form></section></div>';
    }
    return head('Central de problemas e comunicados', 'Registre ocorrências e mantenha a equipe alinhada.', tabs) + content;
  }

  function problemRow(p) {
    var sev = SEVERITY[p.severity], resolved = p.status === 'resolvido';
    return '<div class="row"><div class="body"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
      '<span class="title">' + esc(p.title) + '</span><span class="badge ' + (resolved ? 'badge-ok' : sev[1]) + '"><span class="dot"></span>' + (resolved ? 'Resolvido' : sev[0]) + '</span></div>' +
      (p.desc ? '<p style="font-size:.88rem;margin-top:4px;color:var(--ink-700)">' + esc(p.desc) + '</p>' : '') +
      '<p class="meta">' + esc(p.by) + ' · ' + when(p.at) + (resolved ? ' — resolvido por ' + esc(p.resolvedBy) + ' · ' + when(p.resolvedAt) : '') + '</p></div>' +
      (resolved ? '' : '<button class="btn btn-ghost btn-sm" data-resolve="' + p.id + '">Resolver</button>') + '</div>';
  }

  function noticeList(items) {
    if (!items.length) return '<p class="empty">Nenhum comunicado publicado.</p>';
    return '<div class="list">' + items.map(function (n) {
      return '<div class="row"><div class="tl-icon">' + icon('mega') + '</div><div class="body"><p class="title">' + esc(n.title) + '</p>' +
        '<p style="font-size:.88rem;margin-top:2px;color:var(--ink-700);white-space:pre-line">' + esc(n.body) + '</p>' +
        '<p class="meta">' + esc(n.by) + ' · ' + when(n.at) + '</p></div></div>';
    }).join('') + '</div>';
  }

  function timeline(items) {
    if (!items.length) return '<p class="empty">Nenhuma atividade ainda.</p>';
    var map = { check: ['check', 'ok'], problema: ['alert', 'crit'], resolvido: ['check', 'ok'], comunicado: ['mega', ''], sistema: ['clock', ''] };
    return '<div class="list timeline">' + items.map(function (h) {
      var m = map[h.type] || map.sistema;
      return '<div class="row"><div class="tl-icon ' + m[1] + '">' + icon(m[0]) + '</div><div class="body"><p style="font-size:.9rem">' + esc(h.text) + '</p>' +
        '<p class="meta">' + esc(h.by) + ' · ' + when(h.at) + '</p></div></div>';
    }).join('') + '</div>';
  }

  function viewHistorico() {
    return head('Histórico de atividades', 'Tudo o que a equipe registrou neste aparelho.',
        state.history.length ? '<button class="btn btn-ghost btn-sm" data-clear-history>Limpar histórico</button>' : '') +
      '<section class="card">' + timeline(state.history) + '</section>';
  }

  function head(title, sub, actions) {
    return '<div class="page-head"><div><h1>' + title + '</h1>' + (sub ? '<p class="muted">' + sub + '</p>' : '') + '</div>' + (actions || '') + '</div>';
  }

  function shell(route, inner) {
    var open = openProblems().length;
    var links = function (mobile) {
      return NAV.map(function (n) {
        return '<a href="#/' + n[0] + '"' + (route === n[0] ? ' aria-current="page"' : '') + '>' + icon(n[2]) + '<span>' + n[1] + '</span>' +
          (!mobile && n[0] === 'central' && open ? '<span class="badge badge-crit">' + open + '</span>' : '') + '</a>';
      }).join('');
    };
    var u = state.user;
    return '<div class="shell">' +
      '<aside class="sidebar">' + logo() +
        '<div class="app-name"><strong>Controle Interação</strong><span>Rádio Encorajamento</span></div>' +
        '<nav class="nav" aria-label="Principal">' + links(false) + '</nav>' +
        '<div class="user-chip"><div class="avatar">' + esc(initials(u.name)) + '</div><div class="who"><strong>' + esc(u.name) + '</strong><span>' + esc(u.role) + '</span></div>' +
        '<button class="btn btn-ghost btn-sm" data-logout title="Trocar usuário" aria-label="Trocar usuário" style="padding:6px">' + icon('out').replace('<svg', '<svg width="16" height="16"') + '</button></div>' +
      '</aside>' +
      '<div><header class="mobile-bar">' + logo() + '<div class="avatar" data-logout title="Trocar usuário">' + esc(initials(u.name)) + '</div></header>' +
      '<main class="main">' + inner + '</main></div>' +
      '<nav class="tabbar" aria-label="Principal">' + links(true) + '</nav></div>';
  }

  // ---------- Roteamento ----------
  function render() {
    var app = document.getElementById('app');
    if (!state.user) { app.innerHTML = viewLogin(); return; }
    var hash = location.hash.replace(/^#\/?/, ''), parts = hash.split('?'), route = parts[0] || 'painel';
    var q = new URLSearchParams(parts[1] || '');
    var view = { painel: viewPainel, montagem: function () { return viewChecklist('montagem'); }, desmontagem: function () { return viewChecklist('desmontagem'); },
      central: function () { return viewCentral(q.get('tab')); }, historico: viewHistorico }[route];
    if (!view) { location.hash = '#/painel'; return; }
    app.innerHTML = shell(route, view());
  }

  // ---------- Eventos ----------
  document.addEventListener('submit', function (e) {
    var f = e.target; e.preventDefault();
    if (f.id === 'login-form') {
      state.user = { name: f.name.value.trim(), role: f.role.value };
      if (!state.user.name) return;
      log('sistema', 'Entrou como ' + state.user.role);
      location.hash = '#/painel';
    } else if (f.id === 'problem-form') {
      var title = document.getElementById('p-title').value.trim(); if (!title) return;
      state.problems.push({ id: uid(), title: title, desc: document.getElementById('p-desc').value.trim(),
        severity: document.getElementById('p-sev').value, status: 'aberto', by: state.user.name, at: Date.now() });
      log('problema', 'Registrou problema: ' + title);
    } else if (f.id === 'notice-form') {
      var nt = document.getElementById('n-title').value.trim(), nb = document.getElementById('n-body').value.trim(); if (!nt || !nb) return;
      state.notices.unshift({ id: uid(), title: nt, body: nb, by: state.user.name, at: Date.now() });
      log('comunicado', 'Publicou comunicado: ' + nt);
    }
    save(); render();
  });

  document.addEventListener('change', function (e) {
    var t = e.target, key = t.getAttribute('data-check'); if (!key) return;
    var label = t.closest('.check').querySelector('.label').textContent;
    if (t.checked) { state.checks[key][t.value] = { by: state.user.name, at: Date.now() }; log('check', CHECKLISTS[key].title + ': ' + label); }
    else { delete state.checks[key][t.value]; log('sistema', CHECKLISTS[key].title + ': desmarcou "' + label + '"'); }
    var p = progress(key);
    if (t.checked && p.done === p.total) log('check', 'Checklist de ' + CHECKLISTS[key].title.toLowerCase() + ' concluído');
    save(); render();
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-resolve],[data-reset],[data-tab],[data-logout],[data-clear-history]'); if (!t) return;
    if (t.hasAttribute('data-resolve')) {
      var p = state.problems.filter(function (x) { return x.id === t.getAttribute('data-resolve'); })[0];
      if (p) { p.status = 'resolvido'; p.resolvedBy = state.user.name; p.resolvedAt = Date.now(); log('resolvido', 'Resolveu: ' + p.title); }
    } else if (t.hasAttribute('data-reset')) {
      var k = t.getAttribute('data-reset');
      if (!confirm('Reiniciar o checklist de ' + CHECKLISTS[k].title.toLowerCase() + '?')) return;
      state.checks[k] = {}; log('sistema', 'Reiniciou o checklist de ' + CHECKLISTS[k].title.toLowerCase());
    } else if (t.hasAttribute('data-tab')) {
      location.hash = '#/central?tab=' + t.getAttribute('data-tab'); return;
    } else if (t.hasAttribute('data-logout')) {
      log('sistema', 'Saiu'); state.user = null;
    } else if (t.hasAttribute('data-clear-history')) {
      if (!confirm('Apagar todo o histórico deste aparelho?')) return;
      state.history = [];
    }
    save(); render();
  });

  window.addEventListener('hashchange', render);
  render();
})();
