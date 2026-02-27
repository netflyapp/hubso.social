/**
 * @hubso/plugin-sdk — Core types and interfaces for Hubso plugins
 *
 * This SDK defines the contract between Hubso Core and plugins.
 * Plugins implement HubsoPlugin interface and use the provided APIs
 * to register routes, sidebar items, settings, hooks, widgets, and permissions.
 */

import { z } from 'zod';

// ─── Plugin Categories ───────────────────────────────────────────

export type PluginCategory =
  | 'LMS'
  | 'E_COMMERCE'
  | 'CRM'
  | 'BOOKING'
  | 'SOCIAL'
  | 'ANALYTICS'
  | 'AI'
  | 'INTEGRATIONS'
  | 'GAMIFICATION'
  | 'HEALTH'
  | 'CONTENT'
  | 'COMMUNICATION'
  | 'OTHER';

export type PluginStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'INSTALLING' | 'UPDATING';

export type PluginPricing = 'FREE' | 'PAID' | 'FREEMIUM';

// ─── Plugin Author ───────────────────────────────────────────────

export interface PluginAuthor {
  name: string;
  email?: string;
  url?: string;
  avatar?: string;
  verified?: boolean;
}

// ─── Plugin Manifest ─────────────────────────────────────────────

export interface PluginManifest {
  /** Unique plugin ID, e.g. "hubso-courses" */
  id: string;
  /** Display name */
  name: string;
  /** Semver version */
  version: string;
  /** Human-readable description */
  description: string;
  /** Author info */
  author: PluginAuthor;
  /** Minimum Hubso version required */
  hubsoVersion: string;
  /** Required permissions*/
  permissions: string[];
  /** Other plugins this one depends on */
  dependencies: string[];
  /** Pricing model */
  pricing: PluginPricing;
  /** Price in USD (if paid) */
  price?: number;
  /** Category */
  category: PluginCategory;
  /** Icon URL or icon name (Solar Icons) */
  icon?: string;
  /** Cover image URL */
  coverImage?: string;
  /** Screenshots URLs */
  screenshots?: string[];
  /** Tags for search */
  tags?: string[];
  /** Repository URL */
  repository?: string;
  /** Documentation URL */
  docs?: string;
  /** Changelog URL */
  changelog?: string;
  /** Whether this is an official Hubso plugin */
  official?: boolean;
}

// ─── Plugin Router API ───────────────────────────────────────────

export interface PluginRouteDefinition {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Path relative to plugin root, e.g. "/lessons" */
  path: string;
  /** Handler function */
  handler: (ctx: PluginRequestContext) => Promise<unknown>;
  /** Require authentication? */
  auth?: boolean;
  /** Required roles */
  roles?: string[];
  /** Description for docs */
  description?: string;
}

export interface PluginRequestContext {
  userId?: string;
  communityId?: string;
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string>;
}

export interface PluginRouter {
  /** Register a route under /api/plugins/{pluginId}/... */
  addRoute(route: PluginRouteDefinition): void;
  /** Get all registered routes */
  getRoutes(): PluginRouteDefinition[];
}

// ─── Sidebar API ─────────────────────────────────────────────────

export interface SidebarItem {
  /** Unique key */
  id: string;
  /** Display label */
  label: string;
  /** Icon name (Solar Icons via Iconify) */
  icon: string;
  /** Navigation href */
  href: string;
  /** Section to add to: 'main' | 'community' | 'admin' */
  section: 'main' | 'community' | 'admin';
  /** Sort order within section */
  order?: number;
  /** Badge count (e.g. unread) */
  badge?: number;
  /** Sub-items */
  children?: SidebarItem[];
}

export interface SidebarAPI {
  /** Add a navigation item to sidebar */
  addItem(item: SidebarItem): void;
  /** Remove a navigation item */
  removeItem(id: string): void;
  /** Update badge count */
  updateBadge(id: string, count: number): void;
}

// ─── Settings API ────────────────────────────────────────────────

export type SettingFieldType = 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'color' | 'url' | 'json';

export interface SettingField {
  key: string;
  label: string;
  description?: string;
  type: SettingFieldType;
  defaultValue?: unknown;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: z.ZodType;
}

export interface SettingsAPI {
  /** Register settings fields for this plugin */
  registerFields(fields: SettingField[]): void;
  /** Get a setting value */
  get<T = unknown>(key: string): Promise<T | undefined>;
  /** Set a setting value */
  set<T = unknown>(key: string, value: T): Promise<void>;
  /** Get all settings */
  getAll(): Promise<Record<string, unknown>>;
}

// ─── Hooks API (Event System) ────────────────────────────────────

export type HubsoEvent =
  // User events
  | 'user.registered'
  | 'user.login'
  | 'user.profileUpdated'
  | 'user.deleted'
  // Community events
  | 'community.created'
  | 'community.updated'
  | 'community.memberJoined'
  | 'community.memberLeft'
  // Post events
  | 'post.created'
  | 'post.updated'
  | 'post.deleted'
  // Comment events
  | 'comment.created'
  | 'comment.deleted'
  // Reaction events
  | 'reaction.created'
  | 'reaction.deleted'
  // Message events
  | 'message.sent'
  // Event events
  | 'event.created'
  | 'event.rsvp'
  // Course events
  | 'course.enrolled'
  | 'course.completed'
  | 'lesson.completed'
  // Gamification events
  | 'points.awarded'
  | 'badge.earned'
  | 'level.up'
  | 'challenge.completed'
  // Plugin custom events
  | `plugin.${string}`;

