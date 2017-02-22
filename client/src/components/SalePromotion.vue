<template>
	<div>
		<div v-for="(promotion, index) in promotions" class="col-sm-4">
			<a href="javascript:void(0)" class="widget">
			<div class="widget-content text-light-op" v-bind:class="bgClasses[index % 5]">
				<i class="fa fa-fw fa-chevron-right"></i> <strong>{{ promotion.name }}</strong>
				<span class="pull-right"><i class="fa fa-ticket"></i> {{ promotion.batchRef }}</span>
			</div>
			<div class="widget-content themed-background-muted text-center">
				<div class="form-group">
					<div class="input-group">
						<span class="input-group-addon">จำนวน</span>
						<input type="number" class="form-control" v-model="promotion.quantity"></input>
						<span class="input-group-addon" @click="promotion.quantity++"><i class="fa fa-plus"></i></span>
						<span class="input-group-addon" @click="promotion.quantity--"><i class="fa fa-minus"></i></span>
					</div>
				</div>
				<div class="form-group">
					<div class="input-group">
						<span class="input-group-addon">รายละเอียด</span>
						<input type="text" class="form-control" v-model="promotion.description"></input>
						<span class="input-group-btn">
							<button @click="addSale(promotion)" type="button" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Add</button>
						</span>
					</div>
				</div>
			</div>
			<div class="widget-content text-center">
				<h2 class="widget-heading text-dark">{{ promotion.price / 100 }} x {{ promotion.quantity }} = {{ promotion.price*promotion.quantity / 100 }}</h2>
			</div>
			</a>
		</div>
	</div>
</template>

<script>
import { EventBus } from '../bus';

export default {
	data() {
		return {
			bgClasses: [
				'themed-background',
				'themed-background-dark',
				'themed-background-success',
				'themed-background-info',
				'themed-background-danger'
			],
			promotions: []
		}
	},
	methods: {
		addSale(sale) {
			let data = {
				promotionRef: sale.name,
				quantity: sale.quantity,
				price: sale.price,
				description: sale.description
			}
			EventBus.addSale(data)
				.then(response => {
				this.sales.push(response.body);
			}, response => {
				// TODO
				console.log(response);
			});
		}
	},
	created() {
		EventBus.getPromotions()
			.then(response => this.promotions = response.body)
			.catch(response => console.log(response));
	}
}
</script>
