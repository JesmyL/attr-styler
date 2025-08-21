declare interface PluginOptions {
  /** prefix of your attributes
   * default: 'st-'
   */
  prefix?: `${string}-`;
  /** file extensions to analize attr-styles
   * default:s ['.css', '.scss']
   */
  fileExtToAnalize?: `.${string}`[];

  srcDirName?: string;
}

declare function attrStylerVitePlugin(options?: PluginOptions): {
  name: string;
};

export type TPluginOptions = PluginOptions;
