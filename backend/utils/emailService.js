import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

//  Verification email
export const sendVerificationEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      // Use 'onboarding@resend.dev' if you haven't verified a custom domain yet
      from: "DECIBEL <onboarding@resend.dev>",
      to: [email],
      subject: "Verify Your DECIBEL Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #111827;">Welcome to DECIBEL!</h2>
          <p style="color: #4b5563; font-size: 16px;">We're thrilled to have you. To start shopping for premium audio gear, please verify your email address using the code below:</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <h1 style="font-size: 32px; letter-spacing: 8px; color: #4f46e5; margin: 0;">${otp}</h1>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error("Failed to send email via Resend");
    }

    return data;
  } catch (err) {
    console.error("Email Service Error:", err);
    throw err;
  }
};

// Password Reset email
export const sendPasswordResetEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "DECIBEL <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your DECIBEL Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #111827;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px;">We received a request to reset the password for your DECIBEL account. Use the code below to proceed:</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <h1 style="font-size: 32px; letter-spacing: 8px; color: #dc2626; margin: 0;">${otp}</h1>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error("Failed to send password reset email");
    }

    return data;
  } catch (err) {
    console.error("Password Reset Email Error:", err);
    throw err;
  }
};
