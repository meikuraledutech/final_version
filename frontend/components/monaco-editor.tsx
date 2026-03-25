"use client";

import { useEffect, useRef, useCallback } from "react";

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange?: (value: string) => void;
  height?: string;
  theme?: "vs" | "vs-dark";
}

interface MonacoType {
  editor: {
    create: (container: HTMLElement, options: EditorOptions) => Editor;
    setModelLanguage: (model: unknown, language: string) => void;
  };
}

interface EditorOptions {
  value: string;
  language: string;
  theme: string;
  automaticLayout: boolean;
  minimap: { enabled: boolean };
  fontSize: number;
  fontFamily: string;
  lineNumbers: string;
  scrollBeyondLastLine: boolean;
}

interface Editor {
  getValue: () => string;
  setValue: (value: string) => void;
  getModel: () => unknown;
  onDidChangeModelContent: (callback: () => void) => void;
}

declare global {
  interface Window {
    monaco?: MonacoType;
    require?: {
      config: (options: { paths: Record<string, string> }) => void;
      (modules: string[], callback: () => void): void;
    };
  }
}

export default function MonacoEditor({
  language,
  value,
  onChange,
  height = "100%",
  theme = "vs",
}: MonacoEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const monacoLoadedRef = useRef(false);
  const scriptLoadedRef = useRef(false);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) return;

    scriptLoadedRef.current = true;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.min.js";
    script.async = true;

    script.onload = () => {
      if (!window.monaco) {
        (window as any).require.config({
          paths: {
            vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
          },
        });

        (window as any).require(["vs/editor/editor.main"], () => {
          monacoLoadedRef.current = true;
          if (containerRef.current && !editorRef.current && !isInitializingRef.current) {
            initializeEditor();
          }
        });
      } else {
        monacoLoadedRef.current = true;
        if (containerRef.current && !editorRef.current && !isInitializingRef.current) {
          initializeEditor();
        }
      }
    };

    document.head.appendChild(script);
  }, []);

  const initializeEditor = useCallback(() => {
    if (!containerRef.current || !window.monaco || editorRef.current || isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;

    try {
      editorRef.current = window.monaco.editor.create(containerRef.current, {
        value,
        language,
        theme,
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "Fira Code, Monaco, monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
      });

      if (onChange) {
        editorRef.current.onDidChangeModelContent(() => {
          onChange(editorRef.current?.getValue() ?? "");
        });
      }
    } catch (error) {
      console.error("Failed to create Monaco editor:", error);
    } finally {
      isInitializingRef.current = false;
    }
  }, [value, language, theme, onChange]);

  // Try to initialize if Monaco is loaded
  useEffect(() => {
    if (monacoLoadedRef.current && !editorRef.current && !isInitializingRef.current && containerRef.current) {
      initializeEditor();
    }
  }, [initializeEditor]);

  // Update language when it changes
  useEffect(() => {
    if (editorRef.current && window.monaco && monacoLoadedRef.current) {
      try {
        const model = editorRef.current.getModel();
        if (model) {
          window.monaco.editor.setModelLanguage(model, language);
        }
      } catch (error) {
        console.error("Failed to change language:", error);
      }
    }
  }, [language]);

  // Update value when it changes externally
  useEffect(() => {
    if (editorRef.current && monacoLoadedRef.current) {
      try {
        const currentValue = editorRef.current.getValue();
        if (currentValue !== value) {
          editorRef.current.setValue(value);
        }
      } catch (error) {
        console.error("Failed to set value:", error);
      }
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width: "100%",
      }}
    />
  );
}
