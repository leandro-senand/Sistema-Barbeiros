// ═══════════════════════════════════════════
//  STORE — DADOS
// ═══════════════════════════════════════════
const Store = {
  _data: null,

  defaults() {
    const today = new Date();
    const fmt = (d) => d.toISOString().slice(0,10);
    const t = fmt(today);

    return {
      barbeiros: [
        { id:1, nome:'Ricardo Silva', esp:'Degradê & Tesoura', tel:'(31) 98888-1111', comissao:50, status:'ativo' },
        { id:2, nome:'João Ferreira', esp:'Barba & Navalhado', tel:'(31) 97777-2222', comissao:45, status:'ativo' },
        { id:3, nome:'Carlos Lima', esp:'Pigmento & Desenho', tel:'(31) 96666-3333', comissao:50, status:'ativo' },
      ],
      servicos: [
        { id:1, nome:'Corte Degradê', preco:40, duracao:40, cat:'corte' },
        { id:2, nome:'Barba Completa', preco:30, duracao:30, cat:'barba' },
        { id:3, nome:'Combo (Corte+Barba)', preco:65, duracao:60, cat:'combo' },
        { id:4, nome:'Corte Tesoura', preco:45, duracao:50, cat:'corte' },
        { id:5, nome:'Hidratação Capilar', preco:35, duracao:30, cat:'tratamento' },
        { id:6, nome:'Navalhado', preco:25, duracao:20, cat:'barba' },
        { id:7, nome:'Corte Infantil', preco:30, duracao:30, cat:'corte' },
        { id:8, nome:'Pigmentação', preco:50, duracao:40, cat:'tratamento' },
      ],
      clientes: [
        { id:1, nome:'André Costa', tel:'(31) 99111-2233', barbeiro_id:1, obs:'Gosta de degradê baixo' },
        { id:2, nome:'Bruno Teixeira', tel:'(31) 99222-3344', barbeiro_id:2, obs:'' },
        { id:3, nome:'Carlos Mendes', tel:'(31) 99333-4455', barbeiro_id:1, obs:'Alérgico a certos produtos' },
        { id:4, nome:'Diego Ramos', tel:'(31) 99444-5566', barbeiro_id:3, obs:'Prefere atendimento rápido' },
        { id:5, nome:'Eduardo Lopes', tel:'(31) 99555-6677', barbeiro_id:2, obs:'' },
        { id:6, nome:'Felipe Souza', tel:'(31) 99666-7788', barbeiro_id:null, obs:'' },
      ],
      agendamentos: [
        { id:1, cliente_id:1, barbeiro_id:1, servicos:[1], data:t, hora:'09:00', obs:'', status:'confirmado' },
        { id:2, cliente_id:2, barbeiro_id:2, servicos:[3], data:t, hora:'10:00', obs:'Quer barba bem feita', status:'confirmado' },
        { id:3, cliente_id:3, barbeiro_id:1, servicos:[1,2], data:t, hora:'11:00', obs:'', status:'aguardando' },
        { id:4, cliente_id:5, barbeiro_id:3, servicos:[4], data:t, hora:'14:00', obs:'', status:'aguardando' },
        { id:5, cliente_id:4, barbeiro_id:3, servicos:[8], data:t, hora:'15:30', obs:'Primeiro pigmento', status:'aguardando' },
      ],
      // [JS-1] Corrigido: uso de Date aritmético (today - 86400000) é frágil em horário de verão;
      // substituído por setDate() que respeita timezone corretamente
      cortes: (() => {
        const d = (days) => { const x = new Date(today); x.setDate(x.getDate() - days); return fmt(x); };
        return [
          { id:1, cliente_id:1, barbeiro_id:1, servicos:[1], data:d(1), hora:'09:30', pagamento:'pix', total:40, obs:'', status:'concluído' },
          { id:2, cliente_id:2, barbeiro_id:2, servicos:[3], data:d(1), hora:'11:00', pagamento:'dinheiro', total:65, obs:'', status:'concluído' },
          { id:3, cliente_id:3, barbeiro_id:1, servicos:[1,6], data:d(2), hora:'14:00', pagamento:'débito', total:65, obs:'', status:'concluído' },
          { id:4, cliente_id:4, barbeiro_id:3, servicos:[8], data:d(3), hora:'10:30', pagamento:'crédito', total:50, obs:'', status:'concluído' },
          { id:5, cliente_id:5, barbeiro_id:2, servicos:[2], data:d(3), hora:'15:00', pagamento:'pix', total:30, obs:'', status:'concluído' },
          { id:6, cliente_id:6, barbeiro_id:1, servicos:[4,5], data:d(5), hora:'09:00', pagamento:'dinheiro', total:80, obs:'', status:'concluído' },
          { id:7, cliente_id:1, barbeiro_id:1, servicos:[3], data:d(7), hora:'10:00', pagamento:'pix', total:65, obs:'', status:'concluído' },
          { id:8, cliente_id:2, barbeiro_id:2, servicos:[1], data:d(8), hora:'11:30', pagamento:'dinheiro', total:40, obs:'', status:'concluído' },
        ];
      })(),
      _next: { barbeiros:4, servicos:9, clientes:7, agendamentos:6, cortes:9 }
    };
  },

  load() {
    try {
      const raw = localStorage.getItem('barberos_data');
      this._data = raw ? JSON.parse(raw) : this.defaults();
    } catch { this._data = this.defaults(); }
    return this._data;
  },

  save() { localStorage.setItem('barberos_data', JSON.stringify(this._data)); },

  get(key) { return this._data[key]; },

  nextId(key) {
    const id = this._data._next[key];
    this._data._next[key]++;
    return id;
  },

  add(key, item) {
    this._data[key].push(item);
    this.save();
  },

  update(key, id, patch) {
    const i = this._data[key].findIndex(x => x.id === id);
    if (i >= 0) { Object.assign(this._data[key][i], patch); this.save(); }
  },

  remove(key, id) {
    this._data[key] = this._data[key].filter(x => x.id !== id);
    this.save();
  },

  byId(key, id) { return this._data[key].find(x => x.id === id); },

  clienteCortes(cid) { return this._data.cortes.filter(c => c.cliente_id === cid); },
  barbeiroCortes(bid) { return this._data.cortes.filter(c => c.barbeiro_id === bid); },
  barbeiroAgendamentos(bid) {
    const t = new Date().toISOString().slice(0,10);
    return this._data.agendamentos.filter(a => a.barbeiro_id === bid && a.data === t);
  },
};

