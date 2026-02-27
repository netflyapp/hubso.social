import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PluginStatus, PluginCategory, PluginPricing } from '@prisma/client';

// ─── DTOs ────────────────────────────────────────────────────────

export interface RegisterPluginDto {
  pluginId: string;
  name: string;
  description?: string;
  version?: string;
  category?: PluginCategory;
  pricing?: PluginPricing;
  price?: number;
  icon?: string;
  coverImage?: string;
  screenshots?: string[];
  tags?: string[];
  authorName?: string;
  authorEmail?: string;
  authorUrl?: string;
  authorVerified?: boolean;
  official?: boolean;
  hubsoVersion?: string;
  permissions?: string[];
  dependencies?: string[];
  repository?: string;
  docsUrl?: string;
  changelogUrl?: string;
}

export interface InstallPluginDto {
  pluginId: string;
  config?: Record<string, unknown>;
}

export interface UpdatePluginSettingDto {
  key: string;
  value: unknown;
}

export interface PluginQueryDto {
  category?: PluginCategory;
  pricing?: PluginPricing;
  official?: boolean;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'downloads' | 'rating' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
}

// ─── Select Constants ────────────────────────────────────────────

const PLUGIN_SELECT = {
  id: true,
  pluginId: true,
  name: true,
  description: true,
  version: true,
  category: true,
  pricing: true,
  price: true,
  icon: true,
  coverImage: true,
  screenshots: true,
  tags: true,
  authorName: true,
  authorEmail: true,
  authorUrl: true,
  authorVerified: true,
  official: true,
  hubsoVersion: true,
  permissions: true,
  dependencies: true,
  repository: true,
  docsUrl: true,
  changelogUrl: true,
  downloads: true,
  rating: true,
  ratingCount: true,
  featured: true,
  createdAt: true,
  updatedAt: true,
} as const;

const INSTALLED_PLUGIN_SELECT = {
  id: true,
  pluginId: true,
  communityId: true,
  status: true,
  version: true,
  installedBy: true,
  installedAt: true,
  updatedAt: true,
  config: true,
  plugin: {
    select: PLUGIN_SELECT,
  },
} as const;

// ─── Service ─────────────────────────────────────────────────────

