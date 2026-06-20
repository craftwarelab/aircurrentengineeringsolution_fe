export function sanitizeHtml(html: string): string {
  if (!html) return '';
  if (typeof window === 'undefined') return html;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DOMPurify = require('dompurify');
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p','br','strong','em','u','s','a','h2','h3','ul','ol','li','blockquote','hr'],
    ALLOWED_ATTR: ['href','target','rel'],
    ALLOW_DATA_ATTR: false,
  });
}
