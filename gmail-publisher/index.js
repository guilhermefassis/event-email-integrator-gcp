import { PubSub } from "@google-cloud/pubsub";

/**
 * Recebe um e-mail via HTTP e publica informações no Pub/Sub.
 *
 * @param {object} req Objeto de requisição HTTP.
 * @param {object} res Objeto de resposta HTTP.
 */
export const processEmail = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const emailContent = req.body;

    const sender = emailContent.from ? emailContent.from : "N/A";
    const subject = emailContent.subject ? emailContent.subject : "Sem Assunto";
    const body = emailContent.text
      ? emailContent.text
      : emailContent.html
      ? emailContent.html
      : "Sem Corpo";

    // Crie um cliente Pub/Sub
    const pubsub = new PubSub({ projectId: process.env.GCP_PROJECT });
    const topicName = process.env.PUBSUB_TOPIC;

    // Publicar a mensagem no Pub/Sub
    const dataBuffer = Buffer.from(
      JSON.stringify({ sender, subject, body }),
      "utf-8"
    );

    const messageId = await pubsub
      .topic(topicName)
      .publishMessage({ data: dataBuffer });
    console.log(`Mensagem publicada com ID: ${messageId}`);

    res
      .status(200)
      .json({
        message: `E-mail processado e publicado no Pub/Sub com ID: ${messageId}`,
      });
  } catch (error) {
    console.error("Erro ao processar o e-mail e publicar no Pub/Sub:", error);
    res.status(500).send(`Erro ao processar o e-mail: ${error.message}`);
  }
};
