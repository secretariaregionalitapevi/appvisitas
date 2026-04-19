document.addEventListener('DOMContentLoaded', async () => {
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
            <label title="Grupo de Visitas Músicos">GVMU</label>
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

      input.addEventListener('input', () => {
        let sum = 0;
        inputs.forEach((item) => {
          sum += parseInt(item.value || 0, 10);
        });
        if (totalField) {
          totalField.value = sum;
        }
      });
    });
  }

  renderMonthlyForm();

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

    const payload = {
      referencia_mes: monthInt,
      referencia_ano: new Date().getFullYear(),
      gvi: parseInt(rawData.gvi || 0, 10),
      gvm: parseInt(rawData.gvm || 0, 10),
      gvmu: parseInt(rawData.gvmu || 0, 10),
      rf: parseInt(rawData.rf || 0, 10),
      re: parseInt(rawData.re || 0, 10),
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
          const duplicateMessage = existing
            ? [
                errorData.error || 'Já existe um lançamento para esta comum no mês e ano selecionados.',
                '',
                `Comum: ${existing.comum || errorData.details.comum || 'Não informada'}`,
                `Município: ${existing.municipio || 'Não informado'}`,
                `Responsável: ${existing.identificacao || 'Não informado'}`,
                `Data: ${existing.data_lancamento || existing.created_at || 'Não informada'}`
              ].join('\n')
            : (errorData.error || 'Já existe um lançamento para esta comum no mês e ano selecionados.');
          throw new Error(duplicateMessage);
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



