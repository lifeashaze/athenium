'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import Heading from '@tiptap/extension-heading'
import { useState } from 'react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  Quote,
} from 'lucide-react'
import 'highlight.js/styles/github.css'

const lowlight = createLowlight(common)

const CustomDocument = StarterKit.configure({
  codeBlock: false,
})

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const buttonStyle = (isActive: boolean) => `
    p-2 rounded hover:bg-gray-100 transition-colors duration-200
    ${isActive ? 'bg-gray-100 text-blue-600' : 'text-gray-600'}
  `

  return (
    <div className="border-b border-gray-200 p-2 flex gap-2 flex-wrap sticky top-0 bg-white z-10">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonStyle(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonStyle(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonStyle(editor.isActive('bulletList'))}
        title="Bullet List (Ctrl+Shift+8)"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonStyle(editor.isActive('orderedList'))}
        title="Ordered List (Ctrl+Shift+7)"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={buttonStyle(editor.isActive('taskList'))}
        title="Task List"
      >
        <CheckSquare className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={buttonStyle(editor.isActive('codeBlock'))}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonStyle(editor.isActive('blockquote'))}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonStyle(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonStyle(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonStyle(editor.isActive('heading', { level: 3 }))}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function NotesPage() {
  const [title, setTitle] = useState('Untitled')

  const editor = useEditor({
    extensions: [
      CustomDocument,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-list-item',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
      handleClick: (view: { dispatch?: any; state?: any }, pos: number, event: any) => {
        const { state } = view
        const selectionRange = state.selection.from
        
        if (pos < selectionRange) {
          view.dispatch(state.tr.setSelection(state.selection.map(pos)))
        }
        return false
      },
      handleKeyDown: (view: any, event: { key: string }) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          return false // Let default handling work
        }
        return false
      },
    },
    content: '<p>Start writing...</p>',
  })

  return (
    <>
      <style jsx global>{`
        .task-list {
          list-style-type: none;
          padding-left: 0;
        }
        
        .task-list-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.5em;
        }
        
        .task-list-item input[type="checkbox"] {
          margin-right: 0.5em;
          margin-top: 0.3em;
        }
        
        .code-block {
          background-color: #f6f8fa;
          border-radius: 6px;
          padding: 1em;
          margin: 1em 0;
        }
        
        .prose :where(blockquote):not(:where([class~="not-prose"] *)) {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          font-style: italic;
        }
        
        .prose :where(h1,h2,h3):not(:where([class~="not-prose"] *)) {
          margin-top: 2em;
          margin-bottom: 1em;
          font-weight: 600;
        }
        
        .prose :where(code):not(:where([class~="not-prose"] *)) {
          background-color: #f6f8fa;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
        }

        .ProseMirror li {
          margin-bottom: 0.5em;
        }

        .editor-container {
          overflow-y: auto;
          cursor: text;
        }

        .ProseMirror {
          min-height: 100%;
          padding-bottom: 300px; /* Gives space at bottom for typing */
        }
      `}</style>
      <div className="max-w-4xl mx-auto p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-bold mb-4 p-2 focus:outline-none border-none"
          placeholder="Untitled"
        />
        <div className="border rounded-lg shadow-sm">
          <MenuBar editor={editor} />
          <div className="editor-container" style={{ height: 'calc(100vh - 250px)' }}>
            <EditorContent 
              editor={editor} 
              className="p-4 prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl" 
            />
          </div>
        </div>
      </div>
    </>
  )
}
