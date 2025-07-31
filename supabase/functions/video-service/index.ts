import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// KIE.ai Video Generation Service
class KIEVideoService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.kie.ai/v1';
  }

  async generateVideo(request: VideoGenerationRequest): Promise<KIEVideoTask> {
    const taskId = crypto.randomUUID();
    
    // Store task
    const task: KIEVideoTask = {
      id: taskId,
      prompt: request.prompt,
      image_url: request.image_url,
      style: request.style || 'food-marketing',
      duration: request.duration || 15,
      status: 'pending'
    };
    taskStorage.set(taskId, task);

    try {
      // Submit task to KIE.ai
      const requestBody: {prompt: string, model: string, style: string, duration: number, quality: string, image_url?: string} = {
        prompt: request.prompt,
        model: 'veo-3',
        style: request.style || 'food-marketing',
        duration: request.duration || 15,
        quality: 'hd'
      };

      // If image URL is provided, include it for image-to-video
      if (request.image_url) {
        requestBody.image_url = request.image_url;
      }

      const response = await fetch(`${this.baseUrl}/videos/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`KIE.ai video API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Update task with KIE.ai task ID
      taskStorage.set(taskId, {
        ...task,
        id: data.id || taskId,
        status: 'processing'
      });

      // Start polling for completion
      this.pollForVideoCompletion(data.id || taskId);

      return taskStorage.get(taskId)!;
    } catch (error) {
      console.error('KIE.ai video generation error:', error);
      taskStorage.set(taskId, {
        ...task,
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  private async pollForVideoCompletion(taskId: string, maxAttempts = 60): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/videos/generations/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            // Task not found yet
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }
          throw new Error(`Video polling error: ${response.status}`);
        }

        const data = await response.json();
        const task = taskStorage.get(taskId);

        if (data.status === 'completed' && data.data?.[0]?.url) {
          // Task completed
          taskStorage.set(taskId, {
            ...task!,
            status: 'completed',
            result_url: data.data[0].url,
            thumbnail_url: data.data[0].thumbnail_url,
            duration: data.data[0].duration
          });
          return;
        } else if (data.status === 'failed') {
          // Task failed
          taskStorage.set(taskId, {
            ...task!,
            status: 'failed',
            error: data.error || 'Video generation failed'
          });
          return;
        }

        // Still processing - video generation takes longer
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Video polling error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Timeout
    const task = taskStorage.get(taskId);
    taskStorage.set(taskId, {
      ...task!,
      status: 'failed',
      error: 'Video generation timeout'
    });
  }

  getVideoTaskStatus(taskId: string): KIEVideoTask | undefined {
    return taskStorage.get(taskId);
  }

  async getVideoStyles(): Promise<VideoStyle[]> {
    return [
      {
        id: 'food-marketing',
        name: 'Food Marketing',
        description: 'Professional food marketing video with smooth transitions',
        duration_options: [15, 30, 45],
        features: ['smooth-camera-movement', 'text-overlay', 'background-music']
      },
      {
        id: 'social-media',
        name: 'Social Media',
        description: 'Short, engaging video perfect for Instagram and TikTok',
        duration_options: [15, 30],
        features: ['quick-cuts', 'trending-music', 'hashtag-overlay']
      },
      {
        id: 'restaurant-menu',
        name: 'Restaurant Menu',
        description: 'Elegant video showcasing menu items',
        duration_options: [30, 45, 60],
        features: ['slow-panning', 'elegant-music', 'price-overlay']
      },
      {
        id: 'recipe-tutorial',
        name: 'Recipe Tutorial',
        description: 'Step-by-step cooking demonstration',
        duration_options: [30, 45, 60, 90],
        features: ['step-by-step', 'text-instructions', 'timer-overlay']
      }
    ];
  }
}

// Type definitions
interface VideoGenerationRequest {
  prompt: string;
  image_url?: string;
  style?: string;
  duration?: number;
  text_overlay?: string;
}

interface KIEVideoTask {
  id: string;
  prompt: string;
  image_url?: string;
  style: string;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_url?: string;
  thumbnail_url?: string;
  actual_duration?: number;
  error?: string;
}

interface VideoStyle {
  id: string;
  name: string;
  description: string;
  duration_options: number[];
  features: string[];
}

// Task storage (in production, use Redis or database)
const taskStorage = new Map<string, KIEVideoTask>();

// Initialize video service
const videoService = new KIEVideoService(Deno.env.get('KIE_API_KEY')!);

// HTTP handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (path === '/generate' && method === 'POST') {
      return await handleVideoGeneration(req);
    } else if (path === '/status' && method === 'GET') {
      return await handleVideoStatus(req);
    } else if (path === '/styles' && method === 'GET') {
      return await handleVideoStyles(req);
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Video service error:', error);
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
async function handleVideoGeneration(req: Request): Promise<Response> {
  const { prompt, image_url, style, duration, text_overlay } = await req.json();
  
  if (!prompt) {
    return new Response(JSON.stringify({ error: 'prompt is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate user authentication and tokens
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get user from auth header
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check if user has enough tokens (3 tokens for video generation)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tokens')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile || profile.tokens < 3) {
    return new Response(JSON.stringify({ 
      error: 'Insufficient tokens. You need 3 tokens to generate a video.' 
    }), {
      status: 402,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const task = await videoService.generateVideo({
      prompt,
      image_url,
      style,
      duration,
      text_overlay
    });

    // Deduct tokens
    const { error: tokenError } = await supabase.rpc('deduct_tokens', {
      target_user_id: user.id,
      token_amount: 3,
      transaction_description: 'Video generation'
    });

    if (tokenError) {
      console.error('Token deduction error:', tokenError);
    }

    return new Response(JSON.stringify({ 
      task,
      tokens_remaining: profile.tokens - 3 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to generate video',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleVideoStatus(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const taskId = url.searchParams.get('taskId');
  
  if (!taskId) {
    return new Response(JSON.stringify({ error: 'taskId is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const task = videoService.getVideoTaskStatus(taskId);
  
  if (!task) {
    return new Response(JSON.stringify({ error: 'Task not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ task }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleVideoStyles(req: Request): Promise<Response> {
  const styles = await videoService.getVideoStyles();
  
  return new Response(JSON.stringify({ styles }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}