import { readdir, stat } from 'node:fs/promises';
import { URL } from 'url';
import Logger from 'core/logger';

/**
 * @typedef {Function} JSPlugin
 */

/**
 * @param {JSPlugin} structure - Plugin Class, Classes with `Base` in the name are **skipped!**
 * @returns {boolean}
 */
const predicate = (structure) =>
  typeof structure === 'function' &&
  typeof structure.name === 'string' &&
  !/Base/.test(structure.name);

class Plugins {
  constructor() {
    this.pluginMap = new Map();
  }

  /**
   * Loads all the Plugins in the provided directory.
   *
   * @param {boolean} force
   * @param {boolean} recursive - Whether to recursively load the Plugins in the directory
   * @returns {Promise<object>}
   */
  async getPlugins(force = false, recursive = false) {
    if (this.pluginMap.size !== 0  && !force) return this.toObj();

    const plugins = await this.loadPlugins(force, new URL('./', import.meta.url), recursive);

    for (const Plugin of plugins) {
      if (!Plugin.name) continue;
      Logger.verbose('Plugins', 1, `Loading plugin file ${Plugin.name}...`);
      this.pluginMap.set(Plugin.name, Plugin);
    }
    return this.toObj();
  }

  /**
   * Loads all the Plugins in the provided directory.
   *
   * @template T
   * @param {boolean} force
   * @param {import('node:fs').PathLike} dir - The directory to load the Plugins from
   * @param {boolean} recursive - Whether to recursively load the Plugins in the directory
   * @returns {Promise<T[]>}
   */
  async loadPlugins(force = false, dir, recursive = true) {
    // Get the stats of the directory
    const statDir = await stat(dir);

    // If the provided directory path is not a directory, throw an error
    if (!statDir.isDirectory()) {
      throw new Error(`The directory '${dir}' is not a directory.`);
    }

    // Get all the files in the directory
    const files = await readdir(dir);

    // Create an empty array to store the plugins
    const plugins = [];

    // Loop through all the files in the directory
    for (const file of files) {
      // If the file is index.js, base plugin, or the file does not end with .js, skip the file
			if (file === 'index.js' || /base[\w-]+\.js/.test(file) || !file.endsWith('.js')) {
				continue;
			}

      // Get the stats of the file
      const statFile = await stat(new URL(`${dir}/${file}`));

      // If the file is a directory and recursive is true, recursively load the plugins in the directory
      if (statFile.isDirectory() && recursive) {
        plugins.push(...(await this.loadPlugins(force, `${dir}/${file}`, recursive)));
        continue;
      }

      // Import the plugin dynamically from the file
      const Plugin = (await import(`${dir}/${file}`)).default;
			
      if (predicate(plugins)) plugins.push(Plugin);
    }

    return plugins;
  }

  toObj() {
    if ( this.pluginMap.size === 0 ) {
      return null
    }
    const obj = {};
    for ( const [k, v] of this.pluginMap ) {
      obj[k] = v;
    }
    return obj
  }
}

export default new Plugins();