// ═══════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════
const U = {
  money(v) { return 'R$ ' + Number(v).toFixed(2).replace('.',','); },
  initials(n) { return n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); },
  today() { return new Date().toISOString().slice(0,10); },
  todayFmt() {
    return new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  },
  dateFmt(d) {
    if (!d) return '—';
    const [y,m,dia] = d.split('-');
    return `${dia}/${m}/${y}`;
  },
  catEmoji(c) {
    return {corte:'✂️',barba:'🪒',combo:'🔥',tratamento:'💆',outros:'📌'}[c]||'';
  },
  payIcon(p) {
    return {dinheiro:'💵',pix:'📱','débito':'💳','crédito':'💳'}[p]||'';
  },
  // [JS-2] Adicionado método sanitize para evitar XSS ao inserir dados do usuário no innerHTML
  sanitize(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
};

// ═══════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════
const Toast = {
  show(msg, type='info') {
    const c = document.getElementById('toast-container');
    const dot = {success:'🟢',error:'🔴',info:'🟡'}[type];
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    // [JS-3] Adicionado uso de textContent em vez de innerHTML para evitar XSS no toast
    const dotSpan = document.createElement('span');
    dotSpan.className = 'toast-dot';
    dotSpan.textContent = dot;
    const msgSpan = document.createElement('span');
    msgSpan.textContent = msg;
    el.appendChild(dotSpan);
    el.appendChild(msgSpan);
    c.appendChild(el);
    setTimeout(() => {
      el.style.opacity='0';
      el.style.transform='translateX(20px)';
      el.style.transition='all .3s';
      setTimeout(()=>el.remove(),300);
    }, 2800);
  }
};

// ═══════════════════════════════════════════
//  CONFIRM
// ═══════════════════════════════════════════
const Confirm = {
  _cb: null,
  show(title, msg, cb, icon='⚠️') {
    document.getElementById('confirm-icon').textContent = icon;
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent = msg;
    document.getElementById('modal-confirm').classList.add('open');
    this._cb = cb;
  },
  ok() { if(this._cb) this._cb(); this.close(); },
  cancel() { this.close(); },
  close() { document.getElementById('modal-confirm').classList.remove('open'); },
};

// ═══════════════════════════════════════════
//  APP NAVIGATION
// ═══════════════════════════════════════════
const App = {
  current: 'dashboard',

  navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-'+page).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    const titles = {
      dashboard:'Dashboard', agenda:'Agenda', cortes:'Histórico de Cortes',
      clientes:'Clientes', barbeiros:'Equipe de Barbeiros', servicos:'Serviços & Preços',
      caixa:'Caixa', relatorios:'Relatórios'
    };
    document.getElementById('topbar-title').textContent = titles[page] || page;
    // [JS-4] Atualiza o título da aba do browser ao navegar entre páginas
    document.title = `${titles[page] || page} — BarberOS`;
    this.current = page;
    Renders.run(page);
  },

  quickAction() { ModalAgenda.open(); },

  init() {
    Store.load();
    document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'numeric',month:'short'});
    this.navigate('dashboard');
    this.updateBadges();
    setInterval(() => this.updateBadges(), 30000);
    // [JS-5] Adicionado suporte a ESC para fechar modais abertos via teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => {
          if (m.id !== 'modal-confirm') m.classList.remove('open');
        });
      }
    });
  },

  updateBadges() {
    const t = U.today();
    const count = Store.get('agendamentos').filter(a => a.data===t && a.status!=='cancelado').length;
    document.getElementById('badge-agenda').textContent = count;
  }
};

