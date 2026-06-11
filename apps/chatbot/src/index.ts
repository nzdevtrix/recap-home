import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

async function getChatResponse(message: string, role: string) {
  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-tiny',
        messages: [
          { role: 'system', content: `You are a support assistant for Recap Home. Help ${role} users with their queries.` },
          { role: 'user', content: message }
        ]
      },
      { headers: { 'Authorization': `Bearer ${MISTRAL_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Chatbot API error:', error);
    return 'Sorry, I am unable to process your request at the moment.';
  }
}

console.log('Chatbot service ready');

export { getChatResponse };