import fs from 'node:fs';
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

  const extensions = pluginOptions?.fileExtToAnalize ?? (['.css', '.scss'] as const);
  const includeAttrTypesHere = `[{${Date.now()}-${Math.random()}}]`;
  const fileTemplate =
    pluginOptions?.typeFileTemplate?.({ includeAttrTypesHere }) ??
    `import 'react';\n\ndeclare module 'react' {\n  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {\n    ${includeAttrTypesHere}\n  }\n}\n`;

  const backslashReplacer = (_all: string, $1: string, $2: string) => $1 || $2;
  const sortByEntryKey = (a: [string, string[]?], b: [string, string[]?]) => a[0].localeCompare(b[0]);
  const mapTypeEntries = ([attrName, values]: [string, string[]?]) =>
    `'${attrName}'?: ${Array.from(new Set(values ?? [])).join(' | ')}`;

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
        const value = attrValue?.replace(new RegExp(`(\\\\{2})|\\\\([^${bracket}])`, 'g'), backslashReplacer) ?? "''";

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

      if (!Object.keys(styles).length) {
        pluginUtils.removeKnownFile(modelFilePath, fileSrc);
        return;
      }
      const attrTypesText = Object.entries(styles).sort(sortByEntryKey).map(mapTypeEntries).join(';\n    ') + ';';

      pluginUtils.writeFileContent(
        modelFilePath,
        `${pluginUtils.makeFileImportPath(fileSrc)}\n\n${fileTemplate.replace(includeAttrTypesHere, attrTypesText)}`,
      );
    },
  };
};
