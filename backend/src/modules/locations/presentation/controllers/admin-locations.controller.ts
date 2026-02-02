import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { LocationsService } from '../../services/locations.service';
import {
  CreateCountryDto,
  UpdateCountryDto,
  CreateCityDto,
  UpdateCityDto,
  QueryCountriesDto,
  QueryCitiesDto,
} from '../../dto';

@Controller('admin/locations')
@UseGuards(JwtAuthGuard)
export class AdminLocationsController {
  constructor(private locationsService: LocationsService) {}

  // ==================== COUNTRIES ====================

  @Get('countries')
  async getCountries(@Query() query: QueryCountriesDto) {
    return this.locationsService.getCountries(query);
  }

  @Get('countries/:id')
  async getCountry(@Param('id') id: string) {
    return this.locationsService.getCountryById(id);
  }

  @Post('countries')
  async createCountry(@Body() dto: CreateCountryDto) {
    return this.locationsService.createCountry(dto);
  }

  @Put('countries/:id')
  async updateCountry(@Param('id') id: string, @Body() dto: UpdateCountryDto) {
    return this.locationsService.updateCountry(id, dto);
  }

  @Delete('countries/:id')
  async deleteCountry(@Param('id') id: string) {
    return this.locationsService.deleteCountry(id);
  }

  // ==================== CITIES ====================

  @Get('cities')
  async getCities(@Query() query: QueryCitiesDto) {
    return this.locationsService.getCities(query);
  }

  @Get('cities/:id')
  async getCity(@Param('id') id: string) {
    return this.locationsService.getCityById(id);
  }

  @Post('cities')
  async createCity(@Body() dto: CreateCityDto) {
    return this.locationsService.createCity(dto);
  }

  @Put('cities/:id')
  async updateCity(@Param('id') id: string, @Body() dto: UpdateCityDto) {
    return this.locationsService.updateCity(id, dto);
  }

  @Delete('cities/:id')
  async deleteCity(@Param('id') id: string) {
    return this.locationsService.deleteCity(id);
  }
}
