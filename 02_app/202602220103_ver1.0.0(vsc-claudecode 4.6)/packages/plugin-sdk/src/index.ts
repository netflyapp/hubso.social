/**
 * @hubso/plugin-sdk
 *
 * SDK for building Hubso.social plugins.
 * Provides TypeScript types, Zod schemas, and utilities.
 */

export * from './types';

/**
 * Helper to define a plugin with type safety
 */
export function definePlugin(plugin: import('./types').HubsoPlugin): import('./types').HubsoPlugin {
  return plugin;
}

/**
 * Helper to define a plugin manifest
 */
export function defineManifest(manifest: import('./types').PluginManifest): import('./types').PluginManifest {
  return manifest;
}

/**
 * Validate a plugin manifest against the Zod schema
 */
export function validateManifest(manifest: unknown): import('./types').PluginManifest {
  const { PluginManifestSchema } = require('./types');
  return PluginManifestSchema.parse(manifest);
}
