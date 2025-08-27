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

    // Send email notification using Gmail API
    const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');
    if (gmailPassword) {
      console.log('Attempting to send email notification...');
      try {
        // Create email content
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

        const confirmationEmail = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Thank you for contacting me!</h2>
            <p>Hi ${name},</p>
            <p>I have received your message and will get back to you as soon as possible.</p>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Your message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            <p>Best regards,<br><strong>Prachi Garg</strong></p>
            <hr>
            <p style="color: #666; font-size: 12px;">This is an automated response. Please do not reply to this email.</p>
          </div>
        `;

        // Send emails using a simple email service (we'll implement this next)
        console.log('Email content prepared, but email sending is disabled for now');
        
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the request if email fails, message is already saved
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