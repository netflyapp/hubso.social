import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseStatus, EnrollmentStatus, Prisma } from '@prisma/client';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateCourseInput {
  title: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  price?: number;
  currency?: string;
  isFree?: boolean;
  accessType?: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
}

export interface UpdateCourseInput {
  title?: string;
  slug?: string;
  description?: string;
  coverUrl?: string;
  status?: CourseStatus;
  price?: number;
  currency?: string;
  isFree?: boolean;
  accessType?: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
  settings?: Prisma.JsonValue;
}

export interface CreateModuleInput {
  title: string;
  description?: string;
  position?: number;
}

export interface UpdateModuleInput {
  title?: string;
  description?: string;
  position?: number;
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  content?: Prisma.JsonValue;
  videoUrl?: string;
  videoDuration?: number;
  bunnyVideoId?: string;
  thumbnailUrl?: string;
  hlsUrl?: string;
  position?: number;
  isFree?: boolean;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  content?: Prisma.JsonValue;
  videoUrl?: string;
  videoDuration?: number;
  bunnyVideoId?: string;
  thumbnailUrl?: string;
  hlsUrl?: string;
  position?: number;
  isFree?: boolean;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // ─── Course CRUD ───────────────────────────────────────────────────────────

  async create(communityId: string, data: CreateCourseInput) {
    // Check slug uniqueness within community
    const existing = await this.prisma.course.findUnique({
      where: { communityId_slug: { communityId, slug: data.slug } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Kurs o takim slug już istnieje w tej społeczności.');
    }

    return this.prisma.course.create({
      data: {
        communityId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        coverUrl: data.coverUrl,
        price: data.price ? new Prisma.Decimal(data.price) : null,
        currency: data.currency ?? 'PLN',
        isFree: data.isFree ?? true,
        accessType: data.accessType ?? 'PUBLIC',
      },
      include: {
        modules: {
          include: { lessons: true },
          orderBy: { position: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
    });
  }

  async findAll(communityId: string, options: { status?: CourseStatus; page?: number; limit?: number } = {}) {
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {
      communityId,
      ...(status && { status }),
    };

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          modules: {
            include: { lessons: { select: { id: true } } },
            orderBy: { position: 'asc' },
          },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses.map((course) => ({
        ...course,
        lessonsCount: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
        enrollmentsCount: course._count.enrollments,
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(communityId: string, slug: string, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { communityId_slug: { communityId, slug } },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs nie został znaleziony.');
    }

    // Check if user is enrolled
    let enrollment = null;
    if (userId) {
      enrollment = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
        include: {
          lessonProgress: true,
        },
      });
    }

    return {
      ...course,
      lessonsCount: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      enrollmentsCount: course._count.enrollments,
      enrollment,
    };
  }

  async findById(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: { orderBy: { position: 'asc' } } },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs nie został znaleziony.');
    }

    return course;
  }

  async update(courseId: string, data: UpdateCourseInput) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, communityId: true, slug: true },
    });

    if (!course) {
      throw new NotFoundException('Kurs nie został znaleziony.');
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== course.slug) {
      const existing = await this.prisma.course.findUnique({
        where: { communityId_slug: { communityId: course.communityId, slug: data.slug } },
        select: { id: true },
      });

      if (existing && existing.id !== courseId) {
        throw new ConflictException('Kurs o takim slug już istnieje w tej społeczności.');
      }
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.price !== undefined && { price: data.price ? new Prisma.Decimal(data.price) : null }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.accessType !== undefined && { accessType: data.accessType }),
        ...(data.settings !== undefined && { settings: data.settings === null ? Prisma.JsonNull : data.settings as Prisma.InputJsonValue }),
      },
      include: {
        modules: {
          include: { lessons: { orderBy: { position: 'asc' } } },
          orderBy: { position: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
    });
  }

  async delete(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Kurs nie został znaleziony.');
    }

