import { ProductModel } from '../../models/product.model';
import { ProductFilterOptions } from '../../types/product.types';
import { StoreModel } from '../../models/store.model';
import { AppError } from '../../utils/appError';
import mongoose from 'mongoose';

// Stores to boost in discovery sort (pushed to top)
const BOOSTED_STORE_IDS = [
  new mongoose.Types.ObjectId('69304c2bb514dcd959d1ab6a'),
  new mongoose.Types.ObjectId('693acf8daacd65a2d47d2ec8'),
];

// Stores to deprioritize in discovery sort (pushed to bottom)
const DEPRIORITIZED_STORE_IDS = [
  new mongoose.Types.ObjectId('68c7870b26718100fa87696c'), // Area Cocot
  new mongoose.Types.ObjectId('68c786e026718100fa876958'), // Adorate
];

export class ProductFilterService {
  static async getFilteredProducts(options: ProductFilterOptions = {}) {
    const { search, category, minPrice, maxPrice, page = 1, limit = 20, sort = '-createdAt' } = options;

    const matchFilter: any = {
      status: 'published',
    };

    if (category) {
      // Check if category is a regex pattern (starts with ^)
      // This is used for gender-level filtering (e.g., ^hombre matches all hombre.* categories)
      if (category.startsWith('^')) {
        const genderPattern = category.substring(1); // Remove the ^ prefix
        // Include unisex products when searching for hombre or mujer
        if (genderPattern === 'hombre' || genderPattern === 'mujer') {
          matchFilter.category = { $regex: `^(${genderPattern}|unisex)`, $options: 'i' };
        } else {
          matchFilter.category = { $regex: `^${genderPattern}`, $options: 'i' };
        }
      } else {
        matchFilter.category = category;
      }
    }

    if (search) {
      matchFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      {
        $lookup: {
          from: 'stores',
          localField: 'storeId',
          foreignField: '_id',
          as: 'store',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$store',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          minPrice: { $min: '$variants.price' },
          defaultImage: {
            $let: {
              vars: {
                defaultVariant: {
                  $arrayElemAt: [
                    { $filter: { input: '$variants', cond: { $eq: ['$$this.isDefault', true] } } },
                    0,
                  ],
                },
              },
              in: {
                $ifNull: [
                  { $arrayElemAt: ['$$defaultVariant.images.key', 0] },
                  { $arrayElemAt: [{ $arrayElemAt: ['$variants.images.key', 0] }, 0] },
                ],
              },
            },
          },
          availableColors: {
            $setUnion: ['$variants.color', []],
          },
        },
      },
    ];

    // Add price filtering after aggregation calculations
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: any = {};
      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
      pipeline.push({ $match: { minPrice: priceFilter } });
    }

    // Add sorting
    if (sort === 'discovery') {
      // Discovery sort: Create more dynamic mixing to avoid store clustering
      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay();
      const currentMinute = new Date().getMinutes();

      pipeline.push({
        $addFields: {
          // Create a more dynamic discovery score that changes over time
          discoveryScore: {
            $add: [
              // Time-based rotation that changes frequently
              { $multiply: [
                { $mod: [
                  { $add: [
                    { $multiply: [currentHour, 13] }, // Changes hourly
                    { $multiply: [currentMinute, 7] }, // Changes every minute for more variety
                    { $multiply: [currentDay, 31] } // Daily variation
                  ]},
                  100
                ]},
                1
              ]},
              // Recent products get some boost (but not dominant)
              { $multiply: [{ $divide: [{ $subtract: [new Date(), '$createdAt'] }, 86400000] }, -0.02] },
              // Boost products with more color variety
              { $multiply: [{ $size: '$availableColors' }, 2] },
              // Price-based variation for mixing
              { $multiply: [{ $mod: ['$minPrice', 7] }, 0.5] },
              // Boost specific stores (push to top)
              { $cond: [{ $in: ['$storeId', BOOSTED_STORE_IDS] }, 9999, 0] },
              // Deprioritize specific stores (push to bottom)
              { $cond: [{ $in: ['$storeId', DEPRIORITIZED_STORE_IDS] }, -9999, 0] }
            ]
          }
        }
      });
      pipeline.push({ $sort: { discoveryScore: -1, _id: 1 } });
    } else {
      // Standard sorting for other cases
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      pipeline.push({ $sort: { [sortField]: sortOrder } });
    }

    // Execute aggregation with pagination
    const [products, totalResult] = await Promise.all([
      ProductModel.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
      ProductModel.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = totalResult[0]?.total || 0;
    const pages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      pages,
      limit,
    };
  }

  static async getProductsByStore(storeSlug: string) {
    const storeId = await this.getStoreIdBySlug(storeSlug);

    const products = await ProductModel.aggregate([
      {
        $match: {
          storeId: storeId,
          status: 'published',
        },
      },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      {
        $lookup: {
          from: 'stores',
          localField: 'storeId',
          foreignField: '_id',
          as: 'store',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$store',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          minPrice: { $min: '$variants.price' },
          defaultImage: {
            $let: {
              vars: {
                defaultVariant: {
                  $arrayElemAt: [
                    { $filter: { input: '$variants', cond: { $eq: ['$$this.isDefault', true] } } },
                    0,
                  ],
                },
              },
              in: {
                $ifNull: [
                  { $arrayElemAt: ['$$defaultVariant.images.key', 0] },
                  { $arrayElemAt: [{ $arrayElemAt: ['$variants.images.key', 0] }, 0] },
                ],
              },
            },
          },
          availableColors: {
            $setUnion: ['$variants.color', []],
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return products;
  }

  static async getProductBySlug(storeSlug: string, slug: string) {
    const storeId = await this.getStoreIdBySlug(storeSlug);

    const products = await ProductModel.aggregate([
      {
        $match: {
          storeId: storeId,
          slug: slug,
        },
      },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      { $limit: 1 },
    ]);

    if (!products || products.length === 0) {
      return null;
    }

    return products[0];
  }

  private static async getStoreIdBySlug(storeSlug: string) {
    const store = await StoreModel.findOne({ slug: storeSlug }).select('_id').lean();

    if (!store) {
      throw new AppError('Store not found', 404);
    }

    return store._id;
  }
}
