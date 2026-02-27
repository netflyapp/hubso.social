import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommunitiesModule } from './communities/communities.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { GatewayModule } from './gateway/gateway.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { FollowsModule } from './follows/follows.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { PresenceModule } from './presence/presence.module';
import { MailModule } from './mail/mail.module';
import { GroupsModule } from './groups/groups.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';
import { SearchModule } from './search/search.module';
import { SpacesModule } from './spaces/spaces.module';
import { CaslModule } from './casl/casl.module';
import { CoursesModule } from './courses/courses.module';
import { GamificationModule } from './gamification/gamification.module';
import { PluginsModule } from './plugins/plugins.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CaslModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CommunitiesModule,
    SpacesModule,
    PostsModule,
    CommentsModule,
    ReactionsModule,
    GatewayModule,
    StorageModule,
    FollowsModule,
    NotificationsModule,
    MessagesModule,
    PresenceModule,
    MailModule,
    GroupsModule,
    EventsModule,
    AdminModule,
    SearchModule,
    CoursesModule,
    GamificationModule,
    PluginsModule,
    VideoModule,
  ],
})
export class AppModule {}
