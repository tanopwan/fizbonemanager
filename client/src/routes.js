'use stricts';

import Product from './components/Product.vue';
import Batch from './components/pages/Batch.vue';
import Sale from './components/Sale.vue';
import Order from './components/Order.vue';
import SaleReport from './components/SaleReport.vue';
import BatchReport from './components/BatchReport.vue';
import Promotion from './components/Promotion.vue';
import Consignment from './components/Consignment.vue';
import Customer from './components/Customer.vue';
import Dashboard from './components/Dashboard.vue';
import PageContent from './components/PageContent.vue';
import OnlineShop from './components/OnlineShop.vue';
import PageSettings from './components/PageSettings.vue';

const routes = [
	{
		path: '/',
		component: PageContent,
		children: [
			{ path: 'product', component: Product },
			{ path: 'batch', component: Batch },
			{ path: '/promotion', component: Promotion },
			{ path: '/consignment', component: Consignment },
			{ path: '/sale', component: Sale },
			{ path: '/order', component: Order },
			{ path: '/customer', component: Customer },
			{ path: '/sale_report', component: SaleReport },
			{ path: '/batch_report', component: BatchReport },
			{ path: '/onlineshop', component: OnlineShop },
			{ path: '/page_settings', component: PageSettings },
		]
	},
	{ path: '/dashboard', component: Dashboard }
];

export default routes;
