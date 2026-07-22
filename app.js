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
    const response = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,CNY-BRL,GBP-BRL,JPY-BRL");
    const data = await response.json();
    const dolarAntigo = currencies.dolar.valorMoeda;
    currencies.dolar.valorMoeda = Number(data.USDBRL.high);
    currencies.euro.valorMoeda = Number(data.EURBRL.high);
    currencies.bitcoin.valorMoeda = Number(data.BTCBRL.high);
    currencies.yuan.valorMoeda = Number(data.CNYBRL.high);
    currencies.libra.valorMoeda = Number(data.GBPBRL.high);
    currencies.iene.valorMoeda = Number(data.JPYBRL.high);
    console.log("=== PREÇOS ATUALIZADOS DO MERCADO ===");
    console.log(`💵 Dólar: R$ ${currencies.dolar.valorMoeda}`);
    console.log(`💶 Euro: R$ ${currencies.euro.valorMoeda}`);
    console.log(`₿ Bitcoin: R$ ${currencies.bitcoin.valorMoeda}`);
    console.log(`🇨🇳 Yuan: R$ ${currencies.yuan.valorMoeda}`);
    console.log(`🇬🇧 Libra: R$ ${currencies.libra.valorMoeda}`);
    console.log(`🇯🇵 Iene: R$ ${currencies.iene.valorMoeda}`);
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
    de: fromCurrency.name,
    para: toCurrency.name,
    valorOriginal: valorOriginalFormatado,
    resultado: valorConvertidoFormatado
  });
});
setInterval(updateExchangeRates, 60000);

app.listen(porta, () => {
  console.log(`Servidor de conversão rodando em http://localhost:${porta}`);
});
