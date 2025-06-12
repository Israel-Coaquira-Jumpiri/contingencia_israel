import psutil
import time
import subprocess
import platform
import math
import json
import insert
import selectbd
import s3
import os

from datetime import datetime

# CPU
def coletarCPUPercentual():
    cpuPercentual = psutil.cpu_percent()
    return cpuPercentual

def coletarCPUFreqGhz():
    cpuFreq = (psutil.cpu_freq()) 
    return cpuFreq.current / 1000  # Converte para GHz

# RAM
def coletarRamPercentual():
    ramPercentual = round(psutil.virtual_memory().percent, 1)
    return ramPercentual

def coletarMemoriaUsadaGB():
    memoria = psutil.virtual_memory()  
    memoria_usada_gb = memoria.used / (1024 ** 3)  # Converte de bytes para GB
    return round(memoria_usada_gb, 1)  # Retorna o valor arredondado para 1 casa decimal

# Disco
def coletarDiscoPercentual():
    discoPercentual = psutil.disk_usage("/").percent
    return discoPercentual

def coletarDiscoUsadoGB():
    disco = psutil.disk_usage("/")  
    disco_usado_gb = disco.used / (1024 ** 3)  # Converte de bytes para GB
    return round(disco_usado_gb, 1)  # Retorna o valor arredondado para 1 casa decimal


