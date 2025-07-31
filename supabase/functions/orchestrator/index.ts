import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Service interfaces
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ImageAnalysis {
  id: string;
  url: string;
  analysis: string;
  food_type: string;
  quality_score: number;
  suggestions: string[];
}

interface GenerationRequest {
  prompt: string;
  image_url?: string;
  style?: string;
  dimensions?: string;
}

interface KIEImageTask {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_url?: string;
  error?: string;
}

// Task storage (in production, use Redis or database)
const taskStorage = new Map<string, KIEImageTask>();

// OpenAI Chat Agent
class ChatAgent {
  private openaiApiKey: string;
  private supabase: ReturnType<typeof createClient>;

  constructor(openaiApiKey: string, supabase: ReturnType<typeof createClient>) {
    this.openaiApiKey = openaiApiKey;
    this.supabase = supabase;
  }

  async processMessage(message: string, userId: string, context?: ChatMessage[]): Promise<string> {
    try {
      // Get user context from RAG system
      const ragContext = await this.getRAGContext(message, userId);
      
      // Build conversation context
      const messages = [
        {
          role: 'system' as const,
          content: `You are Foodio AI, an expert food photography assistant. Your role is to help users enhance their food photos, provide styling suggestions, and generate professional food imagery.

Available capabilities:
- Analyze food photos and provide improvement suggestions
- Generate enhanced food photos using AI
- Create marketing videos from food imagery
- Provide food styling and composition advice
- Access Foodio knowledge base for best practices

User context from knowledge base:
${ragContext}

Always be helpful, specific, and focus on food photography excellence.`
        },
        ...(context || []).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: message
        }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Chat agent error:', error);
      return "I'm having trouble processing your message right now. Please try again.";
    }
  }

  private async getRAGContext(query: string, userId: string): Promise<string> {
    try {
      // Search for relevant documents in the vector store
      const { data: documents, error } = await this.supabase.rpc('match_documents', {
        query_embedding: await this.generateEmbedding(query),
        match_threshold: 0.7,
        match_count: 3
      });

      if (error || !documents) {
        return '';
      }

      return documents.map((doc: { content: string }) => doc.content).join('\n\n');
    } catch (error) {
      console.error('RAG context error:', error);
      return '';
    }
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

    const data = await response.json();
    return data.data[0].embedding;
  }
}

