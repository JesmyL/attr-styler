import md5 from 'md5';
import fs from 'node:fs';
import { PluginOptions } from '../types/model';

const singleQuoteReg = /'/g;

export class PluginUtils {
  dirName: string;
  generatesDir: string;

  knownFilesSet: Set<string>;
  knownFilesFilePath: string;

  constructor({ srcDirName = '/src' }: PluginOptions = {}) {
    this.dirName = process.cwd().replace(/\\/g, '/');

    this.makeFileImportPath = (fileSrc: string) =>
      `import('../${fileSrc
        .slice(srcDirName.length)
        .replace(singleQuoteReg, "\\'")
        .replace(/\.tsx?$/, '')}');`;

    this.generatesDir = `${this.dirName}${srcDirName === '/' ? '' : srcDirName}/attr-styler.gen` as const;
    this.knownFilesFilePath = `${this.generatesDir}/files.json` as const;

    let knownFiles: string[] = [];

    try {
      knownFiles = JSON.parse(`${fs.readFileSync(this.knownFilesFilePath)}`);
    } catch (_error) {
      if (!fs.existsSync(this.generatesDir)) {
        fs.mkdirSync(this.generatesDir);
      }
    }

    this.knownFilesSet = new Set(knownFiles);
  }

  makeFileImportPath = (fileSrc: string) => fileSrc;

  saveKnownFiles = (_result: boolean | Set<string>) => {
    fs.writeFileSync(this.knownFilesFilePath, JSON.stringify(Array.from(this.knownFilesSet).sort(), null, 4));
  };

  fun = () => {};
  writeFileContent = (modelFilePath: string, content: string) => {
    fs.writeFile(modelFilePath, content, this.fun);
  };

  removeKnownFile = (generatedTypeFilePath: string, fileSrc: string) => {
    try {
      fs.unlinkSync(generatedTypeFilePath);
    } catch (_error) {
      //
    }
    if (this.knownFilesSet.has(fileSrc)) this.saveKnownFiles(this.knownFilesSet.delete(fileSrc));
  };

  takeFilePaths = (src: string) => {
    const fileSrc = src.slice(this.dirName.length + 1);

    return { fileSrc, modelFilePath: `${this.generatesDir}/${md5(fileSrc)}.ts` };
  };
}