def coletarProcessos():
    num_cores = psutil.cpu_count(logical=True)

    # Inicia medição de CPU
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            proc.cpu_percent(interval=None)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

    time.sleep(1)

    processos = []
    for proc in psutil.process_iter(['pid', 'name', 'memory_percent']):
        try:
            nome = proc.info['name']
            if nome == "System Idle Process":
                continue

            cpu = proc.cpu_percent(interval=None) / num_cores
            mem = proc.memory_percent()

            if cpu > 0 or mem > 0:
                processos.append({
                    'pid': proc.pid,
                    'name': nome,
                    'cpu_percent': round(cpu, 2),
                    'memory_percent': round(mem, 2)
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    processos_ordenados = sorted(processos, key=lambda x: x['cpu_percent'], reverse=True)
    return processos_ordenados[:10]

def coletarVelocidadeDownload():
    antes = psutil.net_io_counters()
    time.sleep(1)
    depois = psutil.net_io_counters()

    bytes_recebidos = depois.bytes_recv - antes.bytes_recv
    velocidade_mbps = (bytes_recebidos * 8) / 1_000_000  # bits para Megabits

    return velocidade_mbps

def coletarVelocidadeUpload():
    antes = psutil.net_io_counters()
    time.sleep(1)
    depois = psutil.net_io_counters()

    bytes_enviados = depois.bytes_sent - antes.bytes_sent
    velocidade_mbps = (bytes_enviados * 8) / 1_000_000  # bits para Megabits

    return velocidade_mbps


def coletaLocal(idServidor):
    contador = 0
    listaJson = []
    
    while True:
        momento = datetime.now()
        contador += 1

        print(f"Repetição: {contador}")
        print(f"Servidor: {idServidor}")

        CPUPercentual = coletarCPUPercentual()
        print(f"Uso da CPU: {CPUPercentual}%")
        CPUFreq = coletarCPUFreqGhz()
        print(f"Frequência da CPU: {CPUFreq} GHz")
        RamPercentual = coletarRamPercentual()
        print(f"Uso da RAM: {RamPercentual}%")
        MemoriaUsadaGB = coletarMemoriaUsadaGB()
        print(f"Memória usada: {MemoriaUsadaGB} GB")
        DiscoPercentual = coletarDiscoPercentual()
        print(f"Uso do Disco: {DiscoPercentual}%")
        DiscoUsadoGB = coletarDiscoUsadoGB()
        print(f"Disco usado: {DiscoUsadoGB} GB")
        print(f"Velocidade de download: {coletarVelocidadeDownload()} Mbps")
        print(f"Velocidade de upload: {coletarVelocidadeUpload()} Mbps")

        print(f"Data-hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-----------------------------------\n\n")

        momento = datetime.now()

        jsonDados = {
        "data-hora": momento.strftime("%Y-%m-%d %H:%M:%S")
        }

        jsonDados["percentualCPU"] = CPUPercentual
        jsonDados["frequenciaCPU"] = CPUFreq
        jsonDados["percentualRAM"] = RamPercentual
        jsonDados["memoriaUsadaGB"] = MemoriaUsadaGB
        jsonDados["percentualDisco"] = DiscoPercentual
        jsonDados["discoUsadoGB"] = DiscoUsadoGB
        jsonDados["velocidadeDownloadMbps"] = coletarVelocidadeDownload()
        jsonDados["velocidadeUploadMbps"] = coletarVelocidadeUpload()
        jsonDados["processos"] = coletarProcessos()
        listaJson.append(jsonDados)
        if contador == 12:
            print("Criando arquivo JSON...")
            nomeArq = momento.strftime("%y-%m-%d_%H-%M") + f"_{idServidor}" + ".json"
            with open(nomeArq, "w", encoding="utf-8") as arquivo:
                json.dump(listaJson, arquivo, ensure_ascii=False, indent=2)
                print("Enviando para o bucket...")
                s3.upload(nomeArq)
                os.remove(nomeArq)
            listaJson = []
            contador = 0
        time.sleep(5)

# Coleta de Informações do Sistema
def coletar_informacoes():
    informacoes = {}

    # Sistema Operacional
    sistema = platform.system()  # Sistema operacional
    versao = platform.version()  # Versão do sistema operacional
    informacoes["Sistema Operacional"] = f"{sistema} {versao}"

    # Modelo do Processador
    try:
        if sistema == "Windows":
            # Usando PowerShell para pegar o modelo do processador
            processador = subprocess.check_output(
                ["powershell", "-Command", "Get-WmiObject Win32_Processor | Select-Object -ExpandProperty Name"], 
                shell=True
            ).decode().strip()
            if not processador:
                processador = "Modelo do Processador não encontrado"
        elif sistema == "Linux":
            # Linux: lendo de /proc/cpuinfo
            processador = subprocess.check_output(
                "cat /proc/cpuinfo | grep 'model name' | uniq", 
                shell=True
            ).decode().split(":")[1].strip()
        else:
            processador = "Desconhecido"
        informacoes["Modelo do Processador"] = processador
    except Exception as e:
        informacoes["Modelo do Processador"] = "Erro ao coletar"

    # Quantidade Máxima de RAM
    ram_maxima = psutil.virtual_memory().total / (1024 ** 3)
    informacoes["RAM Máxima"] = f"{math.ceil(ram_maxima)}"

    # Quantidade Máxima de Armazenamento
    try:
        if sistema == "Windows":
            # Windows: pegando o espaço total do disco principal (C:)
            armazenamento = psutil.disk_usage("C:/").total / (1024 ** 3) 
            armazenamento = math.ceil(armazenamento).__ceil__()
            armazenamento = int(armazenamento)
        elif sistema == "Linux":
            # Linux: usando o comando df para obter o espaço total do disco
            armazenamento = subprocess.check_output(
                "df --total -h | grep total", 
                shell=True
            ).decode().split()[1]
            armazenamento = float(armazenamento[:-1])  # Removendo o "G" e convertendo para float
            armazenamento = math.ceil(armazenamento).__ceil__()
            armazenamento = int(armazenamento)
        else:
            armazenamento = "Desconhecido"
        informacoes["Armazenamento Máximo"] = f"{armazenamento}"
    except Exception as e:
        informacoes["Armazenamento Máximo"] = "Erro ao coletar"

    # UUID da placa mãe
    try:
        if sistema == "Windows":
            # Usando PowerShell para pegar o UUID da placa-mãe
            uuid_placa_mae = subprocess.check_output(
                ["powershell", "-Command", "Get-WmiObject Win32_BaseBoard | Select-Object -ExpandProperty SerialNumber"], 
                shell=True
            ).decode().strip()
            if not uuid_placa_mae:
                uuid_placa_mae = "UUID não encontrado"

        elif sistema == "Linux":
            # Linux: usando o comando dmidecode para pegar o UUID da placa mãe
            try:
                uuid_placa_mae = subprocess.check_output(
                    "sudo dmidecode -s system-uuid", 
                    shell=True
                ).decode().strip()
            except subprocess.CalledProcessError as e:
                uuid_placa_mae = "Erro ao executar dmidecode (necessário sudo)"
            except Exception as e:
                uuid_placa_mae = f"Erro ao coletar UUID no Linux: {e}"

        else:
            uuid_placa_mae = "Desconhecido"
        
        informacoes["UUID da Placa Mãe"] = uuid_placa_mae

    except Exception as e:
        informacoes["UUID da Placa Mãe"] = f"Erro ao coletar UUID: {e}"

    return informacoes
