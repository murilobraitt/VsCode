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
    const MINHA_CHAVE_HG = "2852326"; 
    const response = await fetch(`https://api.hgbrasil.com/finance?format=json&key=${MINHA_CHAVE_HG}`);
    
    if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);

    const data = await response.json();

    const moedas = data.results.currencies;

    currencies.dolar.valorMoeda = Number(moedas.USD.buy);
    currencies.euro.valorMoeda = Number(moedas.EUR.buy);
    currencies.bitcoin.valorMoeda = Number(moedas.BTC.buy);
    currencies.yuan.valorMoeda = Number(moedas.CNY.buy);
    currencies.libra.valorMoeda = Number(moedas.GBP.buy);
    currencies.iene.valorMoeda = Number(moedas.JPY.buy);

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

updateExchangeRates(); // Atualiza as taxas de câmbio ao iniciar o servidor
setInterval(updateExchangeRates, 360000);

app.listen(porta, () => {
  console.log(`Servidor de conversão rodando em http://localhost:${porta}`);
});
