"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPACE_TYPES = exports.NOTIFICATION_TYPES = exports.ROUTES = exports.WEB_URL = exports.API_BASE_URL = void 0;
exports.API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
exports.WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
exports.ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        RESET_PASSWORD: '/auth/reset-password',
    },
    PLATFORM: {
        HOME: '/feed',
        PROFILE: '/profile',
        GROUPS: '/groups',
        MESSAGES: '/messages',
        MEMBERS: '/members',
        FORUMS: '/forums',
        COURSES: '/courses',
        EVENTS: '/events',
    },
};
exports.NOTIFICATION_TYPES = {
    POST_LIKE: 'post_like',
    POST_COMMENT: 'post_comment',
    MENTION: 'mention',
    MESSAGE: 'message',
    EVENT_INVITE: 'event_invite',
    MEMBER_JOIN: 'member_join',
    SPACE_UPDATE: 'space_update',
};
exports.SPACE_TYPES = {
    POSTS: 'posts',
    CHAT: 'chat',
    EVENTS: 'events',
    LINKS: 'links',
    FILES: 'files',
};
//# sourceMappingURL=constants.js.map