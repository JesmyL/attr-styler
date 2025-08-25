import('../style1.test.scss');

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    'st-test'?: 23 | '23' | 'BRO' | 'Other';
    'st-test-style'?: 'Ab[b-]-A';
  }
}
