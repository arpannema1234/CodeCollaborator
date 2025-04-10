declare module "codemirror" {
  export interface Editor {
    toTextArea(): void; // More accurate return type (not `unknown`)
    getValue(): string;
    setValue(value: string): void;
    on(event: string, callback: (instance: Editor, changes: any) => void): void;
    off(event: string, callback?: (instance: Editor) => void): void;
  }

  export interface EditorConfiguration {
    mode?: string | { name: string; json?: boolean };
    theme?: string;
    lineNumbers?: boolean;
    autoCloseTags?: boolean;
    autoCloseBrackets?: boolean;
    // Add more options as needed
  }

  declare function CodeMirror(
    textarea: HTMLTextAreaElement,
    options?: EditorConfiguration
  ): Editor;

  declare namespace CodeMirror {
    function fromTextArea(textarea: HTMLTextAreaElement, options?: EditorConfiguration): Editor;
  }

  export default CodeMirror;
}
