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

    // Handle the array format that n8n sends
    let responseData;
    if (Array.isArray(body) && body.length > 0) {
      responseData = body[0];
    } else if (body.data) {
      responseData = body;
    } else {
      console.error('Unexpected payload format');
      return new Response(JSON.stringify({ error: 'Invalid payload format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract data from the nested structure
    const {
      data: {
        taskId,
        response: { resultUrls = [] } = {},
        status,
        successFlag,
        errorMessage
      } = {}
    } = responseData;

    // Extract the original request data that should be in the n8n workflow context
    // For now, we'll need to find the db_record_id from the taskId or another method
    // This will need to be passed through the n8n workflow
    const processed_image_url = resultUrls[0];
    const success = successFlag === 1 && status === "SUCCESS";

    console.log(`N8N processing result - TaskId: ${taskId}, Success: ${success}, URL: ${processed_image_url}`);

    if (!taskId) {
      console.error('Missing taskId in webhook payload');
      return new Response(JSON.stringify({ error: 'Missing taskId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // We need to find the database record using the taskId
    // First, let's find the record that matches this taskId in metadata
    const { data: imageRecords, error: searchError } = await supabase
      .from('images')
      .select('id, metadata')
      .contains('metadata', { image_id: taskId });

    if (searchError || !imageRecords || imageRecords.length === 0) {
      console.error('Could not find image record for taskId:', taskId, searchError);
      return new Response(JSON.stringify({ error: 'Image record not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageRecord = imageRecords[0];
    const db_record_id = imageRecord.id;

    console.log(`Found database record ${db_record_id} for taskId ${taskId}`);

    if (success && processed_image_url) {
      // Processing completed successfully
      console.log(`Updating record ${db_record_id} with processed URL: ${processed_image_url}`);
      
      const { error: updateError } = await supabase
        .from('images')
        .update({
          metadata: {
            ...imageRecord.metadata,
            processing_completed: true,
            processed_image_url: processed_image_url,
            completed_at: new Date().toISOString(),
            task_id: taskId,
            n8n_success: true,
            n8n_response: responseData
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
      console.log(`Processing failed for record ${db_record_id}: ${errorMessage}`);
      
      const { error: updateError } = await supabase
        .from('images')
        .update({
          metadata: {
            ...imageRecord.metadata,
            processing_failed: true,
            processing_error: errorMessage || `N8N processing failed - Status: ${status}`,
            failed_at: new Date().toISOString(),
            task_id: taskId,
            n8n_success: false,
            n8n_response: responseData
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
      task_id: taskId,
      processed: success,
      processed_url: processed_image_url
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