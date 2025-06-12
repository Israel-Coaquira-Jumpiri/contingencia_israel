let dadosServidores = []

let cores = {
  'critico': '#ff1900',
  'alerta': '#ffa617',
  'estavel': '#09bb26',
}

let criado = false

criticos = 0
moderados = 0

let metricaOrder = 'criticidade'
let booleanOrder = false


// ponto inicial de todas as outras funções
async function atualizarDadosEmTempoReal() {
  try {
    const resposta = await fetch('/tempo_real/monitoria');
    const dados = await resposta.json();
    
    dadosServidores = dados.map(jsonServer => ({
      servidor: jsonServer.servidor,
      dados: jsonServer.dados
    }));
    let ordenado = ordenar();
    destacarServidor(ordenado)
  } catch (erro) {
    console.error("Erro ao buscar dados em tempo real:", erro);
  }
}

 const kpiCritico = document.getElementById("kpi-critico")
 const kpiModerado = document.getElementById("kpi-moderado")

 const corpoRede = document.querySelector("#linechart-rede")
 const corpoFisico = document.querySelector("#linechart-fisico")

function compararData(d1, d2){
  if(d1.length < 9 && d2.length < 9){
  let dias1 = Number(d1[0] + d1[1])
  let dias2 = Number(d2[0] + d2[1])
   if(dias1 > dias2){
    return 1
   } else if (dias1 < dias2){
    return -1
   } else {
  let horas1 = Number(d1[3] + d1[4])
  let horas2 = Number(d2[3] + d2[4])
   if(horas1 > horas2){
    return 1
   } else if (horas1 < horas2){
    return -1
   } else {
  let min1 = Number(d1[6] + d1[7])
  let min2 = Number(d2[6] + d2[7])
   if(min1 > min2){
    return 1
   } else if (min1 < min2){
    return -1
   }
   }
   }
  } else  if (d1.length == 9 && d2.length < 9){
    let dias1 = Number(d1[0] + d1[1] + d1[2])
  let dias2 = Number(d2[0] + d2[1])
   if(dias1 > dias2){
    return 1
   } else if (dias1 < dias2){
    return -1
   } else {
  let horas1 = Number(d1[4] + d1[5])
  let horas2 = Number(d2[3] + d2[4])
   if(horas1 > horas2){
    return 1
   } else if (horas1 < horas2){
    return -1
   } else {
  let min1 = Number(d1[7] + d1[8])
  let min2 = Number(d2[6] + d2[7])
   if(min1 > min2){
    return 1
   } else if (min1 < min2){
    return -1
   }
   }
  }
}else  if (d1.length < 9 && d2.length == 9){
    let dias1 = Number(d1[0] + d1[1])
  let dias2 = Number(d2[0] + d2[1] + d2[2])
   if(dias1 > dias2){
    return 1
   } else if (dias1 < dias2){
    return -1
   } else {
  let horas1 = Number(d1[3] + d1[4])
  let horas2 = Number(d2[4] + d2[5])
   if(horas1 > horas2){
    return 1
   } else if (horas1 < horas2){
    return -1
   } else {
  let min1 = Number(d1[6] + d1[7])
  let min2 = Number(d2[7] + d2[8])
   if(min1 > min2){
    return 1
   } else if (min1 < min2){
    return -1
   }
   }
  }
} else {
      let dias1 = Number(d1[0] + d1[1] + d1[2])
  let dias2 = Number(d2[0] + d2[1] + d2[2])
   if(dias1 > dias2){
    return 1
   } else if (dias1 < dias2){
    return -1
   } else {
  let horas1 = Number(d1[4] + d1[5])
  let horas2 = Number(d2[4] + d2[5])
   if(horas1 > horas2){
    return 1
   } else if (horas1 < horas2){
    return -1
   } else {
  let min1 = Number(d1[7] + d1[8])
  let min2 = Number(d2[7] + d2[8])
   if(min1 > min2){
    return 1
   } else if (min1 < min2){
    return -1
   }
   }
  }
} 
}

dadosSelecionado = []

var jaGerado = false 
var selecionado
let destacadoGlobal

