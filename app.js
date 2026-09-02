const express = require('express');
const app = express();
const porta = process.env.PORT || 3000;

// ADICIONE ESTA LINHA: Ela faz o Node entregar seu HTML/CSS/JS da pasta public automaticamente!
app.use(express.static('public'));

const currencies = {
  real: { valorMoeda: 1, locale: 'pt-BR', currency: 'BRL', name: 'Real Brasileiro', pctChange: 0, high: 1, low: 1 },
  dolar: { valorMoeda: 5.80, locale: 'en-US', currency: 'USD', name: 'Dólar Americano', pctChange: 0, high: 5.80, low: 5.80 },
  euro: { valorMoeda: 6.10, locale: 'de-DE', currency: 'EUR', name: 'Euro', pctChange: 0, high: 6.10, low: 6.10 },
  bitcoin: { valorMoeda: 550000, locale: 'en-US', currency: 'BTC', name: 'Bitcoin', pctChange: 0, high: 550000, low: 550000 },
  yuan: { valorMoeda: 0.80, locale: 'zh-CN', currency: 'CNY', name: 'Yuan', pctChange: 0, high: 0.80, low: 0.80 },
  libra: { valorMoeda: 7.30, locale: 'en-GB', currency: 'GBP', name: 'Libra Esterlina', pctChange: 0, high: 7.30, low: 7.30 },
  iene: { valorMoeda: 0.038, locale: 'ja-JP', currency: 'JPY', name: 'Iene Japonês', pctChange: 0, high: 0.038, low: 0.038 }
};

const updateExchangeRates = async () => {
  try {
    const TOKEN = process.env.TOKEN_AWESOME;
    if (!TOKEN) {
       console.warn("AVISO: Variável TOKEN_AWESOME não configurada no Render. Usando cota grátis aberta.")
    }
    const url = TOKEN
    ? `https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL,CNY-BRL,GBP-BRL,JPY-BRL?token=${TOKEN}`
    : "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL,CNY-BRL,GBP-BRL,JPY-BRL";

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);
  
    const data = await response.json();

    const moedasApi = { dolar: 'USDBRL', euro: 'EURBRL', bitcoin: 'BTCBRL', yuan: 'CNYBRL', libra: 'GBPBRL', iene: 'JPYBRL' }

    for (const [chave, parApi] of Object.entries(moedasApi)) {
      if (data[parApi]) {
        currencies[chave].valorMoeda = Number(data[parApi].bid);
        currencies[chave].pctChange = Number(data[parApi].pctChange);
        currencies[chave].high = Number(data[parApi].high);
        currencies[chave].low = Number(data[parApi].low);
      }
    }

    console.log(`[${new Date().toLocaleTimeString()}] Preços atualizados via API de mercado.`);
  } catch (error) {
    console.error('Erro ao buscar as taxas de câmbio (Usando valores anteriores):', error);
  }
};

