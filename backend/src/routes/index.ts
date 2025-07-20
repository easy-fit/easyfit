import { Router } from 'express';

import { userRoutes } from './user.routes';
import { storeRoutes } from './store.routes';
import { orderRoutes } from './order.routes';
import { returnDamageRoutes } from './returnDamage.routes';
import { productRoutes } from './product.routes';
import { authRoutes } from './auth.routes';
import { kycRoutes } from './kyc.routes';
import { cartRoutes } from './cart.routes';
import { checkoutRoutes } from './checkout.routes';
import { adminRoutes } from './admin.routes';
import { paymentRoutes } from './payment.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/orders', orderRoutes);
router.use('/returns', returnDamageRoutes);
router.use('/auth', authRoutes);
router.use('/kyc', kycRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);

export default router;