function carregarServidoresTabela(copiaDados, destacado){

  const tabela = document.getElementById('spawnpointTabela')
if(jaGerado){
  const selected = tabela.querySelector('.selected')

if (selected != null && selected != undefined) {
  if(selecionado == undefined || selecionado == null){
    selecionado = selected.querySelector('td').innerText
  }
}
}
  let limite = copiaDados.length
  if (limite > 10){
    limite = 10
  }
  tabela.innerHTML = ''
  var addHTML = ''
  moderados = 0
 criticos = 0
  for (let i = 0; i < limite; i++) {
    const servidorAtual = copiaDados[i];
    var ultimo = (servidorAtual.dados.length - 1)

      if(copiaDados[i].dados[ultimo].criticidade >= 3){
        criticos +=1
      } else if (copiaDados[i].dados[ultimo].criticidade >= 1){
        moderados += 1
      }

    var classe = ''
if(selecionado != undefined)
 if ( selecionado == (`${servidorAtual.servidor}`)) {
  classe += 'selected'
}

let corDestaque
if(servidorAtual.servidor == destacado){
corDestaque = servidorAtual.dados[ultimo].criticidade >= 3
  ? cores.critico
  : servidorAtual.dados[ultimo].criticidade >= 1
    ? cores.alerta
    : cores.estavel;
} else {
 corDestaque = 'black'
}

    addHTML += `
    <tr class="row ${classe}">
    <td class='col-server' style='color: ${corDestaque};border-left: 3px ${servidorAtual.dados[ultimo].criticidade >= 3 ? cores['critico'] : servidorAtual.dados[ultimo].criticidade >= 1 ? cores['alerta'] : cores['estavel']} solid';>${servidorAtual.servidor}</td>
    <td style='color: ${servidorAtual.dados[ultimo].criticidade >= 3 ? cores['critico'] : servidorAtual.dados[ultimo].criticidade >= 1 ? cores['alerta'] : cores['estavel']}'>${servidorAtual.dados[ultimo].criticidade}</td>
    <td style='color: ${compararData(servidorAtual.dados[ultimo].tempo_ativo, '24:00:00') >= 1 ? cores['critico'] : (compararData(servidorAtual.dados[ultimo].tempo_ativo, '120:00:00')) >= 1 ? cores['alerta'] : cores['estavel'] }'> ${servidorAtual.dados[ultimo].tempo_ativo}</td>
            <td style='color: ${servidorAtual.dados[ultimo].cpu >= 80 ? cores['critico'] : servidorAtual.dados[ultimo].cpu >=70 ? cores['alerta'] : cores['estavel']} '>${servidorAtual.dados[ultimo].cpu}</td>
            <td style='color: ${servidorAtual.dados[ultimo].ram >= 80 ? cores['critico'] : servidorAtual.dados[ultimo].ram >=70 ? cores['alerta'] : cores['estavel']} '>${servidorAtual.dados[ultimo].ram}</td>
            <td style='color: ${servidorAtual.dados[ultimo].disco >= 80 ? cores['critico'] : servidorAtual.dados[ultimo].disco >=70 ? cores['alerta'] : cores['estavel']}'>${servidorAtual.dados[ultimo].disco}</td>
            <td style='color: #8233C2'>${servidorAtual.dados[ultimo].download}</td>
            <td style='color: #2160D5'>${servidorAtual.dados[ultimo].upload}</td>
          </tr>
    `
  }
  

      kpiCritico.innerHTML = criticos
      kpiCritico.style.color = criticos >= 1 ? `${cores.critico}` : 'black'
kpiModerado.innerHTML = moderados
kpiModerado.style.color = moderados >= 1 ? `${cores.alerta}` : 'black' 
  tabela.innerHTML = addHTML
  document.querySelectorAll('tr').forEach((linha)=> {
    const linhas = tabela.querySelectorAll('tr');
    linhas.forEach((linha) => {
    linha.addEventListener('click', () => {
      linhas.forEach(l => l.classList.remove('selected'));
      linha.classList.add('selected');
      tabela.querySelector('.selected').querySelector('td').innerText.innerText
      });
    })})


  jaGerado = true

}

