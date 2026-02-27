import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UsersService, UpdateProfileInput } from './users.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /** GET /users — public paginated member list */
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search || undefined,
    });
  }

  /** GET /users/me — own full profile */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getMe(@Request() req: { user: { userId: string; email: string } }) {
    return this.usersService.findMe(req.user.userId);
  }

  /** PATCH /users/me — update displayName, bio, username */
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async updateMe(
    @Request() req: { user: { userId: string } },
    @Body() body: UpdateProfileInput,
  ) {
    return this.usersService.updateMe(req.user.userId, body);
  }

  /** POST /users/me/avatar — upload profile picture */
  @Post('me/avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Dozwolone formaty: JPEG, PNG, WebP, GIF.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @Request() req: { user: { userId: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Wymagany jest plik graficzny.');
    }
    return this.usersService.updateAvatar(req.user.userId, file);
  }

  /** GET /users/:id — public profile */
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getById(
    @Param('id') id: string,
    @Request() req: { user?: { userId: string } },
  ) {
    return this.usersService.findById(id, req.user?.userId);
  }
}