    await this.prisma.course.delete({ where: { id: courseId } });
    return { success: true };
  }

  // ─── Module CRUD ───────────────────────────────────────────────────────────

  async createModule(courseId: string, data: CreateModuleInput) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Kurs nie został znaleziony.');
    }

    // Get next position if not provided
    let position = data.position;
    if (position === undefined) {
      const lastModule = await this.prisma.courseModule.findFirst({
        where: { courseId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      position = (lastModule?.position ?? -1) + 1;
    }

    return this.prisma.courseModule.create({
      data: {
        courseId,
        title: data.title,
        description: data.description,
        position,
      },
      include: {
        lessons: { orderBy: { position: 'asc' } },
      },
    });
  }

  async updateModule(moduleId: string, data: UpdateModuleInput) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      select: { id: true },
    });

    if (!module) {
      throw new NotFoundException('Moduł nie został znaleziony.');
    }

    return this.prisma.courseModule.update({
      where: { id: moduleId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.position !== undefined && { position: data.position }),
      },
      include: {
        lessons: { orderBy: { position: 'asc' } },
      },
    });
  }

  async deleteModule(moduleId: string) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      select: { id: true },
    });

    if (!module) {
      throw new NotFoundException('Moduł nie został znaleziony.');
    }

    await this.prisma.courseModule.delete({ where: { id: moduleId } });
    return { success: true };
  }

  async reorderModules(courseId: string, moduleIds: string[]) {
    const updates = moduleIds.map((id, index) =>
      this.prisma.courseModule.update({
        where: { id },
        data: { position: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findById(courseId);
  }

  // ─── Lesson CRUD ───────────────────────────────────────────────────────────

  async createLesson(moduleId: string, data: CreateLessonInput) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      select: { id: true },
    });

    if (!module) {
      throw new NotFoundException('Moduł nie został znaleziony.');
    }

    // Get next position if not provided
    let position = data.position;
    if (position === undefined) {
      const lastLesson = await this.prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      position = (lastLesson?.position ?? -1) + 1;
    }

    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        description: data.description,
        content: data.content === null ? Prisma.JsonNull : (data.content as Prisma.InputJsonValue ?? Prisma.JsonNull),
        videoUrl: data.videoUrl,
        videoDuration: data.videoDuration,
        bunnyVideoId: data.bunnyVideoId,
        thumbnailUrl: data.thumbnailUrl,
        hlsUrl: data.hlsUrl,
        position,
        isFree: data.isFree ?? false,
      },
    });
  }

  async updateLesson(lessonId: string, data: UpdateLessonInput) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lekcja nie została znaleziona.');
    }

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.content !== undefined && { content: data.content === null ? Prisma.JsonNull : data.content as Prisma.InputJsonValue }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.videoDuration !== undefined && { videoDuration: data.videoDuration }),
        ...(data.bunnyVideoId !== undefined && { bunnyVideoId: data.bunnyVideoId }),
        ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
        ...(data.hlsUrl !== undefined && { hlsUrl: data.hlsUrl }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
      },
    });
  }

  async deleteLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lekcja nie została znaleziona.');
    }

    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { success: true };
  }

  async reorderLessons(moduleId: string, lessonIds: string[]) {
    const updates = lessonIds.map((id, index) =>
      this.prisma.lesson.update({
        where: { id },
        data: { position: index },
      }),
    );

    await this.prisma.$transaction(updates);

    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { lessons: { orderBy: { position: 'asc' } } },
    });

    return module;
  }

  // ─── Enrollment ────────────────────────────────────────────────────────────

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true, isFree: true, accessType: true },
    });

    if (!course) {
      throw new NotFoundException('Kurs nie został znaleziony.');
    }

    if (course.status !== 'PUBLISHED') {
      throw new ForbiddenException('Ten kurs nie jest jeszcze dostępny.');
    }

    // Check existing enrollment
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Jesteś już zapisany na ten kurs.');
    }

    // TODO: Handle paid courses (check payment)

    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE',
        progress: 0,
      },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: { select: { id: true } } },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });
  }

  async unenroll(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Nie jesteś zapisany na ten kurs.');
    }

    await this.prisma.enrollment.delete({
      where: { userId_courseId: { userId, courseId } },
    });

    return { success: true };
  }

  async getEnrollments(userId: string, options: { status?: EnrollmentStatus; page?: number; limit?: number } = {}) {
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.EnrollmentWhereInput = {
      userId,
      ...(status && { status }),
    };

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: { select: { id: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      data: enrollments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // ─── Progress Tracking ─────────────────────────────────────────────────────

  async markLessonComplete(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { course: { select: { id: true } } },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lekcja nie została znaleziona.');
    }

    const courseId = lesson.module.course.id;

    // Get or check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });

    if (!enrollment) {
      throw new ForbiddenException('Musisz być zapisany na kurs, aby śledzić postęp.');
    }

    // Create or update lesson progress
    const progress = await this.prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // Recalculate course progress
    await this.recalculateCourseProgress(enrollment.id, courseId);

    return progress;
  }

  async updateLessonWatchTime(userId: string, lessonId: string, watchTime: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { course: { select: { id: true } } },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lekcja nie została znaleziona.');
    }

    const courseId = lesson.module.course.id;

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });

    if (!enrollment) {
      throw new ForbiddenException('Musisz być zapisany na kurs, aby śledzić postęp.');
    }

    return this.prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        watchTime,
      },
      update: {
        watchTime,
      },
    });
  }

  private async recalculateCourseProgress(enrollmentId: string, courseId: string) {
    // Count total lessons
    const totalLessons = await this.prisma.lesson.count({
      where: { module: { courseId } },
    });

    if (totalLessons === 0) return;

    // Count completed lessons
    const completedLessons = await this.prisma.lessonProgress.count({
      where: {
        enrollmentId,
        completed: true,
      },
    });

    const progress = Math.round((completedLessons / totalLessons) * 100);
    const isCompleted = progress === 100;

    await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        completedAt: isCompleted ? new Date() : null,
      },
    });
  }

  async getLessonProgress(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        lessonProgress: true,
      },
    });

    if (!enrollment) {
      return { enrolled: false, progress: [] };
    }

    return {
      enrolled: true,
      enrollmentId: enrollment.id,
      overallProgress: enrollment.progress,
      status: enrollment.status,
      completedAt: enrollment.completedAt,
      progress: enrollment.lessonProgress,
    };
  }
}
