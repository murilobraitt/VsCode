   const currencies = {
     real: {
      valorMoeda: 1,
       locale: 'pt-BR',
       currency: 'BRL',
       name: 'Real Brasileiro',
       image: 'https://img.freepik.com/vetores-premium/brasil-como-um-icone-brilhante-redondo_1222108-165.jpg?semt=ais_hybrid&w=740&q=80'
  },
    dolar: { 
      valorMoeda: 0,
      locale: 'en-US',
      currency: 'USD',
      name: 'Dólar Americano',
      image: 'https://thumbs.dreamstime.com/b/bandeira-do-estados-unidos-da-am%C3%A9rica-%C3%ADcone-lustroso-vetor-crach%C3%A1-americano-isolado-132659192.jpg'
  },
    euro: {
      valorMoeda: 0,
      locale: 'de-DE',
      currency: 'EUR',
      name: 'Euro',
      image: 'https://png.pngtree.com/png-clipart/20190614/original/pngtree-euro-icon-png-image_3700417.jpg'
  },
    bitcoin: {
      valorMoeda: 0,
      locale: 'en-US',
      currency: 'BTC',
      name: 'Bitcoin',
      image: 'https://www.shutterstock.com/image-vector/bitcoin-orange-logo-icon-circle-600nw-2529375087.jpg'
  },
    yuan: {
      valorMoeda: 0,
      locale: 'zh-CN',
      currency: 'CNY',
      name: 'Yuan',
      image: 'https://static.vecteezy.com/ti/vetor-gratis/p1/14337198-simbolo-de-yuan-chines-vetor.jpg'
  },
    libra: {
      valorMoeda: 0,
      locale: 'en-GB',
      currency: 'GBP',
      name: 'Libra Esterlina',
      image: 'https://static.vecteezy.com/ti/vetor-gratis/p1/5720180-libra-icone-moeda-britanica-simbolo-ilustracao-moeda-simbolo-gratis-vetor.jpg'
  },
  iene: {
      valorMoeda: 0,
      locale: 'ja-JP',
      currency: 'JPY',
      name: 'Iene Japonês',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZJLd-i6Epo-wGws_f15YeP78TKPge1x9S3o9pIUqEEg&s=10'
  }
};

const convertButton = document.querySelector('.convert-button')
const currencyFromSelect = document.querySelector('.currency-to-select')
const currencyToSelect = document.querySelector('.currency-select')
const elementoVariacao = document.querySelector('.moeda-variacao')
const elementoLimites = document.querySelector('.moeda-limites')

let meuGraficoInstancia = null;
let periodoSelecionado = '7'

window.convertValues = async (showAlert = true) => {
const rawValue = document.querySelector('.input-convertor').value
const inputConvertorValue = Number(rawValue)

if (isNaN(inputConvertorValue) || inputConvertorValue <= 0) {
    if (showAlert) alert('Por favor, insira um valor válido.');
    return;
  }

  const deMoeda = currencyFromSelect.value;
  const paraMoeda = currencyToSelect.value;

  try {
    const response = await fetch(`/converter?valor=${inputConvertorValue}&de=${deMoeda}&para=${paraMoeda}`);
    const data = await response.json();
  
   if (data.erro) {
      if (showAlert) alert(data.erro);
      return
    }

document.querySelector('.valor-converter').innerHTML = data.valorOriginal
document.querySelector('.valor-convertido').innerHTML = data.resultado

    // 🛠️ SEÇÃO INSTALADA: Lógica para exibir a variação com setas e cores dinâmicas
    if (deMoeda === 'real' && paraMoeda === 'real') {
      elementoVariacao.innerHTML = ''; // Se for Real para Real, esvazia o texto
    } else {
      const varNumero = Number(data.variacao);
      const varFormatada = varNumero.toFixed(2) + '%';

      // Reseta as classes antigas para não misturar verde com vermelho
      elementoVariacao.classList.remove('alta', 'baixa');

      if (varNumero > 0) {
        // Se subiu: coloca a seta para cima e pinta de verde (classe alta)
        elementoVariacao.innerHTML = `▲ +${varFormatada} hoje`;
        elementoVariacao.classList.add('alta');
      } else if (varNumero < 0) {
        // Se caiu: coloca a seta para baixo e pinta de vermelho (classe baixa)
        elementoVariacao.innerHTML = `▼ ${varFormatada} hoje`;
        elementoVariacao.classList.add('baixa');
      } else {
        // Se ficou exatamente estável (0%)
        elementoVariacao.innerHTML = `0.00% hoje`;
      }
       if (elementoLimites) {
        const moedaAlvo = deMoeda === 'real' ? paraMoeda : deMoeda;
        const confMoeda = currencies[moedaAlvo];
        
        // Determina quantas casas decimais usar (Bitcoin precisa de mais casas)
        const casasDecimais = confMoeda.currency === 'BTC' ? 4 : 2;
        const maximoText = Number(data.maxima).toFixed(casasDecimais);
        const minimoText = Number(data.minima).toFixed(casasDecimais);

        // Se a moeda de destino for Real, exibe o símbolo R$. Caso contrário, exibe o símbolo da moeda estrangeira
        const simboloExibicao = paraMoeda === 'real' ? 'R$' : (confMoeda.currency === 'USD' ? 'US$' : (confMoeda.currency === 'EUR' ? '€' : ''));

        elementoLimites.innerHTML = `Mín: ${simboloExibicao} ${minimoText} | Máx: ${simboloExibicao} ${maximoText}`;
      }
    }
  } catch (error) {
    console.error('Erro ao conectar com o servidor local:', error);
  }
}

