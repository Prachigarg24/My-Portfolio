import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import { SMTPClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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

// Email sending function using Gmail SMTP
async function sendEmail(to: string, subject: string, html: string, senderName: string = '') {
  const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');
  
  if (!gmailPassword) {
    throw new Error('Gmail app password not configured');
  }

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 587,
      tls: true,
      auth: {
        username: "prachigarg858@gmail.com",
        password: gmailPassword,
      },
    },
  });

  await client.send({
    from: "prachigarg858@gmail.com",
    to: to,
    subject: subject,
    html: html,
  });

  await client.close();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactRequest = await req.json();

    // Validate input
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store contact message in database
    const { error: dbError } = await supabase
      .from('contacts')
      .insert({
        name,
        email,
        subject: subject || 'Contact from Portfolio',
        message,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save message' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Contact message saved successfully');

    // Send email to Prachi
    const emailSubject = subject || 'New Contact Form Message';
    const emailToOwner = `
      <h2>New Contact Form Message</h2>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${emailSubject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    // Send confirmation email to sender
    const confirmationEmail = `
      <h2>Thank you for contacting me!</h2>
      <p>Hi ${name},</p>
      <p>I have received your message and will get back to you as soon as possible.</p>
      <p><strong>Your message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <br>
      <p>Best regards,<br>Prachi Garg</p>
    `;

    try {
      // Send email to owner
      await sendEmail('prachigarg858@gmail.com', `Portfolio Contact: ${emailSubject}`, emailToOwner, name);
      
      // Send confirmation to sender
      await sendEmail(email, 'Thank you for contacting me!', confirmationEmail);
      
      console.log('Emails sent successfully');
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails, message is already saved
    }

    return new Response(
      JSON.stringify({ 
        message: 'Message sent successfully! Thank you for reaching out. I will get back to you soon.' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error in send-contact-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);