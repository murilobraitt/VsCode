const express = require('express');
const fs = require('fs');
const app = express();
const porta = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

const ARQUIVO_BANCO= 'banco.json';

function lerBancoDeDados() {
  try {
    if (fs.existsSync(ARQUIVO_BANCO)) {
      const dados = fs.readFileSync(ARQUIVO_BANCO, 'utf8');
      return JSON.parse(dados);
    }
  } catch (error) {
    console.error('Erro ao ler o banco de dados:', error);
  }
  return { transacoes: [] };
}

let bancoDeDados = lerBancoDeDados();

app.get('/transacoes', (req, res) => {
  res.json(bancoDeDados.transacoes);
});

app.post('/transacoes', (req, res) => {
  const { descricao, valor, tipo, categoria } = req.body;
  const novaTransacao = { descricao, valor, tipo, categoria };

  bancoDeDados.transacoes.push(novaTransacao);

  try {
    fs.writeFileSync(ARQUIVO_BANCO, JSON.stringify(bancoDeDados, null, 2));
  } catch (error) {
    console.error('Erro ao salvar o banco de dados:', error);
  }

  res.status(201).json(novaTransacao);
})

app.listen(porta, () => {
  console.log(`Servidor do gerenciador de finanças rodando em http://localhost:${porta}`);
});