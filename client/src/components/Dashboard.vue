<template>
	<div id="page-content" style="min-height: 454px;" class="inner-sidebar-right">
		<!-- Inner Sidebar -->
		<div id="page-content-sidebar">
			<div class="collapse navbar-collapse remove-padding">

				<div class="block-section" >
					<h4 class="inner-sidebar-header">
						Monthly Report
					</h4>
					<ul class="nav nav-pills nav-stacked nav-icons">
						<li v-for="(summary, $index) in saleSummaries">
							<a href="javascript:void(0)" @click="selectMonthIndex=$index">
								<i class="fa fa-fw fa-circle icon-push text-info"></i> <strong>{{ summary._id.month }} / {{ summary._id.year }}</strong>
							</a>
						</li>
					</ul>
				</div>

				<!-- Labels -->
				<div class="block-section" v-for="product in products">
					<h4 class="inner-sidebar-header">
						{{ product.name }}
					</h4>
					<ul class="nav nav-pills nav-stacked nav-icons">
						<li v-for="batch in product.batches">
							<a href="javascript:void(0)">
								<i class="fa fa-fw fa-circle icon-push text-info"></i> <strong>{{ batch.batchRef }}</strong>
							</a>
						</li>
					</ul>
				</div>
				<!-- END Labels -->
			</div>
			<!-- END Collapsible Navigation -->
		</div>
		<!-- END Inner Sidebar -->
		<div class="row">
			<div class="col-xs-12 col-sm-6 col-lg-3">
				<a href="javascript:void(0)" class="widget">
					<div class="widget-content widget-content-mini text-right clearfix">
						<div class="widget-icon pull-left themed-background-warning">
							<i class="gi gi-briefcase text-light-op"></i>
						</div>
						<h2 class="widget-heading h3 text-warning">
							<strong>Monthly</strong>
						</h2>
						<span class="text-muted">{{selectMonthName}}</span>
					</div>
				</a>
			</div>
			<div class="col-xs-12 col-sm-6 col-lg-3">
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
			<div class="col-xs-12 col-sm-6 col-lg-3">
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
			<div class="col-xs-12 col-sm-6 col-lg-3">
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
			<div class="col-xs-12 col-sm-4">
				<div class="widget">
					<div class="widget-content border-bottom">
						<span class="pull-right text-muted">% completed</span>
						Batches
					</div>
					<a href="javascript:void(0)" class="widget-content themed-background-muted text-right clearfix"
					v-for="batchStock in batchStocks" @click="selectBatch(batchStock._id)">
					<h2 class="widget-heading h5 text-muted">{{ batchStock.productName }} - {{ batchStock.batchName }} <small>{{ batchStock.width.toFixed(2) }}%</small></h2>
					<div class="progress progress-striped progress-mini active">
						<div class="progress-bar progress-bar-success" role="progressbar" v-bind:style="{ width: batchStock.width + '%' }"></div>
					</div>
				</a>
			</div>
		</div>
		<div class="col-xs-12 col-sm-4">
			<div class="widget">
				<div class="widget-content border-bottom">
					<span class="pull-right text-muted">per Batch</span>
					Promotion
				</div>
				<div class="widget-content border-bottom themed-background-muted">
					<div id="chart-pie" style="height: 280px;"></div>
				</div>
			</div>
		</div>
		<div class="col-xs-12 col-sm-4">
			<div class="widget">
				<div class="widget-content border-bottom">
					<span class="pull-right text-muted">{{ dateRange }}</span>
					Batch Detail
				</div>
				<div class="widget-content border-bottom themed-background-muted text-center">
					<span id="widget-dashchart-sales"></span>
				</div>
				<div class="widget-content widget-content-full-top-bottom border-bottom">
					<div class="row text-center">
						<div class="col-xs-6 push-inner-top-bottom border-right">
							<h3 class="widget-heading"><i class="gi gi-book_open text-dark push"></i> <br><small>{{ batchInfo.totalQuantity }} Total Sales</small></h3>
						</div>
						<div class="col-xs-6 push-inner-top-bottom">
							<h3 class="widget-heading"><i class="gi gi-user_add text-dark push"></i> <br><small>{{ batchInfo.totalTransaction }} Clients</small></h3>
						</div>
					</div>
				</div>
				<div class="widget-content widget-content-full-top-bottom">
					<div class="row text-center">
						<div class="col-xs-6 push-inner-top-bottom border-right">
							<h3 class="widget-heading"><i class="gi gi-briefcase text-dark push"></i> <br><small>{{ batchInfo.totalStock }} Total Stocks</small></h3>
						</div>
						<div class="col-xs-6 push-inner-top-bottom">
							<h3 class="widget-heading"><i class="gi gi-truck text-dark push"></i> <br><small>{{ batchInfo.deliveries }} Deliveries</small></h3>
						</div>
					</div>
				</div>
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
			products: [],
			saleSummaries: [{_id: {}}],
			batchStocks: [],
			totalQuantity: 0,
			totalAmount: 0,
			totalTransaction: 0,
			selectMonthName: 'N/A',
			selectMonthIndex: 0,
			batchInfo: {
				totalQuantity: 0,
				totalTransaction: 0,
				totalStock: 0,
				deliveries: 0
			},
			dateRange: '',
			widgetChartLineOptions: {
				type: 'line',
				width: '200px',
				height: '109px',
				tooltipOffsetX: -25,
				tooltipOffsetY: 20,
				lineColor: '#9bdfe9',
				fillColor: '#9bdfe9',
				spotColor: '#555555',
				minSpotColor: '#555555',
				maxSpotColor: '#555555',
				highlightSpotColor: '#555555',
				highlightLineColor: '#555555',
				spotRadius: 3,
				tooltipPrefix: '',
				tooltipSuffix: ' Sales',
				tooltipFormat: '{{prefix}}{{y}}{{suffix}}'
			}
		};
	},
	methods: {
		refreshBatchLineChart(data) {
			/* Mini Line Charts with jquery.sparkline plugin, for more examples you can check out http://omnipotent.net/jquery.sparkline/#s-about */
			$('#widget-dashchart-sales').text(data);
			$('#widget-dashchart-sales').sparkline('html', this.widgetChartLineOptions);
		},
		getBatchStockById(id) {
			return this.batchStocks.filter(function( obj ) {
				return obj._id == id;
			})[0];
		},
		selectBatch(id) {
			let batchStock = this.getBatchStockById(id);
			if (batchStock) {
				this.batchInfo.totalQuantity = batchStock.totalQuantity;
				this.batchInfo.totalTransaction = batchStock.transaction;
				this.batchInfo.totalStock= batchStock.totalStock;
				this.batchInfo.deliveries = batchStock.deliveries;
			}

			let saleTimeSeries = [];
			let latestPoint = {};
			batchStock.transactions.forEach(transaction => {
				if (saleTimeSeries.length == 0) {
					latestPoint = { date: transaction.saleDate, data: transaction.quantity}
					saleTimeSeries.push(latestPoint);
				}
				else {
					let prevDate = moment(latestPoint.date).format('YYYY-MM-DD');
					let saleDate = moment(transaction.saleDate).format('YYYY-MM-DD');
					if (moment(prevDate).isSame(saleDate, 'day')) {
						latestPoint.data += transaction.quantity;
					}
					else {
						latestPoint = { date: transaction.saleDate, data: transaction.quantity}
						saleTimeSeries.push(latestPoint);
					}
				}
			});

			var points = saleTimeSeries.map(function(item) {
				return item['data'];
			});
			this.dateRange = `${moment(saleTimeSeries[0].date).format('DD MMMM YYYY')} - ${moment(saleTimeSeries[saleTimeSeries.length - 1].date).format('DD MMMM YYYY')}`;

			this.refreshBatchLineChart(points.join());

			EventBus.getBatchStock(id)
			.then(response => {
				let labels = [];
				let piecolors = [];
				console.log(response.data);
				let pie = response.data.reduce(function(res, obj) {
					if (!obj.promotionGroup) {
						obj.promotionGroup = 'None';
					}
					if (!(obj.promotionGroup in res))
						res[obj.promotionGroup] = obj.totalQuantity;
					else {
						res[obj.promotionGroup] += obj.totalQuantity;
					}
					return res;
				}, {});

				console.log(pie);
				for (var key in pie){
					if (pie.hasOwnProperty(key)) {
						labels.push({ label: key, data: pie[key] });
						let idx = Object.keys(pie).indexOf(key);
						piecolors.push(colors[idx % colors.length]);
					}
				}

				// Pie Chart
				$.plot(
					$('#chart-pie'),
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
										return '<div class="chart-pie-label">' + label + '<br>' + pieSeries.data[0][1] + ' sku / ' + Math.round(pieSeries.percent) + '%</div>';
									},
									background: {opacity: .75, color: '#000000'}
								}
							}
						}
					}
				);
			})
			.catch(response => console.log(response));
		},
		selectMonth() {
			if (this.saleSummaries.length > this.selectMonthIndex) {
				this.totalQuantity = this.saleSummaries[this.selectMonthIndex].totalQuantity;
				this.totalAmount = this.saleSummaries[this.selectMonthIndex].totalAmount / 100;
				this.totalTransaction = this.saleSummaries[this.selectMonthIndex].transaction;
				if (this.saleSummaries[this.selectMonthIndex]._id) {
					this.selectMonthName = moment([this.saleSummaries[this.selectMonthIndex]._id.year, this.saleSummaries[this.selectMonthIndex]._id.month - 1]).format("MMMM of YYYY");
				}

				let vm = this;
				$('[data-toggle="counter"]').each(function(){
					var $this = $(this);
					let to = 0;
					if (this.id === "totalTransactionCounter") {
						to = vm.totalTransaction;
					}
					else if (this.id === "totalQuantityCounter") {
						to = vm.totalQuantity;
					}
					else if (this.id === "totalAmountCounter") {
						to = vm.totalAmount;
					}
					$this.countTo({
						speed: 1000,
						to: to,
						refreshInterval: 25,
						onComplete: function() {
							if($this.data('after')) {
								$this.html($this.html() + $this.data('after'));
							}
						}
					});
				});
			}
		}
	},
	watch: {
		selectMonthIndex: function (val) {
			this.selectMonth();
		}
	},
	created() {
		EventBus.getProductsWithBatches()
			.then(response => this.products = response.body)
			.catch(response => console.log(response));
		EventBus.getSaleSummary()
		.then(response => {
			this.saleSummaries = response.body;
			this.selectMonth();
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
		this.refreshBatchLineChart("0,0");
	}
}
</script>
