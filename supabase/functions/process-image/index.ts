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
    console.log('Processing image upload request');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Parse form data
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const message = formData.get('message') as string;
    const userId = formData.get('userId') as string;
    const imageType = formData.get('imageType') as string || 'before'; // 'before' or 'after'
    
    // Auto-detect image type if not provided
    const detectedType = imageFile.name.toLowerCase().includes('after') || 
                        imageFile.name.toLowerCase().includes('enhanced') || 
                        imageFile.name.toLowerCase().includes('processed') ? 'after' : 'before';
    const finalImageType = imageType === 'before' ? detectedType : imageType;

    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing image:', imageFile.name, 'Size:', imageFile.size);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.email);

    // Check if user has enough tokens (1 token per image processing)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.tokens < 1) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient tokens. You need at least 1 token to process an image.' 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique filename with folder structure for before/after
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${finalImageType}/${crypto.randomUUID()}.${fileExt}`;

    console.log('Uploading to storage:', fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('food-images')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to upload image' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Image uploaded successfully:', uploadData.path);

    // Generate unique image ID for easy retrieval
    const imageId = crypto.randomUUID();

    console.log('Generating embedding with OpenAI');

    // Generate embedding using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: message || `Food image: ${imageFile.name}`,
        model: 'text-embedding-3-small',
        dimensions: 1536
      }),
    });

    if (!embeddingResponse.ok) {
      console.error('OpenAI embedding error:', await embeddingResponse.text());
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    console.log('Embedding generated, storing in database');

    // Store image metadata and embedding in database
    const { data: imageRecord, error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        filename: imageFile.name,
        file_path: uploadData.path,
        file_size: imageFile.size,
        content_type: imageFile.type,
        description: message || `Food image: ${imageFile.name}`,
        embedding: embedding,
        metadata: {
          original_message: message,
          user_session: userId,
          processed_at: new Date().toISOString(),
          image_type: finalImageType,
          image_id: imageId,
          folder: `${user.id}/${finalImageType}`
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('food-images').remove([uploadData.path]);
      return new Response(JSON.stringify({ error: 'Failed to store image metadata' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deduct token
    const { error: tokenError } = await supabase.rpc('deduct_tokens', {
      target_user_id: user.id,
      token_amount: 1,
      transaction_description: 'Image processing and storage'
    });

    if (tokenError) {
      console.error('Token deduction error:', tokenError);
    }

    console.log('Image processed successfully:', imageRecord.id);

    // Get public URL for the image
    const { data: publicURL } = supabase.storage
      .from('food-images')
      .getPublicUrl(uploadData.path);

    console.log('Sending image to chat agent for analysis');

    // Get remaining tokens for response
    const remainingTokens = profile.tokens - 1;

    // Start background task for n8n processing without waiting
    const backgroundProcessing = async () => {
      try {
        console.log('Starting background processing for image:', imageId);
        
        const webhookResponse = await fetch('https://sgxlabs.app.n8n.cloud/webhook/63fa615f-c551-4ab4-84d3-67cf6ea627d7', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: {
              message: `New ${finalImageType} image uploaded: "${imageFile.name}". ${message || 'Please analyze this food image.'}`,
              image_id: imageId,
              image_url: publicURL.publicUrl,
              image_type: finalImageType,
              user_id: user.id,
              folder_path: `${user.id}/${finalImageType}`,
              db_record_id: imageRecord.id,
              completion_webhook_url: `${supabaseUrl}/functions/v1/n8n-completion-webhook`
            }
          }),
        });

        console.log('n8n webhook response status:', webhookResponse.status);
        
        if (webhookResponse.ok) {
          const chatResponse = await webhookResponse.text();
          console.log('n8n processing started for image:', imageId);
          console.log('n8n response:', chatResponse);
          
          // Update the database record to indicate processing has started
          try {
            await supabase
              .from('images')
              .update({
                metadata: {
                  ...imageRecord.metadata,
                  processing_started: true,
                  processing_start_time: new Date().toISOString(),
                  n8n_webhook_response: chatResponse
                }
              })
              .eq('id', imageRecord.id);
              
          } catch (updateError) {
            console.error('Error updating image record with processing start:', updateError);
          }
        } else {
          console.error('n8n webhook failed with status:', webhookResponse.status);
          const errorText = await webhookResponse.text();
          console.error('n8n webhook error response:', errorText);
          
          // Update record to indicate webhook failure
          try {
            await supabase
              .from('images')
              .update({
                metadata: {
                  ...imageRecord.metadata,
                  processing_failed: true,
                  processing_error: `N8N webhook failed: ${webhookResponse.status} - ${errorText}`,
                  failed_at: new Date().toISOString()
                }
              })
              .eq('id', imageRecord.id);
          } catch (updateError) {
            console.error('Error updating failed webhook status:', updateError);
          }
        }
      } catch (error) {
        console.error('Background processing error for image:', imageId, error);
        
        // Update record to indicate processing failed
        try {
          await supabase
            .from('images')
            .update({
              metadata: {
                ...imageRecord.metadata,
                processing_failed: true,
                processing_error: error.message,
                failed_at: new Date().toISOString()
              }
            })
            .eq('id', imageRecord.id);
        } catch (updateError) {
          console.error('Error updating failed processing status:', updateError);
        }
      }
    };

    // Start the background task using EdgeRuntime.waitUntil
    EdgeRuntime.waitUntil(backgroundProcessing());

    // Return immediate response to prevent timeout
    return new Response(JSON.stringify({
      success: true,
      message: "Image uploaded successfully! AI processing has started in the background. You'll see the enhanced image when processing completes (usually 60-90 seconds).",
      image_id: imageId,
      db_record_id: imageRecord.id,
      image_url: publicURL.publicUrl,
      image_type: finalImageType,
      folder_path: `${user.id}/${finalImageType}`,
      tokens_remaining: remainingTokens,
      processing_status: "started"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-image function:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});