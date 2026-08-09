const Groq = require('groq-sdk');
const { getSqlGenerationPrompt } = require('../utils/promptTemplates');
const { parseLlmResponse } = require('../utils/sqlParser');

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
    const { systemMessage, userMessage } = getSqlGenerationPrompt(schemaContext, prompt);

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

    return parseLlmResponse(responseContent);
  } catch (error) {
    console.error('LLM Generation Error:', error);
    throw new Error('Failed to generate SQL from prompt');
  }
};

module.exports = {
  generateSQLFromPrompt,
};
