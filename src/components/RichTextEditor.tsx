import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Table,
  Eraser,
  Undo2,
  Redo2,
  Code,
  Eye,
  Sparkles,
  Check,
  HelpCircle
} from "lucide-react";

interface RichTextEditorProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minHeight?: string;
  helpText?: string;
  darkMode?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value = "",
  onChange,
  placeholder = "İçeriğinizi buraya yazın veya biçimlendirin...",
  minHeight = "160px",
  helpText,
  darkMode = false
}) => {
  const [viewMode, setViewMode] = useState<"visual" | "html">("visual");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    ul: false,
    ol: false,
    h1: false,
    h2: false,
    h3: false,
    quote: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>(value || "");
  const savedSelectionRef = useRef<Range | null>(null);

  // Sync external value changes into the contentEditable if different
  useEffect(() => {
    if (editorRef.current && (value || "") !== lastHtmlRef.current) {
      editorRef.current.innerHTML = value || "";
      lastHtmlRef.current = value || "";
    }
  }, [value]);

  // Update active formatting states based on current selection
  const updateToolbarState = () => {
    if (typeof document === "undefined" || viewMode !== "visual") return;
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strike: document.queryCommandState("strikeThrough"),
        ul: document.queryCommandState("insertUnorderedList"),
        ol: document.queryCommandState("insertOrderedList"),
        h1: document.queryCommandValue("formatBlock").toLowerCase() === "h1",
        h2: document.queryCommandValue("formatBlock").toLowerCase() === "h2",
        h3: document.queryCommandValue("formatBlock").toLowerCase() === "h3",
        quote: document.queryCommandValue("formatBlock").toLowerCase() === "blockquote",
        alignLeft: document.queryCommandState("justifyLeft"),
        alignCenter: document.queryCommandState("justifyCenter"),
        alignRight: document.queryCommandState("justifyRight")
      });
    } catch {
      // ignore
    }
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    // If user cleared everything leaving only <br> or empty paragraph, normalize
    const cleanHtml = (html === "<p><br></p>" || html === "<br>") ? "" : html;
    lastHtmlRef.current = cleanHtml;
    onChange(cleanHtml);
    updateToolbarState();
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (viewMode !== "visual") return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  const openLinkDialog = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : "";
    setLinkText(selectedText);
    setLinkUrl("");
    setShowLinkModal(true);
  };

  const handleApplyLink = () => {
    if (!linkUrl.trim()) return;
    restoreSelection();
    const formattedUrl = linkUrl.startsWith("http://") || linkUrl.startsWith("https://") || linkUrl.startsWith("mailto:") || linkUrl.startsWith("tel:")
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`;

    if (linkText && (!savedSelectionRef.current || savedSelectionRef.current.collapsed)) {
      const linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="text-amber-600 underline hover:text-amber-700">${linkText}</a>`;
      execCmd("insertHTML", linkHtml);
    } else {
      execCmd("createLink", formattedUrl);
    }
    setShowLinkModal(false);
  };

  const handleRemoveLink = () => {
    execCmd("unlink");
    setShowLinkModal(false);
  };

  const handleInsertTable = () => {
    restoreSelection();
    let tableHtml = `<table class="w-full my-3 border-collapse border border-slate-300 rounded-lg overflow-hidden text-xs"><thead><tr class="bg-slate-100">`;
    for (let c = 1; c <= tableCols; c++) {
      tableHtml += `<th class="border border-slate-300 p-2 font-bold text-left">Başlık ${c}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;
    for (let r = 1; r <= tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 1; c <= tableCols; c++) {
        tableHtml += `<td class="border border-slate-300 p-2">Hücre ${r}-${c}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;
    execCmd("insertHTML", tableHtml);
    setShowTableModal(false);
  };

  const handleFormatHeading = (tag: string) => {
    // If currently already that tag, toggle back to normal paragraph <p>
    const currentBlock = document.queryCommandValue("formatBlock").toLowerCase();
    if (currentBlock === tag) {
      execCmd("formatBlock", "<p>");
    } else {
      execCmd("formatBlock", `<${tag}>`);
    }
  };

  const handleClearFormat = () => {
    execCmd("removeFormat");
    execCmd("formatBlock", "<p>");
  };

  const handleSmartBeautify = () => {
    if (!editorRef.current) return;
    const rawText = editorRef.current.innerText || editorRef.current.textContent || "";
    if (!rawText.trim()) return;

    // Convert plain lines to clean paragraphs and bullet points
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    let formattedHtml = "";
    let inList = false;

    lines.forEach((line) => {
      const isBullet = line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ");
      const isHeader = line.endsWith(":") || (line.length < 50 && !line.endsWith("."));

      if (isBullet) {
        if (!inList) {
          formattedHtml += '<ul class="list-disc pl-5 my-2 space-y-1">';
          inList = true;
        }
        const cleanItem = line.replace(/^[-*•]\s*/, "");
        formattedHtml += `<li>${cleanItem}</li>`;
      } else {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        if (isHeader) {
          formattedHtml += `<h3 class="text-base font-bold text-slate-800 mt-3 mb-1.5">${line}</h3>`;
        } else {
          formattedHtml += `<p class="mb-2 leading-relaxed text-slate-700">${line}</p>`;
        }
      }
    });

    if (inList) {
      formattedHtml += '</ul>';
    }

    editorRef.current.innerHTML = formattedHtml;
    handleEditorInput();
  };

  // Word and character count computation
  const getStats = () => {
    const text = (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const chars = text.length;
    const words = text ? text.split(" ").length : 0;
    const readTimeMin = Math.max(1, Math.ceil(words / 150));
    return { chars, words, readTimeMin };
  };

  const stats = getStats();

  return (
    <div className="space-y-1.5 w-full">
      {/* Header with Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        {label && (
          <label className={`block text-xs font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
            {label}
          </label>
        )}
        <div className="flex items-center gap-2">
          {/* Quick AI Beautify */}
          <button
            type="button"
            onClick={handleSmartBeautify}
            title="Düz metni akıllı paragraflara ve madde imlerine otomatik dönüştür"
            className="text-[11px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-amber-500/10"
          >
            <Sparkles className="w-3 h-3" />
            <span>Otomatik Biçimlendir</span>
          </button>

          {/* Mode Switcher */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "visual" ? "html" : "visual")}
            className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
              darkMode 
                ? "text-slate-400 hover:text-white hover:bg-slate-800" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {viewMode === "visual" ? (
              <>
                <Code className="w-3 h-3" />
                <span>HTML Kodu Göster</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Görsel WYSIWYG Mod</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className={`rounded-xl border overflow-hidden transition-all shadow-xs ${
        darkMode 
          ? "bg-slate-950 border-slate-800 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/50" 
          : "bg-white border-slate-300 focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800"
      }`}>
        {/* WYSIWYG Toolbar (Visual Mode Only) */}
        {viewMode === "visual" && (
          <div className={`flex flex-wrap items-center gap-1 p-1.5 border-b select-none ${
            darkMode 
              ? "bg-slate-900/90 border-slate-800 text-slate-300" 
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            {/* History */}
            <button
              type="button"
              onClick={() => execCmd("undo")}
              title="Geri Al (Ctrl+Z)"
              className="p-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("redo")}
              title="Yinele (Ctrl+Y)"
              className="p-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <div className={`h-4 w-px mx-0.5 ${darkMode ? "bg-slate-800" : "bg-slate-300"}`} />

            {/* Headings */}
            <button
              type="button"
              onClick={() => handleFormatHeading("h2")}
              title="Ana Başlık (H2)"
              className={`px-2 py-1 rounded text-xs font-black transition-colors ${
                activeFormats.h2 
                  ? "bg-amber-500 text-slate-950 shadow-xs" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => handleFormatHeading("h3")}
              title="Alt Başlık (H3)"
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                activeFormats.h3 
                  ? "bg-amber-500 text-slate-950 shadow-xs" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<p>")}
              title="Normal Paragraf"
              className="px-2 py-1 rounded text-xs font-medium hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              &para; Paragraf
            </button>

            <div className={`h-4 w-px mx-0.5 ${darkMode ? "bg-slate-800" : "bg-slate-300"}`} />

            {/* Basic Formatting */}
            <button
              type="button"
              onClick={() => execCmd("bold")}
              title="Kalın (Ctrl+B)"
              className={`p-1.5 rounded transition-colors ${
                activeFormats.bold 
                  ? "bg-amber-500 text-slate-950 font-bold" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("italic")}
              title="İtalik (Ctrl+I)"
              className={`p-1.5 rounded transition-colors ${
                activeFormats.italic 
                  ? "bg-amber-500 text-slate-950" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("underline")}
              title="Altı Çizili (Ctrl+U)"
              className={`p-1.5 rounded transition-colors ${
                activeFormats.underline 
                  ? "bg-amber-500 text-slate-950" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("strikeThrough")}
              title="Üstü Çizili"
              className={`p-1.5 rounded transition-colors ${
                activeFormats.strike 
                  ? "bg-amber-500 text-slate-950" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <div className={`h-4 w-px mx-0.5 ${darkMode ? "bg-slate-800" : "bg-slate-300"}`} />

            {/* Alignment */}
            <button
              type="button"
              onClick={() => execCmd("justifyLeft")}
              title="Sola Hizala"
              className={`p-1.5 rounded transition-colors ${
                activeFormats.alignLeft 
                  ? "bg-amber-500 text-slate-950" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("justifyCenter")}
              title="Ortala"
              className={`p-1.5 rounded transition-colors ${
                activeFormats.alignCenter 
                  ? "bg-amber-500 text-slate-950" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("justifyRight")}
              title="Sağa Hizala"
              className={`p-1.5 rounded transition-colors ${
                activeFormats.alignRight 
                  ? "bg-amber-500 text-slate-950" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>

            <div className={`h-4 w-px mx-0.5 ${darkMode ? "bg-slate-800" : "bg-slate-300"}`} />

            {/* Lists */}
            <button
              type="button"
              onClick={() => execCmd("insertUnorderedList")}
              title="Madde İşaretli Liste"
              className={`p-1.5 rounded transition-colors ${
                activeFormats.ul 
                  ? "bg-amber-500 text-slate-950" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("insertOrderedList")}
              title="Numaralı Liste"
              className={`p-1.5 rounded transition-colors ${
                activeFormats.ol 
                  ? "bg-amber-500 text-slate-950" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormatHeading("blockquote")}
              title="Alıntı / Vurgu Kutusu"
              className={`p-1.5 rounded transition-colors ${
                activeFormats.quote 
                  ? "bg-amber-500 text-slate-950" 
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <div className={`h-4 w-px mx-0.5 ${darkMode ? "bg-slate-800" : "bg-slate-300"}`} />

            {/* Insert Elements */}
            <button
              type="button"
              onClick={openLinkDialog}
              title="Bağlantı Ekle (Link)"
              className="p-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors text-amber-600 dark:text-amber-400"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowTableModal(true)}
              title="Tablo Ekle"
              className="p-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("insertHorizontalRule")}
              title="Yatay Çizgi (Ayraç)"
              className="p-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Clear Format */}
            <button
              type="button"
              onClick={handleClearFormat}
              title="Seçili Alanın Biçimlendirmesini Temizle"
              className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-500 transition-colors ml-auto"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Link Modal Popup */}
        {showLinkModal && (
          <div className="p-3 bg-amber-50 dark:bg-slate-900 border-b border-amber-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-amber-600" />
              Bağlantı Ekle:
            </span>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Görünen Metin (Opsiyonel)"
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
            />
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="URL (https://...)"
              className="flex-1 min-w-[180px] px-2.5 py-1 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
            >
              Ekle
            </button>
            <button
              type="button"
              onClick={handleRemoveLink}
              className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
            >
              Kaldır
            </button>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="text-slate-400 hover:text-slate-600 ml-auto"
            >
              ✕
            </button>
          </div>
        )}

        {/* Table Insert Popup */}
        {showTableModal && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Table className="w-3.5 h-3.5 text-amber-500" />
              Tablo Oluştur:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Satır:</span>
              <input
                type="number"
                min={1}
                max={10}
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value) || 2)}
                className="w-12 px-1.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-center text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Sütun:</span>
              <input
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value) || 2)}
                className="w-12 px-1.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-center text-xs"
              />
            </div>
            <button
              type="button"
              onClick={handleInsertTable}
              className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
            >
              Tabloyu Ekle
            </button>
            <button
              type="button"
              onClick={() => setShowTableModal(false)}
              className="text-slate-400 hover:text-slate-600 ml-auto"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. VISUAL WYSIWYG CANVAS */}
        {viewMode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onKeyUp={updateToolbarState}
            onMouseUp={updateToolbarState}
            onFocus={updateToolbarState}
            onBlur={handleEditorInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className={`w-full p-3.5 text-sm outline-none overflow-y-auto leading-relaxed focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none ${
              darkMode 
                ? "text-slate-200 prose-invert" 
                : "text-slate-800"
            } [&>h1]:text-xl [&>h1]:font-black [&>h1]:mt-3 [&>h1]:mb-1.5 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-2.5 [&>h2]:mb-1 [&>h3]:text-base [&>h3]:font-bold [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-2 [&>blockquote]:border-l-4 [&>blockquote]:border-amber-500 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:my-2 [&>blockquote]:bg-amber-50/20 [&>blockquote]:py-1 [&>blockquote]:rounded-r [&>a]:text-amber-600 [&>a]:underline [&>table]:w-full [&>table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_th]:bg-slate-100 dark:[&_th]:bg-slate-900 [&>hr]:my-3 [&>hr]:border-slate-300 dark:[&>hr]:border-slate-800`}
          />
        ) : (
          /* 2. HTML SOURCE CODE MODE */
          <div className="p-2 bg-slate-950">
            <textarea
              value={value || ""}
              onChange={(e) => {
                lastHtmlRef.current = e.target.value;
                onChange(e.target.value);
              }}
              style={{ minHeight }}
              placeholder={placeholder}
              className="w-full p-3 text-xs font-mono text-emerald-400 bg-slate-950 outline-none resize-y leading-relaxed border-0 focus:ring-0"
            />
          </div>
        )}

        {/* Footer Info Bar */}
        <div className={`flex items-center justify-between px-3 py-1.5 text-[11px] border-t select-none ${
          darkMode 
            ? "bg-slate-900/60 border-slate-800 text-slate-500" 
            : "bg-slate-50 border-slate-200 text-slate-400"
        }`}>
          <div className="flex items-center gap-3">
            <span>{stats.words} kelime</span>
            <span>{stats.chars} karakter</span>
            <span>~{stats.readTimeMin} dk okuma</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-medium">
            <Check className="w-3 h-3 text-emerald-500" />
            <span>WYSIWYG Aktif</span>
          </div>
        </div>
      </div>

      {helpText && (
        <p className={`text-[11px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          {helpText}
        </p>
      )}
    </div>
  );
};
