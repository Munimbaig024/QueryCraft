const getSqlGenerationPrompt = (schemaContext, userPrompt) => {
  return {
    systemMessage: `You are an expert SQL assistant. Your job is to convert natural language into a secure, optimized SQL query based on the provided database schema. 
Return ONLY a valid JSON object in the following format:
{
  "sql": "SELECT ...",
  "visualization": "table" // recommend one of: table, bar, line, pie
}
Do not include any markdown formatting, explanation, or conversational text.`,
    userMessage: `Schema:
${schemaContext}

User Request:
${userPrompt}`
  };
};

module.exports = {
  getSqlGenerationPrompt,
};
