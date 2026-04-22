import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({ name, email }) {
  try {
    await resend.emails.send({
      from: "GasyTrip <onboarding@resend.dev>",
      to: email,
      subject: "Bienvenue sur GasyTrip 🌴",
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenue sur GasyTrip</title>
</head>
<body style="margin:0;padding:0;background:#030712;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0f1117;border:1px solid #1e2130;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b,#0f172a);padding:40px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:32px;">🌴</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
                Gasy<span style="color:#818cf8;">Trip</span>
              </h1>
              <p style="margin:8px 0 0;color:#a5b4fc;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">
                Covoiturage à Madagascar
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="margin:0 0 12px;color:#ffffff;font-size:20px;font-weight:700;">
                Bienvenue, ${name} ! 👋
              </h2>
              <p style="margin:0 0 20px;color:#9ca3af;font-size:15px;line-height:1.7;">
                Ton compte GasyTrip a été créé avec succès. Tu peux maintenant rechercher des trajets, réserver une place ou publier ton propre trajet.
              </p>

              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:12px;background:#1e2130;border-radius:10px;margin-bottom:8px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ["🔍", "Recherche", "Trouve un trajet vers ta destination"],
                        ["🎫", "Réserve", "Réserve ta place en quelques clics"],
                        ["🚗", "Publie", "Propose ton trajet et partage les frais"],
                      ].map(([icon, title, desc]) => `
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #2d3148;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:20px;padding-right:12px;">${icon}</td>
                              <td>
                                <p style="margin:0;color:#ffffff;font-size:14px;font-weight:600;">${title}</p>
                                <p style="margin:2px 0 0;color:#6b7280;font-size:12px;">${desc}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>`).join("")}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://gasytrip.vercel.app"
                      style="display:inline-block;background:#6366f1;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.02em;">
                      Accéder à GasyTrip →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1e2130;text-align:center;">
              <p style="margin:0;color:#4b5563;font-size:12px;">
                © ${new Date().getFullYear()} GasyTrip · Partagez la route, voyagez ensemble 🛣️
              </p>
              <p style="margin:6px 0 0;color:#374151;font-size:11px;">
                Cet email a été envoyé à ${email}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
    console.log(`✓ Email de bienvenue envoyé à ${email}`);
  } catch (err) {
    // On ne bloque pas l'inscription si l'email échoue
    console.error("✗ Erreur envoi email:", err.message);
  }
}