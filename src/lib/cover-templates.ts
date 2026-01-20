export interface CoverTemplate {
  id: string
  name: string
  description: string
  previewGradient: string
  fontFamily: string
  titlePosition: 'top' | 'center' | 'bottom'
  accentColor: string
}

export const coverTemplates: CoverTemplate[] = [
  {
    id: 'classic',
    name: '클래식',
    description: '전통적이고 우아한 디자인',
    previewGradient: 'from-amber-800 to-amber-950',
    fontFamily: 'serif',
    titlePosition: 'center',
    accentColor: '#D4AF37',
  },
  {
    id: 'modern',
    name: '모던',
    description: '깔끔하고 현대적인 디자인',
    previewGradient: 'from-slate-800 to-slate-950',
    fontFamily: 'sans-serif',
    titlePosition: 'bottom',
    accentColor: '#60A5FA',
  },
  {
    id: 'minimal',
    name: '미니멀',
    description: '심플하고 미니멀한 디자인',
    previewGradient: 'from-gray-100 to-gray-300',
    fontFamily: 'sans-serif',
    titlePosition: 'center',
    accentColor: '#1F2937',
  },
  {
    id: 'vibrant',
    name: '비비드',
    description: '선명하고 활기찬 디자인',
    previewGradient: 'from-purple-600 to-pink-600',
    fontFamily: 'sans-serif',
    titlePosition: 'top',
    accentColor: '#FCD34D',
  },
  {
    id: 'nature',
    name: '네이처',
    description: '자연 친화적인 디자인',
    previewGradient: 'from-emerald-700 to-teal-900',
    fontFamily: 'serif',
    titlePosition: 'center',
    accentColor: '#86EFAC',
  },
  {
    id: 'dark',
    name: '다크',
    description: '어둡고 신비로운 디자인',
    previewGradient: 'from-gray-900 to-black',
    fontFamily: 'serif',
    titlePosition: 'center',
    accentColor: '#F87171',
  },
]

export const bookTypeTemplateMap: Record<string, string> = {
  fiction: 'classic',
  nonfiction: 'modern',
  selfhelp: 'vibrant',
  technical: 'minimal',
  essay: 'modern',
  children: 'vibrant',
  poetry: 'nature',
}

export function getRecommendedTemplate(bookType: string): CoverTemplate {
  const templateId = bookTypeTemplateMap[bookType] || 'classic'
  return coverTemplates.find((t) => t.id === templateId) || coverTemplates[0]
}

export function getTemplateById(id: string): CoverTemplate | undefined {
  return coverTemplates.find((t) => t.id === id)
}
