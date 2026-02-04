import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersAdminService } from '../../services/users-admin.service';
import { QueryUsersDto, UpdateUserDto, UpdateUserStatusDto } from '../../dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/core/common/decorators/roles.decorator';

@ApiTags('Admin Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersAdminController {
  constructor(private usersService: UsersAdminService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Get all users with filters' })
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Get users statistics' })
  async getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Get user details' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update user status (ban/unban)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, dto);
  }

  @Post(':id/revoke-sessions')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Revoke all user sessions' })
  async revokeAllSessions(@Param('id') id: string) {
    return this.usersService.revokeAllSessions(id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete user' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
