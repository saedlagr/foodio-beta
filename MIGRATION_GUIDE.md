# Foodio Backend Migration Guide

## Overview

This guide covers the migration from n8n webhook-based processing to a custom Supabase Edge Functions backend orchestrator for Foodio AI.

## New Architecture

### Replaced Components
- ❌ **n8n webhook** → ✅ **Custom orchestrator** (`/orchestrator`)
- ❌ **External AI processing** → ✅ **Integrated OpenAI + KIE.ai APIs**
- ❌ **Limited knowledge base** → ✅ **RAG system with vector store**

### New Services

#### 1. Main Orchestrator (`/orchestrator`)
- **Chat Agent**: OpenAI 4o mini with RAG context
- **Image Analysis**: OpenAI vision for food photo analysis
- **Image Generation**: KIE.ai 4o Image API integration
- **Workflow Coordination**: Manages all service interactions

#### 2. RAG Service (`/rag-service`)
- **Knowledge Base**: Vector store for Foodio documentation
- **Semantic Search**: OpenAI embeddings for relevant content retrieval
- **Context Management**: Provides context to chat agent

#### 3. Video Service (`/video-service`)
- **Video Generation**: KIE.ai Veo3 API integration
- **Style Management**: Multiple video styles for different use cases
- **Task Polling**: Asynchronous video generation handling

#### 4. Enhanced Process Image (`/process-image`)
- **Image Storage**: Supabase storage with vector embeddings
- **Token Management**: Automatic token deduction
- **Analysis Integration**: Calls orchestrator for image analysis

## Environment Variables Required

### Supabase Secrets
```bash
# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# KIE.ai API
KIE_API_KEY=your_kie_ai_api_key

# Supabase (automatically set)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Setup Commands
```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=your_openai_api_key

# Set KIE.ai API key
supabase secrets set KIE_API_KEY=your_kie_ai_api_key
```

## Database Schema Updates

### New Tables
- `knowledge_base`: RAG document storage with vector embeddings
- `token_transactions`: Token usage tracking

### Enhanced Tables
- `profiles`: Added `tokens` column with default value
- `images`: Enhanced metadata storage

### New Functions
- `match_documents()`: Vector similarity search
- `deduct_tokens()`: Token management
- `add_tokens()`: Token addition

## API Endpoints

### Chat & Analysis
```
POST /orchestrator/chat - Chat with AI agent
POST /orchestrator/analyze-image - Analyze food images
POST /orchestrator/generate-image - Generate enhanced images
GET /orchestrator/generation-status?taskId=xxx - Check generation status
```

### RAG System
```
POST /rag-service/initialize - Initialize knowledge base
POST /rag-service/add-document - Add custom documents
POST /rag-service/search - Search knowledge base
```

### Video Generation
```
POST /video-service/generate - Generate marketing videos
GET /video-service/status?taskId=xxx - Check video status
GET /video-service/styles - Get available video styles
```

## Migration Steps

### 1. Deploy New Functions
```bash
# Deploy all new functions
supabase functions deploy orchestrator
supabase functions deploy rag-service
supabase functions deploy video-service

# Update existing function
supabase functions deploy process-image
```

### 2. Run Database Migrations
```bash
# Apply new schema changes
supabase db push
```

### 3. Initialize Knowledge Base
```bash
# Initialize RAG system with Foodio knowledge
curl -X POST 'https://your-project.supabase.co/functions/v1/rag-service/initialize' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### 4. Update Frontend Configuration
The frontend has been updated to use the new orchestrator endpoints instead of n8n webhooks.

## Token System

### Token Costs
- **Image Analysis**: 1 token
- **Image Enhancement**: 2 tokens
- **Video Generation**: 3 tokens

### Default Allocation
- **New Users**: 10 tokens
- **Pro Tier**: 100 tokens (to be implemented)

## Testing the Migration

### 1. Test Chat Functionality
```bash
# Test chat endpoint
curl -X POST 'https://your-project.supabase.co/functions/v1/orchestrator/chat' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "message": "Hello! How can you help with my food photos?",
    "userId": "test-user-id"
  }'
```

### 2. Test Image Analysis
```bash
# Test image analysis
curl -X POST 'https://your-project.supabase.co/functions/v1/orchestrator/analyze-image' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "imageUrl": "https://example.com/food-photo.jpg",
    "prompt": "Analyze this food photo"
  }'
```

### 3. Test Image Generation
```bash
# Test image generation
curl -X POST 'https://your-project.supabase.co/functions/v1/orchestrator/generate-image' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "prompt": "Professional gourmet burger photo",
    "style": "food-photography",
    "dimensions": "1024x1024"
  }'
```

## Monitoring & Debugging

### Function Logs
```bash
# View function logs
supabase functions logs orchestrator --follow
supabase functions logs rag-service --follow
supabase functions logs video-service --follow
```

### Database Monitoring
```bash
# Check token transactions
select * from token_transactions order by created_at desc limit 10;

# Check knowledge base
select count(*) from knowledge_base;

# Check user tokens
select user_id, email, tokens from profiles p join auth.users u on p.user_id = u.id;
```

## Rollback Plan

If issues occur, you can temporarily rollback to n8n by:

1. **Revert frontend changes**: Use git to revert `Index.tsx` and `process-image/index.ts`
2. **Update n8n webhook**: Ensure your n8n workflow is still active
3. **Disable new functions**: Undeploy the new functions if needed

## Performance Considerations

### Cold Start Mitigation
- Functions are designed to initialize quickly
- API keys are cached in memory
- Vector embeddings are pre-computed

### Scaling
- Each function can handle multiple concurrent requests
- Task storage is in-memory (consider Redis for production)
- Database queries are optimized with indexes

## Security Notes

### API Key Management
- All API keys are stored as Supabase secrets
- Keys are never exposed to client-side code
- Service role key is used only for server-side operations

### Authentication
- All endpoints require valid JWT tokens
- User-specific operations verify ownership
- Token operations are atomic and validated

## Next Steps

1. **Monitor performance** after deployment
2. **Gather user feedback** on the new system
3. **Implement pro tier** with increased token limits
4. **Add advanced analytics** for usage tracking
5. **Optimize prompts** based on real usage

## Support

For issues during migration:
1. Check function logs for errors
2. Verify environment variables are set
3. Ensure database migrations completed successfully
4. Test API endpoints individually