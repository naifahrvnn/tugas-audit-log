import type { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService.ts';
import { AuditLogService } from '../services/auditLogService.ts';

export class ReviewController {
  constructor(
    private reviewService: ReviewService = new ReviewService(),
    private auditLogService: AuditLogService = new AuditLogService(),
  ) {}

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message === 'REVIEW_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Review tidak ditemukan' });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  getReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
      const stallId = req.query.stallId ? Number(req.query.stallId) : undefined;
      const reviews = await this.reviewService.getAllReviews(stallId);
      return res.status(200).json({ status: 'success', data: reviews });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createReview = async (req: Request, res: Response): Promise<Response> => {
  try {
    const stallId = Number(req.params.id ?? req.body?.stallId);
    const input = {
      ...req.body,
      stallId,
      ...(req.user?.id !== undefined && req.body?.userId === undefined
        ? { userId: req.user.id }
        : {}),
    };

    const review = await this.reviewService.createReview(input);

    const actorUserId = Number(review.userId ?? req.user?.id ?? req.body?.userId);
    const targetId = Number(review.id);
    if (
      Number.isInteger(actorUserId) &&
      actorUserId > 0 &&
      Number.isInteger(targetId) &&
      targetId > 0
    ) {
      await this.auditLogService.record({
        userId: actorUserId,
        action: 'CREATE_REVIEW',
        targetTable: 'REVIEWS',
        targetId,
        metadata: {
          stallId: review.stallId ?? stallId,
          rating: review.rating,
        },
      });
    }

    return res.status(201).json({ status: 'success', data: review });
  } catch (error) {
    return this.handleError(res, error);
  }
};

  deleteReview = async (req: Request, res: Response): Promise<Response> => {
    try {
      const paramId = Number(req.params.id);
      const review = await this.reviewService.deleteReview(paramId);

      const actorUserId = Number(review.userId ?? req.body?.userId);
      const targetId = Number(review.id ?? paramId);
      if (Number.isInteger(actorUserId) && actorUserId > 0 && Number.isInteger(targetId) && targetId > 0) {
        await this.auditLogService.record({
          userId: actorUserId,
          action: 'DELETE_REVIEW',
          targetTable: 'REVIEWS',
          targetId,
          metadata: {
            stallId: review.stallId,
          },
        });
      }

      return res.status(200).json({ status: 'success', data: review });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}