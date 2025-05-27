import axios from "axios";

/**
 * Cloud Function acionada por mensagens do Pub/Sub
 */

export const forwardToMake = async (message, context) => {
  try {
    const payload = Buffer.from(message.data, "base64").toString();
    const parsed = JSON.parse(payload);

    console.log("Mensagem recebida do Pub/Sub:", parsed);

    const response = await axios.post(
      process.env.MAKE_WEBHOOK_URL,
      JSON.stringify(parsed),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro ao enviar para Make: ${text}`);
    }
  } catch (err) {
    console.error(`An error as occured: ${err.message}`);
  }
};
