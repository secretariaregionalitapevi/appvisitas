document.addEventListener('DOMContentLoaded', async () => {
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const config = JSON.parse(sessionStorage.getItem('visitas_config'));
  if (!config) {
    window.location.href = '/';
    return;
  }

  // Dinamizar Subtítulo
  if (config.comum) {
    const hSubtitle = document.getElementById('headerSubtitle');
    if (hSubtitle) hSubtitle.innerHTML = `Acompanhamento Regional<br>${config.comum}`;
  }

  const container = document.getElementById('cardsContainer');
  const datePickerRow = document.getElementById('datePickerRow');
  const selectedDateSelect = document.getElementById('selectedDate');
  const form = document.getElementById('visitasForm');

  if (!container || !form) {
    console.error('Elementos essenciais do formulário de visitas não foram encontrados.');
    return;
  }

  const mesesMap = {
    Janeiro: 1,
    Fevereiro: 2,
    Março: 3,
    Abril: 4,
    Maio: 5,
    Junho: 6,
    Julho: 7,
    Agosto: 8,
    Setembro: 9,
    Outubro: 10,
    Novembro: 11,
    Dezembro: 12
  };

  function normalizarMes(nomeMes) {
    if (!nomeMes) {
      return '';
    }

    return String(nomeMes)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  function obterNumeroMes(nomeMes) {
    const lookup = normalizarMes(nomeMes);
    const entrada = Object.keys(mesesMap).find((mes) => normalizarMes(mes) === lookup);
    return entrada ? mesesMap[entrada] : new Date().getMonth() + 1;
  }

  window.updateSummaryWithName = (user) => {
    let name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Auxiliar';
    if (name.toLowerCase() === 'ricardograngeiro') {
      name = 'Ricardo Grangeiro';
    }

    window.auxiliarFullName = name;
    const summaryElement = document.getElementById('selectionSummary');
    if (!summaryElement) {
      console.warn('selectionSummary não encontrado no momento da atualização.');
      return;
    }
    summaryElement.innerHTML = [
      `<strong>Mês Referência:</strong> ${config.mes || 'Não informado'}`,
      `<strong>Município:</strong> ${config.municipio || 'Não informado'}`,
      `<strong>Comum:</strong> ${config.comum || 'Não informada'}`,
      `<span style="color: var(--brand); font-weight: 700;">Responsável: ${name}</span>`
    ].join('<br>');
  };

  if (window.currentUser) {
    window.updateSummaryWithName(window.currentUser);
  }

  const categorias = ['gvi', 'gvm', 'gvmu', 'rf', 're'];
  let camposBloqueados = new Set();

  function atualizarTotal() {
    const totalField = document.getElementById('totalGlobal');
    const inputs = container.querySelectorAll('.count-input:not(.total-field)');
    const total = Array.from(inputs).reduce((sum, input) => sum + parseInt(input.value || 0, 10), 0);
    if (totalField) totalField.value = total;
  }

  function renderMonthlyForm() {
    container.innerHTML = `
      <div class="sunday-card">
        <div class="sunday-card-title">Dados consolidados do mês</div>
        <div class="grid-visits-5">
          <div class="form-group">
            <label title="Grupo de Visitas Irmandade">GVI</label>
            <input type="number" name="gvi" min="0" value="0" required class="count-input">
          </div>
          <div class="form-group">
            <label title="Grupo de Visitas Mocidade">GVM</label>
            <input type="number" name="gvm" min="0" value="0" required class="count-input">
          </div>
          <div class="form-group">
            <label title="Grupo de Visitas Músicos">GVMúsicos</label>
            <input type="number" name="gvmu" min="0" value="0" required class="count-input">
          </div>
          <div class="form-group">
            <label title="Reunião Familiar">RF</label>
            <input type="number" name="rf" min="0" value="0" required class="count-input">
          </div>
          <div class="form-group">
            <label title="Reunião de Evangelização">RE</label>
            <input type="number" name="re" min="0" value="0" required class="count-input">
          </div>
          <div class="form-group total-box-visits">
            <label>Total global do mês</label>
            <input type="number" id="totalGlobal" value="0" readonly class="count-input total-field">
          </div>
        </div>
      </div>
    `;

    const inputs = container.querySelectorAll('.count-input:not(.total-field)');
    const totalField = document.getElementById('totalGlobal');

    inputs.forEach((input) => {
      input.addEventListener('focus', () => {
        if (input.value === '0') {
          input.value = '';
        }
      });

      input.addEventListener('blur', () => {
        if (input.value === '') {
          input.value = '0';
        }
      });

      input.addEventListener('input', atualizarTotal);
    });
  }

  renderMonthlyForm();

  async function consultarLancamentos() {
    const params = new URLSearchParams({
      comum: config.comum || '',
      referencia_mes: String(obterNumeroMes(config.mes)),
      referencia_ano: String(new Date().getFullYear())
    });

    try {
      const response = await window.authFetch(`/api/visitas/status?${params.toString()}`);
      if (!response.ok) throw new Error('Não foi possível consultar os lançamentos existentes.');

      const status = await response.json();
      camposBloqueados = new Set(status.campos_lancados || []);

      categorias.forEach((categoria) => {
        const input = form.elements[categoria];
        if (!input) return;

        if (camposBloqueados.has(categoria)) {
          input.value = String(status.valores?.[categoria] ?? 0);
          input.disabled = true;
          input.style.backgroundColor = '#e2e8f0';
          input.style.borderColor = '#cbd5e1';
          input.style.color = '#64748b';
          input.title = 'Este lançamento já foi realizado para o mês selecionado.';
          input.closest('.form-group')?.querySelector('label')?.insertAdjacentHTML(
            'beforeend',
            ' <small style="color:#64748b;font-weight:600;">(já lançado)</small>'
          );
        }
      });

      atualizarTotal();
    } catch (error) {
      await Swal.fire('Erro', error.message, 'error');
    }
  }

  await consultarLancamentos();

  if (datePickerRow && selectedDateSelect) {
    datePickerRow.classList.add('hidden');
    selectedDateSelect.innerHTML = '<option value="">Selecione...</option>';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = window.currentUser;
    if (!user) {
      Swal.fire('Erro', 'Você precisa estar logado.', 'error');
      return;
    }

    const formData = new FormData(form);
    const rawData = Object.fromEntries(formData.entries());
    const monthInt = obterNumeroMes(config.mes);

    const categoriasParaEnviar = categorias.filter((categoria) => (
      !camposBloqueados.has(categoria) && parseInt(rawData[categoria] || 0, 10) > 0
    ));

    if (categoriasParaEnviar.length === 0) {
      Swal.fire('Atenção', 'Informe ao menos um lançamento ainda disponível.', 'info');
      return;
    }

    const payload = {
      referencia_mes: monthInt,
      referencia_ano: new Date().getFullYear(),
      gvi: parseInt(rawData.gvi || 0, 10),
      gvm: parseInt(rawData.gvm || 0, 10),
      gvmu: parseInt(rawData.gvmu || 0, 10),
      rf: parseInt(rawData.rf || 0, 10),
      re: parseInt(rawData.re || 0, 10),
      categorias: categoriasParaEnviar,
      municipio: config.municipio,
      comum: config.comum,
      identificacao: window.auxiliarFullName || user.email,
      ip: '0.0.0.0',
      os: navigator.platform,
      browser: navigator.userAgent
    };

    Swal.fire({
      title: 'Enviando relatório...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res = await window.authFetch('/api/visitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        if (res.status === 409 && errorData.code === 'duplicate') {
          const existing = errorData.details && errorData.details.existing ? errorData.details.existing : null;
          const comum = existing?.comum || errorData.details?.comum || config.comum || 'Comum não informada';
          const periodo = `${config.mes || 'mês selecionado'} de ${payload.referencia_ano}`;
          const conflitos = (errorData.details?.campos || []).map((campo) => campo.toUpperCase()).join(', ');

          await Swal.fire({
            title: 'Lançamento já realizado',
            html: `
              <p style="margin: 0; color: #64748b; line-height: 1.6;">
                Já existe lançamento para ${escapeHtml(conflitos || 'uma das categorias selecionadas')} em<br>
                <strong style="color: #1e4b7a;">${escapeHtml(comum)}</strong><br>
                <span style="font-size: 14px;">${escapeHtml(periodo)}</span>
              </p>
            `,
            icon: 'info',
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#1e4b7a'
          });
          return;
        }

        throw new Error(errorData.error || errorData.details || 'Falha no envio do relatório.');
      }

      Swal.fire({
        title: 'Sucesso!',
        text: 'Lançamento mensal realizado com sucesso.',
        icon: 'success',
        timer: 3500,
        showConfirmButton: true,
        confirmButtonColor: '#1e4b7a'
      }).then(() => {
        window.location.href = '/';
      });
    } catch (err) {
      Swal.fire('Erro', err.message, 'error');
    }
  });
});



