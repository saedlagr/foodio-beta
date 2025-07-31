# Foodio AI - Complete System Architecture

## 🏗️ System Overview

Foodio AI is a comprehensive food photography enhancement platform that combines multiple AI services to provide professional food photo analysis, enhancement, and marketing video generation.

## 🔄 Architecture Flow

```
User (React App) → Supabase Edge Functions → AI Services (OpenAI + KIE.ai) → Storage/Database
```

## 📋 Core Components

### 1. Frontend Application (`/src`)
**Technology**: React + Vite + Supabase

**Key Features**:
- User authentication and profile management
- Image upload and preview
- Real-time chat interface
- Dashboard with generation history
- Token system integration

**Main Pages**:
- `Index.tsx`: Main chat interface with image upload
- `Dashboard.tsx`: User dashboard and generation history
- `Home.tsx`: Landing page

### 2. Backend Orchestrator (`/supabase/functions`)

#### A. Main Orchestrator (`/orchestrator`)
**Purpose**: Central coordination service for all AI operations

**Services**:
- **Chat Agent**: OpenAI 4o mini with RAG context
- **Image Analysis**: OpenAI vision API for food photo analysis
- **Image Generation**: KIE.ai 4o Image API integration
- **Task Management**: Asynchronous job processing

**Endpoints**:
```typescript
POST /chat                    - Chat with AI agent
POST /analyze-image          - Analyze uploaded images
POST /generate-image         - Generate enhanced images
GET  /generation-status     - Check task status
```

#### B. RAG Service (`/rag-service`)
**Purpose**: Knowledge base and semantic search for Foodio expertise

**Features**:
- Vector document storage (OpenAI embeddings)
- Semantic search capabilities
- Context injection for chat agent
- Foodio best practices knowledge base

**Knowledge Base Content**:
- Food photography best practices
- Styling tips and techniques
- AI enhancement capabilities
- Marketing video creation guides
- Token system information

**Endpoints**:
```typescript
POST /initialize              - Setup knowledge base
POST /add-document           - Add custom content
POST /search                 - Search knowledge base
```

#### C. Video Service (`/video-service`)
**Purpose**: Marketing video generation using KIE.ai Veo3

**Features**:
- Text-to-video generation
- Image-to-video conversion
- Multiple video styles
- Asynchronous processing

**Video Styles**:
- Food Marketing (15-60s)
- Social Media (15-30s)
- Restaurant Menu (30-60s)
- Recipe Tutorial (30-90s)

**Endpoints**:
```typescript
POST /generate               - Create videos
GET  /status                - Check video status
GET  /styles                - Available styles
```

#### D. Process Image (`/process-image`)
**Purpose**: Enhanced image upload and storage

**Features**:
- Supabase storage integration
- OpenAI embedding generation
- Token management
- Automatic image analysis

### 3. Database Schema (`/supabase/migrations`)

#### Core Tables
```sql
profiles                 -- User profiles with tokens
images                   -- Image storage with metadata
knowledge_base          -- RAG documents with embeddings
token_transactions       -- Token usage tracking
```

#### Key Functions
```sql
match_documents()        -- Vector similarity search
deduct_tokens()         -- Token management
add_tokens()           -- Token addition
```

## 🤖 AI Services Integration

### OpenAI Services
- **GPT-4o Mini**: Chat agent with RAG context
- **Vision API**: Image analysis and food recognition
- **Embeddings**: Vector search for knowledge base

### KIE.ai Services
- **4o Image**: Professional food photography generation
- **Veo3**: Marketing video creation
- **Task-based workflow**: Submit → Poll → Download

## 💳 Token System

### Token Costs
- **Image Analysis**: 1 token
- **Image Enhancement**: 2 tokens
- **Video Generation**: 3 tokens

### User Allocations
- **Free Tier**: 10 tokens/month
- **Pro Tier**: 100 tokens/month (future)

### Management
- Automatic deduction on usage
- Transaction logging
- Monthly reset system

## 📊 Data Flow

### Image Upload Workflow
```
1. User uploads image → React app
2. Image stored in Supabase Storage
3. OpenAI embedding generated
4. Image analyzed by orchestrator
5. Analysis returned to user
6. Option to generate enhanced version
```

