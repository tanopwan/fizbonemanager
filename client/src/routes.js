'use stricts';

import Product from 'pages/Product.vue';
import Batch from 'pages/Batch.vue';
import Sale from 'pages/Sale.vue';
import Order from 'pages/Order.vue';
import SaleReport from 'pages/SaleReport.vue';
import BatchReport from 'pages/BatchReport.vue';
import Promotion from 'pages/Promotion.vue';
import Consignment from 'pages/Consignment.vue';
import Customer from 'pages/Customer.vue';
import Dashboard from 'pages/Dashboard.vue';
import PageContent from 'pages/PageContent.vue';
import OnlineShop from 'pages/OnlineShop.vue';
import PageSettings from 'pages/PageSettings.vue';
import OrderReport from 'pages/OrderReport.vue';

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
      { path: '/order_report', component: OrderReport },
			{ path: '/onlineshop', component: OnlineShop },
      { path: '/page_settings', component: PageSettings },
		]
	},
	{ path: '/dashboard', component: Dashboard }
];

export default routes;
