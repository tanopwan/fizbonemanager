<template>
	<div>
		<div class="col-xs-12">
			<div class="row col-xs-4">
				<div class="block full">
					<input type="text" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" placeholder="dd-mm-yyyy">
				</div>
			</div>
		</div>

		<div v-for="(promotion, index) in promotions" class="col-xs-4">
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
								<button @click="addSaleInternal(promotion)" type="button" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Add</button>
							</span>
						</div>
					</div>
				</div>
				<div class="widget-content text-center">
					<h2 class="widget-heading text-dark">{{ promotion.price / 100 }} x {{ promotion.quantity }} = {{ promotion.price*promotion.quantity / 100 }}</h2>
				</div>
				<div class="widget-content text-center">
					<h2 class="widget-heading text-dark">Stocks</h2>
				</div>
			</a>
		</div>

	</div>
</template>

<script>
import { EventBus } from '../bus';

export default {
	props: ['addSale'],
	data() {
		return {
			bgClasses: [
				'themed-background',
				'themed-background-dark',
				'themed-background-success',
				'themed-background-info',
				'themed-background-danger'
			],
			promotions: [],
			saleDate: new Date()
		}
	},
	methods: {
		addSaleInternal(sale) {
			let data = {
				promotionId: sale._id,
				quantity: sale.quantity,
				price: sale.price,
				description: sale.description,
				saleDate: this.saleDate
			}
			this.addSale(data);
		}
	},
	created() {
		EventBus.getPromotions()
		.then(response => this.promotions = response.body)
		.catch(response => console.log(response));
	},
	mounted() {
		let vm = this;
		$('.input-datepicker').datepicker("setDate", new Date()).on('changeDate', function(e){
			$(this).datepicker('hide');
			vm.saleDate = $(this).val();
		});
	}
}
</script>