function ordenar(){
  let lista = [...dadosServidores]  
    for(let i = 0; i < lista.length - 1; i ++){
      const ultimoi = (lista[i].dados.length - 1)        
      let aux 
      let maior = i 
      if (metricaOrder == 'criticidade'){
      for(let j = i + 1; j < lista.length; j++){
        const ultimoj = lista[j].dados.length - 1
        if(lista[maior].dados[ultimoi][metricaOrder] < lista[j].dados[ultimoj][metricaOrder]){
          maior = j
        } else if(lista[maior].dados[ultimoi][metricaOrder] == lista[j].dados[ultimoj][metricaOrder]){
          if(compararData(lista[maior].dados[ultimoi].tempo_ativo,lista[j].dados[ultimoj].tempo_ativo) < 0){
            maior = j
          }
        }
      }
      aux = lista[i]
      lista[i] = lista[maior]
      lista[maior] = aux
} else if (metricaOrder == 'tempo_ativo'){
  for(let i = 0; i < lista.length - 1; i ++){
    const ultimo = lista[i].dados.length - 1;
    let aux;
    let maior = i;
    for (let j = i + 1; j < lista.length; j++) {
      const ultimoJ = lista[j].dados.length - 1;
      if (compararData(lista[maior].dados[ultimo].tempo_ativo, lista[j].dados[ultimoJ].tempo_ativo) < 0) {
        maior = j;
      }
    }
    aux = lista[i];
    lista[i] = lista[maior];
    lista[maior] = aux;
  }
} else {
    for(let i = 0; i < lista.length - 1; i ++){
      const ultimoi = (lista[i].dados.length - 1)        
      let aux 
      let maior = i 
      for(let j = i + 1; j < lista.length; j++){
      const ultimoJ = lista[j].dados.length - 1;
        if(lista[maior].dados[ultimoi][metricaOrder] < lista[j].dados[ultimoJ][metricaOrder]){
          maior = j
        }
      }
      aux = lista[i]
      lista[i] = lista[maior]
      lista[maior] = aux
    }
    }    
  
   if(booleanOrder){
    lista.reverse()
   }

  }
  return lista
}

  function loadEvents(){
  titulo = document.querySelectorAll('.titleTable')
  titulo.forEach((title) => {
    title.addEventListener('click', () => {
      const existingSvg = title.querySelector('svg');
  document.querySelectorAll('.titleTable svg').forEach(svg => { if (svg == existingSvg){ return } else { svg.remove()}})
  
      if(existingSvg){
        if(booleanOrder){
          booleanOrder = false
          let ordenado = ordenar();
          destacarServidor(ordenado)
          
          existingSvg.style.transform = 'rotate(180deg)'
        } else {
          booleanOrder = true
          let ordenado = ordenar();
          destacarServidor(ordenado)
          existingSvg.style.transform = 'rotate(0deg)'
        }
      } else {
        let escolhido = title.innerHTML
        if(escolhido.includes('Nome')){
          metricaOrder = 'nome'
        } else if (escolhido.includes('Criticidade')){
          metricaOrder = 'criticidade'
        }else if (escolhido.includes('Tempo')){
          metricaOrder = 'tempo_ativo'
        } else if (escolhido.includes('Cpu')){
          metricaOrder = 'cpu'
        } else if (escolhido.includes('Ram')){
          metricaOrder = 'ram'
        } else if (escolhido.includes('Disco')){
          metricaOrder = 'disco'
        } else if (escolhido.includes('Download')){
          metricaOrder = 'download'
        } else if (escolhido.includes('Upload')){
          metricaOrder = 'upload'
        }
        
        booleanOrder = false
        let ordenado = ordenar();
        destacarServidor(ordenado)
        title.innerHTML += `<svg width="12" style='margin-left: 4px; height: 8px; transform: rotate(180deg)' viewBox="0 0 22 13" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
        d="M9.78825 12.5399L0.3417 3.09327C-0.1139 2.63767 -0.1139 1.89903 0.3417 1.44348L1.44349 0.341688C1.89831 -0.113133 2.63545 -0.114009 3.09134 0.339744L10.6132 7.82634L18.135 0.339744C18.5909 -0.114009 19.328 -0.113133 19.7828 0.341688L20.8846 1.44348C21.3402 1.89908 21.3402 2.63772 20.8846 3.09327L11.4381 12.5399C10.9825 12.9954 10.2439 12.9954 9.78825 12.5399Z"
        fill="#272727" />
        </svg>`
      }
      })
  })


  }
  
    const modal = document.querySelector(".background-modal")
    const content = document.querySelector("#modal-info")
function carregarModal(texto){
  modal.style.display = 'flex'
    content.innerHTML = `${texto}`
}


function fechar(real) {
  if(real){
    event.stopPropagation()
    return
  }
    modal.style.display= 'none'
}
let expandidoGlobal

