FROM node:18 AS final

# Copiar OpenCV compilado do estágio anterior
COPY --from=hdgigante/python-opencv:latest /usr/local /usr/local

# Instalar dependências do sistema necessárias para o OpenCV
RUN apt-get update && \
    apt-get install -y \
    libopencv-dev \
    python3 \
    python3-pip \
    python3-venv

# Instalar dependências do Node.js
WORKDIR /usr/src/app

# Crie e ative o ambiente virtual
RUN python3 -m venv /env
ENV PATH="/env/bin:$PATH"

COPY package*.json ./
RUN npm install

# Instalar o PM2 globalmente
RUN npm install -g pm2

# Copiar o restante do código da aplicação
COPY . .

# Instalar bibliotecas Python necessárias
RUN pip3 install -r requirements.txt

# Expor a porta em que a aplicação irá rodar
EXPOSE 3000

# Usar o PM2 para rodar a aplicação
CMD [ "pm2-runtime", "index.js" ]
