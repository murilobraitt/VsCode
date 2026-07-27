const express = require('express');
const app = express();
const porta = process.env.PORT || 3000;

// ADICIONE ESTA LINHA: Ela faz o Node entregar seu HTML/CSS/JS da pasta public automaticamente!
app.use(express.static('public'));

const currencies = {
  real: { valorMoeda: 1, locale: 'pt-BR', currency: 'BRL', name: 'Real Brasileiro' },
  dolar: { valorMoeda: 0, locale: 'en-US', currency: 'USD', name: 'Dólar Americano' },
  euro: { valorMoeda: 0, locale: 'de-DE', currency: 'EUR', name: 'Euro' },
  bitcoin: { valorMoeda: 0, locale: 'en-US', currency: 'BTC', name: 'Bitcoin' },
  yuan: { valorMoeda: 0, locale: 'zh-CN', currency: 'CNY', name: 'Yuan' },
  libra: { valorMoeda: 0, locale: 'en-GB', currency: 'GBP', name: 'Libra Esterlina' },
  iene: { valorMoeda: 0, locale: 'ja-JP', currency: 'JPY', name: 'Iene Japonês' }
};

const updateExchangeRates = async () => {
  try {
    const response = await fetch("https://awesomeapi.com.br");
    const data = await response.json();

    currencies.dolar.valorMoeda = Number(data.USD.bid);
    currencies.euro.valorMoeda = Number(data.EUR.bid);
    currencies.bitcoin.valorMoeda = Number(data.BTC.bid);
    currencies.yuan.valorMoeda = Number(data.CNY.bid);
    currencies.libra.valorMoeda = Number(data.GBP.bid);
    currencies.iene.valorMoeda = Number(data.JPY.bid);

    console.log(`[${new Date().toLocaleTimeString()}] Preços atualizados via API de mercado.`);
  } catch (error) {
    console.error('Erro ao buscar as taxas de câmbio:', error);
  }
};

app.get('/converter', async (req, res) => {
  const inputConvertorValue = Number(req.query.valor);
  const deMoeda = req.query.de || 'real';
  const paraMoeda = req.query.para || 'dolar';

  if (isNaN(inputConvertorValue) || inputConvertorValue <= 0) {
    return res.status(400).json({ erro: 'Por favor, insira um valor válido.' });
  }
  
  if (currencies.dolar.valorMoeda === 0) {
    await updateExchangeRates();
  }

  const fromCurrency = currencies[deMoeda];
  const toCurrency = currencies[paraMoeda];

  if (!fromCurrency || !toCurrency) {
    return res.status(400).json({ erro: 'Moeda de origem ou destino inválida.' });
  }

  if (toCurrency.currency !== 'BRL' && toCurrency.valorMoeda === 0) {
    return res.status(503).json({ erro: 'As cotações estão sendo carregadas pelo servidor. Aguarde 2 segundos.' });
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

updateExchangeRates(); // Atualiza as taxas de câmbio ao iniciar o servidor

setInterval(updateExchangeRates, 60000);

app.listen(porta, () => {
  console.log(`Servidor de conversão rodando em http://localhost:${porta}`);
});
