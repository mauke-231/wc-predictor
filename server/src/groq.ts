import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  // Fail fast; calling code will handle throwing from getGroq().
  // Keeping this module-side throw would break server startup.
}

export function getGroqClient(): Groq {
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY environment variable');
  }

  return new Groq({ apiKey });
}

