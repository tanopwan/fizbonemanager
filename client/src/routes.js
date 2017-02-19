'use stricts';

import Product from './components/Product.vue';
import Batch from './components/Batch.vue';
import Sell from './components/Sell.vue';

const routes = [
  { path: '/product', component: Product },
  { path: '/batch', component: Batch },
  { path: '/sell', component: Sell },
]

export default routes;
