/**
 * Text Utilities for Oracle Frontend
 * Provides safe text processing and sanitization functions
 */

/**
 * Sanitizes text input to prevent SQL injection and other security issues
 * @param text - The text to sanitize
 * @param maxLength - Maximum allowed length (default: 2000)
 * @returns Sanitized text
 */
export const sanitizeTextInput = (text: string, maxLength: number = 2000): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/['']/g, "'") // Normalize curly quotes to straight quotes
    .replace(/[""]/g, '"') // Normalize curly quotes to straight quotes
    .replace(/[\\]/g, '\\\\') // Escape backslashes
    .trim()
    .substring(0, maxLength);
};

/**
 * Sanitizes community input specifically (shorter length, stricter filtering)
 * @param text - The community input text
 * @returns Sanitized community input
 */
export const sanitizeCommunityInput = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/['']/g, "'") // Normalize curly quotes
    .replace(/[""]/g, '"') // Normalize curly quotes
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 200); // Community input limit
};

/**
 * Sanitizes prophecy topic strings
 * @param topic - The topic string
 * @returns Sanitized topic
 */
export const sanitizeTopic = (topic: string): string => {
  if (typeof topic !== 'string') return '';
  
  return topic
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[^\w\s_-]/g, '') // Only allow word characters, spaces, underscores, hyphens
    .trim()
    .substring(0, 100);
};

/**
 * Validates that text doesn't contain potentially dangerous patterns
 * @param text - Text to validate
 * @returns True if text is safe, false otherwise
 */
export const isTextSafe = (text: string): boolean => {
  if (typeof text !== 'string') return false;
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\/\*|\*\/)/,
    /(';\s*(DROP|DELETE|INSERT|UPDATE))/i,
    /(INFORMATION_SCHEMA|pg_|mysql\.)/i
  ];
  
  // Check for script injection
  const scriptPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i
  ];
  
  const allPatterns = [...sqlPatterns, ...scriptPatterns];
  
  return !allPatterns.some(pattern => pattern.test(text));
};

/**
 * Escapes special characters for safe database storage
 * @param text - Text to escape
 * @returns Escaped text
 */
export const escapeForDatabase = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/"/g, '""')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
};

/**
 * Formats text for safe display in UI
 * @param text - Text to format
 * @returns Safely formatted text
 */
export const formatForDisplay = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Validates and sanitizes a complete community lore input
 * @param input - The community input object
 * @returns Sanitized input object or null if invalid
 */
export const validateCommunityInput = (input: {
  input_text: string;
  player_address?: string;
  username?: string;
}): { input_text: string; player_address?: string; username?: string } | null => {
  
  if (!input.input_text || typeof input.input_text !== 'string') {
    return null;
  }
  
  const sanitizedText = sanitizeCommunityInput(input.input_text);
  
  if (sanitizedText.length === 0 || sanitizedText.length > 200) {
    return null;
  }
  
  if (!isTextSafe(sanitizedText)) {
    return null;
  }
  
  return {
    input_text: sanitizedText,
    player_address: input.player_address?.trim().substring(0, 44), // Solana address length
    username: input.username?.trim().substring(0, 50)
  };
}; 