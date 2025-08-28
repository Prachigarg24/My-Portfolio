// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Gmail transporter configuration
const createGmailTransporter = (gmailPassword: string) => {
  return {
    service: 'gmail',
    auth: {
      user: 'prachigarg858@gmail.com',
      pass: gmailPassword // Gmail App Password
    }
  };
};

// Send email function (nodemailer-style)
const sendMail = async (transporter: any, mailOptions: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) => {
  // Convert to base64 auth
  const auth = btoa(`${transporter.auth.user}:${transporter.auth.pass}`);
  
  // Create email content
  const emailContent = [
    `From: ${mailOptions.from}`,
    `To: ${mailOptions.to}`,
    `Subject: ${mailOptions.subject}`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    mailOptions.html
  ].join('\r\n');

  // Send via Gmail SMTP using direct fetch to Gmail API
  const response = await fetch('https://www.googleapis.com/upload/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'message/rfc822',
    },
    body: emailContent
  });

  return response;
};

// Auto-reply function
const sendAutoReply = async (transporter: any, toEmail: string, userName: string, originalMessage: string) => {
  await sendMail(transporter, {
    from: 'prachigarg858@gmail.com',
    to: toEmail,
    subject: 'Thank you for contacting Prachi Garg!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A90E2;">Thank you for getting in touch!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for getting in touch with me through my portfolio website. I appreciate your interest and will get back to you shortly.</p>
        
        <p>If your message was regarding collaboration, job opportunity, or interview discussion, I'm excited to connect and explore further!</p>
        
        <p>Meanwhile, feel free to explore more about my work and projects on my portfolio.</p>
        
        <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Your message:</strong></p>
          <p>${originalMessage.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p>Best regards,<br><strong>Prachi Garg</strong><br>Full Stack Developer</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated response.</p>
      </div>
    `
  });
};

// Send notification to owner
const sendOwnerNotification = async (transporter: any, name: string, email: string, subject: string, message: string) => {
  await sendMail(transporter, {
    from: 'prachigarg858@gmail.com',
    to: 'prachigarg858@gmail.com',
    subject: `New Contact Message from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Message</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'Contact from Portfolio'}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
    `
  });
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

serve(async (req: Request) => {
  console.log('Edge function called with method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    console.log('Processing POST request...');
    
    const requestBody = await req.text();
    console.log('Request body received:', requestBody);
    
    const { name, email, subject, message }: ContactRequest = JSON.parse(requestBody);
    console.log('Parsed data:', { name, email, subject: subject || 'No subject', messageLength: message?.length });

    // Validate input
    if (!name || !email || !message) {
      console.log('Validation failed - missing required fields');
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD');
    
    console.log('Environment check:', { 
      hasSupabaseUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseServiceKey,
      hasGmailPassword: !!gmailAppPassword
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Store contact message in database using REST API
    console.log('Inserting message into database...');
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name,
        email,
        subject: subject || 'Contact from Portfolio',
        message,
      })
    });

    console.log('Database insert response status:', insertResponse.status);

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Database insert failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to save message' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Message saved successfully to database');

    // Send emails using nodemailer-style Gmail transporter
    if (gmailAppPassword) {
      console.log('Attempting to send emails via nodemailer-style Gmail transporter...');
      try {
        const transporter = createGmailTransporter(gmailAppPassword);

        // Send notification email to owner
        console.log('Sending notification email to owner...');
        await sendOwnerNotification(transporter, name, email, subject || 'Contact from Portfolio', message);
        console.log('Owner notification email sent successfully');

        // Send auto-reply to user
        console.log('Sending auto-reply to user...');
        await sendAutoReply(transporter, email, name, message);
        console.log('User confirmation email sent successfully');
        
      } catch (emailError) {
        console.error('Gmail transporter error:', emailError);
        // Don't fail the request if email fails, message is already saved
      }
    } else {
      console.log('No Gmail app password found, skipping email sending');
    }

    console.log('Returning success response');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Message sent successfully! Thank you for reaching out. You will receive a confirmation email shortly.' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Unexpected error in send-contact-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});