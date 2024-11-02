// @types/codemirror.d.ts
declare module "codemirror" {
  export interface Editor {
    // You can add more methods and properties as needed
    getValue: () => string;
    setValue: (value: string) => void;
    on: (
      event: string,
      callback: (instance: Editor, changes: any) => void
    ) => void;
    off: (event: string) => void;
  }

  interface CodeMirror {
    fromTextArea: (textarea: HTMLTextAreaElement, options: any) => Editor;
    // Add other methods if needed
  }

  const CodeMirror: CodeMirror;
  export default CodeMirror;
}
