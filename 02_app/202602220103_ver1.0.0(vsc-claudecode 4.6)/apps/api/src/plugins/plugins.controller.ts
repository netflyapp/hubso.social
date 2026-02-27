import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PluginsService, PluginQueryDto, RegisterPluginDto, InstallPluginDto } from './plugins.service';
import { PrismaService } from '../prisma/prisma.service';
import { PluginStatus } from '@prisma/client';

// ─── Helper: resolve communityId from slug ───────────────────────

async function getCommunityId(prisma: PrismaService, slug: string): Promise<string> {
  const community = await prisma.community.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!community) throw new Error('Społeczność nie istnieje');
  return community.id;
}

// ─── Marketplace (public browsing) ───────────────────────────────

@Controller('plugins/marketplace')
export class PluginsMarketplaceController {
  constructor(
    private readonly pluginsService: PluginsService,
  ) {}

  /** GET /plugins/marketplace — browse available plugins */
  @Get()
  async listPlugins(@Query() query: PluginQueryDto) {
    return this.pluginsService.listPlugins(query);
  }

  /** GET /plugins/marketplace/stats — marketplace statistics */
  @Get('stats')
  async getStats() {
    return this.pluginsService.getMarketplaceStats();
  }

  /** GET /plugins/marketplace/:pluginId — plugin details */
  @Get(':pluginId')
  async getPlugin(@Param('pluginId') pluginId: string) {
    return this.pluginsService.getPlugin(pluginId);
  }
}

// ─── Admin Marketplace Management ────────────────────────────────

@Controller('plugins/admin')
@UseGuards(AuthGuard('jwt'))
export class PluginsAdminController {
  constructor(
    private readonly pluginsService: PluginsService,
  ) {}

  /** POST /plugins/admin/register — register new plugin */
  @Post('register')
  async registerPlugin(@Body() body: RegisterPluginDto) {
    return this.pluginsService.registerPlugin(body);
  }

  /** PATCH /plugins/admin/:pluginId — update plugin info */
  @Patch(':pluginId')
  async updatePlugin(
    @Param('pluginId') pluginId: string,
    @Body() body: Partial<RegisterPluginDto>,
  ) {
    return this.pluginsService.updatePlugin(pluginId, body);
  }

  /** DELETE /plugins/admin/:pluginId — remove plugin */
  @Delete(':pluginId')
  async deletePlugin(@Param('pluginId') pluginId: string) {
    return this.pluginsService.deletePlugin(pluginId);
  }

  /** POST /plugins/admin/seed — seed official plugins */
  @Post('seed')
  async seedOfficialPlugins() {
    return this.pluginsService.seedOfficialPlugins();
  }
}

// ─── Community Plugin Management ─────────────────────────────────

@Controller('communities/:communitySlug/plugins')
@UseGuards(AuthGuard('jwt'))
export class CommunityPluginsController {
  constructor(
    private readonly pluginsService: PluginsService,
    private readonly prisma: PrismaService,
  ) {}

  /** GET /communities/:slug/plugins — list installed plugins */
  @Get()
  async getInstalled(@Param('communitySlug') slug: string) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.getInstalledPlugins(communityId);
  }

  /** GET /communities/:slug/plugins/:pluginId — installed plugin details */
  @Get(':pluginId')
  async getInstalledPlugin(
    @Param('communitySlug') slug: string,
    @Param('pluginId') pluginId: string,
  ) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.getInstalledPlugin(communityId, pluginId);
  }

  /** POST /communities/:slug/plugins/install — install a plugin */
  @Post('install')
  async installPlugin(
    @Param('communitySlug') slug: string,
    @Body() body: InstallPluginDto,
    @Req() req: any,
  ) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.installPlugin(communityId, body, req.user?.id);
  }

  /** DELETE /communities/:slug/plugins/:pluginId/uninstall — uninstall */
  @Delete(':pluginId/uninstall')
  async uninstallPlugin(
    @Param('communitySlug') slug: string,
    @Param('pluginId') pluginId: string,
  ) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.uninstallPlugin(communityId, pluginId);
  }

  /** PATCH /communities/:slug/plugins/:pluginId/status — activate/deactivate */
  @Patch(':pluginId/status')
  async toggleStatus(
    @Param('communitySlug') slug: string,
    @Param('pluginId') pluginId: string,
    @Body('status') status: PluginStatus,
  ) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.togglePluginStatus(communityId, pluginId, status);
  }

  /** PATCH /communities/:slug/plugins/:pluginId/config — update config */
  @Patch(':pluginId/config')
  async updateConfig(
    @Param('communitySlug') slug: string,
    @Param('pluginId') pluginId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.updatePluginConfig(communityId, pluginId, body);
  }

  // ─── Settings ────────────────────────────────────────────────

  /** GET /communities/:slug/plugins/:pluginId/settings */
  @Get(':pluginId/settings')
  async getSettings(
    @Param('communitySlug') slug: string,
    @Param('pluginId') pluginId: string,
  ) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.getPluginSettings(communityId, pluginId);
  }

  /** POST /communities/:slug/plugins/:pluginId/settings */
  @Post(':pluginId/settings')
  async setSetting(
    @Param('communitySlug') slug: string,
    @Param('pluginId') pluginId: string,
    @Body() body: { key: string; value: unknown },
  ) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.setPluginSetting(communityId, pluginId, body.key, body.value);
  }

  /** DELETE /communities/:slug/plugins/:pluginId/settings/:key */
  @Delete(':pluginId/settings/:key')
  async deleteSetting(
    @Param('communitySlug') slug: string,
    @Param('pluginId') pluginId: string,
    @Param('key') key: string,
  ) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.deletePluginSetting(communityId, pluginId, key);
  }

  // ─── Hooks ───────────────────────────────────────────────────

  /** GET /communities/:slug/plugins/:pluginId/hooks */
  @Get(':pluginId/hooks')
  async getHooks(
    @Param('communitySlug') slug: string,
    @Param('pluginId') pluginId: string,
  ) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.getPluginHooks(communityId, pluginId);
  }

  /** POST /communities/:slug/plugins/:pluginId/hooks */
  @Post(':pluginId/hooks')
  async registerHook(
    @Param('communitySlug') slug: string,
    @Param('pluginId') pluginId: string,
    @Body() body: { event: string; config?: Record<string, unknown> },
  ) {
    const communityId = await getCommunityId(this.prisma, slug);
    return this.pluginsService.registerHook(communityId, pluginId, body.event, body.config);
  }
}
