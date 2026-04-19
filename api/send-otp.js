// api/send-otp.js
// Vercel Serverless Function — runs on the server, keeps your Resend API key secret
// ─────────────────────────────────────────────────────────────────────────────────
// SETUP: In Vercel dashboard → Project → Settings → Environment Variables, add:
//   RESEND_API_KEY  =  re_xxxxxxxxxxxx   (from resend.com)
//   FROM_EMAIL      =  noreply@yourdomain.com  (or onboarding@resend.dev for testing)
// ─────────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, otp, name } = req.body

  if (!email || !otp) {
    return res.status(400).json({ error: 'Missing email or otp' })
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const FROM_EMAIL     = process.env.FROM_EMAIL || 'onboarding@resend.dev'

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' })
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:'Segoe UI',sans-serif;background:#0a0a0f;color:#F5F0E8;padding:40px 20px;margin:0">
      <div style="max-width:480px;margin:0 auto;background:#13131a;border:1px solid #2a2a3a;border-radius:16px;padding:36px">
        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:28px;font-weight:700;letter-spacing:2px;color:#F5F0E8">
            TEAM <span style="color:#FF6B1A">ANANTAM</span>
          </div>
          <div style="font-size:11px;color:#6b6b80;letter-spacing:3px;text-transform:uppercase;margin-top:4px">
            PCCOE MOTORSPORTS · INVENTORY
          </div>
        </div>
        <div style="border-top:1px solid #2a2a3a;padding-top:24px">
          <p style="margin:0 0 8px;color:#6b6b80;font-size:13px">Hello${name ? ` ${name}` : ''},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6">
            Your password reset OTP for the Inventory System is:
          </p>
          <div style="background:#1c1c26;border:1px solid rgba(255,107,26,.3);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
            <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#FF6B1A;font-family:monospace">
              ${otp}
            </div>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#6b6b80">
            This OTP is valid for <strong style="color:#F5F0E8">5 minutes</strong>.
          </p>
          <p style="margin:0;font-size:13px;color:#6b6b80">
            If you did not request this, please ignore this email.
          </p>
        </div>
        <div style="border-top:1px solid #2a2a3a;margin-top:28px;padding-top:16px;text-align:center">
          <p style="margin:0;font-size:11px;color:#6b6b80;letter-spacing:1px">
            SKY IS THE LOWER LIMIT!
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: 'Team Anantam Inventory — Password Reset OTP',
        html
      })
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Resend error:', err)
      return res.status(500).json({ error: 'Failed to send email' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
