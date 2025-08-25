import('../style1.test.styler.txt');

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    'st-txt'?: -1 | '-1' | 76 | '76' | 88.3 | '88.3' | 'BRO';
    'st-txtStyle'?: 'Text';
  }
}