function expandirServidor() {
  const tabela = document.getElementById('spawnpointTabela')
  const sel = tabela.querySelector('.selected')

  if (sel) {
    let cols = sel.querySelectorAll('td')
    let criticidade = cols[1].innerText
    let nomeSelecionado = cols[0].innerText

    selecionado = undefined;

    const linhas = tabela.querySelectorAll('tr');
    linhas.forEach(l => l.classList.remove('selected'));

    for (let i = 0; i < dadosServidores.length; i++) {
      if (dadosServidores[i].servidor == nomeSelecionado) {
        const servidor = dadosServidores[i];
        let corDestaque = criticidade >= 3 ? cores.critico : criticidade >= 1 ? cores.alerta : cores.estavel;
        let addHtml = `<span style='color:${corDestaque}'>${servidor.servidor}</span>`;

        document.getElementById('nome-servidor-expandido').innerHTML = addHtml;
        expandidoGlobal = servidor;

        atualizarGraficosComDados(servidor);
        carregarServidoresTabela(ordenar(), servidor.servidor)
        return
      }
    }
  } else {
    carregarModal("É necessário selecionar um servidor antes expandir.");
  }
}

function destacarServidor(ordenado) {
  let destacado = ordenado[0]
  if (travado) {
    if (expandidoGlobal) {
      expandidoAtualizado = ordenado.find(servidor => servidor.servidor == expandidoGlobal.servidor)
      let criticidade = expandidoAtualizado.dados[expandidoAtualizado.dados.length - 1].criticidade;
      let servidor = expandidoAtualizado.servidor
      let corDestaque = criticidade >= 3 ? cores.critico : criticidade >= 1 ? cores.alerta :cores.estavel;
      let addHtml = `<span style='color:${corDestaque}'>${servidor}</span>`;
      document.getElementById('nome-servidor-expandido').innerHTML = addHtml;
      atualizarGraficosComDados(expandidoAtualizado);
      carregarServidoresTabela(ordenado,expandidoAtualizado.servidor)
    } else {
      console.warn("expandidoGlobal está undefined.");
    }
    return;
  }

  let ultimoDado = destacado.dados[destacado.dados.length - 1];
  let criticidade = ultimoDado.criticidade;
  let servidor = destacado.servidor;

  let corDestaque = criticidade >= 3 ? cores.critico : criticidade >= 1 ? cores.alerta :cores.estavel;

  let addHtml = `<span style='color:${corDestaque}'>${servidor}</span>`;

  document.getElementById('nome-servidor-expandido').innerHTML = addHtml;
  document.getElementById('nome-servidor-expandido').style.color = `${corDestaque}`;

  atualizarGraficosComDados(destacado);
  carregarServidoresTabela(ordenado, destacado.servidor)
  expandidoGlobal = servidor;

}


let travado = false
function travar(){
  if(!travado){
    travado = true
var nomeServidorHTML = document.querySelector('#nome-servidor-expandido').innerText.trim().toLowerCase();
for(let i = 0; i < dadosServidores.length; i++){
  if(nomeServidorHTML == dadosServidores[i].servidor.toLowerCase())
    expandidoGlobal = dadosServidores[i]
  }

    document.getElementById('lock').querySelector('img').src = '../assets/lock.png'
  } else {
    travado = false
    document.getElementById('lock').querySelector('img').src = '../assets/unlock.png'
  }
}

function atualizarGraficosComDados(servidorEscolhido) {

  const seriesCPU = [];
  const seriesRAM = [];
  const seriesDisco = [];
  const seriesUpload = [];
  const seriesDownload = [];

  servidorEscolhido.dados.forEach(ponto => {
    const timestamp = new Date(ponto.Momento).getTime();
    seriesCPU.push([timestamp, ponto.cpu]);
    seriesRAM.push([timestamp, ponto.ram]);
    seriesDisco.push([timestamp, ponto.disco]);
    seriesUpload.push([timestamp, ponto.upload]);
    seriesDownload.push([timestamp, ponto.download]);
  });

    const minTime = Math.min(...servidorEscolhido.dados.map(p => new Date(p.Momento).getTime()));
  const maxTime = Math.max(...servidorEscolhido.dados.map(p => new Date(p.Momento).getTime()));


  chartLineFisico.updateOptions({
    series: [
      { name: "CPU", data: seriesCPU },
      { name: "RAM", data: seriesRAM },
      { name: "Disco", data: seriesDisco }
    ],
    xaxis: {
  type: "datetime",
  labels: {
    format: 'HH:mm:ss'
  },
  min: minTime,
  max: maxTime
}
  }, false, true); 

  chartLineRede.updateOptions({
    series: [
      { name: "Upload", data: seriesUpload },
      { name: "Download", data: seriesDownload }
    ],
    xaxis: {
      type: 'datetime',
      min: minTime,
      max: maxTime,
      labels: {
        format: 'HH:mm:ss'
      }
    }
  }, false, true);

  atualizarProcessos(servidorEscolhido)
}


