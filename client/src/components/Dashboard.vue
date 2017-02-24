<template>
	<div id="page-content" style="min-height: 454px;">
		<div class="row">
			<div class="col-sm-6 col-lg-4">
				<a href="javascript:void(0)" class="widget">
					<div class="widget-content widget-content-mini text-right clearfix">
						<div class="widget-icon pull-left themed-background">
							<i class="gi gi-cardio text-light-op"></i>
						</div>
						<h2 class="widget-heading h3">
							<strong><span data-toggle="counter" data-to="">{{ totalTransaction }}</span></strong>
						</h2>
						<span class="text-muted">TRANSACTIONS</span>
					</div>
				</a>
			</div>
			<div class="col-sm-6 col-lg-4">
				<a href="javascript:void(0)" class="widget">
					<div class="widget-content widget-content-mini text-right clearfix">
						<div class="widget-icon pull-left themed-background-success">
							<i class="gi gi-user text-light-op"></i>
						</div>
						<h2 class="widget-heading h3 text-success">
							<strong>+ <span data-toggle="counter" data-to="2862">{{ totalQuantity }}</span></strong>
						</h2>
						<span class="text-muted">MONTHLY SALES</span>
					</div>
				</a>
			</div>
			<div class="col-sm-6 col-lg-4">
				<a href="javascript:void(0)" class="widget">
					<div class="widget-content widget-content-mini text-right clearfix">
						<div class="widget-icon pull-left themed-background-danger">
							<i class="gi gi-wallet text-light-op"></i>
						</div>
						<h2 class="widget-heading h3 text-danger">
							<strong>&#x0E3F; <span data-toggle="counter" data-to="5820">{{ totalAmount }}</span></strong>
						</h2>
						<span class="text-muted">MONTHLY EARNINGS</span>
					</div>
				</a>
			</div>
		</div>
		<div class="block">
			<div class="row">
				<div class="col-xs-3">
					<div class="block-section">
						<div class="pie-chart block-section easyPieChart" data-percent="25" data-size="109" data-line-width="2" data-bar-color="#de815c" data-track-color="#ebeef2" style="width: 109px; height: 109px; line-height: 109px;">
							<span><i class="fa fa-database text-danger"></i></span>
							<canvas width="218" height="218" style="width: 109px; height: 109px;"></canvas>
						</div>
					</div>
					<h4 class="text-center"><i class="fa fa-ticket text-muted"></i> Tickets</h4>
				</div>
				<div class="col-xs-3">
					<div class="block-section">
						<div class="pie-chart block-section easyPieChart" data-percent="25" data-size="109" data-line-width="2" data-bar-color="#de815c" data-track-color="#ebeef2" style="width: 109px; height: 109px; line-height: 109px;">
							<span><i class="fa fa-database text-danger"></i></span>
							<canvas width="218" height="218" style="width: 109px; height: 109px;"></canvas>
						</div>
					</div>
					<h4 class="text-center"><i class="fa fa-ticket text-muted"></i> Tickets</h4>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import { EventBus } from '../bus';

export default {
	data() {
		return {
			saleSummaries: [{}]
		};
	},
	computed: {
		totalQuantity: function() {
			return this.saleSummaries[0] ? this.saleSummaries[0].totalQuantity : 0;
		},
		totalAmount: function() {
			return this.saleSummaries[0] ? this.saleSummaries[0].totalAmount / 100 : 0;
		},
		totalTransaction: function() {
			return this.saleSummaries[0] ? this.saleSummaries[0].transaction : 0;
		}
	},
	created() {
		EventBus.getSaleSummary()
		.then(response => {
			this.saleSummaries = response.body;
		})
		.catch(response => console.log(response));
	},
	mounted() {
		// Easy Pie Chart
		$('.pie-chart').easyPieChart({
			barColor: $(this).data('bar-color') ? $(this).data('bar-color') : '#777777',
			trackColor: $(this).data('track-color') ? $(this).data('track-color') : '#eeeeee',
			lineWidth: $(this).data('line-width') ? $(this).data('line-width') : 3,
			size: $(this).data('size') ? $(this).data('size') : '80',
			animate: 800,
			scaleColor: false
		});
	}
}
</script>