@Injectable()
export class PluginsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Marketplace (Plugin Registry) ───────────────────────────

  /** List all available plugins in marketplace */
  async listPlugins(query: PluginQueryDto) {
    const {
      category,
      pricing,
      official,
      featured,
      search,
      page = 1,
      limit = 20,
      sort = 'downloads',
      order = 'desc',
    } = query;

    const where: Prisma.PluginWhereInput = {};

    if (category) where.category = category;
    if (pricing) where.pricing = pricing;
    if (official !== undefined) where.official = official;
    if (featured !== undefined) where.featured = featured;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { pluginId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [plugins, total] = await Promise.all([
      this.prisma.plugin.findMany({
        where,
        select: PLUGIN_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
      }),
      this.prisma.plugin.count({ where }),
    ]);

    return {
      plugins,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Get a single plugin by ID */
  async getPlugin(pluginId: string) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { pluginId },
      select: PLUGIN_SELECT,
    });
    if (!plugin) throw new NotFoundException('Plugin nie istnieje');
    return plugin;
  }

  /** Register a new plugin in the marketplace */
  async registerPlugin(data: RegisterPluginDto) {
    const existing = await this.prisma.plugin.findUnique({
      where: { pluginId: data.pluginId },
    });
    if (existing) throw new ConflictException('Plugin z tym ID już istnieje');

    return this.prisma.plugin.create({
      data: {
        pluginId: data.pluginId,
        name: data.name,
        description: data.description ?? '',
        version: data.version ?? '1.0.0',
        category: data.category ?? 'OTHER',
        pricing: data.pricing ?? 'FREE',
        price: data.price,
        icon: data.icon,
        coverImage: data.coverImage,
        screenshots: (data.screenshots ?? []) as Prisma.InputJsonValue,
        tags: (data.tags ?? []) as Prisma.InputJsonValue,
        authorName: data.authorName ?? 'Hubso',
        authorEmail: data.authorEmail,
        authorUrl: data.authorUrl,
        authorVerified: data.authorVerified ?? false,
        official: data.official ?? false,
        hubsoVersion: data.hubsoVersion ?? '0.1.0',
        permissions: (data.permissions ?? []) as Prisma.InputJsonValue,
        dependencies: (data.dependencies ?? []) as Prisma.InputJsonValue,
        repository: data.repository,
        docsUrl: data.docsUrl,
        changelogUrl: data.changelogUrl,
      },
      select: PLUGIN_SELECT,
    });
  }

  /** Update plugin info in marketplace */
  async updatePlugin(pluginId: string, data: Partial<RegisterPluginDto>) {
    const existing = await this.prisma.plugin.findUnique({
      where: { pluginId },
    });
    if (!existing) throw new NotFoundException('Plugin nie istnieje');

    const updateData: Prisma.PluginUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.pricing !== undefined) updateData.pricing = data.pricing;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.screenshots !== undefined) updateData.screenshots = data.screenshots as Prisma.InputJsonValue;
    if (data.tags !== undefined) updateData.tags = data.tags as Prisma.InputJsonValue;
    if (data.authorName !== undefined) updateData.authorName = data.authorName;
    if (data.repository !== undefined) updateData.repository = data.repository;
    if (data.docsUrl !== undefined) updateData.docsUrl = data.docsUrl;
    if (data.changelogUrl !== undefined) updateData.changelogUrl = data.changelogUrl;

    return this.prisma.plugin.update({
      where: { pluginId },
      data: updateData,
      select: PLUGIN_SELECT,
    });
  }

  /** Delete plugin from marketplace */
  async deletePlugin(pluginId: string) {
    const existing = await this.prisma.plugin.findUnique({
      where: { pluginId },
    });
    if (!existing) throw new NotFoundException('Plugin nie istnieje');

    await this.prisma.plugin.delete({ where: { pluginId } });
    return { deleted: true };
  }

  /** Get marketplace stats */
  async getMarketplaceStats() {
    const [total, official, free, paid, categories] = await Promise.all([
      this.prisma.plugin.count(),
      this.prisma.plugin.count({ where: { official: true } }),
      this.prisma.plugin.count({ where: { pricing: 'FREE' } }),
      this.prisma.plugin.count({ where: { pricing: 'PAID' } }),
      this.prisma.plugin.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
    ]);

    return {
      total,
      official,
      free,
      paid,
      categories: categories.map((c) => ({
        category: c.category,
        count: c._count.category,
      })),
    };
  }

  // ─── Installation (per Community) ────────────────────────────

  /** Install a plugin in a community */
  async installPlugin(communityId: string, dto: InstallPluginDto, userId?: string) {
    // Verify plugin exists
    const plugin = await this.prisma.plugin.findUnique({
      where: { pluginId: dto.pluginId },
    });
    if (!plugin) throw new NotFoundException('Plugin nie istnieje w marketplace');

    // Check if already installed
    const existing = await this.prisma.installedPlugin.findUnique({
      where: {
        pluginId_communityId: {
          pluginId: dto.pluginId,
          communityId,
        },
      },
    });
    if (existing) throw new ConflictException('Plugin jest już zainstalowany w tej społeczności');

    // Check dependencies
    if (plugin.dependencies && Array.isArray(plugin.dependencies)) {
      const deps = plugin.dependencies as string[];
      for (const dep of deps) {
        const depInstalled = await this.prisma.installedPlugin.findUnique({
          where: {
            pluginId_communityId: {
              pluginId: dep,
              communityId,
            },
          },
        });
        if (!depInstalled || depInstalled.status !== 'ACTIVE') {
          throw new BadRequestException(
            `Wymagana zależność "${dep}" nie jest zainstalowana lub aktywna`,
          );
        }
      }
    }

    // Install
    const installed = await this.prisma.installedPlugin.create({
      data: {
        pluginId: dto.pluginId,
        communityId,
        version: plugin.version,
        installedBy: userId,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        status: 'ACTIVE',
      },
      select: INSTALLED_PLUGIN_SELECT,
    });

    // Increment downloads
    await this.prisma.plugin.update({
      where: { pluginId: dto.pluginId },
      data: { downloads: { increment: 1 } },
    });

    return installed;
  }

  /** Uninstall a plugin from a community */
  async uninstallPlugin(communityId: string, pluginId: string) {
    const installed = await this.prisma.installedPlugin.findUnique({
      where: {
        pluginId_communityId: { pluginId, communityId },
      },
    });
    if (!installed) throw new NotFoundException('Plugin nie jest zainstalowany');

    // Check if other plugins depend on this one
    const allInstalled = await this.prisma.installedPlugin.findMany({
      where: { communityId, status: 'ACTIVE' },
      include: { plugin: true },
    });

    for (const inst of allInstalled) {
      if (inst.pluginId === pluginId) continue;
      const deps = (inst.plugin.dependencies as string[]) ?? [];
      if (deps.includes(pluginId)) {
        throw new BadRequestException(
          `Nie można odinstalować — plugin "${inst.plugin.name}" zależy od tego pluginu`,
        );
      }
    }

    await this.prisma.installedPlugin.delete({
      where: {
        pluginId_communityId: { pluginId, communityId },
      },
    });

    return { uninstalled: true };
  }

  /** Get all plugins installed in a community */
  async getInstalledPlugins(communityId: string) {
    return this.prisma.installedPlugin.findMany({
      where: { communityId },
      select: INSTALLED_PLUGIN_SELECT,
      orderBy: { installedAt: 'desc' },
    });
  }

  /** Get a specific installed plugin */
  async getInstalledPlugin(communityId: string, pluginId: string) {
    const installed = await this.prisma.installedPlugin.findUnique({
      where: {
        pluginId_communityId: { pluginId, communityId },
      },
      select: {
        ...INSTALLED_PLUGIN_SELECT,
        settings: {
          select: { key: true, value: true },
        },
      },
    });
    if (!installed) throw new NotFoundException('Plugin nie jest zainstalowany');
    return installed;
  }

  /** Activate / deactivate a plugin */
  async togglePluginStatus(communityId: string, pluginId: string, status: PluginStatus) {
    const installed = await this.prisma.installedPlugin.findUnique({
      where: {
        pluginId_communityId: { pluginId, communityId },
      },
    });
    if (!installed) throw new NotFoundException('Plugin nie jest zainstalowany');

    return this.prisma.installedPlugin.update({
      where: {
        pluginId_communityId: { pluginId, communityId },
      },
      data: { status },
      select: INSTALLED_PLUGIN_SELECT,
    });
  }

  /** Update plugin config */
  async updatePluginConfig(communityId: string, pluginId: string, config: Record<string, unknown>) {
    const installed = await this.prisma.installedPlugin.findUnique({
      where: {
        pluginId_communityId: { pluginId, communityId },
      },
    });
    if (!installed) throw new NotFoundException('Plugin nie jest zainstalowany');

    return this.prisma.installedPlugin.update({
      where: {
        pluginId_communityId: { pluginId, communityId },
      },
      data: { config: config as Prisma.InputJsonValue },
      select: INSTALLED_PLUGIN_SELECT,
    });
  }

  // ─── Plugin Settings (Key-Value Store) ───────────────────────

  /** Get all settings for an installed plugin */
  async getPluginSettings(communityId: string, pluginId: string) {
    const installed = await this.prisma.installedPlugin.findUnique({
      where: {
        pluginId_communityId: { pluginId, communityId },
      },
      select: { id: true },
    });
    if (!installed) throw new NotFoundException('Plugin nie jest zainstalowany');

    const settings = await this.prisma.pluginSetting.findMany({
      where: { installedPluginId: installed.id },
      select: { key: true, value: true },
    });

    return Object.fromEntries(settings.map((s) => [s.key, s.value]));
  }

  /** Set a plugin setting */
  async setPluginSetting(communityId: string, pluginId: string, key: string, value: unknown) {
    const installed = await this.prisma.installedPlugin.findUnique({
      where: {
        pluginId_communityId: { pluginId, communityId },
      },
      select: { id: true },
    });
    if (!installed) throw new NotFoundException('Plugin nie jest zainstalowany');

    await this.prisma.pluginSetting.upsert({
      where: {
        installedPluginId_key: {
          installedPluginId: installed.id,
          key,
        },
      },
      update: { value: value as Prisma.InputJsonValue },
      create: {
        installedPluginId: installed.id,
        key,
        value: value as Prisma.InputJsonValue,
      },
    });

    return { key, value };
  }

  /** Delete a plugin setting */
  async deletePluginSetting(communityId: string, pluginId: string, key: string) {
    const installed = await this.prisma.installedPlugin.findUnique({
      where: {
        pluginId_communityId: { pluginId, communityId },
      },
      select: { id: true },
    });
    if (!installed) throw new NotFoundException('Plugin nie jest zainstalowany');

    await this.prisma.pluginSetting.deleteMany({
      where: { installedPluginId: installed.id, key },
    });

    return { deleted: true };
  }

  // ─── Plugin Hooks ────────────────────────────────────────────

  /** Register an event hook for a plugin */
  async registerHook(communityId: string, pluginId: string, event: string, config?: Record<string, unknown>) {
    const existing = await this.prisma.pluginHook.findUnique({
      where: {
        pluginId_communityId_event: { pluginId, communityId, event },
      },
    });

    if (existing) {
      return this.prisma.pluginHook.update({
        where: { id: existing.id },
        data: {
          enabled: true,
          config: config ? (config as Prisma.InputJsonValue) : undefined,
        },
      });
    }

    return this.prisma.pluginHook.create({
      data: {
        pluginId,
        communityId,
        event,
        config: config ? (config as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  /** Get hooks for a specific event */
  async getHooksForEvent(communityId: string, event: string) {
    return this.prisma.pluginHook.findMany({
      where: { communityId, event, enabled: true },
      orderBy: { priority: 'asc' },
    });
  }

  /** Get all hooks for a plugin in a community */
  async getPluginHooks(communityId: string, pluginId: string) {
    return this.prisma.pluginHook.findMany({
      where: { communityId, pluginId },
      orderBy: { event: 'asc' },
    });
  }

  // ─── Seed Official Plugins ───────────────────────────────────

  /** Seed official Hubso plugins into the marketplace */
  async seedOfficialPlugins() {
    const officialPlugins: RegisterPluginDto[] = [
      {
        pluginId: 'hubso-courses',
        name: 'Courses (LMS)',
        description: 'System kursów online z modułami, lekcjami, progress tracking, certyfikatami i drip content. Buduj i sprzedawaj kursy w swojej społeczności.',
        version: '1.0.0',
        category: 'LMS',
        pricing: 'FREE',
        icon: 'solar:book-2-linear',
        tags: ['kursy', 'lms', 'lekcje', 'edukacja', 'e-learning'],
        authorName: 'Hubso',
        authorVerified: true,
        official: true,
        hubsoVersion: '0.26.0',
      },
      {
        pluginId: 'hubso-gamification',
        name: 'Gamification',
        description: 'System gamifikacji z punktami, levelami, odznakami, leaderboardem, streak tracking i wyzwaniami. Zwiększ engagement w społeczności.',
        version: '1.0.0',
        category: 'GAMIFICATION',
        pricing: 'FREE',
        icon: 'solar:cup-star-linear',
        tags: ['gamifikacja', 'punkty', 'odznaki', 'leaderboard', 'wyzwania'],
        authorName: 'Hubso',
        authorVerified: true,
        official: true,
        hubsoVersion: '0.27.0',
      },
      {
        pluginId: 'hubso-shop',
        name: 'Shop',
        description: 'Sklep z produktami cyfrowymi i fizycznymi, subskrypcjami, koszykiem i integracją płatności. Monetyzuj swoją społeczność.',
        version: '0.1.0',
        category: 'E_COMMERCE',
        pricing: 'FREE',
        icon: 'solar:bag-5-linear',
        tags: ['sklep', 'e-commerce', 'produkty', 'płatności'],
        authorName: 'Hubso',
        authorVerified: true,
        official: true,
        hubsoVersion: '0.30.0',
      },
      {
        pluginId: 'hubso-booking',
        name: 'Booking',
        description: 'System rezerwacji terminów z kalendarzem, integracją Zoom/Meet i automatycznymi przypomnieniami.',
        version: '0.1.0',
        category: 'BOOKING',
        pricing: 'FREE',
        icon: 'solar:calendar-linear',
        tags: ['rezerwacje', 'booking', 'kalendarz', 'spotkania'],
        authorName: 'Hubso',
        authorVerified: true,
        official: true,
        hubsoVersion: '0.32.0',
      },
      {
        pluginId: 'hubso-analytics-pro',
        name: 'Analytics Pro',
        description: 'Zaawansowane metryki, raporty i eksport danych. Śledź engagement, retencję i wzrost społeczności.',
        version: '0.1.0',
        category: 'ANALYTICS',
        pricing: 'FREEMIUM',
        price: 9.99,
        icon: 'solar:chart-2-linear',
        tags: ['analytics', 'metryki', 'raporty', 'statystyki'],
        authorName: 'Hubso',
        authorVerified: true,
        official: true,
        hubsoVersion: '0.33.0',
      },
      {
        pluginId: 'hubso-health-diary',
        name: 'Health Diary',
        description: 'Dziennik zdrowia z parametrami, wykresami, AI sugestiami. Idealny dla społeczności fitness i wellness.',
        version: '0.1.0',
        category: 'HEALTH',
        pricing: 'FREE',
        icon: 'solar:heart-pulse-linear',
        tags: ['zdrowie', 'dziennik', 'fitness', 'wellness'],
        authorName: 'Hubso',
        authorVerified: true,
        official: true,
        hubsoVersion: '0.34.0',
      },
    ];

    const results = [];
    for (const pluginData of officialPlugins) {
      const existing = await this.prisma.plugin.findUnique({
        where: { pluginId: pluginData.pluginId },
      });

      if (existing) {
        // Update version/description
        const updated = await this.prisma.plugin.update({
          where: { pluginId: pluginData.pluginId },
          data: {
            name: pluginData.name,
            description: pluginData.description,
            version: pluginData.version,
            icon: pluginData.icon,
            tags: (pluginData.tags ?? []) as Prisma.InputJsonValue,
          },
          select: PLUGIN_SELECT,
        });
        results.push({ ...updated, action: 'updated' });
      } else {
        const created = await this.registerPlugin(pluginData);
        results.push({ ...created, action: 'created' });
      }
    }

    return results;
  }
}
