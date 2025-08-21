import fs from 'fs';
import { attrStylerVitePlugin as pluginMaker } from '../types/model';
import { PluginUtils } from './PluginUtils';

export const attrStylerVitePlugin: typeof pluginMaker = pluginOptions => {
  const defaultPrefix = 'st-';
  const pluginUtils = new PluginUtils(pluginOptions);

  let prefix = pluginOptions?.prefix ?? defaultPrefix;
  if (!prefix.endsWith('-') || prefix.match(/^[^a-z]|[^-a-z_0-9]/i)) {
    console.error(`The prefix '${prefix}' is incorrect. Use please default, '${defaultPrefix}'`);
    prefix = defaultPrefix;
  }
  const typeFilePrefix = `declare module 'react' {\n  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {\n    `;
  const typeFilePostfix = `\n  }\n}\n`;

  const extensions = pluginOptions?.fileExtToAnalize ?? (['.css', '.scss'] as const);

  const backslashReplacer = (_all: string, $1: string, $2: string) => $1 || $2;

  return {
    name: 'attrStylerVitePlugin',
    enforce: 'pre',
    watchChange: async (src: string, change: { event: 'create' | 'update' | 'delete' }) => {
      if (!extensions.some(ext => src.endsWith(ext))) return;

      const { fileSrc, modelFilePath } = pluginUtils.takeFilePaths(src);

      if (change.event === 'delete') {
        pluginUtils.removeKnownFile(modelFilePath, fileSrc);
        return;
      }

      const content = '' + fs.readFileSync(fileSrc);

      const styles: Partial<Record<string, string[]>> = {};
      const reg = new RegExp(`\\[(${prefix}[-a-z0-9_]+?)(([$^*]?)=(('|").*?\\5))?( \\w+)?\\]`, 'g');

      const matches = Array.from(content.matchAll(reg));

      for (const match of matches) {
        const [, attName, , spec, attrValue, bracket] = match;
        const value = attrValue.replace(new RegExp(`(\\\\{2})|\\\\([^${bracket}])`, 'g'), backslashReplacer);

        styles[attName] ??= [];

        switch (spec) {
          case '^':
            styles[attName].push('`${' + value + '}${string}`');
            break;
          case '$':
            styles[attName].push('`${string}${' + value + '}`');
            break;
          case '*':
            styles[attName].push('`${string}${' + value + '}${string}`');
            break;
          default:
            styles[attName].push(value);
        }
      }

      pluginUtils.writeFileContent(
        modelFilePath,
        `${pluginUtils.makeFileImportPath(fileSrc)}\n\n${typeFilePrefix}${Object.entries(styles)
          .map(([attrName, values]) => `'${attrName}'?: ${Array.from(new Set(values ?? [])).join(' | ')}`)
          .join(';\n    ')};${typeFilePostfix}`,
      );
    },
  };
};
