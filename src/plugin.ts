import fs from 'node:fs';
import { attrStylerVitePlugin as pluginMaker } from '../types/model';
import { PluginUtils } from './PluginUtils';

export const attrStylerVitePlugin: typeof pluginMaker = pluginOptions => {
  const defaultPrefix = 'st-' as const;
  const pluginUtils = new PluginUtils(pluginOptions);

  const prefixes = (pluginOptions?.prefixes ?? [defaultPrefix]).filter(prefix => {
    if (!prefix.endsWith('-') || prefix.match(/^[^a-z]|[^-a-z_0-9]/i)) {
      console.error(`The prefix '${prefix}' is incorrect. Use please default, '${defaultPrefix}'`);
      return false;
    }

    return true;
  });

  if (!prefixes.length || prefixes.length !== pluginOptions?.prefixes?.length) prefixes.push(defaultPrefix);
  const prefixesRegStr = Array.from(new Set(prefixes)).join('|');

  const extensions = pluginOptions?.fileExtToAnalize ?? (['.css', '.scss', '.attr-styler.ts'] as const);
  const includeAttrTypesHere = `@_%-%${Date.now()}%-%_@`;
  const fileTemplate =
    (pluginOptions?.typeFileTemplate?.({ includeAttrTypesHere }).trim() ??
      `import 'react';\n\ndeclare module 'react' {\n  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {\n    ${includeAttrTypesHere}\n  }\n}\n`) +
    '\n';

  const [, indent] = fileTemplate.match(new RegExp(`\\n?(\\s*)${includeAttrTypesHere}`)) ?? ['', ' '];

  const backslashReplacer = (_all: string, $1: string, $2: string) => $1 || $2;
  const sortByEntryKey = (a: [string, Set<string>?], b: [string, Set<string>?]) => a[0].localeCompare(b[0]);
  const sortByEntryValues = (a: string, b: string) => {
    return (a.startsWith('"') || a.startsWith("'") ? a.slice(1) : a).localeCompare(
      b.startsWith('"') || b.startsWith("'") ? b.slice(1) : b,
    );
  };
  const emptySet = new Set<string>();

  const mapTypeEntries = ([attrName, values]: [string, Set<string>?]) => {
    const valuesSet = values ?? emptySet;
    if (valuesSet.size > 2 && valuesSet.has('string') && valuesSet.has('number')) {
      valuesSet.delete('string');
      valuesSet.delete('number');
    }

    return `'${attrName}'?: ${Array.from(valuesSet).sort(sortByEntryValues).join(' | ')}`;
  };

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

      const styles: Partial<Record<string, Set<string>>> = {};
      const numericStr = '-?\\d+(\\.\\d+)?';
      const reg = new RegExp(
        `\\[((${prefixesRegStr})[-a-zA-Z0-9_]+?)(([$^*]?)=(('|")((${numericStr})|.*?)\\6|(${numericStr})|([a-zA-Z_]+)))? ?[si]?\\]`,
        'g',
      );

      const matches = Array.from(content.matchAll(reg));

      for (const match of matches) {
        const [
          ,
          attName,
          ,
          specialValue,
          specificator,
          wholeValue,
          bracket,
          ,
          numberInBracketsValue,
          ,
          numericValue,
          ,
          wordValue,
        ] = match;
        let value = wholeValue?.replace(new RegExp(`(\\\\{2})|\\\\([^${bracket}])`, 'g'), backslashReplacer) ?? "''";

        styles[attName] ??= new Set();

        if (!specialValue) {
          styles[attName].add('string');
          styles[attName].add('number');
          continue;
        }

        if (numericValue) {
          styles[attName].add(`'${value}'`);
          styles[attName].add(value);
          continue;
        }

        if (numberInBracketsValue) {
          styles[attName].add(value.slice(1, -1));
          styles[attName].add(value);
          continue;
        }

        if (wordValue) value = `'${value}'`;

        switch (specificator) {
          case '^':
            styles[attName].add('`${' + value + '}${string}`');
            break;
          case '$':
            styles[attName].add('`${string}${' + value + '}`');
            break;
          case '*':
            styles[attName].add('`${string}${' + value + '}${string}`');
            break;
          default:
            styles[attName].add(value);
        }
      }

      if (!Object.keys(styles).length) {
        pluginUtils.removeKnownFile(modelFilePath, fileSrc);
        return;
      }
      const attrTypesText = Object.entries(styles).sort(sortByEntryKey).map(mapTypeEntries).join(`;\n${indent}`) + ';';

      pluginUtils.writeFileContent(
        modelFilePath,
        `${pluginUtils.makeFileImportPath(fileSrc)}\n\n${fileTemplate.replace(includeAttrTypesHere, attrTypesText)}`,
      );
    },
  };
};
