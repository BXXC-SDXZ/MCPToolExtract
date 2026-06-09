# MCP Server + n8n

![Licença MIT](https://img.shields.io/badge/Licença-MIT-blue.svg)
![n8n](https://img.shields.io/badge/n8n-Workflow%20Automation-orange) 
![MCP Server](https://img.shields.io/badge/MCP%20Server-AI%20Tools-blue) 
![Docker](https://img.shields.io/badge/Docker-Container-blue) 
![Python](https://img.shields.io/badge/Python-3.x-green)

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração do n8n](#configuração-do-n8n)
- [Criando um Workflow com AI Agent](#criando-um-workflow-com-ai-agent)
- [Testando as Ferramentas](#testando-as-ferramentas)
- [Estrutura de Diretórios e Persistência](#estrutura-de-diretórios-e-persistência)
- [Modificando o MCP Server](#modificando-o-mcp-server)
- [Considerações de Segurança](#considerações-de-segurança)
- [Documentação](#documentação)
- [Referências](#referências)


## Sobre o Projeto

Esta aplicação combina a ferramenta de automação n8n com o protocolo MCP Server para criar um ambiente de experimentação. A solução utiliza Docker para facilitar a instalação e configuração, permitindo testar facilmente os recursos do MCP Server através da interface visual do n8n.

**Componentes principais:**
- **n8n**: Plataforma de automação com interface visual
- **MCP Server**: Servidor que disponibiliza ferramentas para agentes de IA

Este projeto foi criado para fins educacionais e de experimentação.

## Pré-requisitos

Para utilizar esta aplicação, você precisará ter:

- **Docker** e **Docker Compose** instalados no seu computador
  - Windows: [Docker Desktop](https://www.docker.com/products/docker-desktop/) e [Git](https://git-scm.com/download/win)
  - Linux: doker.io, docker-compose e docker-buildx

## Instalação

### No Windows

1. Baixe e extraia o arquivo ZIP deste repositório ou clone-o usando Git:
   ```
   git clone https://github.com/curseai/mcp-server-n8n.git
   ```
2. Abra o Prompt de Comando ou PowerShell e navegue até a pasta do projeto:
   ```
   cd mcp-server-n8n
   ```
3. Inicie os containers Docker:
   ```
   docker-compose up -d
   ```
4. Para finalizar os containers Docker:
    ```
    docker-compose down
    ```
> **Observação** -  Caso enfrente dificuldades para instalar o Docker Desktop no Windows, utilize o WSL com uma distribuição linux.

### No Linux

1. Baixe ou clone o repositório:
   ```
   git clone https://github.com/curseai/mcp-server-n8n.git
   ```
2. Navegue até a pasta do projeto:
   ```
   cd mcp-server-n8n
   ```
3. Inicie os containers Docker
   ```
   docker-compose up -d
   ```
4. Para finalizar os containers Docker:
    ```
    docker-compose down
    ```

> **Observação:** Ao finalizar a aplicação, os containers serão removidos. Contudo, os dados serão mantidos nos diretórios persistentes: `mcp_server`, que contém os arquivos Python responsáveis pela execução do MCP Server, e o diretório `n8n_data`, que contém os dados da aplicação n8n. Com isso, caso você deseje iniciar novamente a aplicação, os containers serão recriados com os dados armazenados na execução anterior. 



Quando a instalação for concluída, você verá uma mensagem informando que os containers foram iniciados. 
A aplicação estará disponível em: **http://localhost:5678**

## Configuração do n8n

### Acessando o n8n pela primeira vez

1. Abra seu navegador e acesse http://localhost:5678
2. Você verá a tela de boas-vindas do n8n com o formulário de criação de conta. 
3. Complete o formulário de cadastro:
   - Email: Coloque seu email
   - Nome: Seu nome
   - Senha: Uma senha segura
   - Confirmar senha: Repita a senha

4. Clique em "Next" para criar sua conta.

<img width="320" alt="img-01" src="https://github.com/user-attachments/assets/3796ca53-9f82-4ff8-9c0f-6467ae8d4e21" />

5. O próximo formulário é apenas uma pesquisa e pode ser ignorado clicando em "Get Started"

<img width="320" alt="img-02" src="https://github.com/user-attachments/assets/90197a57-62af-4c29-a9da-b5bc249f997e" />

6. A próxima tela vai oferecer a possibilidade de obtenção de uma chave de licença. Caso não deseje obter, basta clicar em "skip"

<img width="320" alt="img-03" src="https://github.com/user-attachments/assets/a811ce99-04ff-4ce4-9665-69f2bb1f8527" />

7. Após o cadastro, você será redirecionado para a página principal do n8n

## Criando um Workflow com AI Agent

### Criando um novo workflow

1. Na tela inicial do n8n, clique no botão "Create Workflow" no canto superior direito
2. Você será direcionado para o editor de workflows, onde verá uma tela em branco com uma grade

<img width="420" alt="img-04" src="https://github.com/user-attachments/assets/cd461b25-3e5e-435a-aee5-971cfea52987" />


3. Dê um nome para seu workflow, por exemplo: "Teste MCP Server" clicando em "My workflow" no canto superior esquerdo.

### Adicionando um AI Agent

1. Clique em "Add first step" para iniciar a montagem do workflow.
2. No painel esquerdo, você verá a barra de pesquisa "Search nodes..."

<img width="420" alt="img-05" src="https://github.com/user-attachments/assets/659992e9-c469-4861-ae1d-5270fefb7512" />

3. Digite "AI Agent" na barra de pesquisa
4. Localize o nó "AI Agent" nos resultados da pesquisa
5. Clique e arraste o nó "AI Agent" para o centro da tela
6. O painel de configuração do "AI Agent" será exibido na sequência. Para testar o MCP Server, podemos deixar os parametros sem alteração. Em seguida, podemos fechar este painel clicando em "<- Back to canvas" no canto superior esquerdo da tela. 

<img width="420" alt="img-06" src="https://github.com/user-attachments/assets/4b3057d9-581c-4da5-9508-9a22aa03311d" />


### Configurando o Modelo LLM (Chat Model)

1. Para adicionar um modelo LLM no AI Agent clique em "+ Chat Model"
2. Na aba lateral selecione o modelo na aba lateral. Pesquise o seu modelo LLM na barra de pesquisa "Search nodes..."
3. Selecione o modelo LLM que deseja usar (por exemplo: "OpenAI" ou "Anthropic")

<img width="320" alt="img-07" src="https://github.com/user-attachments/assets/7ecbb9b0-a46f-443d-b43e-1dd8ff50cfa6" />

4. Após selecionar o modelo, você verá um campo "Credential to connect with" que mostra "Select Credential"

<img width="320" alt="img-08" src="https://github.com/user-attachments/assets/e69e295c-7822-4311-955e-55e3f785e996" />

5. Clique em "Select Credential" em seguida clique "Create new credential" para abrir a janela de configuração de credenciais
6. Na janela de credenciais, você verá:
   - API Key: campo para inserir sua chave de API
   
<img width="420" alt="img-09" src="https://github.com/user-attachments/assets/6fe3b244-327c-46df-ae59-a578e63f9069" />

   > **Observação**: Para obter uma API Key:
   > - Para OpenAI: Acesse [platform.openai.com](https://platform.openai.com), crie uma conta e gere uma API Key
   > - Para Anthropic: Acesse [console.anthropic.com](https://console.anthropic.com), crie uma conta e gere uma API Key

7. Insira sua API Key no campo correspondente
8. Clique em "Save" para salvar suas credenciais

9. De volta à configuração do AI Agent, você verá campos adicionais para ajustar os parâmetros do modelo:
   - Model: selecione o modelo específico (como "gpt-4o-mini" ou "claude-3.7-Sonnet")
10. Configure esses parâmetros conforme sua preferência
11. Clique em "<- Back to canvas" no canto superior esquerdo da tela para voltar ao workflow

### Configurando a Memória

1. Para adicionar uma memória no AI Agent clique em "+ Memory"
2. Na barra lateral clique no node "Simple Memory"

<img width="320" alt="img-10" src="https://github.com/user-attachments/assets/8160e7a7-ed54-4627-8401-917b38902cfb" />

3. No campo "Context Window Length", defina o tamanho da janela de contexto (recomendado: 20)

<img width="320" alt="img-11" src="https://github.com/user-attachments/assets/d1110429-956d-42f2-9f09-cae222e0f792" />

4. Clique em "<- Back to canvas" no canto superior esquerdo da tela para voltar ao workflow

### Configurando o MCP Client

1. Para adicionar um MCP Client no AI Agent clique em "+ Tools"

<img width="420" alt="img-12" src="https://github.com/user-attachments/assets/b4cbba37-35db-4d13-8c25-da2aeee13668" />

3. Na barra lateral, procure na barra de pesquisa "Search nodes..." por "MCP Client Tool" e selecione na lista de ferramentas disponíveis
5. Configure o MCP Client com os seguintes parâmetros:
   - **SSE Endpoint**: Digite exatamente `http://mcp_server:8000/sse`
   - **Authentication**: Como estamos em um ambiente local e isolado, podemos deixar o campo "Authentication" como "None".
   > **Atenção** Esta aplicação é para fins de experimentação e aprendizado. Para uso em produção você deve usar algum método de autenticação.

<img width="320" alt="img-13" src="https://github.com/user-attachments/assets/063ca728-154f-4c68-8def-45d625b9ab87" />


   - **Tools**: Clique no campo e selecione "All" para usar todas as ferramentas disponíveis
   > **Dica**: Se quiser verificar a conexão com o MCP Server, você pode selecionar "Selected" em vez de "All". Isso mostrará uma lista das ferramentas disponíveis. Se a lista aparecer, significa que a conexão está funcionando corretamente.
   
<img width="520" alt="img-14" src="https://github.com/user-attachments/assets/838ce6f3-4e95-4145-ab3e-238cf0e9b32c" />

6. Após configurar todos os parâmetros, clique em "<- Back to canvas" no canto superior esquerdo da tela para voltar ao workflow
7. Após voltar ao workflow, clique em "Save" no canto superiro direito para salvar as configurações realizadas no seu workflow.

## Testando as Ferramentas

Depois de configurar o AI Agent, você pode testar as ferramentas do MCP Server:

1. No painel de configuração do AI Agent, role até o final da página
2. Clique no botão "Open Chat" na parte inferior do painel de configuração

<img width="520" alt="img-15" src="https://github.com/user-attachments/assets/021886a3-3fda-46be-bedc-f4be1ae69d6d" />

3. Uma janela de chat será aberta, semelhante a um chat de IA
4. No campo de texto na parte inferior do chat, experimente os seguintes comandos:
   - Digite `ping` e pressione Enter - o agente deve responder com "pong"
   - Digite `acho eu` e pressione Enter - o agente deve responder com "acho eu I love you!"

<img width="420" alt="img-16" src="https://github.com/user-attachments/assets/22ab955b-b6d4-47fc-8053-603ac8142f11" />

Esses comandos acionam as ferramentas disponibilizadas pelo MCP Server, demonstrando que a conexão entre o n8n e o MCP Server está funcionando corretamente.

## Estrutura de Diretórios e Persistência

Quando você executa a aplicação pela primeira vez, são criados dois diretórios importantes na pasta do projeto:

### Diretório `n8n_data`

Este diretório armazena todos os dados do n8n, incluindo:
- Seus workflows criados
- Credenciais configuradas
- Configurações da aplicação

O diretório `n8n_data` é essencial para manter suas configurações e workflows mesmo após reiniciar os containers.

### Diretório `mcp_server`

Este diretório contém os arquivos do MCP Server, incluindo:
- O ambiente virtual Python (pasta `.venv`)
- O arquivo `server.py` que contém o código do servidor MCP

Para acessar o arquivo `server.py`, navegue até a pasta do projeto e abra o diretório `mcp_server`. O arquivo está localizado na raiz deste diretório:

No Windows:
```
explorer mcp_server
```

No Linux:
```
ls -la mcp_server
```

Este arquivo contém o código Python que define as ferramentas disponibilizadas pelo MCP Server (atualmente `ping` e `echo`).

## Modificando o MCP Server

Você pode testar e implementar novas funcionalidades ao MCP Server modificando o arquivo `server.py`.

### Editando o arquivo `server.py`

1. Navegue até o diretório `mcp_server` na pasta do projeto
2. Abra o arquivo `server.py` com qualquer editor de texto (como Notepad, VSCode, etc.)
3. O arquivo contém um código Python que define o servidor MCP. No código abaixo podemos ver a definição das suas ferramentas que são usadas no n8n.
   ```python
   from mcp.server.fastmcp import FastMCP
    
   mcp = FastMCP('ping_server')

   @mcp.tool(name='ping')
   def ping() -> str:
       """
       A simple ping tool that returns a message.
       """
       return 'pong'

   @mcp.tool(name='echo')
   def echo(message: str) -> str:
       """
       An echo tool that returns the message sent to it.
       """
       return f"{message} I love you!"

   if __name__ == '__main__':
       mcp.run(transport='sse')
   ```
Além das `tools` é possível adicionar `resources` e `prompt`. Para mais informações consulte a [documentação oficial do MCP Server](https://modelcontextprotocol.io/)

### Aplicando as alterações

Após modificar o arquivo `server.py`, você precisa reiniciar os containers para que as alterações sejam reconhecidas pelo MCP Client no n8n:

1. Abra um terminal ou prompt de comando
2. Navegue até a pasta do projeto
3. Execute o comando:
   ```
   docker-compose restart
   ```

4. Aguarde até que ambos os containers sejam reiniciados
5. Volte ao n8n e teste sua nova ferramenta


## Considerações de Segurança

Esta aplicação foi desenvolvida para fins de experimentação e aprendizado, portanto:

- Não foram implementados procedimentos de autenticação no MCP Server
- Recomenda-se usar apenas em ambientes de teste isolados
- Não utilize em ambientes de produção sem implementar medidas de segurança adequadas

## Documentação

Para mais informações sobre o Model Context Protocol:

- [Documentação oficial do MCP](https://modelcontextprotocol.io/)


## Referências

- [Python SDK do Model Context Protocol](https://github.com/modelcontextprotocol/python-sdk)
- [Exemplos de servidores MCP](https://github.com/modelcontextprotocol/servers)


## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
