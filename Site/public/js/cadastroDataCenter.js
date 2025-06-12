let cep;
let nome = "";
let uf;
let cidade;
let bairro;
let logradouro;
let numero;
let complemento;
let maisInformacao = false;

async function adicionarServidorParte1() {
  nome = document.getElementById("ipt_nome").value;
  cep = document.getElementById("ipt_cep").value;
  // uf = document.getElementById("ipt_uf")
  // cidade = document.getElementById("ipt_cidade")
  // bairro = document.getElementById("ipt_bairro")
  // logradouro = document.getElementById("ipt_logradouro")
  // numero = document.getElement ById("ipt_numero")
  // complemento = document.getElementById("ipt_complemento")

  let nomeValido = validarNome();
  let cepValido = validarCep();

  console.log("Nome valido: ", nomeValido, "CEP valido: ", cepValido);

  if (nomeValido && cepValido && maisInformacao == false) {
    maisInformacao = true;

    div_form_parte1.style.display = "none";
    await autoPreencherCep(cep);
    div_form_parte2.style.display = "flex";
  }
}

// Preenchimento do CEP:

async function autoPreencherCep() {
  cep = document.getElementById("ipt_cep").value;
  console.log(cep);
  if (validarCep(cep)) {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("ipt_logradouro").value = data.logradouro;
        document.getElementById("ipt_bairro").value = data.bairro;
        document.getElementById("ipt_cidade").value = data.localidade;
        document.getElementById("ipt_uf").value = data.uf;

        document.getElementById("ipt_logradouro").disabled = true;
        document.getElementById("ipt_bairro").disabled = true;
        document.getElementById("ipt_cidade").disabled = true;
        document.getElementById("ipt_uf").disabled = true;
      })

      .catch((error) => console.error("Erro ao buscar CEP:", error));
  }
}

function adicionarServidorParte2() {
  // let cep2 = document.getElementById("ipt_cep")

  // if(cep != cep2) {
  //   adicionarServidorParte1()
  //   return;
  // }

  nome = document.getElementById("ipt_nome").value;
  cep = document.getElementById("ipt_cep").value;
  uf = document.getElementById("ipt_uf").value;
  cidade = document.getElementById("ipt_cidade").value;
  bairro = document.getElementById("ipt_bairro").value;
  logradouro = document.getElementById("ipt_logradouro").value;
  numero = document.getElementById("ipt_numero").value;
  complemento = document.getElementById("ipt_complemento").value;

  if (complemento == "") {
    complemento = "--";
  }

  if (numero == "") {
    erros_cadastro_usuario.innerHTML += "Preencha o campo Numero\n";
  }

  alert("Data Center cadastrado com sucesso!");
  console.log("Dados do Data Center:");
  console.log("nome: " + nome);
  console.log("cep: " + cep);
  console.log("uf: " + uf);
  console.log("cidade: " + cidade);
  console.log("bairro: " + bairro);
  console.log("logradouro: " + logradouro);
  console.log("numero: " + numero);
  console.log("complemento: " + complemento);

  fetch("/dataCenter/cadastrar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nomeServer: nome,
      logradouroServer: logradouro,
      bairroServer: bairro,
      cidadeServer: cidade,
      ufServer: uf,
      numeroServer: numero,
      complementoServer: complemento,
      cepServer: cep,
    }),
  }).then(function (resposta) {
    if (resposta.ok) {
      console.log(resposta);
      console.log("Resposta OK!");
      console.log("Cadastrado no BD");

      resposta.json().then((json) => {
        console.log(json);
        console.log(JSON.stringify(json));
      });
    } else {
      console.log("NÃO deu certo a resposta");
      console.log(resposta);
    }
  });

  alert("DataCenter inserido com sucesso");
  document.getElementById("ipt_nome").value = "";
  document.getElementById("ipt_cep").value = "";
  document.getElementById("ipt_numero").value = "";
  document.getElementById("ipt_complemento").value = "";
  div_form_parte1.style.display = "flex";
  div_form_parte2.style.display = "none";
  bg_formulario.style.display = "none";
}

// Validações:

function validarCep() {
  cep = document.getElementById("ipt_cep").value;
  erros_cadastro_usuario.innerHTML = "";
  const regexN = /[0-9]/;
  let cepValido = true;

  if (cep == "") {
    erros_cadastro_usuario.innerHTML += "Preencha o campo CEP\n";
    cepValido = false;
  }

  if (!regexN.test(cep)) {
    erros_cadastro_usuario.innerHTML += "O CEP deve possuir apenas números\n";
    cepValido = false;
  }

  if (cep.length !== 8) {
    erros_cadastro_usuario.innerHTML += "O CEP deve possuir 8 dígitos\n";
    cepValido = false;
  }

  return cepValido;
}

function validarNome() {
  nome = document.getElementById("ipt_nome").value;
  erros_cadastro_usuario.innerHTML = "";

  let nomeValido = true;

  if (nome == "") {
    erros_cadastro_usuario.innerHTML += "Preencha o campo Nome\n";
    nomeValido = false;
  }

  return nomeValido;
}

function validarNumero() {
  numero = document.getElementById("ipt_numero").value;
  erros_cadastro_usuario.innerHTML = "";

  let numeroValido = true;

  if (numero == "") {
    erros_cadastro_usuario.innerHTML += "Preencha o campo Número\n";
    numeroValido = false;
  }

  return numeroValido;
}
