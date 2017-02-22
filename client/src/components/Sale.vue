<template>
	<div>
		<div class="row">
			<sale-promotion></sale-promotion>
		</div>
		<div class="block full">
			<div class="block-title">
				<h2>
					All Sales
				</h2>
			</div>
			<template v-for="sale in sales">
				<table class="table table-striped table-borderless table-vcenter">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th class="hidden-xs">Email</th>
                            <th class="hidden-sm hidden-xs">Status</th>
                            <th style="width: 80px;" class="text-center"><i class="fa fa-flash"></i></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>User1</strong></td>
                            <td class="hidden-xs">user1@example.com</td>
                            <td class="hidden-sm hidden-xs"><a href="javascript:void(0)" class="label label-warning">Pending..</a></td>
                            <td class="text-center">
                                <a href="javascript:void(0)" data-toggle="tooltip" title="" class="btn btn-effect-ripple btn-xs btn-success" style="overflow: hidden; position: relative;" data-original-title="Edit User"><i class="fa fa-pencil"></i></a>
                                <a href="javascript:void(0)" data-toggle="tooltip" title="" class="btn btn-effect-ripple btn-xs btn-danger" style="overflow: hidden; position: relative;" data-original-title="Delete User"><i class="fa fa-times"></i></a>
                            </td>
                        </tr>
                    </tbody>
                </table>
			</template>
		</div>
	</div>
</template>

<script>
import { EventBus } from '../bus';
import salePromotion from './SalePromotion.vue';

export default {
	data() {
		return {
			description: '',
			batches: [],
			sales: [],
		};
	},
	methods: {
		addSale(promotion) {
			/*this.$http.post('/api/sales', { description: this.description }).then(response => {
				this.sales.push(response.body);
			}, response => {
				// TODO
				console.log(response);
			});*/
			console.log(promotion);
		},
		deleteSale(id) {
			this.$http.delete('/api/sales/' + id).then(response => {
				let index = -1;
				this.sales.forEach((sale, idx) => {
					if (sale._id === id) {
						index = idx;
					}
				});
				if (index !== -1) {
					this.sales.splice(index, 1);
				}
			}, response => {
				console.log(response);
			});
		}
	},
	created() {
		EventBus.getBatches()
			.then(response => this.batches = response.body)
			.catch(response => console.log(response));
	},
	components: {
		salePromotion
	}
}
</script>
