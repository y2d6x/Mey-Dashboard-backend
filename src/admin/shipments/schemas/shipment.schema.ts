import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShipmentDocument = Shipment & Document;

export enum ShipmentPlatform {
  SHEIN = 'shein',
  AMAZON = 'amazon',
  SHEGLAM = 'sheglam',
  OTHER = 'other',
}

export enum ShipmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

@Schema({ _id: false })
export class ShipmentItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

@Schema({ _id: false })
export class PackageDimensions {
  @Prop({ required: true })
  length: number;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  unit: string; // cm or inch
}

@Schema({ _id: false })
export class CustomerAddress {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  province: string;

  @Prop()
  postalCode?: string;

  @Prop({ default: 'Iraq' })
  country: string;
}

@Schema({ _id: false })
export class PricingDetails {
  @Prop({ required: true, default: 0 })
  cartPrice: number;

  @Prop({ required: true, default: 0 })
  shipmentFee: number;

  @Prop({ required: true, default: 0 })
  materialCost: number;

  @Prop({ required: true, default: 5000 })
  deliveryFee: number;

  @Prop({ required: true, default: 0 })
  totalPrice: number;

  @Prop({ default: false })
  priceOverride: boolean;
}

@Schema({ timestamps: true })
export class Shipment {
  @Prop({ required: true, unique: true })
  trackingNumber: string;

  // Customer Information
  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop({ type: CustomerAddress, required: true })
  customerAddress: CustomerAddress;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId?: Types.ObjectId;

  // Shipment Details
  @Prop({ type: String, enum: ShipmentPlatform, required: true })
  platform: ShipmentPlatform;

  @Prop({ type: [ShipmentItem], required: true })
  items: ShipmentItem[];

  @Prop({ required: true })
  weight: number; // in kg

  @Prop({ type: PackageDimensions })
  dimensions?: PackageDimensions;

  // Pricing
  @Prop({ type: PricingDetails, required: true })
  pricing: PricingDetails;

  // Status and Tracking
  @Prop({ type: String, enum: ShipmentStatus, default: ShipmentStatus.PENDING })
  status: ShipmentStatus;

  @Prop()
  carrier?: string;

  @Prop()
  estimatedDeliveryDate?: Date;

  @Prop()
  actualDeliveryDate?: Date;

  // Notes
  @Prop()
  notes?: string; // Customer-facing notes

  @Prop()
  internalNotes?: string; // Internal admin notes
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);

// Add indexes for common queries
ShipmentSchema.index({ trackingNumber: 1 });
ShipmentSchema.index({ status: 1 });
ShipmentSchema.index({ platform: 1 });
ShipmentSchema.index({ userId: 1 });
ShipmentSchema.index({ createdAt: -1 });
