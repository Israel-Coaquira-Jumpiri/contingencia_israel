let alertas = [];

function exibirAlertas() {
  const dataCenter = sessionStorage.DataCenter;

  fetch(`/alertas/exibirAlertas/${dataCenter}`, {
    method: "GET"
  })
  .then(response => {
    if (response.ok) {
      response.json().then(json => {
        console.log(json);

        alertas = json.map(item => {
        let nomeFormatado = item.nomecomponente;

        if (nomeFormatado === "ram_usada" || nomeFormatado === "ram_percentual") {
          nomeFormatado = "RAM";
        } else if (nomeFormatado === "disco_usado" || nomeFormatado === "disco_percentual") {
          nomeFormatado = "Disco";
        } else if (nomeFormatado === "cpu_percentual" || nomeFormatado === "cpu_frequencia") {
          nomeFormatado = "CPU";
        }

        return {
          nome: nomeFormatado,
          valor: item.valor,
          medida: item.medida,
          nivel: item.criticidade === 1 ? "Atenção" : "Crítico",
          servidor: item.idservidor,
          dataHora: item.data_gerado,
          datacenter: item.fk_data_center
        };
      });


        const bodyTabela = document.getElementById("bodyTabela");
        bodyTabela.innerHTML = ""; 
      
        alertas.forEach(alerta => {
        const dataFormatada = new Date(alerta.dataHora).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo"
         });
          bodyTabela.innerHTML += `
            <tr>
              <td>${alerta.nome}</td>
              <td style="font-weight: bold; color: ${alerta.nivel === "Crítico" ? '#e74c3c' : '#F29D12'};">${alerta.valor}</td>
              <td>${alerta.medida}</td>
              <td style="font-weight: bold; color: ${alerta.nivel === "Crítico" ? '#e74c3c' : '#F29D12'};">${alerta.nivel}</td>
              <td>${alerta.servidor}</td>
              <td>${dataFormatada}</td>
              <td>${alerta.datacenter}</td>
            </tr>
          `;


        });

      });
    } else {
      console.error('Erro ao obter alertas');
    }
  })
  .catch(error => {
    console.error("Erro na requisição:", error);
  });
}
 
function ordenarAlertasPorNivel() {
  alertas.sort((a, b) => {
    const niveis = { "Atenção": 1, "Crítico": 2 };
    
    return niveis[b.nivel] - niveis[a.nivel];
  });

  const bodyTabela = document.getElementById("bodyTabela");
  bodyTabela.innerHTML = ""; 

  alertas.forEach(alerta => {
    const dataFormatada = new Date(alerta.dataHora).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo"
    });
    
    bodyTabela.innerHTML += `
      <tr>
        <td>${alerta.nome}</td>
        <td style="font-weight: bold; color: ${alerta.nivel === "Crítico" ? '#e74c3c' : '#F29D12'};">${alerta.valor}</td>
        <td>${alerta.medida}</td>
        <td style="font-weight: bold; color: ${alerta.nivel === "Crítico" ? '#e74c3c' : '#F29D12'};">${alerta.nivel}</td>
        <td>${alerta.servidor}</td>
        <td>${dataFormatada}</td>
        <td>${alerta.datacenter}</td>
      </tr>
    `;
  });

  ordenacaoAtual.innerHTML = "Por Nível";
}

function ordenarAlertasPorData() {
  alertas.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

  const bodyTabela = document.getElementById("bodyTabela");
  bodyTabela.innerHTML = ""; 

  alertas.forEach(alerta => {
    const dataFormatada = new Date(alerta.dataHora).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo"
    });
    
    bodyTabela.innerHTML += `
      <tr>
        <td>${alerta.nome}</td>
        <td style="font-weight: bold; color: ${alerta.nivel === "Crítico" ? '#e74c3c' : '#F29D12'};">${alerta.valor}</td>
        <td>${alerta.medida}</td>
        <td style="font-weight: bold; color: ${alerta.nivel === "Crítico" ? '#e74c3c' : '#F29D12'};">${alerta.nivel}</td>
        <td>${alerta.servidor}</td>
        <td>${dataFormatada}</td>
        <td>${alerta.datacenter}</td>
      </tr>
    `;
  });
  ordenacaoAtual.innerHTML = "Mais Recentes";
}

function ordenarAlertasPorComponente() {
  alertas.sort((a, b) => a.nome.localeCompare(b.nome));

  const bodyTabela = document.getElementById("bodyTabela");
  bodyTabela.innerHTML = ""; 

  alertas.forEach(alerta => {
    const dataFormatada = new Date(alerta.dataHora).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo"
    });
    
    bodyTabela.innerHTML += `
      <tr>
        <td>${alerta.nome}</td>
        <td style="font-weight: bold; color: ${alerta.nivel === "Crítico" ? '#e74c3c' : '#F29D12'};">${alerta.valor}</td>
        <td>${alerta.medida}</td>
        <td style="font-weight: bold; color: ${alerta.nivel === "Crítico" ? '#e74c3c' : '#F29D12'};">${alerta.nivel}</td>
        <td>${alerta.servidor}</td>
        <td>${dataFormatada}</td>
        <td>${alerta.datacenter}</td>
      </tr>
    `;
  });
  ordenacaoAtual.innerHTML = "Por Componente";
}

function ordenarAlertasPorServidor() {

  alertas.sort((a, b) => a.servidor - b.servidor);

  const bodyTabela = document.getElementById("bodyTabela");
  bodyTabela.innerHTML = ""; 

  alertas.forEach(alerta => {
    const dataFormatada = new Date(alerta.dataHora).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo"
    });
    
    bodyTabela.innerHTML += `
      <tr>
        <td>${alerta.nome}</td>
        <td style="font-weight: bold; color: ${alerta.nivel === "Crítico" ? '#e74c3c' : '#F29D12'};">${alerta.valor}</td>
        <td>${alerta.medida}</td>
        <td style="font-weight: bold; color: ${alerta.nivel === "Crítico" ? '#e74c3c' : '#F29D12'};">${alerta.nivel}</td>
        <td>${alerta.servidor}</td>
        <td>${dataFormatada}</td>
        <td>${alerta.datacenter}</td>
      </tr>
    `;
  });
  ordenacaoAtual.innerHTML = "Por Servidor";
}

