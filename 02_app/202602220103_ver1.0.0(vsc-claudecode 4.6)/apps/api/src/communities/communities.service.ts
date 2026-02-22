import { Injectable } from '@nestjs/common';

@Injectable()
export class CommunitiesService {
  async findBySlug(slug: string) {
    // TODO: Query from Prisma
    return {
      id: 'temp-id',
      slug,
      name: 'Community Name',
    };
  }
}
