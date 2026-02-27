import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import mjml2html from 'mjml';

export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  mjml?: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // In development/test: use Ethereal (fake SMTP), in production use env vars
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev && !process.env.MAIL_HOST) {
      // Use Ethereal test account preview
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.MAIL_USER || 'test@ethereal.email',
          pass: process.env.MAIL_PASS || 'testpass',
        },
      });
      this.logger.log('[Mail] Using Ethereal (dev mode)');
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      this.logger.log(`[Mail] SMTP configured: ${process.env.MAIL_HOST}`);
    }
  }

  /**
   * Send a notification email using MJML template
   */
  async sendMjml(to: string, subject: string, mjmlTemplate: string): Promise<void> {
    const { html } = mjml2html(mjmlTemplate);
    await this.send({ to, subject, html });
  }

  /**
   * Send email with raw HTML or text
   */
  async send(options: SendMailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM || 'Hubso <noreply@hubso.social>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`[Mail] Sent to ${options.to} — messageId: ${info.messageId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[Mail] Failed to send to ${options.to}: ${msg}`);
      // Don't throw — email failure shouldn't break the main flow
    }
  }

  // ─── MJML Templates ──────────────────────────────────────────────────────

  /**
   * Nowa wiadomość prywatna
   */
  buildNewMessageTemplate(opts: {
    recipientName: string;
    senderName: string;
    preview: string;
    appUrl: string;
  }) {
    return `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Inter, Arial, sans-serif" />
      <mj-text font-size="14px" color="#334155" line-height="24px" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f8fafc">
    <mj-section background-color="#ffffff" border-radius="8px" padding="40px 32px">
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="#0f172a">
          Nowa wiadomość od ${opts.senderName}
        </mj-text>
        <mj-text color="#64748b">
          Cześć ${opts.recipientName}!
        </mj-text>
        <mj-text>
          ${opts.senderName} wysłał(a) Ci wiadomość:
        </mj-text>
        <mj-section background-color="#f1f5f9" border-radius="6px" padding="16px">
          <mj-column>
            <mj-text color="#475569" font-style="italic">
              "${opts.preview}"
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-button background-color="#6366f1" color="#ffffff" border-radius="6px"
          href="${opts.appUrl}/messages" padding-top="24px">
          Odpowiedz
        </mj-button>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text font-size="12px" color="#94a3b8" align="center">
          Hubso.social · Aby zrezygnować z powiadomień, przejdź do ustawień.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
  }

  /**
   * Nowe powiadomienie (follow, mention, etc.)
   */
  buildNotificationTemplate(opts: {
    recipientName: string;
    title: string;
    body: string;
    ctaText: string;
    ctaUrl: string;
    appUrl: string;
  }) {
    return `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Inter, Arial, sans-serif" />
      <mj-text font-size="14px" color="#334155" line-height="24px" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f8fafc">
    <mj-section background-color="#ffffff" border-radius="8px" padding="40px 32px">
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="#0f172a">
          ${opts.title}
        </mj-text>
        <mj-text color="#64748b">
          Cześć ${opts.recipientName}!
        </mj-text>
        <mj-text>${opts.body}</mj-text>
        <mj-button background-color="#6366f1" color="#ffffff" border-radius="6px"
          href="${opts.ctaUrl}" padding-top="16px">
          ${opts.ctaText}
        </mj-button>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text font-size="12px" color="#94a3b8" align="center">
          Hubso.social · Aby zrezygnować z powiadomień, przejdź do ustawień.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
  }

  /**
   * Email digest — podsumowanie powiadomień
   */
  async sendNewMessageNotification(opts: {
    to: string;
    recipientName: string;
    senderName: string;
    preview: string;
  }): Promise<void> {
    const appUrl = process.env.WEB_URL || 'http://localhost:3000';
    const template = this.buildNewMessageTemplate({ ...opts, appUrl });
    await this.sendMjml(
      opts.to,
      `Nowa wiadomość od ${opts.senderName}`,
      template,
    );
  }

  async sendNotificationEmail(opts: {
    to: string;
    recipientName: string;
    title: string;
    body: string;
    ctaText: string;
    ctaUrl: string;
  }): Promise<void> {
    const appUrl = process.env.WEB_URL || 'http://localhost:3000';
    const template = this.buildNotificationTemplate({ ...opts, appUrl });
    await this.sendMjml(opts.to, opts.title, template);
  }
}
