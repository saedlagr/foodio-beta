import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    console.log('Progress tracker webhook called');
    
    const body = await req.json();
    console.log('Received progress data:', body);

    const { 
      image_id, 
      step, 
      progress_percentage, 
      status, 
      message, 
      error_message,
      metadata 
    } = body;

    if (!image_id) {
      return new Response(
        JSON.stringify({ error: 'image_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update the images table with progress information
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (step) updateData.processing_step = step;
    if (progress_percentage !== undefined) updateData.progress_percentage = progress_percentage;
    if (status) updateData.status = status;
    if (message) updateData.processing_message = message;
    if (error_message) updateData.error_message = error_message;
    if (metadata) updateData.metadata = metadata;

    const { data, error } = await supabase
      .from('images')
      .update(updateData)
      .eq('id', image_id);

    if (error) {
      console.error('Error updating image progress:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update progress', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Progress updated for image ${image_id}: ${step || status} - ${progress_percentage || 0}%`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Progress updated successfully',
        image_id,
        updated_fields: Object.keys(updateData)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Progress tracker error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});