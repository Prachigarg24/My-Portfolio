// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

    // Send emails using Gmail SMTP
    if (gmailAppPassword) {
      console.log('Attempting to send emails via Gmail SMTP...');
      try {
        const client = new SMTPClient({
          connection: {
            hostname: "smtp.gmail.com",
            port: 587,
            tls: true,
            auth: {
              username: "prachigarg858@gmail.com",
              password: gmailAppPassword,
            },
          },
        });

        // Email to owner (you)
        console.log('Sending notification email to owner...');
        await client.send({
          from: "prachigarg858@gmail.com",
          to: "prachigarg858@gmail.com",
          subject: `New Contact Message from ${name}`,
          content: `
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
          `,
          html: true,
        });

        console.log('Owner notification email sent successfully');

        // Confirmation email to user
        console.log('Sending confirmation email to user...');
        await client.send({
          from: "prachigarg858@gmail.com",
          to: email,
          subject: 'Thank you for contacting Prachi Garg',
          content: `
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
          `,
          html: true,
        });

        console.log('User confirmation email sent successfully');
        await client.close();
        
      } catch (emailError) {
        console.error('Gmail SMTP error:', emailError);
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