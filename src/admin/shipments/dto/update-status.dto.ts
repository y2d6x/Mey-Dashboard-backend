import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ShipmentStatus } from '../schemas/shipment.schema';

export class UpdateStatusDto {
  @ApiProperty({
    enum: ShipmentStatus,
    example: ShipmentStatus.SHIPPED,
    description: 'New shipment status',
  })
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @ApiPropertyOptional({
    example: 'Shipment picked up by carrier',
    description: 'Notes about status change',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: '2025-10-25',
    description: 'Actual delivery date (for delivered status)',
  })
  @IsDateString()
  @IsOptional()
  actualDeliveryDate?: string;
}
