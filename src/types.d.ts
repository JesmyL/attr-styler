declare global {
  interface AriaAttributes {
    id?: string;
  }
  interface DOMAttributes<T> {
    id?: string;
    test?: T;
  }
}

export {};
