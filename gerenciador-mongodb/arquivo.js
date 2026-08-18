const inputDescricao = document.querySelector('.input-descricao');
const inputValor = document.querySelector('.input-valor');
const selectTipo = document.querySelector('.select-tipo');
const selectCategoria = document.querySelector('.select-categoria');
const buttonAdicionar = document.querySelector('.botao-adicionar');

const elementoEntrada = document.querySelector('.valor-entrada');
const elementoSaida = document.querySelector('.valor-saida');
const elementoSaldo = document.querySelector('.valor-saldo');
const listatransacoes = document.querySelector('.lista-transacoes');

let meuGraficoPizza = null;
let transacoes = [];

async function carregarTransacoes() {
    try {
        const response = await fetch('/transacoes');
        transacoes = await response.json();
        atualizarSaldo();
        exibirHistoricoTransacoes();
        atualizarGraficoPizza();
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
    }
}

function atualizarSaldo() {
    let somatorioEntrada = 0;
    let somatorioSaida = 0;

    transacoes.forEach(transacao => {
        if (transacao.tipo === 'entrada') {
            somatorioEntrada += transacao.valor;
        } else if (transacao.tipo === 'saida') {
            somatorioSaida += transacao.valor;
        }
    });

const saldo = somatorioEntrada - somatorioSaida;
const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

elementoEntrada.innerHTML = formatadorMoeda.format(somatorioEntrada);
elementoSaida.innerHTML = formatadorMoeda.format(somatorioSaida);
elementoSaldo.innerHTML = formatadorMoeda.format(saldo);
}

function exibirHistoricoTransacoes() {
    listatransacoes.innerHTML = '';
    transacoes.forEach(transacao => {
        const item = document.createElement('li');
        const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
        const valorFormatado = formatadorMoeda.format(transacao.valor);

        if (transacao.tipo === 'entrada') {
            item.classList.add('item-entrada');
        } else {
            item.classList.add('item-saida');
        }

        item.innerHTML = `
        <div>
            <strong>${transacao.descricao}</strong>
            <small style="display:block; color:#94a3b8; font-size:11px;">${transacao.categoria}</small>
             </div>
            <span>${transacao.tipo=== `entrada` ? `+` : `-` }${valorFormatado}</span>
            `

            listatransacoes.appendChild(item);
    });
}

function atualizarGraficoPizza() {
    const categorias = {
        'Alimentacao': 0,
        'Lazer': 0,
        'Salario': 0,
        'Transporte': 0,
        'Outros': 0
    };

    transacoes.forEach(transacao => {
        if (transacao.tipo === 'saida' && categorias[transacao.categoria] !== undefined) {
            categorias[transacao.categoria] += transacao.valor;
        }
    });

    const categoriasLabels = Object.keys(categorias);
    const categoriasValores = Object.values(categorias);

    const canvas = document.getElementById('graficoPizza');
    const ctx = canvas.getContext('2d');

    if (meuGraficoPizza) {
        meuGraficoPizza.destroy();
    }

    meuGraficoPizza = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Alimentação', 'Lazer', 'Salário', 'Transporte', 'Outros'],
            datasets: [{
                data: categoriasValores,
                backgroundColor: [
                    '#F87171',
                    '#38bdf8',
                    '#4ade80',
                    '#fbbf24',
                    '#a78bfa'
                ],
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { family: 'Roboto', size: 12 }}
                }
            }
        }
    });
}

async function enviarTransacaoParaServidor() {
    const descricao = inputDescricao.value.trim();
    const valor = Number(inputValor.value);
    const tipo = selectTipo.value;
    const categoria = selectCategoria.value;

    if (descricao === '' || isNaN(valor) || valor <= 0) {
        alert('Por favor, insira uma descrição válida e um valor positivo.');
        return;
    }

    const novaTransacao = { descricao, valor, tipo, categoria };

     try {
        const response = await fetch('/transacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaTransacao)
        });

        if (response.ok) {
            inputDescricao.value = '';
            inputValor.value = '';
            await carregarTransacoes(); // Recarrega os dados do Mongo [Docs]
        } else {
            alert('Erro ao salvar transação para o servidor.');
        }
    } catch (error) {
        console.error('Erro ao conectar com o servidor:', error);
    }
}
    
buttonAdicionar.addEventListener('click', enviarTransacaoParaServidor);

carregarTransacoes();