### Chat Workflow
```
1. User sends message → React app
2. Message sent to orchestrator
3. RAG system retrieves relevant context
4. OpenAI generates response with context
5. Response returned to user
6. Actions offered (generate, analyze, etc.)
```

### Video Generation Workflow
```
1. User requests video → React app
2. Request sent to video service
3. KIE.ai task submitted
4. Polling for completion
5. Video URL returned to user
```

## 🔧 Configuration

### Environment Variables
```bash
OPENAI_API_KEY           -- OpenAI services
KIE_API_KEY             -- KIE.ai services
SUPABASE_URL            -- Project URL
SUPABASE_ANON_KEY       -- Client key
SUPABASE_SERVICE_ROLE_KEY -- Server key
```

### Function Deployment
```bash
supabase functions deploy orchestrator
supabase functions deploy rag-service
supabase functions deploy video-service
supabase functions deploy process-image
```

## 🚀 Performance & Scaling

### Edge Functions
- Auto-scaling with Supabase
- Cold start optimization
- Concurrent request handling
- Memory-efficient design

### Database
- Vector indexes for similarity search
- Optimized queries with proper indexing
- Row-level security for data protection
- Connection pooling

### Storage
- Supabase Storage for images
- CDN delivery for fast access
- Automatic backups
- Version control support

## 🔒 Security

### Authentication
- Supabase Auth for user management
- JWT tokens for API access
- Row-level security policies
- Service role key for server operations

### Data Protection
- Encrypted storage for API keys
- Secure file uploads
- User data isolation
- Audit logging for token transactions

## 📈 Monitoring & Analytics

### Function Monitoring
```bash
supabase functions logs orchestrator --follow
supabase functions logs rag-service --follow
```

### Database Analytics
- Token usage tracking
- User engagement metrics
- Generation success rates
- Performance monitoring

## 🎯 User Experience

### Key Features
1. **Instant Analysis**: Upload food photos and get immediate AI feedback
2. **Professional Enhancement**: Generate restaurant-quality images
3. **Marketing Videos**: Create engaging social media content
4. **Expert Guidance**: AI-powered food photography advice
5. **Token System**: Simple, transparent pricing

### User Journey
1. **Sign Up**: Get 10 free tokens to start
2. **Upload Photo**: Get instant analysis and suggestions
3. **Generate Enhancement**: Create professional version
4. **Create Marketing**: Generate videos for social media
5. **Share Results**: Download and share enhanced content

## 🚧 Future Enhancements

### Planned Features
- **Pro Tier**: Increased token limits and features
- **Batch Processing**: Multiple image enhancements
- **Advanced Editing**: Fine-tune enhancement parameters
- **Mobile App**: iOS and Android applications
- **API Access**: Developer API for integration
- **Analytics Dashboard**: Advanced usage insights

### Technical Improvements
- **Redis Cache**: For better performance
- **CDN Integration**: Faster image delivery
- **Advanced RAG**: More sophisticated knowledge retrieval
- **Multi-language Support**: Global accessibility
- **Offline Mode**: Basic functionality without internet

## 🛠️ Development Workflow

### Local Development
```bash
# Start Supabase locally
supabase start

# Deploy functions
supabase functions deploy

# Run frontend
npm run dev
```

### Testing
- Component testing with React Testing Library
- Integration testing with Supabase
- Load testing for performance validation
- User acceptance testing

## 📚 Documentation

- **Migration Guide**: `MIGRATION_GUIDE.md`
- **API Documentation**: Function-level docs in code
- **Database Schema**: Migration files with comments
- **Setup Instructions**: This architecture overview

## 🤝 Support & Maintenance

### Monitoring
- Function performance metrics
- Error rate tracking
- User feedback collection
- System health checks

### Updates
- Regular AI model updates
- Security patches
- Feature enhancements
- Performance optimizations

---

This architecture provides a solid foundation for Foodio AI's food photography enhancement platform, combining multiple AI services into a seamless user experience with proper scaling, security, and maintainability.