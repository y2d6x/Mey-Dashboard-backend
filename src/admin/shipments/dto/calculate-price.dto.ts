import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { ShipmentPlatform } from '../schemas/shipment.schema';

export class CalculatePriceDto {
  @ApiProperty({
    enum: ShipmentPlatform,
    example: ShipmentPlatform.SHEIN,
    description: 'Shipping platform',
  })
  @IsEnum(ShipmentPlatform)
  platform: ShipmentPlatform;

  @ApiProperty({
    example: 50000,
    description: 'Cart price in IQD (sum of item prices)',
  })
  @IsNumber()
  @Min(0)
  cartPrice: number;

  @ApiProperty({
    example: 2.5,
    description: 'Weight in kg',
  })
  @IsNumber()
  @Min(0.1)
  weight: number;

  @ApiPropertyOptional({
    example: 5000,
    description:
      'Material cost in IQD (optional, will use default if not provided)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  materialCost?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Delivery fee in IQD (optional, defaults to 5000)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  deliveryFee?: number;
}

export class PriceCalculationResult {
  @ApiProperty({ example: 50000, description: 'Cart price' })
  cartPrice: number;

  @ApiProperty({ example: 6500, description: 'Shipment fee' })
  shipmentFee: number;

  @ApiProperty({ example: 5000, description: 'Material cost' })
  materialCost: number;

  @ApiProperty({ example: 5000, description: 'Delivery fee' })
  deliveryFee: number;

  @ApiProperty({ example: 66500, description: 'Total price' })
  totalPrice: number;

  @ApiProperty({ example: 'Shein', description: 'Platform' })
  platform: string;

  @ApiProperty({ example: 2.5, description: 'Weight in kg' })
  weight: number;
}