function atualizarProcessos(servidor){
  let topcpu = ''
  let topram = ``
  let listaram = []
  let listacpu = []
  servidor.dados[servidor.dados.length - 1].processos.forEach(processo => {
    if(processo.grupo == 'top_cpu'){
   listacpu.push(processo)
    } else {
   listaram.push(processo)
    }
  })
    listacpu.forEach(processo => {
      topcpu += `<tr>
      <td>${processo.name}</td>
      <td>${processo.cpu_percent}% </td>
      <td>${processo.pid}</td>
      </tr>
      `
      })
        listaram.sort((a,b) => {
        return b.ram_percent - a.ram_percent  
      })
      listaram.forEach(processo => {
        topram +=  `<tr>
        <td>${processo.name}</td>
        <td>${processo.ram_percent}% </td>
        <td>${processo.pid}</td>
        </tr>
        `
        })
    
   document.getElementById("lista-processos-ram").innerHTML = topram
   document.getElementById("lista-processos-cpu").innerHTML = topcpu
}

 let oldAlertas
async function pegarAlertas() {
  try {
    const response = await fetch("/alertas/getAlertasUnsolved/1");
    
    if (!response.ok) {
      throw new Error(`Erro no fetch! status: ${response.status}`);
    }

    const alertas = await response.json();
    atualizarListaAlertas(alertas);
    // notificarAlerta(alertas)
    oldAlertas = [...alertas]
  } catch (erro) {
    console.error("Erro ao pegar os alertas:", erro);
  }
}

// function notificarAlerta(alertas){
//    if(oldAlertas === undefined){
//     console.log("Inicializando variável de alertas.")
//    } else {
//     for(alerta in alertas){
//       console.log("Não existe")
//       if(!oldAlertas.includes(alerta)){
//         enviarNotificacao(alerta)
//       } else {
//         console.log("Já existe")
//       }
//     }
//    }
// }

function enviarNotificacao(Texto){
  
}

function atualizarListaAlertas(alertas) {
  const lista = document.getElementById('lista-alertas');
  lista.innerHTML = '';
  let limite = alertas.length
  if (limite > 10){
    limite = 10
  }
    for(let i = 0; i < limite; i++ ){
    const alerta = alertas[i]
    const servidorNome = alerta.fk_servidor ? `Servidor ${alerta.fk_servidor}`: 'Servidor desconhecido';

    const componente = alerta.nomecomponente.includes('ram') ? 'RAM' : alerta.nomecomponente.includes('disco') ? 'DISCO' : 'CPU';

    const data = new Date(alerta.data_gerado);
const dataCopia = new Date(data);
dataCopia.setHours(dataCopia.getHours() + 3);
const dataTeste = dataCopia.toLocaleString('pt-BR', {
  hour: '2-digit',
  minute: '2-digit'
});

      lista.innerHTML += `<tr> 
      <td style='border-left: 3px solid ${alerta.valor >= 80 ? cores.critico : cores.alerta}'>${servidorNome}</td>
      <td>${componente} ${alerta.valor}%</td>
      <td>${dataTeste}</td>
      <td>${alerta.idjira}</td>
      </tr>
      `;
      
    // Cores de acordo com valor
  };
}

setInterval(() => {
  atualizarDadosEmTempoReal()
  pegarAlertas()
}, 2000);

// variaveis estéticas
 var stroke =  {
    curve: "smooth",
    width: 5,
    lineCap: "butt"
  }

  var marcadores = {
    size: 1,
    backgroundColor: 'black',
    hover: {
      size: 2
    }
  }

  var toolbar = {
      show: true,
      offsetX: 20,
      offsetY: 7
    }

  var sombra = {
      enabled: true,
      opacity: 0.3,
      blur: 8,
      left: -7,
      top: 22
    }  

    var tooltip = {
    theme: "dark",
    x: {
          show: true,
          format: "HH:mm:ss",
      }
  }

    var altura = '100%'
    var largura = '100%'
    var velocidade = 200
    
