import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(email: string, resetUrl: string, userName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY no está configurado')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Concurso Fotografía SAV <noreply@concurso-fotografia-sav.vercel.app>',
      to: email,
      subject: 'Recuperación de contraseña - Concurso de Fotografía SAV',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Recuperación de contraseña</h2>
          <p>Hola ${userName},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña en el Concurso de Fotografía de la Sociedad Argentina de Virología.</p>
          <p>Hacé clic en el siguiente enlace para crear una nueva contraseña:</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora por seguridad.</p>
          <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, ignorá este email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Concurso de Fotografía - Sociedad Argentina de Virología<br>
            Este es un email automático, no respondas a esta dirección.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}