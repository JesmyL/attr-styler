import('../style.test.scss');

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    'st-empty'?: '';
    'st-go'?: 'BRO' | 'BRO1';
  }
}
