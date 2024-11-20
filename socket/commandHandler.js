const axios = require("axios");
require("dotenv").config();

module.exports = async (msg) => {
  switch (msg.content) {
    case "/gif":
      const gifOptions = {
        method: "GET",
        url: "https://giphy.p.rapidapi.com/v1/gifs/random",
        params: {
          api_key: process.env.GIPHY_API_KEY,
          tag: "meme",
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "giphy.p.rapidapi.com",
        },
      };

      try {
        const response = await axios.request(gifOptions);
        msg.content = response.data.data.images.original.url;
        msg.type = "gif";
      } catch (error) {
        msg.content = "Erreur lors de la récupération du GIF";
        msg.type = "error";
      }
      break;

    case "/meme":
      try {
        const response = await axios.get("https://api.imgflip.com/get_memes");
        const memes = response.data.data.memes;
        const randomMeme = memes[Math.floor(Math.random() * memes.length)];
        msg.content = randomMeme.url;
        msg.type = "image";
      } catch (error) {
        msg.content = "Erreur lors de la récupération des mèmes";
        msg.type = "error";
      }
      break;

    case "/citation":
      const quoteOptions = {
        method: "GET",
        url: "https://quotes15.p.rapidapi.com/quotes/random/",
        params: {
          language_code: "fr",
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "quotes15.p.rapidapi.com",
        },
      };

      try {
        const response = await axios.request(quoteOptions);
        msg.content = response.data.content;
        msg.type = "quote";
      } catch (error) {
        msg.content = "Erreur lors de la récupération de la citation";
        msg.type = "error";
      }
      break;
    default:
      msg.content = "Commande inexistante";
      msg.type = "error";
  }
};
