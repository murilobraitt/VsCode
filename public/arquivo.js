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
      name: 'Libra Estrelina',
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

const updateExchangeRates = async () => {
  try{
    const response= await fetch("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,CNY-BRL,GBP-BRL,JPY-BRL")
    const data = await response.json()
    currencies.dolar.valorMoeda = Number(data.USDBRL.high)
    currencies.euro.valorMoeda = Number(data.EURBRL.high)
    currencies.bitcoin.valorMoeda = Number(data.BTCBRL.high)
    currencies.yuan.valorMoeda = Number(data.CNYBRL.high)
    currencies.libra.valorMoeda = Number(data.GBPBRL.high)
    currencies.iene.valorMoeda = Number(data.JPYBRL.high)

    console.log("Cotações atualizadas com sucesso!")
} catch (error) {
    console.error('Erro ao buscar as taxas de câmbio:', error)
  }
}

const convertValues = async (showAlert = true) => {
const rawValue = document.querySelector('.input-convertor').value
const inputConvertorValue = Number(rawValue)

if (isNaN(inputConvertorValue) || inputConvertorValue <= 0) {
    if (showAlert) alert('Por favor, insira um valor válido.');
    return;
  }

  if (currencies.dolar.valorMoeda === 0) {
    await updateExchangeRates();
  }

  const fromCurrency = currencies[currencyFromSelect.value]
  const toCurrency = currencies[currencyToSelect.value]

   const valueInReal = fromCurrency.currency === 'BRL' 
    ? inputConvertorValue 
    : inputConvertorValue * fromCurrency.valorMoeda

    const finalValue = toCurrency.currency === 'BRL' 
    ? valueInReal 
    : valueInReal / toCurrency.valorMoeda;

document.querySelector('.valor-converter').innerHTML = new Intl.NumberFormat(fromCurrency.locale, {
    style: 'currency',
    currency: fromCurrency.currency
  }).format(inputConvertorValue)


const formatoOpcoes = {
    style: 'currency',
    currency: toCurrency.currency
  }

  if (toCurrency.currency === 'BTC') {
    formatoOpcoes.minimumFractionDigits = 6;
    formatoOpcoes.maximumFractionDigits = 6;
  }

  document.querySelector('.valor-convertido').innerHTML = new Intl.NumberFormat(toCurrency.locale, formatoOpcoes).format(finalValue)
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
}

currencyFromSelect.addEventListener('change', changeCurrency)
currencyToSelect.addEventListener('change', changeCurrency)
convertButton.addEventListener('click', () => convertValues(true))

changeCurrency()

setInterval(async () => {
  const rawValue = document.querySelector('.input-convertor').value
  await updateExchangeRates();
  if (rawValue && Number(rawValue) > 0) {
    convertValues(false);
  }
}, 60000)