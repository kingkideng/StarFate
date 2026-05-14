import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  children: string;
  streaming?: boolean;
}

function getStableMarkdown(markdown: string, streaming?: boolean) {
  if (!streaming) return markdown;

  const lines = markdown.split('\n');
  const lastLine = lines[lines.length - 1] || '';
  const openBold = (lastLine.match(/\*\*/g) || []).length % 2 === 1;
  const openInlineCode = (lastLine.match(/`/g) || []).length % 2 === 1;
  const headingOnly = /^#{1,6}\s*$/.test(lastLine);
  const listMarkerOnly = /^\s*[-*+]\s*$/.test(lastLine);

  if (openBold || openInlineCode || headingOnly || listMarkerOnly) {
    return lines.slice(0, -1).join('\n');
  }

  return markdown;
}

export default function MarkdownContent({ children, streaming }: MarkdownContentProps) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{getStableMarkdown(children, streaming)}</ReactMarkdown>;
}
