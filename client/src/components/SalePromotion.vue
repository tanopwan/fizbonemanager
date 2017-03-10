<template>
	<div class="col-xs-12 col-sm-6 col-md-4">
		<a href="javascript:void(0)" class="widget">
			<div class="widget-content text-light-op" v-bind:class="bgClasses[index % 5]">
				<i class="fa fa-fw fa-chevron-right"></i> <strong>{{ promotion.name }}</strong>
				<span class="pull-right"><i class="fa fa-ticket"></i></span>
			</div>
			<div class="widget-content themed-background-muted text-center">
				<div class="form-group" :class="{ 'has-error': error }">
					<div class="input-group">
						<span class="input-group-addon">จำนวน</span>
						<input type="number" class="form-control" v-model="quantity"></input>
						<span class="input-group-addon" @click="quantity++"><i class="fa fa-plus"></i></span>
						<span class="input-group-addon" @click="quantity--"><i class="fa fa-minus"></i></span>
					</div>
				</div>
				<div class="form-group">
					<div class="input-group">
						<span class="input-group-addon">รายละเอียด</span>
						<input type="text" class="form-control" v-model="description"></input>
						<span class="input-group-btn">
							<button @click="addSaleInternal(getAvaliableStock(promotion.batchId))" type="button" class="btn btn-effect-ripple btn-primary" style="overflow: hidden; position: relative;">Add</button>
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
						<h3 class="widget-heading"><i class="gi gi-more_items text-dark push"></i> <br><small>{{ getAvaliableStock(promotion.batchId) }} in stocks <br>{{promotion.batchId.batchRef}}</small></h3>
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

</template>

<script>
import { EventBus } from '../bus';
import moment from 'moment';

export default {
	props: ['batchStocks', 'promotion', 'isConsignment', 'index', 'onAddSale'],
	data() {
		return {
			bgClasses: [
				'themed-background',
				'themed-background-dark',
				'themed-background-success',
				'themed-background-info',
				'themed-background-danger'
			],
			saleDate: new Date(),
			quantity: this.promotion.quantity,
			description: '',
			error: false
		}
	},
	methods: {
		addSaleInternal(stock) {
			let data = {
				promotionId: this.promotion._id,
				quantity: this.quantity,
				description: this.description,
				saleDate: this.saleDate,
				isConsignment: this.isConsignment
			}
			if (this.quantity > stock) {
				console.log("Over stocks!");
				this.error = true;
				return false;
			}
			this.error = false;
			EventBus.addSale(data).then(response => {
				this.onAddSale(response.body);
			})
			.catch(response => console.log(response));
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
			let changedDate = moment($(this).val(), "YYYY-MM-DD")

			var iscurrentDate = changedDate.isSame(new Date(), "day");
			if (iscurrentDate) {
				vm.saleDate = moment();
			}
			else {
				vm.saleDate = changedDate;
			}
		});
	}
}
</script>
