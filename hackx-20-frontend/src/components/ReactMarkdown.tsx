"use client";
// ----------------------------
// Imports
// ----------------------------
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css"; // Modern code highlighting theme
import "./ReactMarkdown.css"; // Import custom styles

// ----------------------------
// Custom markdown code starts here
// ----------------------------
const CustomMarkdown = ({
  content,
  isUserMessage = false,
}: {
  content: string | undefined;
  isUserMessage?: boolean;
}) => {
  return (
    <div className="max-w-full overflow-hidden">
      <div
        className={`markdown-content overflow-hidden ${isUserMessage ? "user-message" : ""}`}
        style={{ color: 'var(--color-text)' }}
      >
        <ReactMarkdown
          children={content}
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
          components={{
            strong: ({ children }) => (
              <strong
                style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '1.125rem' }}
              >
                {children}
              </strong>
            ),
            h1: ({ children }) => (
              <h1
                style={{
                  color: 'var(--color-heading)',
                  borderBottom: '2px solid var(--color-border)',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  margin: '1.5rem 0 1rem 0',
                  paddingBottom: '0.5rem',
                }}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                style={{
                  color: 'var(--color-heading)',
                  borderBottom: '1px solid var(--color-border)',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  margin: '1.25rem 0 1rem 0',
                  paddingBottom: '0.25rem',
                }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  margin: '1rem 0',
                }}
              >
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <span
                style={{
                  color: 'var(--color-text)',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  margin: '1rem 0',
                  display: 'block',
                  wordBreak: 'break-word',
                  width: '100%',
                }}
              >
                {children}
              </span>
            ),
            blockquote: ({ children }) => (
              <blockquote
                style={{
                  borderLeft: '4px solid var(--color-primary)',
                  background: 'var(--color-blockquote-bg)',
                  color: 'var(--color-blockquote-text)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem',
                  fontStyle: 'italic',
                  margin: '1rem 0',
                }}
              >
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', margin: '1rem 0' }}>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol style={{ listStyle: 'decimal', paddingLeft: '1.5rem', margin: '1rem 0' }}>{children}</ol>
            ),
            li: ({ children }) => (
              <li style={{ color: 'var(--color-text)', fontSize: '1rem', marginBottom: '0.5rem' }}>{children}</li>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                style={{
                  color: 'var(--color-link)',
                  textDecoration: 'underline',
                  transition: 'color 0.2s',
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            img: ({ src, alt }) => (
              <div style={{ margin: '1.5rem 0' }}>
                <img
                  src={src || "/placeholder.svg"}
                  alt={alt}
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '0.5rem', boxShadow: '0 2px 8px 0 var(--color-shadow)' }}
                  loading="lazy"
                />
                {alt && (
                  <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>{alt}</p>
                )}
              </div>
            ),
            table: ({ children }) => (
              <div style={{ overflow: 'auto', margin: '1.5rem 0', borderRadius: '0.5rem', boxShadow: '0 2px 8px 0 var(--color-shadow)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-table-bg)', color: 'var(--color-text)' }}>{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th style={{ borderBottom: '2px solid var(--color-border)', padding: '0.75rem', background: 'var(--color-table-header-bg)', fontWeight: 700, color: 'var(--color-heading)' }}>{children}</th>
            ),
            td: ({ children }) => (
              <td style={{ borderBottom: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text)' }}>{children}</td>
            ),
            em: ({ children }) => (
              <em style={{ fontWeight: 600, fontStyle: 'italic', color: 'var(--color-heading)' }}>{children}</em>
            ),
            sup: ({ children }) => (
              <sup style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{children}</sup>
            ),
            span: ({ children, ...props }) => (
              <span style={{ fontSize: '1rem', margin: '0.25rem 0' }} {...props}>{children}</span>
            ),
            code: ({ className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || "");
              if (props["data-inline"] !== true) {
                // Block code
                return (
                  <div style={{ borderRadius: '0.5rem', overflow: 'hidden', margin: '1rem 0' }}>
                    <div style={{ background: 'var(--color-code-header-bg)', color: 'var(--color-code-header-text)', padding: '0.5rem 1rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      {match && match[1] ? match[1].toUpperCase() : "CODE"}
                    </div>
                    <pre style={{ padding: '1rem', overflow: 'auto', background: 'var(--color-code-bg)', color: 'var(--color-code-text)', borderRadius: '0 0 0.5rem 0.5rem' }}>
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              } else {
                // Inline code
                return (
                  <code
                    style={{ background: 'var(--color-inline-code-bg)', color: 'var(--color-primary)', padding: '0.15em 0.4em', borderRadius: '0.3em', fontSize: '0.95em', fontFamily: 'monospace' }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
            },
          }}
        />
      </div>
    </div>
  );
};

export default CustomMarkdown;
