import { Router } from 'express';

import { userRoutes } from './user.routes';
import { storeRoutes } from './store.routes';
import { productRoutes } from './product.routes';
import { orderRoutes } from './order.routes';
import { returnDamageRoutes } from './returnDamage.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/returns', returnDamageRoutes);

export default router;