// ═══════════════════════════════════════════
//  RENDERS
// ═══════════════════════════════════════════
const Renders = {
  run(page) {
    const map = {
      dashboard: this.dashboard,
      agenda: this.agenda,
      cortes: this.cortes,
      clientes: this.clientes,
      barbeiros: this.barbeiros,
      servicos: this.servicos,
      caixa: this.caixa,
      relatorios: this.relatorios,
    };
    if (map[page]) map[page].call(this);
  },

  // ── DASHBOARD
  dashboard() {
    const cortes = Store.get('cortes');
    const t = U.today();
    const hoje = cortes.filter(c=>c.data===t);
    const totalHoje = hoje.reduce((s,c)=>s+Number(c.total),0);
    const totalMes = cortes.reduce((s,c)=>s+Number(c.total),0);
    const agendHoje = Store.get('agendamentos').filter(a=>a.data===t && a.status!=='cancelado');

    document.getElementById('dash-stats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">✂️</div>
        <div class="stat-label">Cortes Hoje</div>
        <div class="stat-value gold">${hoje.length}</div>
        <div class="stat-sub">${agendHoje.length} agendados hoje</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">💰</div>
        <div class="stat-label">Faturamento Hoje</div>
        <div class="stat-value money">${U.money(totalHoje)}</div>
        <div class="stat-sub">Acumulado do dia</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon">📅</div>
        <div class="stat-label">Faturamento Total</div>
        <div class="stat-value money">${U.money(totalMes)}</div>
        <div class="stat-sub">${cortes.length} cortes registrados</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-label">Clientes</div>
        <div class="stat-value">${Store.get('clientes').length}</div>
        <div class="stat-sub">${Store.get('barbeiros').filter(b=>b.status==='ativo').length} barbeiros ativos</div>
      </div>
    `;

    const agEl = document.getElementById('dash-agenda');
    if (!agendHoje.length) {
      agEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>Nenhum agendamento hoje</p></div>';
    } else {
      agEl.innerHTML = agendHoje.sort((a,b)=>a.hora.localeCompare(b.hora)).map(a => {
        const cl = Store.byId('clientes', a.cliente_id);
        const ba = Store.byId('barbeiros', a.barbeiro_id);
        const srvs = a.servicos.map(id=>Store.byId('servicos',id)?.nome||'?').join(', ');
        const statusBadge = a.status==='confirmado'
          ? '<span class="badge badge-green">✓ Confirmado</span>'
          : '<span class="badge badge-muted">Aguardando</span>';
        return `<div class="recent-item">
          <div class="avatar">${U.initials(cl?.nome||'?')}</div>
          <div class="recent-info">
            <div class="recent-name">${U.sanitize(cl?.nome||'?')}</div>
            <div class="recent-sub">${U.sanitize(srvs)} · ${U.sanitize(ba?.nome||'?')}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:'DM Mono',monospace;font-size:12px;color:var(--gold);">${a.hora}</div>
            <div style="margin-top:4px;">${statusBadge}</div>
          </div>
        </div>`;
      }).join('');
    }

    const rcEl = document.getElementById('dash-recentes');
    const recent = [...cortes].sort((a,b)=>b.data.localeCompare(a.data)||b.hora.localeCompare(a.hora)).slice(0,6);
    if (!recent.length) {
      rcEl.innerHTML = '<div class="empty-state"><div class="empty-icon">✂️</div><p>Nenhum corte ainda</p></div>';
    } else {
      rcEl.innerHTML = recent.map(c => {
        const cl = Store.byId('clientes', c.cliente_id);
        const ba = Store.byId('barbeiros', c.barbeiro_id);
        return `<div class="recent-item">
          <div class="avatar">${U.initials(cl?.nome||'?')}</div>
          <div class="recent-info">
            <div class="recent-name">${U.sanitize(cl?.nome||'?')}</div>
            <div class="recent-sub">${U.dateFmt(c.data)} · ${U.sanitize(ba?.nome||'?')}</div>
          </div>
          <div class="recent-value">${U.money(c.total)}</div>
        </div>`;
      }).join('');
    }

    const bEl = document.getElementById('dash-barbers');
    bEl.innerHTML = Store.get('barbeiros').filter(b=>b.status==='ativo').map(b => {
      const bc = Store.barbeiroCortes(b.id);
      const total = bc.reduce((s,c)=>s+Number(c.total),0);
      const pct = cortes.length ? Math.round(bc.length/cortes.length*100) : 0;
      return `<div class="card">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
          <div class="avatar" style="width:40px;height:40px;font-size:15px;">${U.initials(b.nome)}</div>
          <div>
            <div style="font-weight:600;font-size:14px;">${U.sanitize(b.nome)}</div>
            <div style="font-size:11px;color:var(--muted);">${U.sanitize(b.esp)}</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px;">
          <span>${bc.length} cortes</span><span>${pct}% do total</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div style="margin-top:10px;font-family:'DM Mono',monospace;font-size:13px;color:var(--gold);">${U.money(total)} <span style="font-size:11px;color:var(--muted);font-family:'DM Sans',sans-serif;">faturado</span></div>
      </div>`;
    }).join('');
  },

  // ── AGENDA
  agenda() {
    const tbody = document.getElementById('agenda-tbody');
    const t = U.today();
    const all = Store.get('agendamentos').filter(a=>a.data===t).sort((a,b)=>a.hora.localeCompare(b.hora));

    if (!all.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📅</div><p>Nenhum agendamento para hoje</p></div></td></tr>';
    } else {
      tbody.innerHTML = all.map(a => {
        const cl = Store.byId('clientes', a.cliente_id);
        const ba = Store.byId('barbeiros', a.barbeiro_id);
        const srvs = a.servicos.map(id => Store.byId('servicos',id)?.nome||'?').join(', ');
        const stMap = {
          confirmado: '<span class="badge badge-green">✓ Confirmado</span>',
          aguardando: '<span class="badge badge-gold">⏳ Aguardando</span>',
          cancelado: '<span class="badge badge-red">✕ Cancelado</span>',
        };
        return `<tr id="ag-row-${a.id}">
          <td><span style="font-family:'DM Mono',monospace;color:var(--gold);">${a.hora}</span></td>
          <td><div class="flex gap-2"><div class="avatar" style="width:28px;height:28px;font-size:11px;">${U.initials(cl?.nome||'?')}</div>${U.sanitize(cl?.nome||'?')}</div></td>
          <td>${U.sanitize(ba?.nome||'?')}</td>
          <td>${U.sanitize(srvs)}</td>
          <td>${stMap[a.status]||a.status}</td>
          <td>
            <div class="flex gap-2">
              ${a.status!=='cancelado'?`<button class="btn btn-sm btn-primary" onclick="Agenda.iniciarCorte(${a.id})">✂️ Atender</button>`:''}
              ${a.status==='aguardando'?`<button class="btn btn-sm btn-ghost" onclick="Agenda.confirmar(${a.id})">✓</button>`:''}
              <button class="btn btn-sm btn-danger btn-icon" aria-label="Cancelar agendamento" onclick="Agenda.cancelar(${a.id})">✕</button>
            </div>
          </td>
        </tr>`;
      }).join('');
    }

    this._renderMiniCal(t);
  },

  _renderMiniCal(selected) {
    const cal = document.getElementById('mini-cal');
    const now = window._calDate || new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const dows = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const first = new Date(y,m,1).getDay();
    const days = new Date(y,m+1,0).getDate();
    const agDates = new Set(Store.get('agendamentos').map(a=>a.data));

    let cells = '';
    for (let i=0;i<first;i++) cells += `<div class="cal-day other-month" aria-hidden="true"></div>`;
    for (let d=1;d<=days;d++) {
      const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = dateStr===U.today();
      const isSel = dateStr===selected;
      const hasEv = agDates.has(dateStr);
      cells += `<div class="cal-day${isToday?' today':''}${isSel?' selected':''}${hasEv?' has-event':''}" role="button" tabindex="0" aria-label="${d} ${months[m]}${hasEv?' - tem agendamento':''}" onclick="CalNav.select('${dateStr}')" onkeydown="if(event.key==='Enter')CalNav.select('${dateStr}')">${d}</div>`;
    }

    cal.innerHTML = `
      <div class="cal-header">
        <button class="cal-nav" onclick="CalNav.prev()" aria-label="Mês anterior">‹</button>
        <div class="cal-month" aria-live="polite">${months[m]} ${y}</div>
        <button class="cal-nav" onclick="CalNav.next()" aria-label="Próximo mês">›</button>
      </div>
      <div class="cal-grid" role="grid" aria-label="Calendário ${months[m]} ${y}">
        ${dows.map(d=>`<div class="cal-dow" role="columnheader" aria-label="${d}">${d}</div>`).join('')}
        ${cells}
      </div>
    `;
  },

  // ── CORTES
  cortes() {
    this._cortesData = [...Store.get('cortes')].sort((a,b)=>b.data.localeCompare(a.data)||b.hora.localeCompare(a.hora));
    this._cortesTab = this._cortesTab || 'todos';
    this._cortesSearch = this._cortesSearch || '';
    this._renderCortes();
  },

  _renderCortes() {
    const tbody = document.getElementById('cortes-tbody');
    const t = U.today();
    // [JS-6] Corrigido: weekAgo recalculado a cada render para evitar data desatualizada
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    let data = this._cortesData || Store.get('cortes');
    const tab = this._cortesTab || 'todos';
    const q = (this._cortesSearch||'').toLowerCase();

    if (tab==='hoje') data = data.filter(c=>c.data===t);
    if (tab==='semana') data = data.filter(c=>new Date(c.data+'T00:00:00')>=weekAgo);
    if (q) data = data.filter(c => {
      const cl = Store.byId('clientes',c.cliente_id);
      return cl?.nome.toLowerCase().includes(q);
    });

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">✂️</div><p>Nenhum corte encontrado</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(c => {
      const cl = Store.byId('clientes',c.cliente_id);
      const ba = Store.byId('barbeiros',c.barbeiro_id);
      const srvs = c.servicos.map(id=>Store.byId('servicos',id)?.nome||'?').join(', ');
      return `<tr id="co-row-${c.id}">
        <td><span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);">#${c.id}</span></td>
        <td><span style="font-size:12.5px;">${U.dateFmt(c.data)}</span><br><span style="font-size:11px;color:var(--muted);">${c.hora}</span></td>
        <td><div class="flex gap-2"><div class="avatar" style="width:28px;height:28px;font-size:11px;">${U.initials(cl?.nome||'?')}</div>${U.sanitize(cl?.nome||'?')}</div></td>
        <td>${U.sanitize(ba?.nome||'?')}</td>
        <td style="font-size:12.5px;">${U.sanitize(srvs)}</td>
        <td><span class="money text-gold">${U.money(c.total)}</span></td>
        <td>${U.payIcon(c.pagamento)} ${c.pagamento}</td>
        <td><span class="badge badge-green">✓ ${c.status}</span></td>
        <td>
          <button class="btn btn-sm btn-danger btn-icon" title="Remover corte #${c.id}" aria-label="Remover corte #${c.id}" onclick="Cortes.remover(${c.id})">🗑</button>
        </td>
      </tr>`;
    }).join('');
  },

  // ── CLIENTES
  clientes() {
    this._clientesData = [...Store.get('clientes')];
    this._renderClientes();
  },

  _renderClientes() {
    const tbody = document.getElementById('clientes-tbody');
    let data = this._clientesData || Store.get('clientes');
    const q = (this._clientesSearch||'').toLowerCase();
    if (q) data = data.filter(c=>c.nome.toLowerCase().includes(q));

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">👤</div><p>Nenhum cliente encontrado</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(cl => {
      const ba = cl.barbeiro_id ? Store.byId('barbeiros',cl.barbeiro_id) : null;
      const cortes = Store.clienteCortes(cl.id);
      const gasto = cortes.reduce((s,c)=>s+Number(c.total),0);
      // [JS-7] Corrigido: sort original mutava o array de cortes do store via referência;
      // usando slice() antes de sort() para evitar efeitos colaterais
      const ultima = cortes.slice().sort((a,b)=>b.data.localeCompare(a.data))[0];
      return `<tr>
        <td><div class="flex gap-2"><div class="avatar">${U.initials(cl.nome)}</div><div><div style="font-weight:500;">${U.sanitize(cl.nome)}</div>${cl.obs?`<div style="font-size:11px;color:var(--muted);">${U.sanitize(cl.obs.slice(0,30))}...</div>`:''}</div></div></td>
        <td>${U.sanitize(cl.tel||'—')}</td>
        <td>${ba?`<span class="badge badge-gold">${U.sanitize(ba.nome)}</span>`:'<span class="badge badge-muted">Qualquer</span>'}</td>
        <td><span style="font-family:'DM Mono',monospace;font-size:13px;">${cortes.length}</span></td>
        <td><span class="money text-gold">${U.money(gasto)}</span></td>
        <td>${ultima?U.dateFmt(ultima.data):'Nunca'}</td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-ghost" aria-label="Editar ${U.sanitize(cl.nome)}" onclick="ModalCliente.edit(${cl.id})">✏️</button>
            <button class="btn btn-sm btn-danger btn-icon" aria-label="Remover ${U.sanitize(cl.nome)}" onclick="ClientesActions.remover(${cl.id})">🗑</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  // ── BARBEIROS
  barbeiros() {
    const grid = document.getElementById('barbeiros-grid');
    const all = Store.get('barbeiros');
    if (!all.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">💈</div><p>Nenhum barbeiro cadastrado</p></div>'; return; }
    grid.innerHTML = all.map(b => {
      const bc = Store.barbeiroCortes(b.id);
      const total = bc.reduce((s,c)=>s+Number(c.total),0);
      const com = total * b.comissao/100;
      const stBadge = {ativo:'badge-green',férias:'badge-blue',inativo:'badge-red'}[b.status]||'badge-muted';
      const ci = b.id % 3;
      return `<div class="barber-card">
        <div class="barber-avatar" style="${ci===1?'background:rgba(76,175,125,.12);border-color:var(--green);color:var(--green)':ci===2?'background:rgba(91,141,238,.12);border-color:var(--blue);color:var(--blue)':''}">${U.initials(b.nome)}</div>
        <div class="barber-name">${U.sanitize(b.nome)}</div>
        <div class="barber-role">${U.sanitize(b.esp)}</div>
        <span class="badge ${stBadge}" style="margin-bottom:14px;">${b.status}</span>
        <div class="barber-stats">
          <div class="barber-stat">
            <div class="barber-stat-val">${bc.length}</div>
            <div class="barber-stat-lbl">Cortes</div>
          </div>
          <div class="barber-stat">
            <div class="barber-stat-val" style="font-size:14px;">${U.money(com)}</div>
            <div class="barber-stat-lbl">Comissão</div>
          </div>
        </div>
        <div style="margin-top:10px;font-size:12px;color:var(--muted);">Comissão: ${b.comissao}%</div>
        <div style="margin-top:10px;display:flex;gap:8px;justify-content:center;">
          <button class="btn btn-sm btn-ghost" aria-label="Editar ${U.sanitize(b.nome)}" onclick="ModalBarbeiro.edit(${b.id})">✏️ Editar</button>
          <button class="btn btn-sm btn-danger" aria-label="Remover ${U.sanitize(b.nome)}" onclick="BarbeirosActions.remover(${b.id})">🗑</button>
        </div>
      </div>`;
    }).join('');
  },

  // ── SERVIÇOS
  servicos() {
    const grid = document.getElementById('servicos-grid');
    const all = Store.get('servicos');
    grid.innerHTML = all.map(s => {
      const uses = Store.get('cortes').filter(c=>c.servicos.includes(s.id)).length;
      return `<div class="service-card" onclick="">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
          <span style="font-size:22px;" aria-hidden="true">${U.catEmoji(s.cat)}</span>
          <span class="badge badge-muted">${s.cat}</span>
        </div>
        <div class="service-name">${U.sanitize(s.nome)}</div>
        <div class="service-price">${U.money(s.preco)}</div>
        <div class="service-time">⏱ ${s.duracao} min · Usado ${uses}x</div>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <button class="btn btn-sm btn-ghost" onclick="ModalServico.edit(${s.id},event)" aria-label="Editar ${U.sanitize(s.nome)}">✏️ Editar</button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="ServicosActions.remover(${s.id},event)" aria-label="Remover ${U.sanitize(s.nome)}">🗑</button>
        </div>
      </div>`;
    }).join('');
  },

  // ── CAIXA
  caixa() {
    const cortes = Store.get('cortes');
    const total = cortes.reduce((s,c)=>s+Number(c.total),0);
    const t = U.today();
    const hoje = cortes.filter(c=>c.data===t).reduce((s,c)=>s+Number(c.total),0);
    const totalCom = cortes.reduce((s,c)=>{
      const b = Store.byId('barbeiros',c.barbeiro_id);
      return s + (b ? Number(c.total)*b.comissao/100 : 0);
    },0);

    document.getElementById('caixa-stats').innerHTML = `
      <div class="stat-card green"><div class="stat-icon">💰</div><div class="stat-label">Total Geral</div><div class="stat-value gold money">${U.money(total)}</div></div>
      <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-label">Hoje</div><div class="stat-value gold money">${U.money(hoje)}</div></div>
      <div class="stat-card red"><div class="stat-icon">🤝</div><div class="stat-label">Comissões</div><div class="stat-value money">${U.money(totalCom)}</div><div class="stat-sub">a pagar</div></div>
    `;

    const sorted = [...cortes].sort((a,b)=>b.data.localeCompare(a.data)||b.hora.localeCompare(a.hora)).slice(0,15);
    document.getElementById('caixa-tbody').innerHTML = sorted.map(c=>{
      const cl = Store.byId('clientes',c.cliente_id);
      return `<tr>
        <td>${U.dateFmt(c.data)}</td>
        <td>${U.sanitize(cl?.nome||'?')} · ${c.servicos.map(id=>Store.byId('servicos',id)?.nome||'?').join(', ')}</td>
        <td><span class="badge badge-green">Entrada</span></td>
        <td><span class="money text-green">+${U.money(c.total)}</span></td>
      </tr>`;
    }).join('');

    const byPay = {};
    cortes.forEach(c=>{ byPay[c.pagamento]=(byPay[c.pagamento]||0)+Number(c.total); });
    const payEl = document.getElementById('caixa-pagamentos');
    payEl.innerHTML = Object.entries(byPay).map(([k,v])=>{
      const pct = total ? Math.round(v/total*100) : 0;
      return `<div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span>${U.payIcon(k)} ${k}</span>
          <span class="money text-gold">${U.money(v)} <span style="color:var(--muted);font-size:11px;">(${pct}%)</span></span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div></div>
      </div>`;
    }).join('');
  },

  // ── RELATÓRIOS
  relatorios() {
    const cortes = Store.get('cortes');
    const total = cortes.reduce((s,c)=>s+Number(c.total),0);
    const semana = new Date(); semana.setDate(semana.getDate()-7);
    const totalSemana = cortes.filter(c=>new Date(c.data+'T00:00:00')>=semana).reduce((s,c)=>s+Number(c.total),0);
    const ticketMedio = cortes.length ? total/cortes.length : 0;
    const clientes = Store.get('clientes');

    document.getElementById('relatorios-cards').innerHTML = `
      <div class="card"><div style="font-size:22px;margin-bottom:8px;">📊</div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Ticket Médio</div><div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--gold);">${U.money(ticketMedio)}</div></div>
      <div class="card"><div style="font-size:22px;margin-bottom:8px;">📅</div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Esta Semana</div><div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--gold);">${U.money(totalSemana)}</div></div>
      <div class="card"><div style="font-size:22px;margin-bottom:8px;">👥</div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Clientes Ativos</div><div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--gold);">${clientes.length}</div></div>
    `;

    const svCount = {};
    cortes.forEach(c=>c.servicos.forEach(sid=>{ svCount[sid]=(svCount[sid]||0)+1; }));
    const ranking = Object.entries(svCount).sort((a,b)=>b[1]-a[1]);
    const max = ranking[0]?.[1]||1;
    document.getElementById('servicos-ranking').innerHTML = ranking.map(([id,cnt])=>{
      const s = Store.byId('servicos',Number(id));
      const pct = Math.round(cnt/max*100);
      const rev = cnt * (s?.preco||0);
      return `<div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span style="font-weight:500;">${U.catEmoji(s?.cat)} ${U.sanitize(s?.nome||'?')}</span>
          <span style="font-size:12px;color:var(--muted);">${cnt}x · <span class="text-gold money">${U.money(rev)}</span></span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${pct>70?'var(--gold)':pct>40?'var(--blue)':'var(--muted2)'};" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div></div>
      </div>`;
    }).join('');
  },
};

// ═══════════════════════════════════════════
//  ACTIONS
// ═══════════════════════════════════════════
const Agenda = {
  iniciarCorte(id) {
    const a = Store.byId('agendamentos', id);
    if (!a) return;
    Store.update('agendamentos', id, { status: 'cancelado' });
    const novoCorte = {
      id: Store.nextId('cortes'),
      cliente_id: a.cliente_id, barbeiro_id: a.barbeiro_id,
      servicos: a.servicos, data: a.data,
      hora: a.hora, pagamento: 'pix',
      total: a.servicos.reduce((s,sid)=>s+(Store.byId('servicos',sid)?.preco||0),0),
      obs: a.obs, status: 'concluído',
    };
    Store.add('cortes', novoCorte);
    Toast.show('Corte registrado com sucesso! ✂️', 'success');
    App.updateBadges();
    Renders.agenda();
  },
  confirmar(id) {
    Store.update('agendamentos', id, { status: 'confirmado' });
    Toast.show('Agendamento confirmado!', 'success');
    Renders.agenda();
  },
  cancelar(id) {
    Confirm.show('Cancelar Agendamento', 'Deseja cancelar este agendamento?', ()=>{
      Store.update('agendamentos', id, { status: 'cancelado' });
      Toast.show('Agendamento cancelado.', 'error');
      App.updateBadges();
      Renders.agenda();
    }, '🗑️');
  }
};

const Cortes = {
  filter(q) { Renders._cortesSearch = q; Renders._renderCortes(); },
  setTab(tab, el) {
    document.querySelectorAll('#page-cortes .tab').forEach(t=>{
      t.classList.remove('active');
      t.setAttribute('aria-selected','false');
    });
    el.classList.add('active');
    el.setAttribute('aria-selected','true');
    Renders._cortesTab = tab;
    Renders._renderCortes();
  },
  remover(id) {
    Confirm.show('Remover Corte', 'Remover este registro de corte?', ()=>{
      Store.remove('cortes', id);
      Toast.show('Corte removido.', 'info');
      Renders.cortes();
    }, '🗑️');
  }
};

const ClientesActions = {
  remover(id) {
    const cl = Store.byId('clientes', id);
    Confirm.show('Remover Cliente', `Remover "${cl?.nome}"? Cortes associados serão mantidos.`, ()=>{
      Store.remove('clientes', id);
      Toast.show('Cliente removido.', 'info');
      Renders.clientes();
    }, '🗑️');
  }
};

const BarbeirosActions = {
  remover(id) {
    const b = Store.byId('barbeiros', id);
    Confirm.show('Remover Barbeiro', `Remover "${b?.nome}"?`, ()=>{
      Store.remove('barbeiros', id);
      Toast.show('Barbeiro removido.', 'info');
      Renders.barbeiros();
    }, '🗑️');
  }
};

const ServicosActions = {
  remover(id, e) {
    e?.stopPropagation();
    const s = Store.byId('servicos', id);
    Confirm.show('Remover Serviço', `Remover "${s?.nome}"?`, ()=>{
      Store.remove('servicos', id);
      Toast.show('Serviço removido.', 'info');
      Renders.servicos();
    }, '🗑️');
  }
};

const CalNav = {
  select(d) {
    Renders._renderMiniCal.call(Renders, d);
    const agEl = document.getElementById('agenda-day-info');
    const ags = Store.get('agendamentos').filter(a=>a.data===d);
    if (!ags.length) { agEl.innerHTML = `<div class="card" style="text-align:center;color:var(--muted);font-size:13px;">Nenhum agendamento em ${U.dateFmt(d)}</div>`; return; }
    agEl.innerHTML = `<div class="card">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${U.dateFmt(d)} · ${ags.length} agendamento(s)</div>
      ${ags.map(a=>{
        const cl=Store.byId('clientes',a.cliente_id);
        const ba=Store.byId('barbeiros',a.barbeiro_id);
        return `<div class="flex gap-2" style="padding:8px 0;border-bottom:1px solid var(--border);">
          <span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--gold);min-width:40px;">${a.hora}</span>
          <span style="font-size:13px;">${U.sanitize(cl?.nome||'?')}</span>
          <span class="badge badge-muted" style="margin-left:auto;">${U.sanitize(ba?.nome||'?')}</span>
        </div>`;
      }).join('')}
    </div>`;
  },
  prev() {
    if (!window._calDate) window._calDate = new Date();
    window._calDate.setMonth(window._calDate.getMonth()-1);
    Renders._renderMiniCal.call(Renders, U.today());
  },
  next() {
    if (!window._calDate) window._calDate = new Date();
    window._calDate.setMonth(window._calDate.getMonth()+1);
    Renders._renderMiniCal.call(Renders, U.today());
  }
};

// ═══════════════════════════════════════════
//  MODAL — AGENDA
// ═══════════════════════════════════════════
const ModalAgenda = {
  _sel: [],
  open() {
    this._sel = [];
    const cl = document.getElementById('ag-cliente');
    cl.innerHTML = Store.get('clientes').map(c=>`<option value="${c.id}">${U.sanitize(c.nome)}</option>`).join('');
    const ba = document.getElementById('ag-barbeiro');
    ba.innerHTML = Store.get('barbeiros').filter(b=>b.status==='ativo').map(b=>`<option value="${b.id}">${U.sanitize(b.nome)}</option>`).join('');
    document.getElementById('ag-data').value = U.today();
    document.getElementById('ag-hora').value = '09:00';
    document.getElementById('ag-obs').value = '';
    const chips = document.getElementById('ag-servicos-chips');
    chips.innerHTML = Store.get('servicos').map(s=>`<span class="chip" role="checkbox" aria-checked="false" tabindex="0" onclick="ModalAgenda.toggleSrv(${s.id},this)" onkeydown="if(event.key==='Enter'||event.key===' ')ModalAgenda.toggleSrv(${s.id},this)">${U.catEmoji(s.cat)} ${U.sanitize(s.nome)}</span>`).join('');
    document.getElementById('modal-agenda').classList.add('open');
  },
  toggleSrv(id, el) {
    if (this._sel.includes(id)) {
      this._sel = this._sel.filter(x=>x!==id);
      el.classList.remove('active');
      el.setAttribute('aria-checked','false');
    } else {
      this._sel.push(id);
      el.classList.add('active');
      el.setAttribute('aria-checked','true');
    }
  },
  close() { document.getElementById('modal-agenda').classList.remove('open'); },
  save() {
    const cl = document.getElementById('ag-cliente').value;
    const ba = document.getElementById('ag-barbeiro').value;
    const dt = document.getElementById('ag-data').value;
    const hr = document.getElementById('ag-hora').value;
    if (!cl||!ba||!dt||!hr) { Toast.show('Preencha todos os campos!','error'); return; }
    if (!this._sel.length) { Toast.show('Selecione ao menos um serviço!','error'); return; }
    const novo = {
      id: Store.nextId('agendamentos'),
      cliente_id: Number(cl), barbeiro_id: Number(ba),
      servicos: this._sel, data: dt, hora: hr,
      obs: document.getElementById('ag-obs').value,
      status: 'aguardando',
    };
    Store.add('agendamentos', novo);
    Toast.show('Agendamento criado! 📅','success');
    App.updateBadges();
    this.close();
    if (App.current==='agenda') Renders.agenda();
    if (App.current==='dashboard') Renders.dashboard();
  }
};

// ═══════════════════════════════════════════
//  MODAL — CORTE
// ═══════════════════════════════════════════
const ModalCorte = {
  _sel: [],
  open() {
    this._sel = [];
    document.getElementById('co-cliente').innerHTML = Store.get('clientes').map(c=>`<option value="${c.id}">${U.sanitize(c.nome)}</option>`).join('');
    document.getElementById('co-barbeiro').innerHTML = Store.get('barbeiros').filter(b=>b.status==='ativo').map(b=>`<option value="${b.id}">${U.sanitize(b.nome)}</option>`).join('');
    document.getElementById('co-data').value = U.today();
    document.getElementById('co-hora').value = new Date().toTimeString().slice(0,5);
    document.getElementById('co-pagamento').value = 'pix';
    document.getElementById('co-total').value = '';
    document.getElementById('co-obs').value = '';
    const chips = document.getElementById('co-servicos-chips');
    chips.innerHTML = Store.get('servicos').map(s=>`<span class="chip" role="checkbox" aria-checked="false" tabindex="0" onclick="ModalCorte.toggleSrv(${s.id},${s.preco},this)" onkeydown="if(event.key==='Enter'||event.key===' ')ModalCorte.toggleSrv(${s.id},${s.preco},this)">${U.catEmoji(s.cat)} ${U.sanitize(s.nome)} (${U.money(s.preco)})</span>`).join('');
    document.getElementById('modal-corte').classList.add('open');
  },
  toggleSrv(id, preco, el) {
    if (this._sel.find(x=>x.id===id)) {
      this._sel = this._sel.filter(x=>x.id!==id);
      el.classList.remove('active');
      el.setAttribute('aria-checked','false');
    } else {
      this._sel.push({id,preco});
      el.classList.add('active');
      el.setAttribute('aria-checked','true');
    }
    const t = this._sel.reduce((s,x)=>s+x.preco,0);
    document.getElementById('co-total').value = t.toFixed(2);
  },
  close() { document.getElementById('modal-corte').classList.remove('open'); },
  save() {
    const cl = document.getElementById('co-cliente').value;
    const ba = document.getElementById('co-barbeiro').value;
    const dt = document.getElementById('co-data').value;
    const hr = document.getElementById('co-hora').value;
    const total = document.getElementById('co-total').value;
    if (!cl||!ba||!dt||!hr||!total) { Toast.show('Preencha todos os campos!','error'); return; }
    if (!this._sel.length) { Toast.show('Selecione ao menos um serviço!','error'); return; }
    const novo = {
      id: Store.nextId('cortes'),
      cliente_id: Number(cl), barbeiro_id: Number(ba),
      servicos: this._sel.map(x=>x.id), data: dt, hora: hr,
      pagamento: document.getElementById('co-pagamento').value,
      total: Number(total),
      obs: document.getElementById('co-obs').value,
      status: 'concluído',
    };
    Store.add('cortes', novo);
    Toast.show('Corte registrado! ✂️','success');
    this.close();
    if (App.current==='cortes') Renders.cortes();
    if (App.current==='dashboard') Renders.dashboard();
    if (App.current==='caixa') Renders.caixa();
  }
};

// ═══════════════════════════════════════════
//  MODAL — CLIENTE
// ═══════════════════════════════════════════
const ModalCliente = {
  _editId: null,
  open() {
    this._editId = null;
    document.getElementById('modal-cliente-title').textContent = 'Novo Cliente';
    document.getElementById('modal-cliente-btn').textContent = 'Salvar Cliente';
    document.getElementById('cl-nome').value = '';
    document.getElementById('cl-tel').value = '';
    document.getElementById('cl-obs').value = '';
    document.getElementById('cl-barbeiro').innerHTML = '<option value="">— Nenhum —</option>' +
      Store.get('barbeiros').map(b=>`<option value="${b.id}">${U.sanitize(b.nome)}</option>`).join('');
    document.getElementById('modal-cliente').classList.add('open');
  },
  edit(id) {
    this._editId = id;
    const cl = Store.byId('clientes', id);
    document.getElementById('modal-cliente-title').textContent = 'Editar Cliente';
    document.getElementById('modal-cliente-btn').textContent = 'Atualizar';
    document.getElementById('cl-nome').value = cl.nome;
    document.getElementById('cl-tel').value = cl.tel||'';
    document.getElementById('cl-obs').value = cl.obs||'';
    document.getElementById('cl-barbeiro').innerHTML = '<option value="">— Nenhum —</option>' +
      Store.get('barbeiros').map(b=>`<option value="${b.id}"${b.id===cl.barbeiro_id?' selected':''}>${U.sanitize(b.nome)}</option>`).join('');
    document.getElementById('modal-cliente').classList.add('open');
  },
  close() { document.getElementById('modal-cliente').classList.remove('open'); },
  save() {
    const nome = document.getElementById('cl-nome').value.trim();
    const tel = document.getElementById('cl-tel').value.trim();
    if (!nome) { Toast.show('Informe o nome do cliente!','error'); return; }
    const bid = document.getElementById('cl-barbeiro').value;
    const data = { nome, tel, barbeiro_id: bid?Number(bid):null, obs: document.getElementById('cl-obs').value.trim() };
    if (this._editId) {
      Store.update('clientes', this._editId, data);
      Toast.show('Cliente atualizado!','success');
    } else {
      Store.add('clientes', { id: Store.nextId('clientes'), ...data });
      Toast.show('Cliente cadastrado!','success');
    }
    this.close();
    if (App.current==='clientes') Renders.clientes();
  }
};

// ═══════════════════════════════════════════
//  MODAL — BARBEIRO
// ═══════════════════════════════════════════
const ModalBarbeiro = {
  _editId: null,
  open() {
    this._editId = null;
    document.getElementById('modal-barbeiro-title').textContent = 'Novo Barbeiro';
    document.getElementById('modal-barbeiro-btn').textContent = 'Salvar';
    ['ba-nome','ba-esp','ba-tel','ba-com'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('ba-status').value = 'ativo';
    document.getElementById('modal-barbeiro').classList.add('open');
  },
  edit(id) {
    this._editId = id;
    const b = Store.byId('barbeiros', id);
    document.getElementById('modal-barbeiro-title').textContent = 'Editar Barbeiro';
    document.getElementById('modal-barbeiro-btn').textContent = 'Atualizar';
    document.getElementById('ba-nome').value = b.nome;
    document.getElementById('ba-esp').value = b.esp||'';
    document.getElementById('ba-tel').value = b.tel||'';
    document.getElementById('ba-com').value = b.comissao||50;
    document.getElementById('ba-status').value = b.status||'ativo';
    document.getElementById('modal-barbeiro').classList.add('open');
  },
  close() { document.getElementById('modal-barbeiro').classList.remove('open'); },
  save() {
    const nome = document.getElementById('ba-nome').value.trim();
    if (!nome) { Toast.show('Informe o nome!','error'); return; }
    const data = {
      nome, esp: document.getElementById('ba-esp').value.trim(),
      tel: document.getElementById('ba-tel').value.trim(),
      comissao: Number(document.getElementById('ba-com').value)||50,
      status: document.getElementById('ba-status').value,
    };
    if (this._editId) {
      Store.update('barbeiros', this._editId, data);
      Toast.show('Barbeiro atualizado!','success');
    } else {
      Store.add('barbeiros', { id: Store.nextId('barbeiros'), ...data });
      Toast.show('Barbeiro cadastrado!','success');
    }
    this.close();
    if (App.current==='barbeiros') Renders.barbeiros();
  }
};

// ═══════════════════════════════════════════
//  MODAL — SERVIÇO
// ═══════════════════════════════════════════
const ModalServico = {
  _editId: null,
  open() {
    this._editId = null;
    document.getElementById('modal-servico-title').textContent = 'Novo Serviço';
    document.getElementById('modal-servico-btn').textContent = 'Salvar Serviço';
    ['sv-nome','sv-preco','sv-duracao'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('sv-cat').value = 'corte';
    document.getElementById('modal-servico').classList.add('open');
  },
  edit(id, e) {
    e?.stopPropagation();
    this._editId = id;
    const s = Store.byId('servicos', id);
    document.getElementById('modal-servico-title').textContent = 'Editar Serviço';
    document.getElementById('modal-servico-btn').textContent = 'Atualizar';
    document.getElementById('sv-nome').value = s.nome;
    document.getElementById('sv-preco').value = s.preco;
    document.getElementById('sv-duracao').value = s.duracao;
    document.getElementById('sv-cat').value = s.cat;
    document.getElementById('modal-servico').classList.add('open');
  },
  close() { document.getElementById('modal-servico').classList.remove('open'); },
  save() {
    const nome = document.getElementById('sv-nome').value.trim();
    const preco = Number(document.getElementById('sv-preco').value);
    const dur = Number(document.getElementById('sv-duracao').value);
    if (!nome||!preco||!dur) { Toast.show('Preencha todos os campos!','error'); return; }
    const data = { nome, preco, duracao:dur, cat: document.getElementById('sv-cat').value };
    if (this._editId) {
      Store.update('servicos', this._editId, data);
      Toast.show('Serviço atualizado!','success');
    } else {
      Store.add('servicos', { id: Store.nextId('servicos'), ...data });
      Toast.show('Serviço cadastrado!','success');
    }
    this.close();
    if (App.current==='servicos') Renders.servicos();
  }
};

// ═══════════════════════════════════════════
//  CLOSE MODALS ON OVERLAY CLICK
// ═══════════════════════════════════════════
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay && overlay.id !== 'modal-confirm') {
      overlay.classList.remove('open');
    }
  });
});

// ═══════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════
App.init();
