import { CommunitiesService } from './communities.service';
export declare class CommunitiesController {
    private communitiesService;
    constructor(communitiesService: CommunitiesService);
    getBySlug(slug: string): Promise<{
        id: string;
        slug: string;
        name: string;
    }>;
}
//# sourceMappingURL=communities.controller.d.ts.map