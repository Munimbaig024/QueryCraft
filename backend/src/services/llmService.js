const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate SQL from Natural Language
 * @param {string} prompt - The natural language query from the user
 * @param {string} schemaContext - The database schema context
 * @returns {Promise<Object>} The generated SQL query and recommended visualization
 */
const generateSQLFromPrompt = async (prompt, schemaContext) => {
  try {
    const systemMessage = `You are an expert SQL assistant. Your job is to convert natural language into a secure, optimized SQL query based on the provided database schema. 
Return ONLY a valid JSON object in the following format:
{
  "sql": "SELECT ...",
  "visualization": "table" // recommend one of: table, bar, line, pie
}
Do not include any markdown formatting, explanation, or conversational text.`;

    const userMessage = `Schema:
${schemaContext}

User Request:
${prompt}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      model: process.env.LLM_MODEL || 'qwen-2.5-32b-it',
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from LLM');
    }

    return JSON.parse(responseContent);
  } catch (error) {
    console.error('LLM Generation Error:', error);
    throw new Error('Failed to generate SQL from prompt');
  }
};

module.exports = {
  generateSQLFromPrompt,
};
