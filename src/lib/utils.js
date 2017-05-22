import walk from 'walk';
import fsp from 'fs-promise';
import { typeOf } from 'lutils';
import path from 'path';

/**
 * Creates a walker.
 *
 * @param {*[]} args list of args
 *
 * @returns {Object} walker instance
 */
export function walker(...args) {
  const wker = walk.walk(...args);

  wker.end = () => new Promise((resolve, reject) => {
    wker.on('error', reject);
    wker.on('end', resolve);
  });

  return wker;
}

/**
 *  Normalizes transforming and zip allocation for walked files.
 *  Used by SourceBundler & ModuleBundler.
 */
export async function handleFile({
    filePath, relPath,
  artifact, zipConfig, useSourceMaps,
  transformExtensions, transforms,
}) {
  const extname = path.extname(filePath);
  const isTransformable = transformExtensions.some(ext => `.${ext}` === extname.toLowerCase());

  // TODO: make each transformer check extensions itself, and concat their
  // extension whitelist to check here.
  if (isTransformable) {
    //
    // JAVASCRIPT
    //

    let code = await fsp.readFile(filePath, 'utf8');
    let map = '';

    /**
     *  Runs transforms against the code, mutating the code & map
     *  with each iteration, optionally producing source maps
     */
    if (transforms.length) {
      for (const transformer of transforms) {
        const result = transformer.run({ code, map, filePath, relPath });

        if (result.code) {
          code = result.code;
          if (result.map) map = result.map;
        }
      }
    }

    artifact.addBuffer(new Buffer(code), relPath, zipConfig);

    if (useSourceMaps && map) {
      if (typeOf.isObject(map)) map = JSON.stringify(map);

      artifact.addBuffer(new Buffer(map), `${relPath}.map`, zipConfig);
    }
  } else {
    //
    // ARBITRARY FILES
    //

    artifact.addFile(filePath, relPath, zipConfig);
  }

  return artifact;
}
