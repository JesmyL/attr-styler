## 🕹️Installation and use

```sh
npm install attr-styler
```

### What is needed for work

#### 1. Register plugin

```ts
// vite.config.ts

import { attrStylerVitePlugin } from 'attr-styler';

export default defineConfig(() => {
  return {
    plugins: [attrStylerVitePlugin()],
  };
});
```

#### 2. Start a project

```sh
npm run dev
```

> ### Type parsing occurs only when the project is running!

#### 3. Write your css file with [st-attr="value"]
