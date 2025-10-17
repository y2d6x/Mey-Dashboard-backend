import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsBoolean,
  Min,
  IsDateString,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentPlatform } from '../schemas/shipment.schema';

export class ShipmentItemDto {
  @ApiProperty({ example: 'Summer Dress', description: 'Item name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 15000, description: 'Price in IQD' })
  @IsNumber()
  @Min(0)
  price: number;
}

export class PackageDimensionsDto {
  @ApiProperty({ example: 30, description: 'Length' })
  @IsNumber()
  @Min(0)
  length: number;

  @ApiProperty({ example: 20, description: 'Width' })
  @IsNumber()
  @Min(0)
  width: number;

  @ApiProperty({ example: 10, description: 'Height' })
  @IsNumber()
  @Min(0)
  height: number;

  @ApiProperty({ example: 'cm', description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  unit: string;
}

export class CustomerAddressDto {
  @ApiProperty({
    example: 'Al-Karrada Street, Building 15',
    description: 'Street address',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: 'Baghdad', description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Baghdad', description: 'Province' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiPropertyOptional({ example: '10001', description: 'Postal code' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({
    example: 'Iraq',
    description: 'Country',
    default: 'Iraq',
  })
  @IsString()
  @IsOptional()
  country?: string;
}

export class CreateShipmentDto {
  // Customer Information
  @ApiProperty({ example: 'Ahmed Ali', description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({
    example: '+964 770 123 4567',
    description: 'Customer phone number',
  })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ type: CustomerAddressDto, description: 'Customer address' })
  @ValidateNested()
  @Type(() => CustomerAddressDto)
  customerAddress: CustomerAddressDto;

  @ApiPropertyOptional({
    example: '507f1f77bcf86cd799439011',
    description: 'User ID if customer is registered',
  })
  @IsMongoId()
  @IsOptional()
  userId?: string;

  // Shipment Details
  @ApiProperty({
    enum: ShipmentPlatform,
    example: ShipmentPlatform.SHEIN,
    description: 'Shipping platform',
  })
  @IsEnum(ShipmentPlatform)
  platform: ShipmentPlatform;

  @ApiProperty({
    type: [ShipmentItemDto],
    description: 'List of items in shipment',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentItemDto)
  items: ShipmentItemDto[];

  @ApiProperty({ example: 2.5, description: 'Weight in kg' })
  @IsNumber()
  @Min(0.1)
  weight: number;

  @ApiPropertyOptional({
    type: PackageDimensionsDto,
    description: 'Package dimensions',
  })
  @ValidateNested()
  @Type(() => PackageDimensionsDto)
  @IsOptional()
  dimensions?: PackageDimensionsDto;

  // Pricing (optional, will be auto-calculated if not provided)
  @ApiPropertyOptional({ example: 50000, description: 'Cart price in IQD' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cartPrice?: number;

  @ApiPropertyOptional({ example: 6500, description: 'Shipment fee in IQD' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  shipmentFee?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Material cost in IQD' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  materialCost?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Delivery fee in IQD',
    default: 5000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  deliveryFee?: number;

  @ApiPropertyOptional({
    example: 66500,
    description: 'Total price in IQD (manual override)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether price is manually overridden',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  priceOverride?: boolean;

  // Optional fields
  @ApiPropertyOptional({ example: 'DHL', description: 'Carrier name' })
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiPropertyOptional({
    example: '2025-10-25',
    description: 'Estimated delivery date',
  })
  @IsDateString()
  @IsOptional()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional({
    example: 'Handle with care',
    description: 'Customer-facing notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: 'Priority shipment',
    description: 'Internal admin notes',
  })
  @IsString()
  @IsOptional()
  internalNotes?: string;
}
