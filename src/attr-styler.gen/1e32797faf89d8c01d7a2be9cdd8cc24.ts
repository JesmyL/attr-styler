import('../style.test.styler');

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    'st-go1'?: 'BRO' | 'Other';
    'st-style'?: 'Ab[b-]-A';
  }
}
