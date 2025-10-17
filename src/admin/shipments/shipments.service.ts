import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Shipment,
  ShipmentDocument,
  ShipmentPlatform,
  ShipmentStatus,
} from './schemas/shipment.schema';
import {
  CreateShipmentDto,
  UpdateShipmentDto,
  UpdateStatusDto,
  CalculatePriceDto,
  PriceCalculationResult,
} from './dto';
import { UsersService } from '../../users/users.service';

// Platform Pricing Configuration
export interface PlatformPricingConfig {
  pricePerKg: number;           // Price per kilogram in IQD
  defaultDeliveryFee: number;   // Default delivery fee in Iraq
  defaultMaterialCost: number;  // Default material/packaging cost
  currency: string;             // Currency (IQD)
}

const PLATFORM_PRICING: Record<ShipmentPlatform, PlatformPricingConfig> = {
  [ShipmentPlatform.SHEIN]: {
    pricePerKg: 6500,          // شي ان: 6,500 دينار لكل كيلو
    defaultDeliveryFee: 5000,  // 5,000 دينار توصيل داخل العراق
    defaultMaterialCost: 0,    // تكلفة التغليف (حسب الطلب)
    currency: 'IQD',
  },
  [ShipmentPlatform.AMAZON]: {
    pricePerKg: 8000,          // أمازون: 8,000 دينار لكل كيلو (أغلى)
    defaultDeliveryFee: 5000,  // 5,000 دينار توصيل
    defaultMaterialCost: 0,
    currency: 'IQD',
  },
  [ShipmentPlatform.SHEGLAM]: {
    pricePerKg: 5500,          // شي جلام: 5,500 دينار لكل كيلو (أرخص)
    defaultDeliveryFee: 5000,  // 5,000 دينار توصيل
    defaultMaterialCost: 0,
    currency: 'IQD',
  },
  [ShipmentPlatform.OTHER]: {
    pricePerKg: 7000,          // منصات أخرى: 7,000 دينار لكل كيلو
    defaultDeliveryFee: 5000,  // 5,000 دينار توصيل
    defaultMaterialCost: 0,
    currency: 'IQD',
  },
};

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
    private usersService: UsersService,
  ) {}

  /**
   * Generate unique tracking number
   */
  private async generateTrackingNumber(
    platform: ShipmentPlatform,
  ): Promise<string> {
    const platformPrefix = platform.toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const trackingNumber = `MEY-${platformPrefix}-${timestamp}${random}`;

    // Ensure uniqueness
    const existing = await this.shipmentModel.findOne({ trackingNumber });
    if (existing) {
      return this.generateTrackingNumber(platform); // Retry if collision
    }

    return trackingNumber;
  }

  /**
   * Get platform pricing configuration
   */
  getPlatformPricing(platform: ShipmentPlatform): PlatformPricingConfig {
    return PLATFORM_PRICING[platform];
  }

  /**
   * Get all platform pricing configurations
   */
  getAllPlatformPricing(): Record<ShipmentPlatform, PlatformPricingConfig> {
    return PLATFORM_PRICING;
  }

  /**
   * Calculate shipment price based on platform
   * رسوم الشحن = الوزن × السعر لكل كيلو
   */
  calculatePrice(dto: CalculatePriceDto): PriceCalculationResult {
    const config = PLATFORM_PRICING[dto.platform];
    
    if (!config) {
      throw new BadRequestException(`Invalid platform: ${dto.platform}`);
    }

    // Calculate shipment fee: Weight × Price per KG
    // رسوم الشحن = الوزن × السعر لكل كيلو
    const shipmentFee = Math.ceil(dto.weight) * config.pricePerKg;

    // Use provided values or defaults from config
    const cartPrice = dto.cartPrice;
    const materialCost = dto.materialCost ?? config.defaultMaterialCost;
    const deliveryFee = dto.deliveryFee ?? config.defaultDeliveryFee;

    // Calculate total
    // المجموع = سعر السلة + رسوم الشحن + تكلفة التغليف + رسوم التوصيل
    const totalPrice = cartPrice + shipmentFee + materialCost + deliveryFee;

    return {
      cartPrice,
      shipmentFee,
      materialCost,
      deliveryFee,
      totalPrice,
      platform: dto.platform,
      weight: dto.weight,
    };
  }

  /**
   * Create new shipment
   */
  async create(
    createShipmentDto: CreateShipmentDto,
  ): Promise<ShipmentDocument> {
    // Validate userId if provided
    if (createShipmentDto.userId) {
      const user = await this.usersService.findById(createShipmentDto.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // Generate tracking number
    const trackingNumber = await this.generateTrackingNumber(
      createShipmentDto.platform,
    );

    // Calculate cart price from items if not provided
    let cartPrice = createShipmentDto.cartPrice;
    if (!cartPrice) {
      cartPrice = createShipmentDto.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    }

    // Calculate pricing if not manually overridden
    let pricing;
    if (
      createShipmentDto.priceOverride &&
      createShipmentDto.totalPrice !== undefined
    ) {
      // Manual override
      pricing = {
        cartPrice: createShipmentDto.cartPrice ?? cartPrice,
        shipmentFee: createShipmentDto.shipmentFee ?? 0,
        materialCost: createShipmentDto.materialCost ?? 0,
        deliveryFee: createShipmentDto.deliveryFee ?? 5000,
        totalPrice: createShipmentDto.totalPrice,
        priceOverride: true,
      };
    } else {
      // Auto-calculate
      const calculated = this.calculatePrice({
        platform: createShipmentDto.platform,
        cartPrice,
        weight: createShipmentDto.weight,
        materialCost: createShipmentDto.materialCost,
        deliveryFee: createShipmentDto.deliveryFee,
      });

      pricing = {
        cartPrice: calculated.cartPrice,
        shipmentFee: calculated.shipmentFee,
        materialCost: calculated.materialCost,
        deliveryFee: calculated.deliveryFee,
        totalPrice: calculated.totalPrice,
        priceOverride: false,
      };
    }

    const shipment = new this.shipmentModel({
      trackingNumber,
      customerName: createShipmentDto.customerName,
      customerPhone: createShipmentDto.customerPhone,
      customerAddress: createShipmentDto.customerAddress,
      userId: createShipmentDto.userId
        ? new Types.ObjectId(createShipmentDto.userId)
        : null,
      platform: createShipmentDto.platform,
      items: createShipmentDto.items,
      weight: createShipmentDto.weight,
      dimensions: createShipmentDto.dimensions,
      pricing,
      status: ShipmentStatus.PENDING,
      carrier: createShipmentDto.carrier,
      estimatedDeliveryDate: createShipmentDto.estimatedDeliveryDate,
      notes: createShipmentDto.notes,
      internalNotes: createShipmentDto.internalNotes,
    });

    return shipment.save();
  }

  /**
   * Find all shipments with optional filters
   */
  async findAll(filters?: {
    status?: ShipmentStatus;
    platform?: ShipmentPlatform;
    userId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<ShipmentDocument[]> {
    const query: any = {};

    if (filters) {
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.platform) {
        query.platform = filters.platform;
      }

      if (filters.userId) {
        query.userId = new Types.ObjectId(filters.userId);
      }

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }

      if (filters.search) {
        query.$or = [
          { trackingNumber: { $regex: filters.search, $options: 'i' } },
          { customerName: { $regex: filters.search, $options: 'i' } },
          { customerPhone: { $regex: filters.search, $options: 'i' } },
        ];
      }
    }

    return this.shipmentModel
      .find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find single shipment by ID
   */
  async findOne(id: string): Promise<ShipmentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid shipment ID');
    }

    const shipment = await this.shipmentModel
      .findById(id)
      .populate('userId', 'username email')
      .exec();

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  /**
   * Find shipment by tracking number
   */
  async findByTrackingNumber(
    trackingNumber: string,
  ): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel
      .findOne({ trackingNumber })
      .populate('userId', 'username email')
      .exec();

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  /**
   * Update shipment
   */
  async update(
    id: string,
    updateShipmentDto: UpdateShipmentDto,
  ): Promise<ShipmentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid shipment ID');
    }

    // Validate userId if provided
    if (updateShipmentDto.userId) {
      const user = await this.usersService.findById(updateShipmentDto.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    const shipment = await this.shipmentModel.findById(id);
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Recalculate pricing if relevant fields changed
    if (
      updateShipmentDto.weight !== undefined ||
      updateShipmentDto.platform !== undefined ||
      updateShipmentDto.items !== undefined
    ) {
      const cartPrice = updateShipmentDto.items
        ? updateShipmentDto.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          )
        : shipment.pricing.cartPrice;

      if (!updateShipmentDto.priceOverride) {
        const calculated = this.calculatePrice({
          platform: updateShipmentDto.platform ?? shipment.platform,
          cartPrice: updateShipmentDto.cartPrice ?? cartPrice,
          weight: updateShipmentDto.weight ?? shipment.weight,
          materialCost:
            updateShipmentDto.materialCost ?? shipment.pricing.materialCost,
          deliveryFee:
            updateShipmentDto.deliveryFee ?? shipment.pricing.deliveryFee,
        });

        updateShipmentDto['pricing'] = {
          cartPrice: calculated.cartPrice,
          shipmentFee: calculated.shipmentFee,
          materialCost: calculated.materialCost,
          deliveryFee: calculated.deliveryFee,
          totalPrice: calculated.totalPrice,
          priceOverride: false,
        };
      }
    }

    // Handle manual price override
    if (
      updateShipmentDto.priceOverride &&
      updateShipmentDto.totalPrice !== undefined
    ) {
      updateShipmentDto['pricing'] = {
        ...shipment.pricing,
        totalPrice: updateShipmentDto.totalPrice,
        priceOverride: true,
      };
    }

    const updatedShipment = await this.shipmentModel
      .findByIdAndUpdate(id, updateShipmentDto, { new: true })
      .populate('userId', 'username email')
      .exec();

    return updatedShipment!;
  }

  /**
   * Update shipment status
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<ShipmentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid shipment ID');
    }

    const shipment = await this.shipmentModel.findById(id);
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const updateData: any = {
      status: updateStatusDto.status,
    };

    // Update notes if provided
    if (updateStatusDto.notes) {
      updateData.internalNotes = shipment.internalNotes
        ? `${shipment.internalNotes}\n[${new Date().toISOString()}] ${updateStatusDto.notes}`
        : `[${new Date().toISOString()}] ${updateStatusDto.notes}`;
    }

    // Set actual delivery date if status is delivered
    if (updateStatusDto.status === ShipmentStatus.DELIVERED) {
      updateData.actualDeliveryDate = updateStatusDto.actualDeliveryDate
        ? new Date(updateStatusDto.actualDeliveryDate)
        : new Date();
    }

    const updatedShipment = await this.shipmentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'username email')
      .exec();

    return updatedShipment!;
  }

  /**
   * Delete shipment
   */
  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid shipment ID');
    }

    const result = await this.shipmentModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Shipment not found');
    }

    return { message: 'Shipment deleted successfully' };
  }

  /**
   * Get shipment statistics
   */
  async getStatistics(): Promise<any> {
    const totalShipments = await this.shipmentModel.countDocuments();

    const statusCounts = await this.shipmentModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const platformCounts = await this.shipmentModel.aggregate([
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = await this.shipmentModel.aggregate([
      {
        $match: { status: { $ne: ShipmentStatus.CANCELLED } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.totalPrice' },
        },
      },
    ]);

    return {
      totalShipments,
      byStatus: statusCounts,
      byPlatform: platformCounts,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }
}
