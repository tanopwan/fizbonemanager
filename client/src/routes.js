'use stricts';

import Product from './components/Product.vue';
import Batch from './components/Batch.vue';
import Sale from './components/Sale.vue';
import SaleReport from './components/SaleReport.vue';
import Promotion from './components/Promotion.vue';
import Dashboard from './components/Dashboard.vue';

const routes = [
	{ path: '/product', component: Product },
	{ path: '/batch', component: Batch },
	{ path: '/promotion', component: Promotion },
	{ path: '/sale', component: Sale },
	{ path: '/saleReport', component: SaleReport },
	{ path: '/dashboard', component: Dashboard },
]

export default routes;
