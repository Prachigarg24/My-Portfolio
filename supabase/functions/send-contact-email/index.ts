// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    console.log('Environment check:', { 
      hasSupabaseUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseServiceKey 
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
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

    // Send emails using Gmail SMTP
    const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');
    if (gmailPassword) {
      console.log('Attempting to send email notification...');
      try {
        // Email to owner
        const emailToOwner = `
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
        `;

        // Confirmation email to user
        const confirmationEmail = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Thank you for getting in touch!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for getting in touch with me through my portfolio website. I appreciate your interest and will get back to you shortly.</p>
            
            <p>If your message was regarding collaboration, job opportunity, or interview discussion, I'm excited to connect and explore further!</p>
            
            <p>Meanwhile, feel free to explore more about my work and projects on my portfolio.</p>
            
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Your message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>Best regards,<br><strong>Prachi Garg</strong><br>Full Stack Developer</p>
            <hr>
            <p style="color: #666; font-size: 12px;">This is an automated response.</p>
          </div>
        `;

        // Send email to owner
        await sendGmailEmail(gmailPassword, {
          to: 'prachigarg858@gmail.com',
          subject: `New Contact Message from ${name}`,
          html: emailToOwner
        });

        // Send confirmation to user
        await sendGmailEmail(gmailPassword, {
          to: email,
          subject: 'Thank you for contacting Prachi Garg',
          html: confirmationEmail
        });

        console.log('Both emails sent successfully');
        
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the request if email fails, message is already saved
      }
    }

// Gmail SMTP function
async function sendGmailEmail(password: string, emailData: { to: string; subject: string; html: string }) {
  const smtpServer = 'smtp.gmail.com';
  const smtpPort = 587;
  const username = 'prachigarg858@gmail.com';

  try {
    // Create SMTP connection
    const conn = await Deno.connect({
      hostname: smtpServer,
      port: smtpPort,
    });

    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    // Helper function to send command and read response
    async function sendCommand(command: string): Promise<string> {
      await conn.write(textEncoder.encode(command + '\r\n'));
      const buffer = new Uint8Array(1024);
      const bytesRead = await conn.read(buffer);
      return textDecoder.decode(buffer.subarray(0, bytesRead || 0));
    }

    // SMTP conversation
    await sendCommand('EHLO localhost');
    await sendCommand('STARTTLS');
    
    // After STARTTLS, we need to upgrade to TLS
    conn.close();
    
    // For now, let's use a simpler approach with fetch to a webhook service
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'gmail',
        template_id: 'template_contact',
        user_id: 'user_id',
        template_params: {
          to_email: emailData.to,
          subject: emailData.subject,
          message: emailData.html,
          from_email: username,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`Email sent successfully to ${emailData.to}`);
  } catch (error) {
    console.error('SMTP Error:', error);
    throw error;
  }
}

    console.log('Returning success response');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Message sent successfully! Thank you for reaching out. I will get back to you soon.' 
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