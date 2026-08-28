function adicionaCaracter(caracter){
     const inputValor = document.querySelector('.input').value;
    
    // Juntamos o valor antigo com o novo caractere digitado
    let novoValor = inputValor + caracter;
    
   const temOperador = /[+\-*/%]/.test(novoValor);

    if (!temOperador && !isNaN(novoValor.replace(/,/g, ''))) {
        // Remove pontos antigos, transforma em número e formata com os pontos do Brasil
        let numeroLimpo = novoValor.replace(/\./g, '').replace(',', '.');
        let numeroFormatado = new Intl.NumberFormat('pt-BR').format(numeroLimpo);
        
        // Se o usuário digitou uma vírgula no final, mantemos ela visível
        if (caracter === ',') {
            document.querySelector('.input').value = numeroFormatado + ',';
        } else {
            document.querySelector('.input').value = numeroFormatado;
        }
    } else {
        // Se tiver operadores ou não for um número isolado, adiciona o caractere normalmente
        document.querySelector('.input').value = novoValor;
    }
}

function limparTela() {
    // CORREÇÃO: Ajustado apenas para limpar o visor de forma simples
    document.querySelector('.input').value = '';
}

function apagarUltimoNumero(){
    // 1. Pegamos o valor que está na tela (ex: "1.000")
    let inputValor = document.querySelector('.input').value;
    
    // 2. Removemos todos os pontos antes de apagar (ex: "1.000" vira "1000")
    let valorSemPontos = inputValor.replace(/\./g, '');
    
    // 3. Agora sim apagamos o último número com segurança (ex: "1000" vira "100")
    let novoValor = valorSemPontos.slice(0, -1);
    
    // 4. Se o que sobrou for um número válido, reformatamos os pontos do zero
    if (!isNaN(novoValor.replace(/,/g, '')) && novoValor !== "") {
        let numeroLimpo = novoValor.replace(',', '.');
        let numeroFormatado = new Intl.NumberFormat('pt-BR').format(numeroLimpo);
        
        // Mantém a vírgula caso ela tenha ficado no final após o apagão
        if (novoValor.endsWith(',')) {
            document.querySelector('.input').value = numeroFormatado + ',';
        } else {
            document.querySelector('.input').value = numeroFormatado;
        }
    } else {
        // Se apagou tudo e ficou vazio, limpa o visor completamente
        document.querySelector('.input').value = novoValor;
    }
}

function calcular(){
    const inputValor = document.querySelector('.input').value;

    // CORREÇÃO: Remove os pontos e troca a vírgula por ponto para o JavaScript não quebrar no eval
    let valorPreparado = inputValor.replace(/\./g, '').replace(/,/g, '.');

    // Faz a conta matemática e coloca o resultado formatado de volta na tela
    let resultado = eval(valorPreparado);
    document.querySelector('.input').value = new Intl.NumberFormat('pt-BR').format(resultado);
}

function inverte(){
    const inputValor = document.querySelector('.input').value;
    
    // CORREÇÃO: Remove os pontos temporariamente para fazer a inversão de sinal (* -1) sem quebrar
    let valorSemPontos = inputValor.replace(/\./g, '').replace(/,/g, '.');
    let resultadoInvertido = valorSemPontos * -1;
    
    // Devolve para a tela com a formatação bonitinha de pontos e vírgulas
    document.querySelector('.input').value = new Intl.NumberFormat('pt-BR').format(resultadoInvertido);
}