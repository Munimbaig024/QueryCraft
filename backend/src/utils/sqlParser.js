/**
 * Parses and cleans the SQL output from the LLM
 * @param {string} rawSql 
 * @returns {string} cleaned SQL
 */
const cleanSqlOutput = (rawSql) => {
  if (!rawSql) return '';
  
  // Remove markdown code blocks if the LLM accidentally included them
  let cleaned = rawSql.replace(/```sql/gi, '').replace(/```/g, '').trim();
  
  // Ensure it ends with a semicolon
  if (cleaned.length > 0 && !cleaned.endsWith(';')) {
    cleaned += ';';
  }
  
  return cleaned;
};

/**
 * Parses the raw LLM string response into a structured object
 * @param {string} llmResponse 
 * @returns {Object} { sql, visualization }
 */
const parseLlmResponse = (llmResponse) => {
  try {
    // 1. Strip <think> tags if present
    let strippedResponse = llmResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // 2. Clean markdown wrappers
    let cleanedJsonStr = strippedResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // 3. Forcefully extract the JSON object boundaries to ignore all conversational text
    const jsonStart = cleanedJsonStr.indexOf('{');
    const jsonEnd = cleanedJsonStr.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedJsonStr = cleanedJsonStr.substring(jsonStart, jsonEnd + 1);
    }
    
    const parsed = JSON.parse(cleanedJsonStr);
    return {
      sql: cleanSqlOutput(parsed.sql),
      visualization: parsed.visualization || 'table',
    };
  } catch (error) {
    console.error('Failed to parse JSON from LLM, attempting regex fallback:', error.message);
    
    // Fallback: Try to extract SQL if the LLM included it in markdown blocks alongside conversational text
    const sqlMatch = llmResponse.match(/```sql([\s\S]*?)```/i);
    let extractedSql = sqlMatch ? sqlMatch[1] : llmResponse;
    
    return {
      sql: cleanSqlOutput(extractedSql),
      visualization: 'table',
    };
  }
};

module.exports = {
  cleanSqlOutput,
  parseLlmResponse,
};
