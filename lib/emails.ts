import nodemailer from 'nodemailer'

const useEmailAuth = process.env.USE_EMAIL_AUTH === 'true'

// Create transporter based on environment
const getTransporter = () => {
  if (!useEmailAuth) {
    // For development, use a mock transporter that logs to console
    return {
      sendMail: async (options: any) => {
        console.log('📧 [DEV MODE] Email would be sent:')
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('HTML:', options.html)
        return { messageId: 'dev-message-id' }
      },
    }
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT) || 1025,
    secure: false,
    auth: process.env.EMAIL_SERVER_USER
      ? {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        }
      : undefined,
  })
}

export interface InviteEmailData {
  inviteEmail: string
  familyName: string
  inviteToken: string
  role: string
  inviterName?: string
}

export async function sendInviteEmail(data: InviteEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/invite/${data.inviteToken}`

    const transporter = getTransporter()
    const fromEmail = process.env.EMAIL_FROM || 'noreply@familylink.local'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You've been invited to join ${data.familyName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌳 FamilyLink</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #111827; margin-top: 0; font-size: 24px;">You've been invited!</h2>
            
            <p style="font-size: 16px; color: #4b5563;">
              ${data.inviterName ? `${data.inviterName} has` : 'You have been'} invited to join <strong>${data.familyName}</strong> on FamilyLink as a <strong>${data.role.toLowerCase()}</strong>.
            </p>
            
            <p style="font-size: 16px; color: #4b5563;">
              FamilyLink helps you build and share your family tree, preserve memories, and connect with your relatives.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 4px;">
              ${inviteUrl}
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>This email was sent by FamilyLink</p>
            <p>If you have any questions, please contact the family owner.</p>
          </div>
        </body>
      </html>
    `

    const text = `
You've been invited to join ${data.familyName} on FamilyLink!

${data.inviterName ? `${data.inviterName} has` : 'You have been'} invited to join ${data.familyName} as a ${data.role.toLowerCase()}.

Accept your invitation by clicking this link:
${inviteUrl}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.
    `.trim()

    await transporter.sendMail({
      from: fromEmail,
      to: data.inviteEmail,
      subject: `You've been invited to join ${data.familyName} on FamilyLink`,
      html,
      text,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending invite email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}




