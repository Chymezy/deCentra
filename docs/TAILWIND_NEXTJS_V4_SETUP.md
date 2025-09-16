# Tailwind CSS v4 + Next.js 15+ Integration Guide

This guide documents the correct setup for integrating Tailwind CSS v4 with Next.js 15+ applications, ensuring full compatibility with static export and modern build pipelines.

## Prerequisites
- Next.js v15 or newer
- Tailwind CSS v4
- PostCSS v8+
- Node.js 18+

## 1. Install Dependencies

```bash
npm install tailwindcss@^4 @tailwindcss/postcss postcss autoprefixer
```

## 2. Configure Tailwind
Create or update `tailwind.config.ts` in your project root:

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}',
    // Add any other relevant paths
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

## 3. Configure PostCSS
Create or update `postcss.config.mjs` in your project root:

```js
export default {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
```

## 4. Import Tailwind in CSS
Replace all legacy `@tailwind` directives with a single import in your main CSS file (e.g., `src/app/globals.css`):

```css
@import "tailwindcss";

/* You can add custom styles, animations, and overrides below */
```

- **Do not use** `@tailwind base;`, `@tailwind components;`, or `@tailwind utilities;` in Next.js 15+.
- **Do not use** `@apply` or `@theme` in your CSS files. Use Tailwind utility classes directly in your JSX/TSX components.

## 5. Remove Legacy CSS At-Rules
- Delete all usages of `@apply`, `@theme`, and legacy `@tailwind` directives from your CSS files.
- Refactor custom classes (e.g., `.btn-primary`) to use Tailwind utility classes directly in your components.

## 6. Import CSS in Layout
Ensure your main CSS file is imported in your root layout (e.g., `src/app/layout.tsx`):

```tsx
import './globals.css';
```

## 7. Build and Export
For static export, use:

```bash
npm run build
```

- Next.js 15+ automatically generates a static export if `output: 'export'` is set in `next.config.ts`.
- No need for `next export` or custom export scripts.

## 8. Troubleshooting
- If Tailwind classes are missing, check your `tailwind.config.ts` content paths.
- If you see lint errors for unknown at-rules, ensure you are using `@import "tailwindcss";` and the correct PostCSS plugin.
- If custom styles are not applied, confirm your CSS file is imported in your layout.

## Example: globals.css
```css
@import "tailwindcss";

/* Custom styles, animations, and overrides below */
```

## Example: postcss.config.mjs
```js
export default {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
```

## Example: tailwind.config.ts
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

## References
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs/installation)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [PostCSS Docs](https://postcss.org/)

---
This setup ensures full compatibility and future-proofing for Next.js applications using Tailwind CSS v4. For custom design systems, use Tailwind utility classes directly in your components and avoid legacy CSS at-rules.
