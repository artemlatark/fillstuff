import authRoutes from './auth';
import registration from './registration';
import users from './users';
import stocks from './stocks';
import products from './products';

const router = app => {
	app.use('/auth', authRoutes);
	app.use('/api', registration);
	app.use('/api', users);
	app.use('/api', stocks);
	app.use('/api', products);
};

export default router;
