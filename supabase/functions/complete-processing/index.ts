import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create Supabase client with service role key for updating
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      jobId, 
      status, 
      enhancedImageUrl, 
      errorMessage,
      metadata 
    } = await req.json();

    console.log('Processing completion request:', { jobId, status, enhancedImageUrl });

    if (!jobId || !status) {
      throw new Error('Missing required fields: jobId and status');
    }

    // Update the processing job status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.enhanced_image_url = enhancedImageUrl;
      updateData.completed_at = new Date().toISOString();
      
      if (metadata) {
        updateData.metadata = metadata;
      }
    } else if (status === 'failed') {
      updateData.error_message = errorMessage;
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('processing_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error updating processing job:', error);
      throw error;
    }

    console.log('Successfully updated processing job:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Processing job updated successfully',
        job: data 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in complete-processing function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});