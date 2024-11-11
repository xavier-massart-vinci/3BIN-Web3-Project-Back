module.exports = (msg) => {
  switch (msg.content) {
    case "/gif":
      msg.content = "https://www.icegif.com/wp-content/uploads/2023/06/icegif-154.gif";
      msg.type = "gif";
      break;

    case "/meme":
      msg.content = "https://res.cloudinary.com/practicaldev/image/fetch/s--7xOGg_Q_--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7si8jfsjdhatsdw5gxll.jpg";
      msg.type = "image";
      break;

    case "/citation":
        // TODO
        msg.content = "";
        msg.type = "text";
      break;

    case startWith("/ascii"): // Turn the text into an ascii logo
        // TODO
        msg.content = "https://www.asciiart.eu/text-to-ascii-art";
        msg.type = "text";
        break;



    default:
      msg.content = "Command not found"; // Normalement gérer dans le front
      msg.type = "error";
      break;
  }
  return msg;
};



/* TODO : Trouver API générateur de gifs et de memes
          Trouver API générateur de citations
          Trouver API générateur d'image en charactères ASCII

          Rajouter ça au front pour afficher les commandes disponibles

                "/help":
                msg.content = "Available commands: /gif, /meme, /citation, /ascii, /help";
                msg.type = "text";
*/