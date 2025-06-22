# Analytics Dashboard

A modern, responsive analytics dashboard built with Next.js 15, TypeScript, and Tailwind CSS. This application provides comprehensive insights into coaching business metrics, YouTube performance, and sales analytics with AI-powered chat functionality.

## 🚀 Features

### 📊 **Multi-Page Analytics Dashboard**
- **Overview Page**: High-level business metrics and funnel visualization
- **YouTube Stats**: Video performance, engagement rates, and ROI analysis
- **Website Stats**: Traffic analysis, conversion rates, and lead attribution
- **Sales Stats**: Revenue tracking, payment methods, and sales performance
- **AI Chat**: Interactive AI assistant for data insights and analysis

### 🤖 **AI-Powered Features**
- **Smart Chat Interface**: Ask questions about your data in natural language
- **AI Summary Modals**: Get AI-generated insights for each analytics page
- **Context-Aware Responses**: AI has access to all your business data
- **Custom Webhook Integration**: Powered by n8n for flexible AI processing

### 📈 **Data Visualization**
- **Interactive Charts**: Line charts, bar charts, and pie charts using Recharts
- **Data Tables**: Sortable and filterable data tables with pagination
- **Real-time Metrics**: Live updates with cached API responses
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### ⚡ **Performance Optimizations**
- **API Caching**: 5-minute cache for all API responses
- **Memoized Computations**: Optimized data calculations
- **Lazy Loading**: Efficient component loading
- **TypeScript**: Full type safety and better developer experience

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom Components
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Icons**: Lucide React
- **State Management**: React Hooks
- **AI Integration**: n8n Webhooks

## 📁 Project Structure

```
analytics-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── cal/           # Cal.com integration
│   │   ├── kajabi/        # Kajabi revenue data
│   │   └── youtube/       # YouTube data API
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── pages/            # Page-specific components
│   ├── data-table/       # Data table components
│   └── ai-summary-modal.tsx
├── hooks/                # Custom React hooks
│   ├── use-youtube-data.ts
│   ├── use-monthly-revenue.ts
│   └── use-monthly-calls.ts
├── lib/                  # Utilities and data
│   ├── api-cache.ts      # API caching utility
│   ├── mock-data.ts      # Mock data for development
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd analytics-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# API Endpoints (optional - defaults to mock data)
NEXT_PUBLIC_YOUTUBE_WEBHOOK_URL=https://n8n.syedd.com/webhook/your-webhook-id
NEXT_PUBLIC_AI_CHAT_WEBHOOK_URL=https://n8n.syedd.com/webhook/your-chat-webhook-id
NEXT_PUBLIC_AI_SUMMARY_WEBHOOK_URL=https://n8n.syedd.com/webhook/your-summary-webhook-id
```

### API Integration
The dashboard currently uses mock data. To integrate with real APIs:

1. **YouTube Data**: Update the webhook URL in `app/api/youtube/data/route.ts`
2. **Revenue Data**: Modify `app/api/kajabi/monthly-revenue/route.ts`
3. **Call Data**: Update `app/api/cal/monthly-calls/route.ts`

## 📊 Data Sources

### Current Data Structure
- **YouTube Videos**: View counts, likes, comments, revenue attribution
- **Monthly Revenue**: PIF payments, installments, conversion rates
- **Call Data**: Booked calls, show-ups, cancellations, video sources
- **Lead Attribution**: Traffic sources, conversion funnels, geographic data

### Mock Data
The application includes comprehensive mock data in `lib/mock-data.ts` for development and demonstration purposes.

## 🤖 AI Features

### Chat Interface
- **Location**: `/chat` page
- **Functionality**: Ask questions about your data in natural language
- **Integration**: Sends queries to n8n webhook with full context
- **Features**: Suggested questions, conversation history, real-time responses

### AI Summary Modals
- **Location**: Available on all analytics pages
- **Functionality**: Generate AI insights for specific data sets
- **Integration**: Separate webhook for summary generation

### Webhook Structure
```json
{
  "query": "User's question",
  "context": {
    "monthlyRevenue": [...],
    "youtubeVideos": [...],
    "totalRevenue": 123456,
    "totalViews": 789012,
    // ... other calculated metrics
  }
}
```

## 🎨 Customization

### Styling
- **Theme**: Custom Tailwind CSS configuration
- **Colors**: Purple, blue, green, orange gradient system
- **Components**: Fully customizable UI components in `components/ui/`

### Adding New Pages
1. Create a new component in `components/pages/`
2. Add the route to the sidebar in `app/page.tsx`
3. Implement data fetching with custom hooks
4. Add AI summary modal if needed

### Extending Data
1. Update mock data in `lib/mock-data.ts`
2. Create corresponding API routes in `app/api/`
3. Build custom hooks for data management
4. Add visualization components

## 📱 Responsive Design

The dashboard is fully responsive with:
- **Desktop**: Full-featured layout with sidebar navigation
- **Tablet**: Optimized layout with collapsible sidebar
- **Mobile**: Mobile-first design with touch-friendly interactions

## 🔒 Security

- **API Routes**: Server-side data processing
- **Environment Variables**: Secure configuration management
- **Type Safety**: Full TypeScript coverage
- **Input Validation**: Proper data validation and sanitization

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the code comments
- Review the TypeScript types for API structures

## 🔄 Changelog

### v0.1.0
- Initial release with core analytics features
- AI chat integration
- Responsive design
- API caching system
- Comprehensive mock data

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
