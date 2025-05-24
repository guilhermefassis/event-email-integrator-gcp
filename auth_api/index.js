import { google } from "googleapis";

export const handler = async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground" // Pode ser qualquer redirect registrado
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const { credentials } = await oauth2Client.getAccessToken();
    return res.status(200).json({
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date,
    });
  } catch (err) {
    console.error("Erro ao gerar access token:", err);
    return res.status(500).json({ error: "Erro ao gerar token" });
  }
};
