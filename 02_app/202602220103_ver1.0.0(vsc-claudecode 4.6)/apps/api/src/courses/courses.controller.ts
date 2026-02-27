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
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService, CreateCourseInput, UpdateCourseInput, CreateModuleInput, UpdateModuleInput, CreateLessonInput, UpdateLessonInput } from './courses.service';
import { CourseStatus, EnrollmentStatus } from '@prisma/client';

@ApiTags('courses')
@ApiBearerAuth()
@Controller('communities/:communitySlug/courses')
@UseGuards(AuthGuard('jwt'))
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Course Endpoints ──────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  async create(
    @Param('communitySlug') communitySlug: string,
    @Body() data: CreateCourseInput,
    @Request() req: { user: { id: string } },
  ) {
    // TODO: Get communityId from slug and verify admin/moderator permissions
    const communityId = await this.getCommunityId(communitySlug);
    return this.coursesService.create(communityId, data);
  }

  @Get()
  @ApiOperation({ summary: 'List all courses in a community' })
  @ApiQuery({ name: 'status', enum: CourseStatus, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async findAll(
    @Param('communitySlug') communitySlug: string,
    @Query('status') status?: CourseStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.coursesService.findAll(communityId, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a course by slug' })
  async findOne(
    @Param('communitySlug') communitySlug: string,
    @Param('slug') slug: string,
    @Request() req: { user?: { id: string } },
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.coursesService.findOne(communityId, slug, req.user?.id);
  }

  @Patch(':courseId')
  @ApiOperation({ summary: 'Update a course' })
  async update(
    @Param('courseId') courseId: string,
    @Body() data: UpdateCourseInput,
  ) {
    // TODO: Verify admin/moderator permissions
    return this.coursesService.update(courseId, data);
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'Delete a course' })
  async delete(@Param('courseId') courseId: string) {
    // TODO: Verify admin permissions
    return this.coursesService.delete(courseId);
  }

  // ─── Module Endpoints ──────────────────────────────────────────────────────

  @Post(':courseId/modules')
  @ApiOperation({ summary: 'Create a module in a course' })
  async createModule(
    @Param('courseId') courseId: string,
    @Body() data: CreateModuleInput,
  ) {
    return this.coursesService.createModule(courseId, data);
  }

  @Patch('modules/:moduleId')
  @ApiOperation({ summary: 'Update a module' })
  async updateModule(
    @Param('moduleId') moduleId: string,
    @Body() data: UpdateModuleInput,
  ) {
    return this.coursesService.updateModule(moduleId, data);
  }

  @Delete('modules/:moduleId')
  @ApiOperation({ summary: 'Delete a module' })
  async deleteModule(@Param('moduleId') moduleId: string) {
    return this.coursesService.deleteModule(moduleId);
  }

  @Patch(':courseId/modules/reorder')
  @ApiOperation({ summary: 'Reorder modules in a course' })
  async reorderModules(
    @Param('courseId') courseId: string,
    @Body() body: { moduleIds: string[] },
  ) {
    return this.coursesService.reorderModules(courseId, body.moduleIds);
  }

  // ─── Lesson Endpoints ──────────────────────────────────────────────────────

  @Post('modules/:moduleId/lessons')
  @ApiOperation({ summary: 'Create a lesson in a module' })
  async createLesson(
    @Param('moduleId') moduleId: string,
    @Body() data: CreateLessonInput,
  ) {
    return this.coursesService.createLesson(moduleId, data);
  }

  @Patch('lessons/:lessonId')
  @ApiOperation({ summary: 'Update a lesson' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() data: UpdateLessonInput,
  ) {
    return this.coursesService.updateLesson(lessonId, data);
  }

  @Delete('lessons/:lessonId')
  @ApiOperation({ summary: 'Delete a lesson' })
  async deleteLesson(@Param('lessonId') lessonId: string) {
    return this.coursesService.deleteLesson(lessonId);
  }

  @Patch('modules/:moduleId/lessons/reorder')
  @ApiOperation({ summary: 'Reorder lessons in a module' })
  async reorderLessons(
    @Param('moduleId') moduleId: string,
    @Body() body: { lessonIds: string[] },
  ) {
    return this.coursesService.reorderLessons(moduleId, body.lessonIds);
  }

  // ─── Enrollment Endpoints ──────────────────────────────────────────────────

  @Post(':courseId/enroll')
  @ApiOperation({ summary: 'Enroll in a course' })
  async enroll(@Param('courseId') courseId: string, @Request() req: { user: { id: string } }) {
    return this.coursesService.enroll(req.user.id, courseId);
  }

  @Delete(':courseId/enroll')
  @ApiOperation({ summary: 'Unenroll from a course' })
  async unenroll(@Param('courseId') courseId: string, @Request() req: { user: { id: string } }) {
    return this.coursesService.unenroll(req.user.id, courseId);
  }

  // ─── Progress Endpoints ────────────────────────────────────────────────────

  @Post('lessons/:lessonId/complete')
  @ApiOperation({ summary: 'Mark a lesson as completed' })
  async markLessonComplete(@Param('lessonId') lessonId: string, @Request() req: { user: { id: string } }) {
    return this.coursesService.markLessonComplete(req.user.id, lessonId);
  }

  @Patch('lessons/:lessonId/watch-time')
  @ApiOperation({ summary: 'Update watch time for a lesson' })
  async updateWatchTime(
    @Param('lessonId') lessonId: string,
    @Body() body: { watchTime: number },
    @Request() req: { user: { id: string } },
  ) {
    return this.coursesService.updateLessonWatchTime(req.user.id, lessonId, body.watchTime);
  }

  @Get(':courseId/progress')
  @ApiOperation({ summary: 'Get course progress for current user' })
  async getProgress(@Param('courseId') courseId: string, @Request() req: { user: { id: string } }) {
    return this.coursesService.getLessonProgress(req.user.id, courseId);
  }

  // ─── Helper ────────────────────────────────────────────────────────────────

  private async getCommunityId(slug: string): Promise<string> {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!community) {
      throw new NotFoundException('Społeczność nie została znaleziona.');
    }

    return community.id;
  }
}

// ─── User Enrollments Controller (separate route) ────────────────────────────

@ApiTags('enrollments')
@ApiBearerAuth()
@Controller('enrollments')
@UseGuards(AuthGuard('jwt'))
export class EnrollmentsController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get current user enrollments' })
  @ApiQuery({ name: 'status', enum: EnrollmentStatus, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getMyEnrollments(
    @Request() req: { user: { id: string } },
    @Query('status') status?: EnrollmentStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.coursesService.getEnrollments(req.user.id, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
