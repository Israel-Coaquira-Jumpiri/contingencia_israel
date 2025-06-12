import boto3
import pandas as pd
import io
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import json

def lambda_handler(event, context):
    try:

  
        s3 = boto3.client('s3')

        bucket_name = 'tradeflux-trusted'
        prefix = 'DataCenter1Amanda/' 

        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)


        dfs = []
        servidores = 8

        # Percorre todos os arquivos encontrados
        if 'Contents' in response:
            for obj in response['Contents']:
                key = obj['Key']
                if key.endswith('.csv'):
                    # Lê o conteúdo do arquivo CSV direto da memória
                    csv_obj = s3.get_object(Bucket=bucket_name, Key=key)
                    body = csv_obj['Body'].read()
                    df = pd.read_csv(io.BytesIO(body))  # transforma em DataFrame
                    dfs.append(df)


        df_final = pd.concat(dfs, ignore_index=True)



        df_final["Data Hora"] = pd.to_datetime(df_final["Data Hora"], format="%Y-%m-%d %H:%M:%S", errors='coerce')
        df_final = df_final[df_final["Data Hora"].notna()]

        hoje = datetime.today()
        seis_meses_atras = hoje - relativedelta(months=3)
        trinta_dias_atras = hoje - timedelta(days = 30)
        sete_dias_atras = hoje - timedelta(days = 7)




        df_6_meses = df_final[(df_final["Data Hora"] >= seis_meses_atras) & (df_final['Data Hora'] <= hoje)]
        df_30_dias = df_final[(df_final['Data Hora'] >= trinta_dias_atras) & (df_final['Data Hora'] <= hoje)]
        df_7_dias = df_final[(df_final["Data Hora"] >= sete_dias_atras) & (df_final['Data Hora'] <= hoje)]

       

        # priemria kpi 
        ociosidade_6meses = df_6_meses[(df_6_meses['CPU Percentual'] <= 5) & (df_6_meses['RAM Percentual'] <= 25 ) & (df_6_meses['Disco Percentual'] <= 25)]
        ociosidade_30dias = df_30_dias[(df_30_dias['CPU Percentual'] <= 5) & (df_30_dias['RAM Percentual'] <= 25 ) & (df_30_dias['Disco Percentual'] <= 25)]
        ociosidade_7dias = df_7_dias[(df_7_dias['CPU Percentual'] <= 5) & (df_7_dias['RAM Percentual'] <= 25 ) & (df_7_dias['Disco Percentual'] <= 25)]

    
        TabelaOciosidade_6meses = {}
        TabelaOciosidade_30dias = {}
        TabelaOciosidade_7dias = {}

    
        periodos = [
            ("6meses", df_6_meses),
            ("30dias", df_30_dias),
            ("7dias", df_7_dias)
        ]

        data_inicial = datetime.now() - timedelta(days=90)
        data3meses = []
        quantidade = 19  # a cada 5 dias

        cpu_ociosa_3meses = []
        ram_ociosa_3meses = []
        disco_ociosa_3meses = []

        for i in range(quantidade):
            data_alvo = data_inicial + timedelta(days=5 * i)
            data3meses.append(data_alvo)

            cpu = df_6_meses[(df_6_meses['CPU Percentual'] <= 5) & (df_6_meses['Data Hora'].dt.date == data_alvo.date())]
            ram = df_6_meses[(df_6_meses['RAM Percentual'] <= 25) & (df_6_meses['Data Hora'].dt.date == data_alvo.date())]
            disco = df_6_meses[(df_6_meses['Disco Percentual'] <= 25) & (df_6_meses['Data Hora'].dt.date == data_alvo.date())]

            cpu_ociosa_3meses.append(len(cpu))
            ram_ociosa_3meses.append(len(ram))
            disco_ociosa_3meses.append(len(disco))


        
        data_inicial2 = datetime.now() - timedelta(days=30)
        data30dias = []
        quantidade2 = 16  # a cada 2 dias

        cpu_ociosa_30dias = []
        ram_ociosa_30dias = []
        disco_ociosa_30dias = []

        for i in range(quantidade2):
            data_alvo = data_inicial2 + timedelta(days=2 * i)
            data30dias.append(data_alvo)

            cpu = df_30_dias[(df_30_dias['CPU Percentual'] <= 5) & (df_30_dias['Data Hora'].dt.date == data_alvo.date())]
            ram = df_30_dias[(df_30_dias['RAM Percentual'] <= 25) & (df_30_dias['Data Hora'].dt.date == data_alvo.date())]
            disco = df_30_dias[(df_30_dias['Disco Percentual'] <= 25) & (df_30_dias['Data Hora'].dt.date == data_alvo.date())]

            cpu_ociosa_30dias.append(len(cpu))
            ram_ociosa_30dias.append(len(ram))
            disco_ociosa_30dias.append(len(disco))


     
        data_inicial3 = datetime.now() - timedelta(days=7)
        data7dias = []
        quantidade3 = 8  # um por dia

        cpu_ociosa_7dias = []
        ram_ociosa_7dias = []
        disco_ociosa_7dias = []

        for i in range(quantidade3):
            data_alvo = data_inicial3 + timedelta(days=i)
            data7dias.append(data_alvo)

            cpu = df_7_dias[(df_7_dias['CPU Percentual'] <= 5) & (df_7_dias['Data Hora'].dt.date == data_alvo.date())]
            ram = df_7_dias[(df_7_dias['RAM Percentual'] <= 25) & (df_7_dias['Data Hora'].dt.date == data_alvo.date())]
            disco = df_7_dias[(df_7_dias['Disco Percentual'] <= 25) & (df_7_dias['Data Hora'].dt.date == data_alvo.date())]

            cpu_ociosa_7dias.append(len(cpu))
            ram_ociosa_7dias.append(len(ram))
            disco_ociosa_7dias.append(len(disco))

          


        for servidor_id in range(1, servidores):
            for nome_periodo, df in periodos:
                filtro = (
                    (df['CPU Percentual'] <= 5) &
                    (df['RAM Percentual'] <= 25) &
                    (df['Disco Percentual'] <= 25) &
                    (df['Servidor'] == servidor_id)
                )
                
                valor = len(df[filtro]) / 60     

                # Armazena no dicionário
                if nome_periodo == "6meses":
                    TabelaOciosidade_6meses[servidor_id] = valor
                elif nome_periodo == "30dias":
                    TabelaOciosidade_30dias[servidor_id] = valor
                elif nome_periodo == "7dias":
                    TabelaOciosidade_7dias[servidor_id] = valor

        cpuOcioso6meses = (df_6_meses['CPU Percentual'] <= 5).sum()
        ramOcioso6meses = (df_6_meses['RAM Percentual'] <= 25).sum()
        discoOcioso6meses = (df_6_meses['Disco Percentual'] <= 25).sum()

        cpuOcioso30dias = (df_30_dias['CPU Percentual'] <= 5).sum()
        ramOcioso30dias = (df_30_dias['RAM Percentual'] <= 25).sum()
        discoOcioso30dias = (df_30_dias['Disco Percentual'] <= 25).sum()

        cpuOcioso7dias = (df_7_dias['CPU Percentual'] <= 5).sum()
        ramOcioso7dias = (df_7_dias['RAM Percentual'] <= 25).sum()
        discoOcioso7dias = (df_7_dias['Disco Percentual'] <= 25).sum()

        
        # 3 MESES
        cpuEstavel3meses = ((df_6_meses['CPU Percentual'] >= 5) & (df_6_meses['CPU Percentual'] <= 80)).sum()
        ramEstavel3meses = ((df_6_meses['RAM Percentual'] >= 25) & (df_6_meses['RAM Percentual'] <= 80)).sum()
        discoEstavel3meses = ((df_6_meses['Disco Percentual'] >= 25) & (df_6_meses['Disco Percentual'] <= 80)).sum()

        # 30 DIAS
        cpuEstavel30dias = ((df_30_dias['CPU Percentual'] >= 5) & (df_30_dias['CPU Percentual'] <= 80)).sum()
        ramEstavel30dias = ((df_30_dias['RAM Percentual'] >= 25) & (df_30_dias['RAM Percentual'] <= 80)).sum()
        discoEstavel30dias = ((df_30_dias['Disco Percentual'] >= 25) & (df_30_dias['Disco Percentual'] <= 80)).sum()

        # 7 DIAS
        cpuEstavel7dias = ((df_7_dias['CPU Percentual'] >= 5) & (df_7_dias['CPU Percentual'] <= 80)).sum()
        ramEstavel7dias = ((df_7_dias['RAM Percentual'] >= 25) & (df_7_dias['RAM Percentual'] <= 80)).sum()
        discoEstavel7dias = ((df_7_dias['Disco Percentual'] >= 25) & (df_7_dias['Disco Percentual'] <= 80)).sum()


        ociosidade6meses = []

        ociosidade6meses = [
            int(cpuOcioso6meses),
            int(ramOcioso6meses),
            int(discoOcioso6meses)
        ]

        ociosidade30dias = []

        ociosidade30dias = [
            int(cpuOcioso30dias),
            int(ramOcioso30dias),
            int(discoOcioso30dias)
        ]

        ociosidade7dias = []

        ociosidade7dias = [
            int(cpuOcioso7dias),
            int(ramOcioso7dias),
            int(discoOcioso7dias)
        ]

        
        estabilidade3meses = []

        estabilidade3meses = [
            int(cpuEstavel3meses),
            int(ramEstavel3meses),
            int(discoEstavel3meses)
        ]

        estabilidade30dias = []

        estabilidade30dias = [
            int(cpuEstavel30dias),
            int(ramEstavel30dias),
            int(discoEstavel30dias)
        ]

        estabilidade7dias = []

        estabilidade7dias = [
            int(cpuEstavel7dias),
            int(ramEstavel7dias),
            int(discoEstavel7dias)
        ]




        # 6 meses
        if cpuOcioso6meses > ramOcioso6meses and cpuOcioso6meses > discoOcioso6meses:
            componenteMaisOcioso6meses = 'CPU'
        elif ramOcioso6meses > discoOcioso6meses:
            componenteMaisOcioso6meses = 'RAM'
        else:
            componenteMaisOcioso6meses = 'Disco'

        # 30 dias
        if cpuOcioso30dias > ramOcioso30dias and cpuOcioso30dias > discoOcioso30dias:
            componenteMaisOcioso30dias = 'CPU'
        elif ramOcioso30dias > discoOcioso30dias:
            componenteMaisOcioso30dias = 'RAM'
        else:
            componenteMaisOcioso30dias = 'Disco'

        # 7 dias
        if cpuOcioso7dias > ramOcioso7dias and cpuOcioso7dias > discoOcioso7dias:
            componenteMaisOcioso7dias = 'CPU'
        elif ramOcioso7dias > discoOcioso7dias:
            componenteMaisOcioso7dias = 'RAM'
        else:
            componenteMaisOcioso7dias = 'Disco'


        media_ociosidade_6meses = round(len(ociosidade_6meses) / 60,1) / servidores
        media_ociosidade_30dias = round(len(ociosidade_30dias) / 60,1) / servidores
        media_ociosidade_7dias = round(len(ociosidade_7dias) / 60, 1) / servidores

        mediaOciosidade = {
            "MediaOciosidade6Meses": media_ociosidade_6meses,
            "MediaOciosidade30dias": media_ociosidade_30dias,
            "MediaOciosidade7dias": media_ociosidade_7dias
        }

        componenteMaisOciosioso = {
            "componente6meses": componenteMaisOcioso6meses,
            "componente30dias": componenteMaisOcioso30dias,
            "componente7dias": componenteMaisOcioso7dias,
            "ociosidade6meses": ociosidade6meses,
            "ociosidade30dias": ociosidade30dias,
            "ociosidade7dias": ociosidade7dias
        }

        estabilidadeComponentes = {
            "estabilidade3meses": estabilidade3meses,
            "estabilidade30dias": estabilidade30dias,
            "estabilidade7dias": estabilidade7dias
        }

        # Tabela de ociosidade para os últimos 6 meses
        tabela6meses = {
            i: TabelaOciosidade_6meses[i]
            for i in range(1, len(TabelaOciosidade_6meses))
        }

        # Tabela de ociosidade para os últimos 30 dias
        tabela30dias = {
            i: TabelaOciosidade_30dias[i]
            for i in range(1, len(TabelaOciosidade_30dias))
        }

        # Tabela de ociosidade para os últimos 7 dias
        tabela7dias = {
            i: TabelaOciosidade_7dias[i]
            for i in range(1, len(TabelaOciosidade_7dias))
        }

        ociosidadeCPU3mesesTemporal = {

        data3meses[i].strftime("%d/%m/%Y"): cpu_ociosa_3meses[i]
        for i in range(len(cpu_ociosa_3meses))
        
        }

        ociosidadeRAM3mesesTemporal = {

        data3meses[i].strftime("%d/%m/%Y"): ram_ociosa_3meses[i]
        for i in range(len(ram_ociosa_3meses))
        
        }

        ociosidadeDISCO3mesesTemporal = {

        data3meses[i].strftime("%d/%m/%Y"): disco_ociosa_3meses[i]
        for i in range(len(disco_ociosa_3meses))
        
        }
        

        ociosidadeCPU30diasTemporal = {
        data30dias[i].strftime("%d/%m/%Y"): cpu_ociosa_30dias[i]
        for i in range(len(cpu_ociosa_30dias))
        }

        ociosidadeRAM30diasTemporal = {
        data30dias[i].strftime("%d/%m/%Y"): ram_ociosa_30dias[i]
        for i in range(len(ram_ociosa_30dias))
        }

        ociosidadeDISCO30diasTemporal = {
        data30dias[i].strftime("%d/%m/%Y"): disco_ociosa_30dias[i]
        for i in range(len(disco_ociosa_30dias))
        }

        ociosidadeCPU7diasTemporal = {
        data7dias[i].strftime("%d/%m/%Y"): cpu_ociosa_7dias[i]
        for i in range(len(cpu_ociosa_7dias))
        }

        ociosidadeRAM7diasTemporal = {
        data7dias[i].strftime("%d/%m/%Y"): ram_ociosa_7dias[i]
        for i in range(len(ram_ociosa_7dias))
        }

        ociosidadeDISCO7diasTemporal = {
        data7dias[i].strftime("%d/%m/%Y"): disco_ociosa_7dias[i]
        for i in range(len(disco_ociosa_7dias))
        }

    

        dados = [mediaOciosidade, componenteMaisOciosioso, tabela6meses, tabela30dias, tabela7dias, estabilidadeComponentes, ociosidadeCPU3mesesTemporal, ociosidadeRAM3mesesTemporal, ociosidadeDISCO3mesesTemporal, ociosidadeCPU30diasTemporal, ociosidadeRAM30diasTemporal, ociosidadeDISCO30diasTemporal, ociosidadeCPU7diasTemporal, ociosidadeRAM7diasTemporal, ociosidadeDISCO7diasTemporal]


        json_final = json.dumps(dados, indent=4)
        

        # envia o json para o client
        #por enquanto json se der tempo csv
        data_hoje = datetime.today().strftime('%Y-%m-%d')

        nome_arquivo = f'dados_eficiencia_{data_hoje}.json'

        s3.put_object(
        Bucket='tradeflux-client',
        Key=f'dataCenter1Amanda/{nome_arquivo}',
        Body=json_final,
        ContentType='application/json'
        )


        return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",  
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "*"
        },
            "body": json_final
        }
    except Exception as e:
        return {
                "statusCode": 500,
                "body": json.dumps({"erro": str(e)})
            }




