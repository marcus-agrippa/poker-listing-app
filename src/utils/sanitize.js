import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content while allowing basic formatting tags
 * Use this for rich text content like notes and announcements
 *
 * @param {string} dirty - Unsanitized HTML string
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitize plain text by stripping all HTML tags
 * Use this for user display names, venue names, and short text fields
 *
 * @param {string} text - Unsanitized text string
 * @returns {string} - Sanitized plain text string
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  }).trim();
};

/**
 * Sanitize and validate display names
 * Ensures display names are safe and within allowed length
 *
 * @param {string} displayName - User's display name
 * @returns {string} - Sanitized and validated display name
 */
export const sanitizeDisplayName = (displayName) => {
  if (!displayName || typeof displayName !== 'string') return '';

  // Strip all HTML tags
  let clean = DOMPurify.sanitize(displayName, { ALLOWED_TAGS: [] }).trim();

  // Remove any remaining special characters that could be used for attacks
  clean = clean.replace(/<script[^>]*>.*?<\/script>/gi, '');
  clean = clean.replace(/javascript:/gi, '');
  clean = clean.replace(/on\w+\s*=/gi, '');

  // Limit length (Firestore rules enforce 2-50 characters)
  if (clean.length > 50) {
    clean = clean.substring(0, 50);
  }

  return clean;
};

/**
 * Sanitize URLs to prevent javascript: and data: URI attacks
 *
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL or empty string if invalid
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') return '';

  const clean = url.trim();

  // Block dangerous protocols
  if (clean.match(/^(javascript|data|vbscript):/i)) {
    return '';
  }

  // Only allow http, https, and mailto
  if (!clean.match(/^(https?:\/\/|mailto:)/i)) {
    return '';
  }

  return DOMPurify.sanitize(clean, { ALLOWED_TAGS: [] });
};
