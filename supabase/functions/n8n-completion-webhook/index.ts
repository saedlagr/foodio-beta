import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('N8N completion webhook called');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log('N8N webhook payload:', JSON.stringify(body, null, 2));

    // Extract data from n8n payload
    const {
      image_id,
      db_record_id,
      processed_image_url,
      success,
      error_message,
      user_id
    } = body;

    if (!db_record_id) {
      console.error('Missing db_record_id in webhook payload');
      return new Response(JSON.stringify({ error: 'Missing db_record_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing completion for record ${db_record_id}, success: ${success}`);

    if (success && processed_image_url) {
      // Processing completed successfully
      console.log(`Updating record ${db_record_id} with processed URL: ${processed_image_url}`);
      
      const { error: updateError } = await supabase
        .from('images')
        .update({
          metadata: {
            processing_completed: true,
            processed_image_url: processed_image_url,
            completed_at: new Date().toISOString(),
            image_id: image_id,
            n8n_success: true
          }
        })
        .eq('id', db_record_id);

      if (updateError) {
        console.error('Error updating image record:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update record' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Successfully updated record ${db_record_id} with processed image`);

    } else {
      // Processing failed
      console.log(`Processing failed for record ${db_record_id}: ${error_message}`);
      
      const { error: updateError } = await supabase
        .from('images')
        .update({
          metadata: {
            processing_failed: true,
            processing_error: error_message || 'N8N processing failed',
            failed_at: new Date().toISOString(),
            image_id: image_id,
            n8n_success: false
          }
        })
        .eq('id', db_record_id);

      if (updateError) {
        console.error('Error updating failed record:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update record' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Successfully updated record ${db_record_id} with failure status`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook processed successfully',
      db_record_id,
      processed: success
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in n8n completion webhook:', error);
    return new Response(JSON.stringify({ 
      error: 'Webhook processing failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});