// Test script to verify Groq API connectivity
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'your-api-key-here';
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

async function testGroqModel(model) {
  console.log(`Testing model: ${model}`);
  
  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user", 
            content: "Write a short test story about an oracle."
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ${model} failed: ${response.status} - ${errorText}`);
      return false;
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    if (content) {
      console.log(`✅ ${model} success: ${content.substring(0, 100)}...`);
      return true;
    } else {
      console.error(`❌ ${model} failed: No content generated`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${model} error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔮 Testing Groq API connectivity...\n');
  
  const models = ['llama3-8b-8192', 'llama3-70b-8192'];
  
  for (const model of models) {
    await testGroqModel(model);
    console.log('');
  }
}

main().catch(console.error); 