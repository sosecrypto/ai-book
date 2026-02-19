'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  className = ''
}: RichTextEditorProps) {
  const isInternalUpdate = useRef(false)
  const isInitialMount = useRef(true)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true
      onChange(editor.getHTML())
      setTimeout(() => { isInternalUpdate.current = false }, 0)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[200px] max-h-[400px] overflow-y-auto p-4 text-neutral-900 dark:text-neutral-100 prose-headings:text-neutral-900 dark:prose-headings:text-white prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-p:leading-relaxed prose-strong:text-neutral-900 dark:prose-strong:text-white prose-li:text-neutral-700 dark:prose-li:text-neutral-300',
      },
    },
  })

  // 외부 value 변경 시 에디터 동기화
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (isInternalUpdate.current) return
    if (editor && !editor.isFocused && !editor.isDestroyed) {
      const currentContent = editor.getHTML()
      if (value !== currentContent) {
        editor.commands.setContent(value || '')
      }
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className={`border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex-wrap">
        {/* 텍스트 스타일 */}
        <div className="flex items-center border-r border-neutral-200 dark:border-neutral-700 pr-1 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="굵게 (Ctrl+B)"
          >
            <span className="font-bold text-xs">B</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="기울임 (Ctrl+I)"
          >
            <span className="italic text-xs">I</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="밑줄 (Ctrl+U)"
          >
            <span className="underline text-xs">U</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="취소선"
          >
            <span className="line-through text-xs">S</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="형광펜"
          >
            <span className="text-xs bg-yellow-200 dark:bg-yellow-800 px-0.5">H</span>
          </ToolbarButton>
        </div>

        {/* 헤딩 */}
        <div className="flex items-center border-r border-neutral-200 dark:border-neutral-700 pr-1 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="제목"
          >
            <span className="text-xs font-medium">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="소제목"
          >
            <span className="text-xs font-medium">H3</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph') && !editor.isActive('heading')}
            title="본문"
          >
            <span className="text-xs">P</span>
          </ToolbarButton>
        </div>

        {/* 정렬 */}
        <div className="flex items-center border-r border-neutral-200 dark:border-neutral-700 pr-1 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="왼쪽 정렬"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="가운데 정렬"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="오른쪽 정렬"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
            </svg>
          </ToolbarButton>
        </div>

        {/* 리스트 & 인용 */}
        <div className="flex items-center border-r border-neutral-200 dark:border-neutral-700 pr-1 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="글머리 기호"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="번호 목록"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="인용구"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </ToolbarButton>
        </div>

        {/* 구분선 & Undo/Redo */}
        <div className="flex items-center ml-auto">
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="구분선"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
            </svg>
          </ToolbarButton>
          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="실행 취소 (Ctrl+Z)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="다시 실행 (Ctrl+Y)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 transition-colors ${
        disabled
          ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
          : isActive
            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
      }`}
    >
      {children}
    </button>
  )
}
