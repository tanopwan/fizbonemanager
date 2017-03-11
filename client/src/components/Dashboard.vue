<template>
	<div id="page-content" style="min-height: 454px;">
		<div class="row">
			<div class="col-sm-6 col-lg-3">
				<a href="javascript:void(0)" class="widget">
					<div class="widget-content widget-content-mini text-right clearfix">
						<div class="widget-icon pull-left themed-background-warning">
							<i class="gi gi-briefcase text-light-op"></i>
						</div>
						<h2 class="widget-heading h3 text-warning">
							<strong>Monthly</strong>
						</h2>
						<span class="text-muted">{{latestMonth}}</span>
					</div>
				</a>
			</div>
			<div class="col-sm-6 col-lg-3">
				<a href="javascript:void(0)" class="widget">
					<div class="widget-content widget-content-mini text-right clearfix">
						<div class="widget-icon pull-left themed-background">
							<i class="gi gi-cardio text-light-op"></i>
						</div>
						<h2 class="widget-heading h3">
							<strong><span id="totalTransactionCounter" data-toggle="counter">{{ totalTransaction }}</span></strong>
						</h2>
						<span class="text-muted">TRANSACTIONS</span>
					</div>
				</a>
			</div>
			<div class="col-sm-6 col-lg-3">
				<a href="javascript:void(0)" class="widget">
					<div class="widget-content widget-content-mini text-right clearfix">
						<div class="widget-icon pull-left themed-background-success">
							<i class="gi gi-user text-light-op"></i>
						</div>
						<h2 class="widget-heading h3 text-success">
							<strong>+ <span id="totalQuantityCounter" data-toggle="counter">{{ totalQuantity }}</span></strong>
						</h2>
						<span class="text-muted">SALES</span>
					</div>
				</a>
			</div>
			<div class="col-sm-6 col-lg-3">
				<a href="javascript:void(0)" class="widget">
					<div class="widget-content widget-content-mini text-right clearfix">
						<div class="widget-icon pull-left themed-background-danger">
							<i class="gi gi-wallet text-light-op"></i>
						</div>
						<h2 class="widget-heading h3 text-danger">
							<strong>&#x0E3F; <span id="totalAmountCounter" data-toggle="counter">{{ totalAmount }}</span></strong>
						</h2>
						<span class="text-muted">EARNINGS</span>
					</div>
				</a>
			</div>
		</div>
		<div class="row">
			<div class="col-xs-12 col-md-6">
				<div class="widget">
					<div class="widget-content border-bottom">
						<span class="pull-right text-muted">% completed</span>
						Batches
					</div>
					<a href="javascript:void(0)" class="widget-content themed-background-muted text-right clearfix"
					v-for="batchStock in batchStocks" @click="selectBatch(batchStock._id)">
					<h2 class="widget-heading h3 text-muted">{{ batchStock.batchName }} <small>{{ batchStock.width.toFixed(2) }}%</small></h2>
					<div class="progress progress-striped progress-mini active">
						<div class="progress-bar progress-bar-success" role="progressbar" v-bind:style="{ width: batchStock.width + '%' }"></div>
					</div>
				</a>
			</div>
		</div>
		<div class="col-xs-12 col-md-6">
			<div id="chart-pie" style="height: 380px;"></div>
		</div>
	</div>
</div>
</div>
</template>

<script>
import { EventBus } from '../bus';

const colors = ['#5cafde', '#deb25c', '#de815c', '#7fb364', '#5ccdde', '#454e59']

export default {
	data() {
		return {
			saleSummaries: [{}],
			batchStocks: [],
			totalQuantity: 0,
			totalAmount: 0,
			totalTransaction: 0,
			latestMonth: 'N/A'
		};
	},
	methods: {
		selectBatch(id) {
			EventBus.getBatchStock(id)
			.then(response => {
				let labels = [];
				let piecolors = [];
				response.data.forEach((data, idx) => {
					labels.push({ label: data.promotionName, data: data.totalQuantity });
					piecolors.push(colors[idx % colors.length]);
				});
				// Pie Chart
				$.plot($('#chart-pie'),
					labels,
					{
						colors: piecolors,
						legend: {show: false},
						series: {
							pie: {
								show: true,
								radius: 1,
								label: {
									show: true,
									radius: 2/3,
									formatter: function(label, pieSeries) {
										return '<div class="chart-pie-label">' + label + '<br>' + Math.round(pieSeries.percent) + '%</div>';
									},
									background: {opacity: .75, color: '#000000'}
								}
							}
						}
					}
				);
			})
			.catch(response => console.log(response));
		}
	},
	created() {
		EventBus.getSaleSummary()
		.then(response => {
			this.saleSummaries = response.body;
			if (this.saleSummaries.length > 0) {
				this.totalQuantity = this.saleSummaries[0].totalQuantity;
				this.totalAmount = this.saleSummaries[0].totalAmount / 100;
				this.totalTransaction = this.saleSummaries[0].transaction;
				if (this.saleSummaries[0]._id) {
					this.latestMonth = moment([this.saleSummaries[0]._id.year, this.saleSummaries[0]._id.month - 1]).format("MMMM of YYYY");
				}

				console.log($('#totalQuantityCounter'));
				//$('#totalQuantityCounter').context.dataset.to = this.quantity;
				let vm = this;
				$('[data-toggle="counter"]').each(function(){
					var $this = $(this);
					if (this.id === "totalTransactionCounter") {
						$this.context.dataset.to = vm.totalTransaction;
					}
					else if (this.id === "totalQuantityCounter") {
						$this.context.dataset.to = vm.totalQuantity;
					}
					else if (this.id === "totalAmountCounter") {
						$this.context.dataset.to = vm.totalAmount;
					}
					$this.countTo({
						speed: 1000,
						refreshInterval: 25,
						onComplete: function() {
							if($this.data('after')) {
								$this.html($this.html() + $this.data('after'));
							}
						}
					});
				});
			}
		})
		.catch(response => console.log(response));
		EventBus.getBatchStock()
		.then(response => {
			this.batchStocks = response.body;
			this.batchStocks.forEach((batchStock, index) => {
				let width = (batchStock.totalQuantity / batchStock.totalStock) * 100;
				this.$set(this.batchStocks[index], 'width', width);
			});
		})
		.catch(response => console.log(response));
	},
	mounted() {

	}
}
</script>
