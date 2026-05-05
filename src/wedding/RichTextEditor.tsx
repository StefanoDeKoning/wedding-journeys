import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, Heading2, Link as LinkIcon, List, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

/**
 * Lightweight contentEditable WYSIWYG. Uses document.execCommand for broad
 * compatibility — sufficient for invitation copy.
 */
export function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync external value into the editor only when it diverges (avoid caret jumps).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
    ref.current?.focus();
  };

  const insertPlaceholder = (token: string) => {
    document.execCommand("insertText", false, token);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const insertLink = () => {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    exec("createLink", url);
  };

  return (
    <div className="rounded-md border border-input bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
        <ToolbarBtn onClick={() => exec("bold")} aria-label="Bold"><Bold className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec("italic")} aria-label="Italic"><Italic className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec("underline")} aria-label="Underline"><Underline className="w-4 h-4" /></ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarBtn onClick={() => exec("formatBlock", "H2")} aria-label="Heading"><Heading2 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec("formatBlock", "P")} aria-label="Paragraph">P</ToolbarBtn>
        <ToolbarBtn onClick={() => exec("insertUnorderedList")} aria-label="List"><List className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={insertLink} aria-label="Link"><LinkIcon className="w-4 h-4" /></ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarBtn onClick={() => exec("undo")} aria-label="Undo"><Undo2 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec("redo")} aria-label="Redo"><Redo2 className="w-4 h-4" /></ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => insertPlaceholder("{{guest_name}}")}>
          + guest name
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => insertPlaceholder("{{plus_one_name}}")}>
          + plus one
        </Button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="prose prose-sm max-w-none min-h-[280px] px-4 py-3 text-sm focus:outline-none [&_h2]:font-display [&_h2]:text-xl [&_p]:my-2 [&_a]:text-primary [&_a]:underline"
      />
    </div>
  );
}

function ToolbarBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="inline-flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      {...props}
    >
      {children}
    </button>
  );
}
