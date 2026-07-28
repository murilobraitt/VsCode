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

  } catch (error) {
    console.error('Erro ao conectar com o servidor local:', error);
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

changeCurrency()

setInterval(async () => {
  const rawValue = document.querySelector('.input-convertor').value
  if (rawValue && Number(rawValue) > 0) {
    convertValues(false);
  }
}, 60000)