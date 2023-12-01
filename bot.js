const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

const telegramBotToken = '6411379653:AAE-B0uwjb8oXOKDqYDnJAb-x18FKZa6HQQ';
const telegramBotId = '@NoPleas3Bot';

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  try {
    const searchTerm = req.body.message.text;

    // Chame a função de busca de imagens
    await searchImages(searchTerm);

    res.status(200).send('Mensagens enviadas com sucesso!');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Erro interno no servidor.');
  }
});

async function sendImagesToTelegram(imageUrls, searchTerm) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramBotId,
        text: `Imagens para o termo "${searchTerm}":\n${imageUrls.join('\n')}`,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Erro ao enviar mensagem para o Telegram:', data.description);
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem para o Telegram:', error.message);
  }
}

async function searchImages(searchTerm) {
  const apiKey = 'AIzaSyBB1P26lArZzHZBueKWYc0m5AuamLnGIDU';
  const searchEngineId = 'a1ecfaba38d6e4058';
  const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${searchTerm}&cx=${searchEngineId}&searchType=image&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const itemsToDisplay = data.items.slice(0, 5); // Ajuste para exibir 5 imagens

      const imageUrls = itemsToDisplay.map((item) => item.link);

      // Enviar as URLs das imagens para o Telegram
      await sendImagesToTelegram(imageUrls, searchTerm);
    } else {
      console.error('Nenhuma imagem encontrada para o termo:', searchTerm);
    }
  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
  }
}

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