export interface HubsoEventPayload {
  event: HubsoEvent;
  userId?: string;
  communityId?: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export type EventHandler = (payload: HubsoEventPayload) => Promise<void>;

export interface HookAPI {
  /** Subscribe to a Hubso event */
  on(event: HubsoEvent, handler: EventHandler): void;
  /** Unsubscribe from an event */
  off(event: HubsoEvent, handler: EventHandler): void;
  /** Emit a custom plugin event */
  emit(event: `plugin.${string}`, data: Record<string, unknown>): Promise<void>;
}

// ─── Widget API ──────────────────────────────────────────────────

export type WidgetPlacement =
  | 'dashboard.main'
  | 'dashboard.sidebar'
  | 'profile.sidebar'
  | 'community.sidebar'
  | 'post.footer'
  | 'post.sidebar';

export interface WidgetDefinition {
  /** Unique widget ID */
  id: string;
  /** Display title */
  title: string;
  /** Where to render */
  placement: WidgetPlacement;
  /** Widget component path (relative to plugin) */
  component: string;
  /** Sort order */
  order?: number;
  /** Min/max size */
  minWidth?: number;
  maxWidth?: number;
}

export interface WidgetAPI {
  /** Register a widget */
  addWidget(widget: WidgetDefinition): void;
  /** Remove a widget */
  removeWidget(id: string): void;
}

// ─── Permission API ──────────────────────────────────────────────

export interface PermissionDefinition {
  /** Permission key, e.g. "courses.create" */
  key: string;
  /** Display label */
  label: string;
  /** Description */
  description?: string;
  /** Which roles get this by default */
  defaultRoles?: string[];
}

export interface PermissionAPI {
  /** Register custom permissions */
  register(permissions: PermissionDefinition[]): void;
  /** Check if user has a permission */
  check(userId: string, permission: string): Promise<boolean>;
}

// ─── Database API ────────────────────────────────────────────────

export interface DatabaseAPI {
  /** Get the plugin's key-value store */
  getStore(namespace?: string): PluginStore;
}

export interface PluginStore {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<Array<{ key: string; value: unknown }>>;
}

// ─── Notification API ────────────────────────────────────────────

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type?: string;
  link?: string;
  icon?: string;
  channels?: ('in_app' | 'email' | 'push')[];
}

export interface NotificationAPI {
  /** Send a notification */
  send(payload: NotificationPayload): Promise<void>;
  /** Send bulk notifications */
  sendBulk(payloads: NotificationPayload[]): Promise<void>;
}

// ─── Storage API ─────────────────────────────────────────────────

export interface StorageAPI {
  /** Get presigned upload URL */
  getUploadUrl(filename: string, contentType: string): Promise<{ url: string; key: string }>;
  /** Get presigned download URL */
  getDownloadUrl(key: string): Promise<string>;
  /** Delete a file */
  deleteFile(key: string): Promise<void>;
}

// ─── Frontend Page Registration ──────────────────────────────────

export interface PluginPage {
  /** URL path (relative, e.g. "/courses") */
  path: string;
  /** Page title */
  title: string;
  /** Component file path */
  component: string;
  /** Show in navigation? */
  showInNav?: boolean;
  /** Icon for navigation */
  icon?: string;
  /** Require auth? */
  auth?: boolean;
  /** Admin only? */
  admin?: boolean;
}

export interface UIRegistryAPI {
  /** Register frontend pages */
  registerPages(pages: PluginPage[]): void;
  /** Register admin pages */
  registerAdminPages(pages: PluginPage[]): void;
}

// ─── Main Plugin Interface ───────────────────────────────────────

export interface HubsoPlugin {
  /** Plugin manifest */
  manifest: PluginManifest;

  // Lifecycle hooks
  onInstall(): Promise<void>;
  onUninstall(): Promise<void>;
  onActivate(): Promise<void>;
  onDeactivate(): Promise<void>;

  // Registration methods (all optional)
  registerRoutes?(router: PluginRouter): void;
  registerSidebarItems?(sidebar: SidebarAPI): void;
  registerSettings?(settings: SettingsAPI): void;
  registerHooks?(hooks: HookAPI): void;
  registerWidgets?(widgets: WidgetAPI): void;
  registerPermissions?(perms: PermissionAPI): void;
  registerPages?(ui: UIRegistryAPI): void;
}

// ─── Plugin Context (injected into plugins) ──────────────────────

export interface PluginContext {
  pluginId: string;
  communityId?: string;
  settings: SettingsAPI;
  hooks: HookAPI;
  notifications: NotificationAPI;
  storage: StorageAPI;
  database: DatabaseAPI;
  logger: PluginLogger;
}

export interface PluginLogger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: Error, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
}

// ─── Zod Schemas for validation ──────────────────────────────────

export const PluginManifestSchema = z.object({
  id: z.string().min(3).max(64).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(128),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().max(1024),
  author: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
    avatar: z.string().url().optional(),
    verified: z.boolean().optional(),
  }),
  hubsoVersion: z.string(),
  permissions: z.array(z.string()),
  dependencies: z.array(z.string()),
  pricing: z.enum(['FREE', 'PAID', 'FREEMIUM']),
  price: z.number().min(0).optional(),
  category: z.enum([
    'LMS', 'E_COMMERCE', 'CRM', 'BOOKING', 'SOCIAL',
    'ANALYTICS', 'AI', 'INTEGRATIONS', 'GAMIFICATION',
    'HEALTH', 'CONTENT', 'COMMUNICATION', 'OTHER',
  ]),
  icon: z.string().optional(),
  coverImage: z.string().url().optional(),
  screenshots: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  repository: z.string().url().optional(),
  docs: z.string().url().optional(),
  changelog: z.string().url().optional(),
  official: z.boolean().optional(),
});

// ─── Re-exports ──────────────────────────────────────────────────

export { z } from 'zod';
