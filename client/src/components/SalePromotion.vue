<template>
	<div>
		<div class="block full">
			<div class="row">
				<div class="col-xs-12 col-sm-6 col-md-4">
					<div class="input-group">
						<span class="input-group-addon">Custom Date</span>
						<input type="text" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" placeholder="dd-mm-yyyy">
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div v-for="(promotion, index) in activePromotions" class="col-xs-12 col-sm-6 col-md-4">
				<a href="javascript:void(0)" class="widget">
					<div class="widget-content text-light-op" v-bind:class="bgClasses[index % 5]">
						<i class="fa fa-fw fa-chevron-right"></i> <strong>{{ promotion.name }}</strong>
						<span class="pull-right"><i class="fa fa-ticket"></i></span>
					</div>
					<div class="widget-content themed-background-muted text-center">
						<div class="form-group" :class="{ 'has-error': promotion.error }">
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
									<button @click="addSaleInternal(promotion, getAvaliableStock(promotion.batchId))" type="button" class="btn btn-effect-ripple btn-primary" style="overflow: hidden; position: relative;">Add</button>
								</span>
							</div>
						</div>
					</div>
					<div class="widget-content widget-content-full-top-bottom border-bottom">
						<div class="row text-center">
							<div class="col-xs-6 push-inner-top-bottom border-right">
								<h3 class="widget-heading"><i class="gi gi-money text-dark push"></i> <br><small>{{ promotion.price / 100 }} x {{ promotion.quantity }} = &#x0E3F;{{ promotion.price*promotion.quantity / 100 }}</small></h3>
							</div>
							<div class="col-xs-6 push-inner-top-bottom">
								<h3 class="widget-heading"><i class="gi gi-more_items text-dark push"></i> <br><small>{{ getAvaliableStock(promotion.batchId) }} Avaliables</small></h3>
							</div>
						</div>
					</div>
					<div class="widget-content text-center">
						<h3 class="widget-heading text-dark">
							{{ promotion.batchId.productId.name }}
						</h3>
					</div>
				</a>
			</div>
		</div>
	</div>
</template>

<script>
import { EventBus } from '../bus';

export default {
	props: ['addSale', 'batchStocks', 'promotions'],
	data() {
		return {
			bgClasses: [
				'themed-background',
				'themed-background-dark',
				'themed-background-success',
				'themed-background-info',
				'themed-background-danger'
			],
			saleDate: new Date()
		}
	},
	computed: {
		activePromotions: function() {
			if (this.promotions) {
				return this.promotions.filter(promotion => {
					console.log(promotion.isActive);
					if (promotion.isActive === false) {
						return false;
					}
					return true;
				});
			}
			return [];
		}
	},
	methods: {
		addSaleInternal(sale, stock) {
			let data = {
				promotionId: sale._id,
				quantity: sale.quantity,
				price: sale.price,
				description: sale.description,
				saleDate: this.saleDate
			}

			if (data.quantity > stock) {
				console.log("Over stocks!");
				this.$set(sale, 'error', true);
				return false;
			}
			this.$set(sale, 'error', false);
			this.addSale(data);
		},
		getBatchStock(batchId) {
			let batch = null;
			this.batchStocks.forEach(batchStock => {
				if (batchStock._id === batchId) {
					batch = batchStock;
				}
			});
			return batch;
		},
		getAvaliableStock(batch) {
			let stock = batch.quantity;
			let batchSummary = this.getBatchStock(batch._id);
			let totalQuantity = batchSummary ? batchSummary.totalQuantity : 0;
			return stock - totalQuantity;
		}
	},
	mounted() {
		let vm = this;
		$('.select-select2').select2();
		$('.input-datepicker').datepicker("setDate", new Date()).on('changeDate', function(e){
			$(this).datepicker('hide');
			vm.saleDate = $(this).val();
		});
	}
}
</script>