async function atualizarGrafico() {
  // O gráfico vai mostrar a tendência da moeda que NÃO for o Real.
  // Se "De" for Real, olhamos a tendência do "Para". Se "De" for estrangeira, olhamos a tendência dela.
  const moedaParaHistorico = currencyFromSelect.value === 'real' ? currencyToSelect.value : currencyFromSelect.value;
  const container = document.querySelector('.grafico-container');

  // Se as duas moedas selecionadas forem Real, ocultamos a caixinha do gráfico por lógica
  if (currencyFromSelect.value === 'real' && currencyToSelect.value === 'real') {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';

  try {
    const response = await fetch(`/historico?moeda=${moedaParaHistorico}&dias=${periodoSelecionado}`);
    const dados = await response.json();

    if (dados.erro) {
      console.warn(dados.erro);
      return;
    }

    // Mapeia e divide os dados em rótulos (datas) e valores (preços) exigidos pelo Chart.js [Docs]
    const rotulosDatas = dados.map(item => item.data);
    const valoresPrecos = dados.map(item => item.preco);

    const ctx = document.getElementById('canvasGrafico').getContext('2d');

    // REGRA DO CHART.JS: Se o gráfico já existir na tela, precisamos destruí-lo antes de criar o novo [Docs]
    if (meuGraficoInstancia) {
      meuGraficoInstancia.destroy();
    }

    // Configuração oficial de design do Chart.js combinando perfeitamente com seu CSS [Docs]
    meuGraficoInstancia = new Chart(ctx, {
      type: 'line',
      data: {
        labels: rotulosDatas,
        datasets: [{
          label: `Preço em Real (${currencies[moedaParaHistorico].currency})`,
          data: valoresPrecos,
          borderColor: '#38bdf8', // Azul claro brilhante igual seus destaques do CSS
          backgroundColor: 'rgba(56, 189, 248, 0.1)', // Sombra azul transparente abaixo da linha
          borderWidth: 3,
          tension: 0.3, // Deixa a linha do gráfico curvada e elegante
          pointBackgroundColor: '#4ade80', // Pontos em verde igual seu resultado convertido
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false } // Oculta legenda para economizar espaço no card
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
        }
      }
    });

  } catch (error) {
    console.error('Erro ao renderizar gráfico:', error);
  }
}

function changeCurrency() {
    const fromCurrency = currencies[currencyFromSelect.value]
    const toCurrency = currencies[currencyToSelect.value]

    if (fromCurrency) {
        document.querySelector('.converter-name').innerHTML = fromCurrency.name
        document.querySelector('.imagem-de').src = fromCurrency.image
    }

    if (toCurrency) {
        document.querySelector('.convertido-name').innerHTML = toCurrency.name
        document.querySelector('.imagem').src = toCurrency.image
    }

    convertValues(false)
    atualizarGrafico()
}

currencyFromSelect.addEventListener('change', changeCurrency)
currencyToSelect.addEventListener('change', changeCurrency)
convertButton.addEventListener('click', () => convertValues(true))
const invertButton = document.querySelector('.invert-button')
invertButton.addEventListener('click', () => {
  const tempValue = currencyFromSelect.value;
  currencyFromSelect.value = currencyToSelect.value;
  currencyToSelect.value = tempValue;
  changeCurrency();
});

// 3. INSTALADO: Gerenciador de cliques nos botões de período (7D, 15D, 30D, 60D)
document.querySelectorAll('.periodo-btn').forEach(botao => {
  botao.addEventListener('click', (evento) => {
    // Remove a classe 'active' do botão antigo
    document.querySelectorAll('.periodo-btn').forEach(btn => btn.classList.remove('active'));
    
    // Adiciona a classe 'active' no botão que acabou de ser clicado
    evento.target.classList.add('active');
    
    // Captura o número do atributo data-dias e atualiza o gráfico
    periodoSelecionado = evento.target.getAttribute('data-dias');
    atualizarGrafico();
  });
});

changeCurrency()

setInterval(async () => {
  const rawValue = document.querySelector('.input-convertor').value
  if (rawValue && Number(rawValue) > 0) {
    convertValues(false);
  }
  atualizarGrafico();
}, 60000)