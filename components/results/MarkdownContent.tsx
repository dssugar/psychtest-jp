/**
 * マークダウンコンテンツレンダラー
 *
 * interpretation関数から返されるマークダウン形式のテキストを
 * HTMLとしてレンダリングします。
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // カスタムスタイリング
        p: ({ children }) => (
          <p className="text-brutal-gray-900 leading-relaxed text-lg mb-4">
            {children}
          </p>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-bold text-brutal-black mt-6 mb-3">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-lg font-bold text-brutal-black mt-4 mb-2">
            {children}
          </h4>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-brutal-gray-900">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside ml-5 space-y-2 mb-4 text-brutal-gray-900">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-lg leading-relaxed pl-2">
            <span className="inline">{children}</span>
          </li>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-brutal-black">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-brutal-gray-800">{children}</em>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-brutal-black pl-4 py-2 my-4 text-brutal-gray-800 italic">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="bg-brutal-gray-100 px-2 py-1 rounded text-sm font-mono text-brutal-black">
            {children}
          </code>
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
