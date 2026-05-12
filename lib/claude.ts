const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';
const CLAUDE_MODEL = 'claude-sonnet-4-6';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function callClaude(messages: Message[], system: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function suggestDestinations(params: {
  budget: number;
  duration: number;
  vibe: string;
  startingFrom: string;
}): Promise<string> {
  return callClaude(
    [
      {
        role: 'user',
        content: `I'm a student planning a spring break trip.
Budget: $${params.budget}
Duration: ${params.duration} days
Vibe: ${params.vibe}
Starting from: ${params.startingFrom}

Suggest 4 destinations. For each, include: name, why it's great for students, estimated daily cost, top 2 activities, and a fun emoji. Keep it concise and exciting.`,
      },
    ],
    'You are a fun, knowledgeable travel advisor specializing in budget student trips. Give practical, exciting recommendations. Format your response with clear sections for each destination.'
  );
}

export async function generateItinerary(params: {
  destination: string;
  duration: number;
  budget: number;
  interests: string;
}): Promise<string> {
  return callClaude(
    [
      {
        role: 'user',
        content: `Create a day-by-day itinerary for a student trip:
Destination: ${params.destination}
Duration: ${params.duration} days
Budget: $${params.budget} total
Interests: ${params.interests}

For each day, list 3-4 activities with times, locations, and estimated costs. Include food recommendations. Keep it budget-friendly and fun!`,
      },
    ],
    'You are a travel planning expert who creates detailed, practical itineraries for budget-conscious students. Format each day clearly with times and activities.'
  );
}

export async function generatePackingList(params: {
  destination: string;
  duration: number;
  activities: string;
}): Promise<string> {
  return callClaude(
    [
      {
        role: 'user',
        content: `Create a packing list for:
Destination: ${params.destination}
Duration: ${params.duration} days
Activities planned: ${params.activities}

Organize by category (clothes, toiletries, documents, electronics, etc). Keep it realistic for a student with carry-on only.`,
      },
    ],
    'You are a practical travel packing expert. Create concise, organized packing lists. Use emojis for categories to make it visually appealing.'
  );
}
