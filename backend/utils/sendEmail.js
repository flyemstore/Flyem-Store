import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  // ✅ CHANGED: Use the Env Variable first, fallback to your hardcoded domain, 
  // and NEVER use "onboarding@resend.dev" again.
  const senderEmail = process.env.EMAIL_FROM || "noreply@flyemstore.me"; 
  
  try {
    const data = await resend.emails.send({
      // ✅ CHANGED: Clean up the "From" name to look professional
      from: `FLYEM Store <${senderEmail}>`,
      to: options.email, 
      subject: options.subject,
      html: options.html || `<div>${options.text}</div>`, 
      text: options.text || "", 
    });
    console.log("✅ Email sent via Resend:", data);
    return data;
  } catch (error) {
    console.error("🔥 Resend Error:", error);
    // Log error but don't crash
  }
};

export default sendEmail;