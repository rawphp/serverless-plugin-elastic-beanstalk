import path from 'path';
import fsp from 'fs-promise';
import { typeOf, } from 'lutils';
import glob from 'minimatch';

import { walker, handleFile } from './utils';
import BabelTransform from './transforms/Babel';

/**
 * Handles the inclusion of source code in the artifact.
 */
export default class SourceBundler {
  constructor(config = {}, artifact) {
    this.config = {
      servicePath: '',   // serverless.config.servicePath
      babel: null,       // Babel options
      sourceMaps: false, // Whether to add source maps
      zip: null,         // Yazl zip options
      ...config,
    };

    this.log = this.config.log || (() => { });

    this.artifact = artifact;
  }

  /**
   *  Walks through, transforms, and zips source content wich
   *  is both `included` and not `excluded` by the regex or glob patterns.
   */
  async bundle({ exclude = [], include = [] }) {
    const transforms = await this._createTransforms();

    const onFile = async (basePath, stats, next) => {
      /**
       *  A relative path to the servicePath
       *  @example ./functions/test/handler.js
       */
      const relPath = path.join(
        basePath.split(this.config.servicePath)[1], stats.name,
      ).replace(/^\/|\/$/g, '');

      const filePath = path.join(basePath, stats.name);

      const testPattern = (pattern) => {
        return typeOf.isRegExp(pattern)
          ? pattern.test(relPath)
          : glob(relPath, pattern, { dot: true });
      };

      const included = include.some(testPattern);
      const excluded = exclude.some(testPattern);

      /**
      *  When a pattern matches an exclude, it skips
      *  When a pattern doesnt match an include, it skips
      */
      if (!included || (excluded && !included)) return next();

      await handleFile({
        filePath,
        relPath,
        transforms,
        transformExtensions: ['js', 'jsx'],
        useSourceMaps: this.config.sourceMaps,
        artifact: this.artifact,
        zipConfig: this.config.zip,
      });

      this.log(`[SOURCE] ${relPath}`);

      return next();
    };

    // We never want node_modules here
    await walker(this.config.servicePath, { filters: [/\/node_modules\//i] })
      .on('file', onFile)
      .end();

    return this.artifact;
  }

  /**
   * Create a list of transforms.
   *
   * @returns {Object[]} list of transforms
   *
   * @private
   */
  async _createTransforms() {
    const transforms = [];

    if (this.config.babel) {
      let babelQuery = this.config.babel;

      if (!typeOf.isObject(babelQuery)) {
        const babelrcPath = path.join(this.config.servicePath, '.babelrc');

        babelQuery = fsp.existsSync(babelrcPath)
          ? JSON.parse(await fsp.readFile(babelrcPath))
          : babelQuery;
      }

      transforms.push(new BabelTransform(babelQuery));
    }

    return transforms;
  }
}
