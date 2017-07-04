<template>
	<div>
		<a href="#edit-sale-modal" @click="openEditSale(sale._id)" class="btn btn-warning" data-toggle="modal" style="overflow: hidden; position: relative;">
			<i class="fa fa-money"></i>
		</a>
		<div id="edit-sale-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
						<h3 class="modal-title"><strong>Sale</strong></h3>
					</div>
					<div class="modal-body">
						<date-time-picker update="false" v-on:input="onDatetime"></date-time-picker>
						<div class="row form-group" :class="{ 'has-error': quantityError }">
							<div class="col-sm-6">
								<div class="input-group">
									<span class="input-group-addon">จำนวน</span>
									<input type="text" v-model="billQuantity" class="form-control" placeholder="จำนวน">
								</div>
							</div>
							<div class="col-sm-6">
								<div class="input-group">
									<span class="input-group-addon">ราคา</span>
									<input type="text" v-model="billPrice" class="form-control" placeholder="ราคา">
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" @click="bill" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Save</button>
						<button type="button" class="btn btn-effect-ripple btn-danger" data-dismiss="modal" style="overflow: hidden; position: relative;">Close</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	props: ['sale'],
	methods: {
		openEditSale(id) {

		},
	}
}
</script>