// CONFIGURA O GRÁFICO DE LINHAS DE COMPONENTES
window.Apex = {
  chart: {
    foreColor: "#2b2b2b",
    toolbar: {
      show: false
    }
  },
  colors: ["#FCCF31", "#17ead9", "#f02fc2"],
  stroke: {
    width: 3
  },
  dataLabels: {
    enabled: false
  },
  grid: {
    borderColor: "#40475D"
  },
  xaxis: {
    axisTicks: {
      color: "#333"
    },
    axisBorder: {
      color: "#333"
    }
  },
  tooltip: tooltip,
  yaxis: {
    decimalsInFloat: 2,
    opposite: true,
    labels: {
      offsetX: -10
    },
    max: 100
  }
};

var optionsLineFisico = {
  chart: {
    height: altura,
    width: largura,
    type: "line",
    stacked: false,
    animations: {
      enabled: false,
      easing: "linear",
      dynamicAnimation: {
        speed: velocidade
      }
    },
    dropShadow: sombra,
    events: {
      animationEnd: function (chartCtx) {

        // Cria os dados novos?
        const newData1 = chartCtx.w.config.series[0].data.slice();
        newData1.shift();
        const newData2 = chartCtx.w.config.series[1].data.slice();
        newData2.shift();
        const newData3 = chartCtx.w.config.series[2].data.slice();
        newData3.shift();

      }
    },
    toolbar: toolbar,
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: stroke,
  markers: marcadores,
  series: [],
  xaxis: {
  type: "datetime",
  labels: {
    format: 'HH:mm:ss' // mostra o horário sempre
  }
},
  title: {
    text: "Uso dos componentes",
    align: "left",
    offsetY: -3,
    style: {
      fontSize: "25px"
    }
  },
  subtitle: {
    text: "Percentual",
    floating: true,
    align: "right",
    offsetY: 30,
    offsetX: 10,
    style: {
      fontSize: "18px"
    }
  },
  legend: {
    show: true,
    floating: true,
    horizontalAlign: "left",
    onItemClick: {
      toggleDataSeries: false
    },
    position: "top",
    offsetY: -38,
    offsetX: -5,
    fontSize: '22px'
  }
};

const chartLineFisico = new ApexCharts(
  corpoFisico,
  optionsLineFisico
);
chartLineFisico.render();

// CONFIGURA O GRÁFICO DE LINHAS DE REDE
window.Apex = {
  chart: {
    foreColor: "#2b2b2b",
    toolbar: {
      show: false
    }
  },
  colors: ["#2160D5", "#8233C2"],
  stroke: {
    width: 3
  },
  dataLabels: {
    enabled: false
  },
  grid: {
    borderColor: "#40475D"
  },
  xaxis: {
    axisTicks: {
      color: "#333"
    },
    axisBorder: {
      color: "#333"
    }
  },
  tooltip: tooltip,
  yaxis: {
    decimalsInFloat: 2,
    opposite: true,
    labels: {
      offsetX: -10
    }
  }
};

var optionsLineRede = {
  chart: {
    height: altura,
    width: largura,
    type: "line",
    stacked: false,
    animations: {
      enabled: false,
      easing: "linear",
      dynamicAnimation: {
        speed: velocidade
      }
    },
    dropShadow: sombra,
    events: {
      animationEnd: function (chartCtx) {

        // Cria os dados novos?
        const newData1 = chartCtx.w.config.series[0].data.slice();
        newData1.shift();
        const newData2 = chartCtx.w.config.series[1].data.slice();
        newData2.shift();

      }
    },
    toolbar: toolbar,
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: stroke,
  markers: marcadores,
  series: [],
  xaxis: {
  type: "datetime",
  labels: {
    format: 'HH:mm:ss' 
  }
},
  title: {
    text: "Velocidade de rede",
    align: "left",
    offsetY: -5,
    style: {
      fontSize: "28px",
      textWrap: true
    }
  },
  subtitle: {
    text: "KB/s",
    floating: true,
    align: "right",
    offsetY: 30,
    offsetX: 10,
    style: {
      fontSize: "22px"
    }
  },
  legend: {
    show: true,
    floating: true,
    horizontalAlign: "left",
    onItemClick: {
      toggleDataSeries: false
    },
    position: "top",
    offsetY: -45,
    offsetX: -5,
    fontSize: '20px'
  }
};

const chartLineRede = new ApexCharts(
  corpoRede,
  optionsLineRede
);

chartLineRede.render();
