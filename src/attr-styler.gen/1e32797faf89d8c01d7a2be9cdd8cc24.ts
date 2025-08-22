import('../style.test.styler');

import 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    'st-go1'?: 'Other' | 'BRO';
    'st-style'?: 'Ab[b-]-A';
  }
}
