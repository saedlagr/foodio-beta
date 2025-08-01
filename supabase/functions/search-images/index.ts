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
    console.log('Processing image search request');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { query, user_id, match_threshold = 0.7, match_count = 10 } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating embedding for search query:', query);

    // Generate embedding for the search query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-3-small',
        dimensions: 1536
      }),
    });

    if (!embeddingResponse.ok) {
      console.error('OpenAI embedding error:', await embeddingResponse.text());
      throw new Error('Failed to generate search embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    console.log('Searching for similar images');

    // Search for similar images using the vector similarity function
    const { data: similarImages, error: searchError } = await supabase.rpc(
      'search_similar_images',
      {
        query_embedding: queryEmbedding,
        match_threshold: match_threshold,
        match_count: match_count,
        filter_user_id: user_id || null
      }
    );

    if (searchError) {
      console.error('Search error:', searchError);
      return new Response(JSON.stringify({ error: 'Failed to search images' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get public URLs for the images
    const imagesWithUrls = await Promise.all(
      similarImages.map(async (image: any) => {
        const { data: publicURL } = supabase.storage
          .from('food-images')
          .getPublicUrl(image.file_path);
        
        return {
          ...image,
          public_url: publicURL.publicUrl
        };
      })
    );

    console.log(`Found ${imagesWithUrls.length} similar images`);

    return new Response(JSON.stringify({
      success: true,
      query: query,
      results: imagesWithUrls,
      count: imagesWithUrls.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-images function:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});