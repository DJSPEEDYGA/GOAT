# Ms Vanessa AI Backend

## Overview
Ms Vanessa is an intelligent AI assistant backend service powered by OpenAI GPT-4, designed specifically for the GOAT Royalty App to help artists manage their music publishing, track royalties, and maximize revenue.

## Setup Instructions

### Prerequisites
- Node.js 14 or higher
- OpenAI API key with GPT-4 access
- npm or yarn package manager

### Installation

1. **Clone or navigate to the backend directory**:
   ```bash
   cd ms-vanessa-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

The server will start running on `http://localhost:4000`

### Environment Variables

Create a `.env` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=4000
CORS_ORIGIN=http://localhost:3000
SYSTEM_PROMPT=You are Ms. Vanessa, a smart and loyal assistant specializing in music royalty management and publishing analytics.
```

## API Endpoints

### POST /chat
Send a message to Ms Vanessa and receive an AI-powered response.

**Request Body**:
```json
{
  "message": "How can I track my royalty earnings?"
}
```

**Response**:
```json
{
  "reply": "I can help you track your royalty earnings across multiple platforms. Let me analyze your current data and provide insights on optimizing your revenue streams..."
}
```

## Usage with GOAT Royalty App

1. Make sure the Ms Vanessa backend is running on port 4000
2. Navigate to `/ms-vanessa` in the GOAT Royalty App
3. Start chatting with Ms Vanessa for intelligent assistance

## Features

- **Intelligent Responses**: Powered by OpenAI GPT-4
- **Music Industry Focus**: Specialized knowledge for royalty management
- **Real-time Processing**: Fast response times
- **CORS Enabled**: Secure cross-origin communication
- **Error Handling**: Graceful error recovery

## Security Notes

- Keep your OpenAI API key secure and never commit it to version control
- The backend includes CORS configuration for security
- Input validation and sanitization are implemented

## Development

### Running in Development Mode
```bash
npm run dev  # If you have nodemon installed
# or
npm start
```

### Testing the API
```bash
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Ms Vanessa!"}'
```

## Integration

The GOAT Royalty App includes a proxy API endpoint at `/api/ms-vanessa/chat` that securely forwards requests to this backend service.

## Support

For issues or questions:
1. Check the server logs for error messages
2. Verify your OpenAI API key is valid and has GPT-4 access
3. Ensure proper CORS configuration
4. Check network connectivity between frontend and backend

---

**Version**: 1.0.0  
**Last Updated**: November 4, 2025