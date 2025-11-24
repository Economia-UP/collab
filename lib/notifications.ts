import { Resend } from 'resend';
import twilio from 'twilio';

// Initialize Resend (free tier: 100 emails/day)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Initialize Twilio for WhatsApp (requires Twilio account)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@research-hub.up.edu.mx';
const FROM_WHATSAPP = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

export interface NotificationData {
  to: {
    email?: string;
    phoneNumber?: string;
    name?: string;
  };
  subject: string;
  message: string;
  html?: string;
  projectTitle?: string;
  projectId?: string;
  actionUrl?: string;
}

/**
 * Send email notification
 */
export async function sendEmailNotification(data: NotificationData): Promise<boolean> {
  if (!resend || !data.to.email) {
    console.warn('Email notification skipped: Resend not configured or no email provided');
    return false;
  }

  try {
    const html = data.html || `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Research Hub UP</h1>
            </div>
            <div class="content">
              <h2>${data.subject}</h2>
              <p>${data.message}</p>
              ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Ver más</a>` : ''}
              ${data.projectTitle ? `<p><strong>Proyecto:</strong> ${data.projectTitle}</p>` : ''}
            </div>
            <div class="footer">
              <p>Universidad Panamericana - Research Hub</p>
              <p>Este es un correo automático, por favor no responder.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to.email,
      subject: data.subject,
      html,
    });

    console.log(`Email notification sent to ${data.to.email}`);
    return true;
  } catch (error: any) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

/**
 * Send WhatsApp notification
 */
export async function sendWhatsAppNotification(data: NotificationData): Promise<boolean> {
  if (!twilioClient || !data.to.phoneNumber) {
    console.warn('WhatsApp notification skipped: Twilio not configured or no phone number provided');
    return false;
  }

  try {
    // Format phone number (ensure it starts with +)
    const phoneNumber = data.to.phoneNumber.startsWith('+')
      ? data.to.phoneNumber
      : `+${data.to.phoneNumber}`;

    // Format WhatsApp number (whatsapp:+521234567890)
    const whatsappNumber = phoneNumber.startsWith('whatsapp:')
      ? phoneNumber
      : `whatsapp:${phoneNumber}`;

    const message = `🔔 *${data.subject}*\n\n${data.message}${data.projectTitle ? `\n\n📁 Proyecto: ${data.projectTitle}` : ''}${data.actionUrl ? `\n\n🔗 Ver más: ${data.actionUrl}` : ''}\n\n_Research Hub UP_`;

    await twilioClient.messages.create({
      from: FROM_WHATSAPP,
      to: whatsappNumber,
      body: message,
    });

    console.log(`WhatsApp notification sent to ${whatsappNumber}`);
    return true;
  } catch (error: any) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
}

/**
 * Send notification based on user preferences
 */
export async function sendNotification(
  userId: string,
  notificationData: NotificationData
): Promise<{ emailSent: boolean; whatsappSent: boolean }> {
  const { prisma } = await import('@/lib/prisma');
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        phoneNumber: true,
        emailNotifications: true,
        whatsappNotifications: true,
      },
    });

    if (!user) {
      console.warn(`User ${userId} not found for notification`);
      return { emailSent: false, whatsappSent: false };
    }

    const results = {
      emailSent: false,
      whatsappSent: false,
    };

    // Send email if enabled
    if (user.emailNotifications && user.email) {
      results.emailSent = await sendEmailNotification({
        ...notificationData,
        to: {
          ...notificationData.to,
          email: user.email,
          name: user.name || undefined,
        },
      });
    }

    // Send WhatsApp if enabled and phone number provided
    if (user.whatsappNotifications && user.phoneNumber) {
      results.whatsappSent = await sendWhatsAppNotification({
        ...notificationData,
        to: {
          ...notificationData.to,
          phoneNumber: user.phoneNumber,
          name: user.name || undefined,
        },
      });
    }

    return results;
  } catch (error: any) {
    console.error('Error in sendNotification:', error);
    return { emailSent: false, whatsappSent: false };
  }
}

/**
 * Notification templates for different events
 */
export const NotificationTemplates = {
  membershipRequest: (projectTitle: string, requesterName: string, projectId: string) => ({
    subject: `Nueva solicitud de acceso: ${projectTitle}`,
    message: `${requesterName} ha solicitado unirse a tu proyecto "${projectTitle}". Puedes aprobar o rechazar la solicitud desde el proyecto.`,
    projectTitle,
    projectId,
    actionUrl: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/projects/${projectId}`,
  }),

  membershipApproved: (projectTitle: string, projectId: string) => ({
    subject: `Solicitud aprobada: ${projectTitle}`,
    message: `Tu solicitud para unirte al proyecto "${projectTitle}" ha sido aprobada. Ya puedes acceder al proyecto.`,
    projectTitle,
    projectId,
    actionUrl: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/projects/${projectId}`,
  }),

  membershipRejected: (projectTitle: string) => ({
    subject: `Solicitud rechazada: ${projectTitle}`,
    message: `Tu solicitud para unirte al proyecto "${projectTitle}" ha sido rechazada.`,
    projectTitle,
  }),

  newComment: (projectTitle: string, authorName: string, commentPreview: string, projectId: string, commentId: string) => ({
    subject: `Nuevo comentario en: ${projectTitle}`,
    message: `${authorName} comentó en "${projectTitle}": "${commentPreview.substring(0, 100)}${commentPreview.length > 100 ? '...' : ''}"`,
    projectTitle,
    projectId,
    actionUrl: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/projects/${projectId}?tab=discussion#comment-${commentId}`,
  }),

  taskAssigned: (projectTitle: string, taskTitle: string, projectId: string, taskId: string) => ({
    subject: `Nueva tarea asignada: ${taskTitle}`,
    message: `Se te ha asignado una nueva tarea "${taskTitle}" en el proyecto "${projectTitle}".`,
    projectTitle,
    projectId,
    actionUrl: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/projects/${projectId}?tab=tasks#task-${taskId}`,
  }),

  projectUpdated: (projectTitle: string, projectId: string) => ({
    subject: `Proyecto actualizado: ${projectTitle}`,
    message: `El proyecto "${projectTitle}" ha sido actualizado.`,
    projectTitle,
    projectId,
    actionUrl: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/projects/${projectId}`,
  }),
};