app.get('/converter', (req, res) => {
  const inputConvertorValue = Number(req.query.valor);
  const deMoeda = req.query.de || 'real';
  const paraMoeda = req.query.para || 'dolar';

  if (isNaN(inputConvertorValue) || inputConvertorValue <= 0) {
    return res.status(400).json({ erro: 'Por favor, insira um valor válido.' });
  }

  const fromCurrency = currencies[deMoeda];
  const toCurrency = currencies[paraMoeda];

  if (!fromCurrency || !toCurrency) {
    return res.status(400).json({ erro: 'Moeda de origem ou destino inválida.' });
  }

  // --- CÁLCULO DOS VALORES DE CONVERSÃO ---
  const valueInReal = fromCurrency.currency === 'BRL' 
    ? inputConvertorValue 
    : inputConvertorValue * fromCurrency.valorMoeda;

  const finalValue = toCurrency.currency === 'BRL' 
    ? valueInReal 
    : valueInReal / toCurrency.valorMoeda;

  // --- LOGICA DE VARIAÇÃO, MÁXIMA E MÍNIMA ---
  let porcentagemVariacao = 0;
  let maximaHoje = 0;
  let minimaHoje = 0;
  
  if (deMoeda === 'real' && paraMoeda !== 'real') {
    porcentagemVariacao = -toCurrency.pctChange;
    maximaHoje = 1 / toCurrency.low;
    minimaHoje = 1 / toCurrency.high;
  } else if (deMoeda !== 'real' && paraMoeda === 'real') {
    porcentagemVariacao = fromCurrency.pctChange;
    maximaHoje = fromCurrency.high;
    minimaHoje = fromCurrency.low;
  } else if (deMoeda !== 'real' && paraMoeda !== 'real') {
    porcentagemVariacao = fromCurrency.pctChange - toCurrency.pctChange;
    maximaHoje = fromCurrency.valorMoeda / toCurrency.valorMoeda;
    minimaHoje = fromCurrency.valorMoeda / toCurrency.valorMoeda;
  }

  // --- FORMATAÇÃO DOS RESULTADOS ---
  const valorOriginalFormatado = new Intl.NumberFormat(fromCurrency.locale, {
    style: 'currency',
    currency: fromCurrency.currency
  }).format(inputConvertorValue);

  const formatoOpcoes = { style: 'currency', currency: toCurrency.currency };
  if (toCurrency.currency === 'BTC') {
    formatoOpcoes.minimumFractionDigits = 6;
    formatoOpcoes.maximumFractionDigits = 6;
  }

  const valorConvertidoFormatado = new Intl.NumberFormat(toCurrency.locale, formatoOpcoes).format(finalValue);

  // Envia a resposta final estruturada
  res.json({
    valorOriginal: valorOriginalFormatado,
    resultado: valorConvertidoFormatado,
    variacao: porcentagemVariacao,
    maxima: maximaHoje,
    minima: minimaHoje
  });
}); // 💡 Fechamento correto da rota sem o catch órfão

app.get('/historico', async (req, res) => {
  const moedaSelecionada = req.query.moeda || 'dolar';
  const diasSugeridos = req.query.dias || '7';
  
  const codigosMoedas = {
    dolar: 'USD',
    euro: 'EUR',
    bitcoin: 'BTC',
    yuan: 'CNY',
    libra: 'GBP',
    iene: 'JPY'
  };

  const codigo = codigosMoedas[moedaSelecionada];

  if (!codigo || moedaSelecionada === 'real') {
    return res.json({ erro: 'Não há dados históricos para a moeda selecionada.' });
  }

  try {
    const TOKEN = process.env.TOKEN_AWESOME;
    const url = TOKEN
      ? `https://economia.awesomeapi.com.br/json/daily/${codigo}-BRL/${diasSugeridos}?token=${TOKEN}`
      : `https://economia.awesomeapi.com.br/json/daily/${codigo}-BRL/${diasSugeridos}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na API de histórico: ${response.status}`);

    const data = await response.json();
    const historicoOrdenado = data.reverse();

    const dadosGrafico = historicoOrdenado.map(item => {
      const dataOriginal = new Date(item.timestamp * 1000);
      const dia = String(dataOriginal.getDate()).padStart(2, '0');
      const mes = String(dataOriginal.getMonth() + 1).padStart(2, '0');
      
      return {
        data: `${dia}/${mes}`,
        preco: Number(item.bid)
      };
    });

    res.json(dadosGrafico);
  } catch (error) {
    console.error('Erro ao buscar histórico do mercado:', error.message);
    res.status(500).json({ erro: 'Erro ao carregar os dados do gráfico.' });
  }
});

updateExchangeRates(); 
// Atualiza as taxas de câmbio ao iniciar o servidor
setInterval(updateExchangeRates, 60000);

app.listen(porta, () => {
  console.log(`Servidor de conversão rodando em http://localhost:${porta}`);
});
