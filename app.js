const express = require('express');
const app = express();
const porta = process.env.PORT || 3000;

// ADICIONE ESTA LINHA: Ela faz o Node entregar seu HTML/CSS/JS da pasta public automaticamente!
app.use(express.static('public'));

const currencies = {
  real: { valorMoeda: 1, locale: 'pt-BR', currency: 'BRL', name: 'Real Brasileiro' },
  dolar: { valorMoeda: 5.80, locale: 'en-US', currency: 'USD', name: 'Dólar Americano' },
  euro: { valorMoeda: 6.10, locale: 'de-DE', currency: 'EUR', name: 'Euro' },
  bitcoin: { valorMoeda: 550000, locale: 'en-US', currency: 'BTC', name: 'Bitcoin' },
  yuan: { valorMoeda: 0.80, locale: 'zh-CN', currency: 'CNY', name: 'Yuan' },
  libra: { valorMoeda: 7.30, locale: 'en-GB', currency: 'GBP', name: 'Libra Esterlina' },
  iene: { valorMoeda: 0.038, locale: 'ja-JP', currency: 'JPY', name: 'Iene Japonês' }
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

    currencies.dolar.valorMoeda = Number(data.USDBRL.bid);
    currencies.euro.valorMoeda = Number(data.EURBRL.bid);
    currencies.bitcoin.valorMoeda = Number(data.BTCBRL.bid);
    currencies.yuan.valorMoeda = Number(data.CNYBRL.bid);
    currencies.libra.valorMoeda = Number(data.GBPBRL.bid);
    currencies.iene.valorMoeda = Number(data.JPYBRL.bid);

    console.log(`[${new Date().toLocaleTimeString()}] Preços atualizados via API de mercado.`);
  } catch (error) {
    console.error('Erro ao buscar as taxas de câmbio (Usando valores padrão):', error);
  }
};

app.get('/converter', async (req, res) => {
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

  const valueInReal = fromCurrency.currency === 'BRL' 
    ? inputConvertorValue 
    : inputConvertorValue * fromCurrency.valorMoeda;

  const finalValue = toCurrency.currency === 'BRL' 
    ? valueInReal 
    : valueInReal / toCurrency.valorMoeda;

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

  res.json({
    valorOriginal: valorOriginalFormatado,
    resultado: valorConvertidoFormatado
  });
});

app.get('/historico', async (req, res) => {
  const moedaSelecionada = req.query.moeda || 'dolar';
  
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
      ? `https://economia.awesomeapi.com.br/json/daily/${codigo}-BRL/7?token=${TOKEN}`
      : `https://economia.awesomeapi.com.br/json/daily/${codigo}-BRL/7`;

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
