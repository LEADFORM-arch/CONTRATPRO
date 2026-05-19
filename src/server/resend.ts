type SendEmailPayload = {
  attachment: Buffer;
  filename: string;
  html: string;
  subject: string;
  text: string;
  to: string;
};

type SendPlainEmailPayload = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

export class EmailProviderError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "EmailProviderError";
    this.status = status;
  }
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.CONTRATPRO_FROM_EMAIL;

  if (!apiKey) {
    throw new EmailProviderError(
      "RESEND_API_KEY est absent. Ajoutez la cle Resend dans .env.local avant l'envoi email.",
      503,
    );
  }

  if (!from) {
    throw new EmailProviderError(
      "RESEND_FROM_EMAIL est absent. Configurez un expediteur Resend verifie avant l'envoi email.",
      503,
    );
  }

  return { apiKey, from };
}

export async function sendDocumentEmail(payload: SendEmailPayload) {
  const { apiKey, from } = getResendConfig();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      attachments: [
        {
          content: payload.attachment.toString("base64"),
          filename: payload.filename,
        },
      ],
      from,
      html: payload.html,
      subject: payload.subject,
      text: payload.text,
      to: [payload.to],
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | { id?: string; message?: string; name?: string }
    | null;

  if (!response.ok) {
    throw new EmailProviderError(
      data?.message || data?.name || "Resend a refuse l'envoi du document.",
      response.status,
    );
  }

  return { id: data?.id ?? "" };
}

export async function sendPlainEmail(payload: SendPlainEmailPayload) {
  const { apiKey, from } = getResendConfig();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      html: payload.html,
      subject: payload.subject,
      text: payload.text,
      to: [payload.to],
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | { id?: string; message?: string; name?: string }
    | null;

  if (!response.ok) {
    throw new EmailProviderError(
      data?.message || data?.name || "Resend a refuse l'envoi de l'email.",
      response.status,
    );
  }

  return { id: data?.id ?? "" };
}
