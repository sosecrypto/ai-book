import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'h2', 'h3', 'h4',
  'p', 'br',
  'strong', 'em', 'u',
  'ul', 'ol', 'li',
  'blockquote',
  'span',
]

const ALLOWED_ATTR = ['class']

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  })
}
