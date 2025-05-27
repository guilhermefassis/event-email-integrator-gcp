import { PubSub } from "@google-cloud/pubsub";
import { v4 as uuidv4 } from "uuid";

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

    if (req.body.challenge) {
      console.log("Desafio recebido:", req.body.challenge);
      return res.status(200).send(JSON.stringify(req.body));
    }
    const { event } = req.body;
    const emailTextContent = event?.value?.value;
    console.log(`DEBUG EVENT VALUE: ${JSON.stringify(emailContent)}`);
    const emailContent = parseEmailToJSON(emailTextContent);
    console.log(`DEBUG PARSED EMAIL: ${JSON.stringify(emailContent)}`);

    const sender = emailContent.email || "N/A";
    const subject = event.pulseName || "Sem Assunto";
    const body = emailContent.body || "";
    const to = emailContent.to || "";
    const sentAt = emailContent.sentAt || "";
    const transactionId = uuidv4();
    const date = new Date(sentAt ? sentAt : Date.now())
      .toISOString()
      .split("T")[0];

    // Crie um cliente Pub/Sub
    const pubsub = new PubSub({ projectId: process.env.GCP_PROJECT });
    const topicName = process.env.PUBSUB_TOPIC;

    // Publicar a mensagem no Pub/Sub
    const dataBuffer = Buffer.from(
      JSON.stringify({ sender, subject, body, to, date, transactionId }),
      "utf-8"
    );

    if (filterEmails(sender)) {
      res.status(422).json(`Sender ${sender} has a email in blacklist.`);
    } else {
      const messageId = await pubsub
        .topic(topicName)
        .publishMessage({ data: dataBuffer });
      console.log(`Mensagem publicada com ID: ${messageId}`);

      res.status(200).json({
        message: `E-mail processado e publicado no Pub/Sub com ID: ${messageId}`,
      });
    }
  } catch (error) {
    console.error(
      "Erro ao processar o e-mail e publicar no Pub/Sub:",
      error.message
    );
    res.status(500).send(`Erro ao processar o e-mail: ${error.message}`);
  }
};

export function parseEmailToJSON(rawEmail) {
  const lines = rawEmail
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const fromLine = lines.find((line) => line.toLowerCase().startsWith("from:"));
  const toLine = lines.find((line) => line.toLowerCase().startsWith("to:"));
  const sentAtLine = lines.find((line) =>
    line.toLowerCase().startsWith("sent at:")
  );

  const fromMatch =
    fromLine?.match(/from:\s*(.*)\s+<(.+@.+)>/i) ||
    fromLine?.match(/from:\s*(.*?)\s([\w.-]+@[\w.-]+\.\w+)/i);
  const toMatch = toLine?.match(/to:\s*(.+)/i);
  const sentAtMatch = sentAtLine?.match(/sent at:\s*(.+)/i);

  const bodyStartIndex =
    lines.findIndex((line) => line.toLowerCase().startsWith("sent at:")) + 1;
  const messageLines = lines.slice(bodyStartIndex);

  let subject = null;
  let body = "";

  if (messageLines.length > 1) {
    subject = messageLines[0].trim();
    body = messageLines.slice(1).join("\n");
  } else if (messageLines.length === 1) {
    body = messageLines[0].trim();
  }

  return {
    from: fromMatch ? fromMatch[1].trim() : null,
    email: fromMatch ? fromMatch[2].trim() : null,
    to: toMatch ? toMatch[1].trim() : null,
    sentAt: sentAtMatch ? sentAtMatch[1].trim() : null,
    subject,
    body,
  };
}

export function filterEmails(sender) {
  const EMAILS_BLACK_LIST = [
    // Prefixos genéricos automáticos
    "noreply@",
    "no-reply@",
    "donotreply@",
    "do-not-reply@",
    "mailer-daemon@",
    "postmaster@",
    "bounce@",
    "automated@",
    "autoresponder@",
    "bot@",
    "system@",
    "daemon@",

    // E-mails de marketing e comunicação em massa
    "marketing@",
    "newsletter@",
    "news@",
    "promo@",
    "ads@",
    "offers@",
    "notifications@",
    "alerts@",
    "update@",
    "updates@",
    "info@",
    "email@",
    "contact@",
    "support@",

    // Domínios de grandes empresas que enviam mensagens automáticas (EUA e globais)
    "@facebookmail.com",
    "@linkedin.com",
    "@twitter.com",
    "@notify.twitter.com",
    "@accounts.google.com",
    "@google.com",
    "@youtube.com",
    "@noreply.youtube.com",
    "@instagram.com",
    "@tiktok.com",
    "@snapchat.com",
    "@pinterest.com",

    // Serviços populares de envio de e-mails automáticos (ESP)
    "@amazonses.com",
    "@sendgrid.net",
    "@mailchimp.com",
    "@mandrillapp.com",
    "@mailgun.org",
    "@constantcontact.com",
    "@sparkpostmail.com",
    "@postmarkapp.com",
    "@getresponse.com",

    // Plataformas de e-commerce / SaaS com e-mails transacionais
    "@shopify.com",
    "@walmart.com",
    "@amazon.com",
    "@ebay.com",
    "@paypal.com",
    "@stripe.com",
    "@intuit.com",
    "@squareup.com",
    "@quickbooks.com",

    // E-mails do governo dos EUA (geralmente automáticos)
    "@irs.gov",
    "@ssa.gov",
    "@uscis.dhs.gov",
    "@notify.cdc.gov",
  ];
  const lowerEmail = sender.toLowerCase();

  return EMAILS_BLACK_LIST.some((blacklisted) =>
    lowerEmail.includes(blacklisted)
  );
}
