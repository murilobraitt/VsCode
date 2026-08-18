require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const porta = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static('.'));

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB Atlas:', err));

const transacaoSchema = new mongoose.Schema({
  descricao: String,
  valor: Number,
  tipo: String,
  categoria: String
});

const Transacao = mongoose.model('Transacao', transacaoSchema);

app.get('/transacoes', async (req, res) => {
  try {
    const transacoes = await Transacao.find();
    res.json(transacoes);
  } catch (error) {
   res.status(500).json({ erro: 'Erro ao buscar transações no banco de dados.' });
  }
});

app.post('/transacoes', async (req, res) => {
  try {
  const { descricao, valor, tipo, categoria } = req.body;
  const novaTransacao = new Transacao({ descricao, valor, tipo, categoria });

  await novaTransacao.save();

  console.log('Gravado na nuvem com sucesso:', novaTransacao);
  res.status(201).json(novaTransacao);
  } catch (error) {
    res.status(400).json({ erro: 'Erro ao gravar dados no banco de dados.' });
  }
});

app.get ('/teste', (req, res) => {
  res.send('Servidor ativo e funcionando corretamente!');
});

app.listen(porta, () => {
  console.log(`Servidor do gerenciador de finanças rodando em http://localhost:${porta}`);
});