// Image Analysis Service
class ImageAnalysisService {
  private openaiApiKey: string;

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey;
  }

  async analyzeImage(imageUrl: string, prompt?: string): Promise<ImageAnalysis> {
    try {
      // Download image and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user' as const,
              content: [
                {
                  type: 'text' as const,
                  text: prompt || 'Analyze this food photo and provide detailed feedback on composition, lighting, styling, and overall quality. Rate the quality from 1-10 and provide specific suggestions for improvement.'
                },
                {
                  type: 'image_url' as const,
                  image_url: {
                    url: `data:${imageResponse.headers.get('content-type')};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Image analysis error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;

      // Parse analysis into structured data
      return {
        id: crypto.randomUUID(),
        url: imageUrl,
        analysis,
        food_type: this.extractFoodType(analysis),
        quality_score: this.extractQualityScore(analysis),
        suggestions: this.extractSuggestions(analysis)
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error('Failed to analyze image');
    }
  }

  private extractFoodType(analysis: string): string {
    // Simple extraction - in production, use AI to categorize
    const foodTypes = ['burger', 'pizza', 'salad', 'pasta', 'dessert', 'soup', 'steak', 'sushi'];
    const found = foodTypes.find(type => analysis.toLowerCase().includes(type));
    return found || 'general';
  }

  private extractQualityScore(analysis: string): number {
    const match = analysis.match(/(\d+)\/10|quality.*?(\d+)/i);
    return match ? parseInt(match[1] || match[2]) : 7;
  }

  private extractSuggestions(analysis: string): string[] {
    const sentences = analysis.split(/[.!?]+/);
    return sentences
      .filter(s => s.toLowerCase().includes('suggest') || s.toLowerCase().includes('improve'))
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
}

// KIE.ai Image Generation Service
class KIEImageService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.kie.ai/v1';
  }

  async generateImage(request: GenerationRequest): Promise<KIEImageTask> {
    const taskId = crypto.randomUUID();
    
    // Store task
    const task: KIEImageTask = {
      id: taskId,
      prompt: request.prompt,
      status: 'pending'
    };
    taskStorage.set(taskId, task);

    try {
      // Submit task to KIE.ai
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          model: '4o-image',
          style: request.style || 'food-photography',
          size: request.dimensions || '1024x1024',
          quality: 'hd',
          n: 1
        }),
      });

      if (!response.ok) {
        throw new Error(`KIE.ai API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Update task with KIE.ai task ID
      taskStorage.set(taskId, {
        ...task,
        id: data.id || taskId,
        status: 'processing'
      });

      // Start polling for completion
      this.pollForCompletion(data.id || taskId);

      return taskStorage.get(taskId)!;
    } catch (error) {
      console.error('KIE.ai generation error:', error);
      taskStorage.set(taskId, {
        ...task,
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  private async pollForCompletion(taskId: string, maxAttempts = 30): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/images/generations/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            // Task not found yet
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          throw new Error(`Polling error: ${response.status}`);
        }

        const data = await response.json();
        const task = taskStorage.get(taskId);

        if (data.status === 'completed' && data.data?.[0]?.url) {
          // Task completed
          taskStorage.set(taskId, {
            ...task!,
            status: 'completed',
            result_url: data.data[0].url
          });
          return;
        } else if (data.status === 'failed') {
          // Task failed
          taskStorage.set(taskId, {
            ...task!,
            status: 'failed',
            error: data.error || 'Generation failed'
          });
          return;
        }

        // Still processing
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Polling error:', error);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Timeout
    const task = taskStorage.get(taskId);
    taskStorage.set(taskId, {
      ...task!,
      status: 'failed',
      error: 'Generation timeout'
    });
  }

  getTaskStatus(taskId: string): KIEImageTask | undefined {
    return taskStorage.get(taskId);
  }
}

// Main orchestrator
class FoodioOrchestrator {
  private chatAgent: ChatAgent;
  private imageAnalysis: ImageAnalysisService;
  private imageGeneration: KIEImageService;
  private supabase: ReturnType<typeof createClient>;

  constructor(
    openaiApiKey: string,
    kieApiKey: string,
    supabaseUrl: string,
    supabaseServiceKey: string
  ) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.chatAgent = new ChatAgent(openaiApiKey, this.supabase);
    this.imageAnalysis = new ImageAnalysisService(openaiApiKey);
    this.imageGeneration = new KIEImageService(kieApiKey);
  }

  async handleChatRequest(userId: string, message: string, context?: ChatMessage[]): Promise<string> {
    return await this.chatAgent.processMessage(message, userId, context);
  }

  async handleImageAnalysis(imageUrl: string, prompt?: string): Promise<ImageAnalysis> {
    return await this.imageAnalysis.analyzeImage(imageUrl, prompt);
  }

  async handleImageGeneration(request: GenerationRequest): Promise<KIEImageTask> {
    return await this.imageGeneration.generateImage(request);
  }

  async getGenerationStatus(taskId: string): Promise<KIEImageTask | undefined> {
    return this.imageGeneration.getTaskStatus(taskId);
  }
}

// Initialize orchestrator
const orchestrator = new FoodioOrchestrator(
  Deno.env.get('OPENAI_API_KEY')!,
  Deno.env.get('KIE_API_KEY')!,
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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

    // Route requests
    if (path === '/chat' && method === 'POST') {
      return await handleChat(req);
    } else if (path === '/analyze-image' && method === 'POST') {
      return await handleImageAnalysis(req);
    } else if (path === '/generate-image' && method === 'POST') {
      return await handleImageGeneration(req);
    } else if (path === '/generation-status' && method === 'GET') {
      return await handleGenerationStatus(req);
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Request error:', error);
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
async function handleChat(req: Request): Promise<Response> {
  const { message, userId, context } = await req.json();
  
  if (!message || !userId) {
    return new Response(JSON.stringify({ error: 'Message and userId required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const response = await orchestrator.handleChatRequest(userId, message, context);
  
  return new Response(JSON.stringify({ response }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleImageAnalysis(req: Request): Promise<Response> {
  const { imageUrl, prompt } = await req.json();
  
  if (!imageUrl) {
    return new Response(JSON.stringify({ error: 'imageUrl required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const analysis = await orchestrator.handleImageAnalysis(imageUrl, prompt);
  
  return new Response(JSON.stringify({ analysis }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleImageGeneration(req: Request): Promise<Response> {
  const request = await req.json();
  
  if (!request.prompt) {
    return new Response(JSON.stringify({ error: 'prompt required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const task = await orchestrator.handleImageGeneration(request);
  
  return new Response(JSON.stringify({ task }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGenerationStatus(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const taskId = url.searchParams.get('taskId');
  
  if (!taskId) {
    return new Response(JSON.stringify({ error: 'taskId required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const task = await orchestrator.getGenerationStatus(taskId);
  
  return new Response(JSON.stringify({ task }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}