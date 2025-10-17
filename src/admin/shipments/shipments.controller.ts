import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import {
  CreateShipmentDto,
  UpdateShipmentDto,
  UpdateStatusDto,
  CalculatePriceDto,
  PriceCalculationResult,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/Schemas/user.schema';
import { ShipmentPlatform, ShipmentStatus } from './schemas/shipment.schema';
import { Throttle } from '@nestjs/throttler';

@ApiTags('admin/shipments')
@Controller('admin/shipments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new shipment',
    description:
      'Create a new shipment with automatic price calculation or manual override',
  })
  @ApiResponse({
    status: 201,
    description: 'Shipment created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all shipments',
    description: 'Retrieve all shipments with optional filters',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ShipmentStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'platform',
    required: false,
    enum: ShipmentPlatform,
    description: 'Filter by platform',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (ISO format)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by tracking number, customer name, or phone',
  })
  @ApiResponse({
    status: 200,
    description: 'Shipments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  findAll(
    @Query('status') status?: ShipmentStatus,
    @Query('platform') platform?: ShipmentPlatform,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.shipmentsService.findAll({
      status,
      platform,
      userId,
      startDate,
      endDate,
      search,
    });
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get shipment statistics',
    description:
      'Retrieve statistics including total shipments, revenue, and counts by status/platform',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  getStatistics() {
    return this.shipmentsService.getStatistics();
  }

  @Get('pricing')
  @ApiOperation({
    summary: 'Get platform pricing configurations',
    description: 'Retrieve pricing details for all platforms including base fees, delivery costs, and weight surcharges',
  })
  @ApiResponse({
    status: 200,
    description: 'Pricing configurations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  getPlatformPricing() {
    return this.shipmentsService.getAllPlatformPricing();
  }

  @Post('calculate-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate shipment price',
    description:
      'Calculate the total price for a shipment based on platform, weight, and other factors',
  })
  @ApiResponse({
    status: 200,
    description: 'Price calculated successfully',
    type: PriceCalculationResult,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  calculatePrice(
    @Body() calculatePriceDto: CalculatePriceDto,
  ): PriceCalculationResult {
    return this.shipmentsService.calculatePrice(calculatePriceDto);
  }

  @Get('tracking/:trackingNumber')
  @ApiOperation({
    summary: 'Get shipment by tracking number',
    description: 'Retrieve a single shipment by its tracking number',
  })
  @ApiParam({
    name: 'trackingNumber',
    description: 'Shipment tracking number',
    example: 'MEY-SHEIN-123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Shipment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  findByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.shipmentsService.findByTrackingNumber(trackingNumber);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get shipment by ID',
    description: 'Retrieve a single shipment by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Shipment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Shipment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update shipment',
    description: 'Update shipment details',
  })
  @ApiParam({
    name: 'id',
    description: 'Shipment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Shipment updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  update(
    @Param('id') id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
  ) {
    return this.shipmentsService.update(id, updateShipmentDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update shipment status',
    description: 'Update the status of a shipment with optional notes',
  })
  @ApiParam({
    name: 'id',
    description: 'Shipment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Shipment status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.shipmentsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete shipment (Super Admin only)',
    description:
      'Permanently delete a shipment. Only super admins can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'Shipment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Shipment deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super admin privileges required',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  remove(@Param('id') id: string) {
    return this.shipmentsService.remove(id);
  }
}
