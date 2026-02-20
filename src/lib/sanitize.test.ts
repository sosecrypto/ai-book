import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from './sanitize'

describe('sanitizeHtml', () => {
  it('allows safe HTML tags', () => {
    const input = '<h2>Title</h2><p>Text with <strong>bold</strong> and <em>italic</em></p>'
    expect(sanitizeHtml(input)).toBe(input)
  })

  it('removes script tags', () => {
    const input = '<p>Safe</p><script>alert("xss")</script>'
    expect(sanitizeHtml(input)).toBe('<p>Safe</p>')
  })

  it('removes onerror attributes', () => {
    const input = '<p onerror="alert(1)">Text</p>'
    expect(sanitizeHtml(input)).toBe('<p>Text</p>')
  })

  it('removes onclick attributes', () => {
    const input = '<p onclick="alert(1)">Click</p>'
    expect(sanitizeHtml(input)).toBe('<p>Click</p>')
  })

  it('removes img tags (not in allowed list)', () => {
    const input = '<img src="x" onerror="alert(1)">'
    expect(sanitizeHtml(input)).toBe('')
  })

  it('removes iframe tags', () => {
    const input = '<iframe src="http://evil.com"></iframe>'
    expect(sanitizeHtml(input)).toBe('')
  })

  it('allows class attribute', () => {
    const input = '<span class="highlight">Text</span>'
    expect(sanitizeHtml(input)).toBe(input)
  })

  it('removes style attribute', () => {
    const input = '<p style="color:red">Text</p>'
    expect(sanitizeHtml(input)).toBe('<p>Text</p>')
  })

  it('removes javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">Click</a>'
    const result = sanitizeHtml(input)
    expect(result).not.toContain('javascript:')
  })

  it('handles nested XSS attempts', () => {
    const input = '<p><strong onmouseover="alert(1)">Text</strong></p>'
    expect(sanitizeHtml(input)).toBe('<p><strong>Text</strong></p>')
  })

  it('preserves list structures', () => {
    const input = '<ul><li>Item 1</li><li>Item 2</li></ul>'
    expect(sanitizeHtml(input)).toBe(input)
  })

  it('preserves blockquotes', () => {
    const input = '<blockquote>Quote text</blockquote>'
    expect(sanitizeHtml(input)).toBe(input)
  })
})
