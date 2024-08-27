const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Configuração do Google Cloud Storage
const storage = new Storage();
const bucketName = 'carsecurity-app.appspot.com';
const bucket = storage.bucket(bucketName);

// Função para fazer upload de um arquivo para o GCS
const uploadFile = async (filePath, destination) => {
  await bucket.upload(filePath, {
    destination,
    gzip: true,
    metadata: {
      cacheControl: 'no-cache',
    },
  });
  console.log(`${filePath} uploaded to ${bucketName}.`);
};

// Função para processar a imagem e extrair características da digital
const processImage = async (filePaths) => {
  const pythonScriptPath = path.join(__dirname, 'extract_minutiae.py');
  return new Promise((resolve, reject) => {
    exec(`python3 ${pythonScriptPath} ${filePaths.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(JSON.parse(stdout));
    });
  });
};

app.post('/upload-images', async (req, res) => {
  const imagesData = req.body.images;

  if (imagesData.length == 0) {
    return res.status(400).json({
      success: false,
      message: 'É necessário pelo menos uma Data URI de imagem.'
    });
  }

  try {
    const imagePaths = [];
    const templatePaths = [];

    for (let i = 0; i < imagesData.length; i++) {
      const imageData = imagesData[i];
      const buffer = Buffer.from(imageData.replace(/^data:image\/jpeg;base64,/, ""), 'base64');
      const localImagePath = path.join(__dirname, `temp-image-${i}.jpg`);
      fs.writeFileSync(localImagePath, buffer);
      imagePaths.push(localImagePath);

      const imageDestination = `fingerprints/images/${Date.now()}_image-${i}.jpg`;
      await uploadFile(localImagePath, imageDestination);

      // Processar todas as imagens e gerar o template combinado
      const combinedTemplate = await processImage(imagePaths);
      const templatePath = path.join(__dirname, `combined-template.json`);
      fs.writeFileSync(templatePath, JSON.stringify(combinedTemplate));
      const templateDestination = `fingerprints/templates/${Date.now()}_combined_template.json`;
      await uploadFile(templatePath, templateDestination);

      fs.unlinkSync(localImagePath);
      fs.unlinkSync(templatePath);
    }

    res.json({
      success: true,
      message: 'Imagens e templates enviados para o bucket com sucesso!',
      imagePaths: imagePaths.map((p, i) => `fingerprints/images/${Date.now()}_image-${i}.png`),
      templatePath: `fingerprints/templates/${Date.now()}_combined_template.json`
    });
  } catch (error) {
    console.error('Erro ao processar as imagens', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar as imagens'
    });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
