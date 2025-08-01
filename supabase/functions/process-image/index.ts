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

    // Generate unique filename
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

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

    // Convert image to base64 for OpenAI
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = imageFile.type;

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
          processed_at: new Date().toISOString()
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

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: `Image "${imageFile.name}" has been processed and stored successfully! I can now analyze and enhance your food photos. Your image is ready for AI processing.`,
      image_id: imageRecord.id,
      image_url: publicURL.publicUrl,
      tokens_remaining: profile.tokens - 1
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