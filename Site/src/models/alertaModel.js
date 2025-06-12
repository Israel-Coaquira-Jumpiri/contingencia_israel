let database = require("../database/config");

function exibirAlertas(dataCenter) {
  console.log(
    "ACESSEI O COMPONENTE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function exibirAlertas():",
  );

  let instrucaoSql = `
      select idalerta, valor, a.medida, data_gerado, criticidade, nomecomponente, idservidor, fk_data_center
      from alerta as a
      join parametro_servidor as ps
      on a.fk_parametro = ps.idparametros_servidor
      join servidor_cliente as sc
      on ps.fk_servidor = sc.idservidor
      join componente as c
      on ps.fk_componente = c.idcomponente
      order by data_gerado desc;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getTotalAlertas(idDataCenter){
  console.log(
    "ACESSEI O COMPONENTE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function exibirAlertas():",
  );
  
  let instrucaoSql = `
      SELECT 
      SUM(CASE WHEN a.criticidade = 1 THEN 1 ELSE 0 END) AS alertas_atencao,
      SUM(CASE WHEN a.criticidade = 3 THEN 1 ELSE 0 END) AS alertas_criticos
      FROM alerta a
      JOIN parametro_servidor p ON a.fk_parametro = p.idparametros_servidor
      JOIN servidor_cliente s ON p.fk_servidor = s.idservidor
      JOIN data_center dc ON s.fk_data_center = dc.iddata_center
      WHERE dc.iddata_center = ${idDataCenter}
      AND a.criticidade IN (1, 3)
      AND a.data_gerado >= NOW() - INTERVAL 30 DAY;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getQtdAlertasComponente(idDataCenter){
  console.log(
    "ACESSEI O COMPONENTE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function exibirAlertas():",
  );
  
  let instrucaoSql = `
      SELECT 
      c.nomecomponente AS componente,
      SUM(CASE WHEN a.criticidade = 1 THEN 1 ELSE 0 END) AS alertas_atencao,
      SUM(CASE WHEN a.criticidade = 3 THEN 1 ELSE 0 END) AS alertas_criticos,
      COUNT(*) AS total_alertas
      FROM alerta a
      JOIN parametro_servidor p ON a.fk_parametro = p.idparametros_servidor
      JOIN componente c ON p.fk_componente = c.idcomponente
      LEFT JOIN servidor_cliente s ON p.fk_servidor = s.idservidor
      LEFT JOIN data_center dc ON s.fk_data_center = dc.iddata_center
      WHERE dc.iddata_center = ${idDataCenter}
      AND c.nomecomponente IN ('cpu_percentual', 'ram_percentual', 'disco_percentual')
      AND a.criticidade IN (1, 3)
      AND a.data_gerado >= NOW() - INTERVAL 30 DAY
      GROUP BY c.nomecomponente
      ORDER BY total_alertas DESC;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function getTopServidoresAlertasAtencao(idDataCenter){
  console.log(
    "ACESSEI O COMPONENTE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function exibirAlertas():",
  );
  
  let instrucaoSql = `
      SELECT 
      CONCAT('Servidor ', s.idservidor) AS nome_servidor,
      COUNT(*) AS qtd_alertas
      FROM alerta a
      JOIN parametro_servidor p ON a.fk_parametro = p.idparametros_servidor
      JOIN servidor_cliente s ON p.fk_servidor = s.idservidor
      JOIN data_center dc ON s.fk_data_center = dc.iddata_center
      WHERE a.criticidade = 1
      AND a.data_gerado >= NOW() - INTERVAL 30 DAY
      AND dc.iddata_center = ${idDataCenter}
      GROUP BY s.idservidor
      ORDER BY qtd_alertas DESC
      LIMIT 5;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function getTopServidoresAlertasCriticos(idDataCenter){
  console.log(
    "ACESSEI O COMPONENTE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function exibirAlertas():",
  );
  
  let instrucaoSql = `
      SELECT 
      CONCAT('Servidor ', s.idservidor) AS nome_servidor,
      COUNT(*) AS qtd_alertas
      FROM alerta a
      JOIN parametro_servidor p ON a.fk_parametro = p.idparametros_servidor
      JOIN servidor_cliente s ON p.fk_servidor = s.idservidor
      JOIN data_center dc ON s.fk_data_center = dc.iddata_center
      WHERE a.criticidade = 3
      AND a.data_gerado >= NOW() - INTERVAL 30 DAY
      AND dc.iddata_center = ${idDataCenter}
      GROUP BY s.idservidor
      ORDER BY qtd_alertas DESC
      LIMIT 5;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function getAlertaUnsolved(idDataCenter){
    console.log(
    "ACESSEI O COMPONENTE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function exibirAlertas():",
  );

    let instrucaoSql = `
select fk_servidor,idjira, valor, nomecomponente, data_gerado from alerta 
JOIN parametro_servidor as p ON fk_parametro = idparametros_servidor
JOIN componente as c ON fk_componente = idcomponente
LEFT JOIN servidor_cliente as s ON fk_servidor = idservidor
LEFT JOIN data_center as d ON iddata_center = fk_data_center
WHERE data_resolvido is NULL 
AND idjira IS NOT NULL
AND DAY(data_gerado) = DAY(CURRENT_TIME)
AND (fk_data_center = ${idDataCenter} OR fk_data_center IS NULL)
ORDER BY data_gerado DESC;
    `;
    
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getAlertasCalendario(idDataCenter){
  console.log(
    "ACESSEI O COMPONENTE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function exibirAlertas():",
  );
  
  let instrucaoSql = `
      SELECT 
    DATE(a.data_gerado) AS data_alerta,
    SUM(CASE WHEN a.criticidade = 1 THEN 1 ELSE 0 END) AS alertas_atencao,
    SUM(CASE WHEN a.criticidade = 3 THEN 1 ELSE 0 END) AS alertas_criticos,
    COUNT(*) AS total_alertas
FROM alerta a
JOIN parametro_servidor p ON a.fk_parametro = p.idparametros_servidor
JOIN servidor_cliente s ON p.fk_servidor = s.idservidor
WHERE s.fk_data_center = ${idDataCenter}
  AND a.data_gerado >= CURDATE() - INTERVAL 29 DAY
GROUP BY DATE(a.data_gerado)
ORDER BY DATE(a.data_gerado);

    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function getStatusServidores(idDataCenter){
  console.log(
    "ACESSEI O COMPONENTE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function getStatusServidores():",
  );
  
  let instrucaoSql = `
      SELECT 
          s.idservidor,
          COALESCE(SUM(CASE WHEN a.criticidade = 3 THEN 1 ELSE 0 END), 0) AS alertas_criticos,
          COALESCE(SUM(CASE WHEN a.criticidade = 1 THEN 1 ELSE 0 END), 0) AS alertas_atencao
      FROM servidor_cliente s
      LEFT JOIN parametro_servidor p ON s.idservidor = p.fk_servidor
      LEFT JOIN alerta a ON p.idparametros_servidor = a.fk_parametro
          AND a.data_gerado >= NOW() - INTERVAL 30 DAY
      WHERE s.fk_data_center = ${idDataCenter}
      GROUP BY s.idservidor
      ORDER BY s.idservidor;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function getPorcentagemAumentoAlertas(idDataCenter){
  console.log(
    "ACESSEI O COMPONENTE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function exibirAlertas():",
  );
  
  let instrucaoSql = `
      SELECT
    CASE 
        WHEN total_critico_30d = 0 AND total_critico_1d > 0 THEN 'NOVOS ALERTAS'
        WHEN total_critico_30d = 0 AND total_critico_1d = 0 THEN 'SEM DADOS'
        ELSE ROUND((total_critico_1d * 100.0) / total_critico_30d, 2)
    END AS taxa_alertas_criticos,
    CASE 
        WHEN total_atencao_30d = 0 AND total_atencao_1d > 0 THEN 'NOVOS_ALERTAS'
        WHEN total_atencao_30d = 0 AND total_atencao_1d = 0 THEN 'SEM_DADOS'
        ELSE ROUND((total_atencao_1d * 100.0) / total_atencao_30d, 2)
    END AS taxa_alertas_atencao

FROM (
    SELECT 
        SUM(CASE WHEN a.criticidade = 3 THEN 1 ELSE 0 END) AS total_critico_30d,
        SUM(CASE WHEN a.criticidade = 1 THEN 1 ELSE 0 END) AS total_atencao_30d,
        SUM(CASE WHEN a.criticidade = 3 AND a.data_gerado >= NOW() - INTERVAL 1 DAY THEN 1 ELSE 0 END) AS total_critico_1d,
        SUM(CASE WHEN a.criticidade = 1 AND a.data_gerado >= NOW() - INTERVAL 1 DAY THEN 1 ELSE 0 END) AS total_atencao_1d

    FROM alerta a
    JOIN parametro_servidor p ON a.fk_parametro = p.idparametros_servidor
    JOIN servidor_cliente s ON p.fk_servidor = s.idservidor
    JOIN data_center dc ON s.fk_data_center = dc.iddata_center
    WHERE dc.iddata_center = ${idDataCenter}
      AND a.data_gerado >= NOW() - INTERVAL 30 DAY
) AS contagem;

    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
module.exports = {
    exibirAlertas,
    getTotalAlertas,
    getQtdAlertasComponente,
    getTopServidoresAlertasAtencao,
    getTopServidoresAlertasCriticos,
    getAlertaUnsolved,
    getAlertasCalendario,
    getStatusServidores,
    getPorcentagemAumentoAlertas
};