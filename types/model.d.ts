declare interface PluginOptions {
  /** prefix of your attributes
   * default: 'st-'
   */
  prefix?: `${string}-`;
  /** file extensions to analize attr-styles
   * default: ['.css', '.scss', '.attr-styler.ts']
   */
  fileExtToAnalize?: `.${string}`[];

  srcDirName?: string;
  typeFileTemplate?: (props: { includeAttrTypesHere: string }) => string;
}

declare function attrStylerVitePlugin(options?: PluginOptions): {
  name: string;
};

export type TPluginOptions = PluginOptions;
