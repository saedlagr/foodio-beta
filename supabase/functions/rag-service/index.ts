import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RAG Document Management Service
class RAGService {
  private supabase: ReturnType<typeof createClient>;
  private openaiApiKey: string;

  constructor(supabaseUrl: string, supabaseServiceKey: string, openaiApiKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.openaiApiKey = openaiApiKey;
  }

  async addDocument(content: string, metadata: Record<string, unknown> = {}): Promise<string> {
    try {
      // Generate embedding for the document
      const embedding = await this.generateEmbedding(content);
      
      // Store document with embedding
      const { data, error } = await this.supabase
        .from('knowledge_base')
        .insert({
          content,
          embedding,
          metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to store document: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  async searchDocuments(query: string, limit: number = 5): Promise<Array<{content: string, metadata: Record<string, unknown>, similarity: number}>> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Use vector similarity search
      const { data, error } = await this.supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit
      });

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  async initializeFoodioKnowledgeBase(): Promise<void> {
    console.log('Initializing Foodio knowledge base...');
    
    const foodioDocuments = [
      {
        content: `Food Photography Best Practices:
        
1. Lighting: Use natural, soft light whenever possible. Position food near a window with diffused light. Avoid harsh shadows.
2. Composition: Use the rule of thirds. Place main elements at intersection points. Create depth with layering.
3. Styling: Props should complement, not distract. Use neutral backgrounds. Keep composition clean and focused.
4. Camera Settings: Use a wide aperture (f/2.8-f/4) for beautiful bokeh. Shutter speed 1/125 or faster to avoid blur.
5. Editing: Enhance colors naturally. Adjust exposure and contrast subtly. Sharpen key details.
6. Angles: 45-degree angle works well for most dishes. Overhead for flat lays. Eye level for tall dishes.`,
        metadata: { category: 'best-practices', topic: 'general-photography' }
      },
      {
        content: `Food Styling Tips:

1. Freshness: Use fresh ingredients. Wipe plates clean of spills. Add herbs and garnishes last minute.
2. Color Theory: Complementary colors make food pop. Use green herbs to add freshness to any dish.
3. Texture Contrast: Combine smooth and crunchy elements. Add nuts, seeds, or breadcrumbs for texture.
4. Props: Use simple, neutral plates. Wooden boards add warmth. Metallic utensils add elegance.
5. Steam: Use steam from hot beverages or freshly cooked food to add life to photos.
6. Layers: Create height and depth. Stack elements. Use ramekins or small bowls to add dimension.`,
        metadata: { category: 'styling', topic: 'food-styling' }
      },
      {
        content: `AI Food Photography Enhancement:

Our AI can enhance your food photos by:
- Improving lighting and exposure
- Enhancing colors and saturation
- Sharpening key details
- Reducing noise and artifacts
- Adding professional depth of field
- Optimizing composition

Best results come from:
- Well-lit original photos
- Clear focus on main subject
- Minimal distracting elements
- Good composition foundation`,
        metadata: { category: 'ai-capabilities', topic: 'enhancement' }
      },
      {
        content: `Marketing Video Creation with Foodio:

Turn your food photos into engaging marketing videos:

1. Choose your best-enhanced food photo
2. Select video style: social media, restaurant promo, or food blog
3. Add text overlays: dish name, ingredients, or call-to-action
4. Include background music that matches your brand
5. Optimize for platform: Instagram (15-30s), TikTok (15-60s), YouTube (30s+)

Video features:
- Smooth camera movements
- Dynamic transitions
- Text animations
- Brand overlay options
- Multiple aspect ratios`,
        metadata: { category: 'video-creation', topic: 'marketing' }
      },
      {
        content: `Token System and Pricing:

Free tier: 10 tokens per month
- 1 token = 1 image analysis
- 2 tokens = 1 AI enhancement
- 3 tokens = 1 video generation

Pro tier: 100 tokens per month
- All free tier benefits
- Higher resolution outputs
- Priority processing
- Advanced editing options

Tokens reset monthly. Unused tokens do not roll over.`,
        metadata: { category: 'pricing', topic: 'tokens' }
      }
    ];

    for (const doc of foodioDocuments) {
      try {
        await this.addDocument(doc.content, doc.metadata);
        console.log(`Added document: ${doc.metadata.category}/${doc.metadata.topic}`);
      } catch (error) {
        console.error(`Failed to add document: ${error.message}`);
      }
    }

    console.log('Foodio knowledge base initialized successfully');
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
        dimensions: 1536
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding generation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }
}

// Initialize RAG service
const ragService = new RAGService(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  Deno.env.get('OPENAI_API_KEY')!
);

// HTTP handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (path === '/initialize' && method === 'POST') {
      return await handleInitialize(req);
    } else if (path === '/add-document' && method === 'POST') {
      return await handleAddDocument(req);
    } else if (path === '/search' && method === 'POST') {
      return await handleSearch(req);
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('RAG service error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Route handlers
async function handleInitialize(req: Request): Promise<Response> {
  await ragService.initializeFoodioKnowledgeBase();
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Foodio knowledge base initialized' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleAddDocument(req: Request): Promise<Response> {
  const { content, metadata } = await req.json();
  
  if (!content) {
    return new Response(JSON.stringify({ error: 'Content is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const documentId = await ragService.addDocument(content, metadata);
  
  return new Response(JSON.stringify({ 
    success: true, 
    documentId 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSearch(req: Request): Promise<Response> {
  const { query, limit } = await req.json();
  
  if (!query) {
    return new Response(JSON.stringify({ error: 'Query is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const results = await ragService.searchDocuments(query, limit || 5);
  
  return new Response(JSON.stringify({ 
    success: true, 
    results 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}