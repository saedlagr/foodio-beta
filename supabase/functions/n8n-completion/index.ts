import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log('N8N completion webhook received');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the webhook data from n8n
    const webhookData = await req.json();
    console.log('N8N completion data:', JSON.stringify(webhookData, null, 2));

    // Extract data from your new n8n response format
    const { 
      success, 
      taskId, 
      enhanced_image, 
      original_image, 
      filename, 
      status, 
      processing_completed,
      db_record_id 
    } = webhookData;

    if (!db_record_id) {
      console.error('No db_record_id provided in webhook data');
      console.error('Received webhook data:', JSON.stringify(webhookData, null, 2));
      
      return new Response(JSON.stringify({ 
        error: 'Missing db_record_id',
        received_data: webhookData,
        error_id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing completion for database record:', db_record_id);

    if (success && processing_completed && enhanced_image) {
      // Extract the enhanced image URL - enhanced_image contains the resultUrls array
      const enhancedImageUrl = Array.isArray(enhanced_image) ? enhanced_image[0] : enhanced_image;
      
      console.log('Enhanced image URL:', enhancedImageUrl);
      
      // Update the database record with the processed image
      const { error: updateError } = await supabase
        .from('images')
        .update({
          metadata: {
            processing_completed: true,
            processing_success: true,
            enhanced_image_url: enhancedImageUrl,
            task_id: taskId,
            n8n_status: status,
            completed_at: new Date().toISOString(),
            n8n_response: webhookData
          }
        })
        .eq('id', db_record_id);

      if (updateError) {
        console.error('Failed to update database:', updateError);
        return new Response(JSON.stringify({ error: 'Database update failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
        
      console.log('Image processing completed successfully for record:', db_record_id);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Processing completed successfully',
        enhanced_image_url: enhancedImageUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // Handle failure case
      const { error: updateError } = await supabase
        .from('images')
        .update({
          metadata: {
            processing_failed: true,
            processing_error: `N8N processing failed: ${status || 'Unknown error'}`,
            task_id: taskId,
            n8n_status: status,
            failed_at: new Date().toISOString(),
            n8n_response: webhookData
          }
        })
        .eq('id', db_record_id);

      if (updateError) {
        console.error('Failed to update database with failure:', updateError);
      }
        
      console.error('N8N processing failed for record:', db_record_id);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Processing failed',
        details: status || 'Unknown error'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in n8n-completion function:', error);
    
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      webhookData: webhookData || null
    };
    
    console.error('Enhanced error details:', JSON.stringify(errorDetails, null, 2));
    
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred', 
      details: error.message,
      error_id: crypto.randomUUID(), // For tracking
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});