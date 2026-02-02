import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LocationsService } from './services/locations.service';
import { LocationsController } from './presentation/controllers/locations.controller';
import { AdminLocationsController } from './presentation/controllers/admin-locations.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LocationsController, AdminLocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
