import { Module } from '@nestjs/common';
import { ReviewsService } from './services/reviews.service';
import { ReviewsController } from './presentation/controllers/reviews.controller';
import { AdminReviewsController } from './presentation/controllers/admin-reviews.controller';

@Module({
  controllers: [ReviewsController, AdminReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
