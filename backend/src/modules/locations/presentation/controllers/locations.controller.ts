import { Controller, Get, Param, Query } from '@nestjs/common';
import { LocationsService } from '../../services/locations.service';
import { QueryCitiesDto } from '../../dto';

@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get('countries')
  async getCountries() {
    return this.locationsService.getActiveCountriesWithCities();
  }

  @Get('countries/:id')
  async getCountry(@Param('id') id: string) {
    return this.locationsService.getCountryById(id);
  }

  @Get('cities')
  async getCities(@Query() query: QueryCitiesDto) {
    return this.locationsService.getCities({ ...query, isActive: true });
  }

  @Get('cities/featured')
  async getFeaturedCities() {
    return this.locationsService.getFeaturedCities();
  }

  @Get('cities/:id')
  async getCity(@Param('id') id: string) {
    return this.locationsService.getCityById(id);
  }
}
