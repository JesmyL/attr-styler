import('../style.test.scss');

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    'other-prefix-attr'?: 123 | '123';
    'q123--AaA'?: -777.54321 | '-777.54321';
    'st-empty'?: '' | number | string;
    'st-go'?: 'BRO' | 'BRO1';
  }
}
