<template>
	<div class="row">
		<div class="col-xs-6">
			<div class="form-group">
				<div class="input-group">
					<span class="input-group-addon">Date</span>
					<input type="text" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" v-model="date">
				</div>
			</div>
		</div>
		<div class="col-xs-6">
			<div class="form-group">
				<div class="input-group bootstrap-timepicker">
					<div class="bootstrap-timepicker-widget dropdown-menu">
						<table>
							<tbody>
								<tr>
									<td><a href="#" data-action="incrementHour"><i class="fa fa-chevron-up"></i></a></td>
									<td class="separator">&nbsp;</td>
									<td><a href="#" data-action="incrementMinute"><i class="fa fa-chevron-up"></i></a></td>
									<td class="separator">&nbsp;</td>
									<td><a href="#" data-action="incrementSecond"><i class="fa fa-chevron-up"></i></a></td>
								</tr>
								<tr>
									<td><input type="text" class="form-control bootstrap-timepicker-hour" maxlength="2"></td>
									<td class="separator">:</td>
									<td><input type="text" class="form-control bootstrap-timepicker-minute" maxlength="2"></td>
									<td class="separator">:</td>
									<td><input type="text" class="form-control bootstrap-timepicker-second" maxlength="2"></td>
								</tr>
								<tr>
									<td><a href="#" data-action="decrementHour"><i class="fa fa-chevron-down"></i></a></td>
									<td class="separator"></td>
									<td><a href="#" data-action="decrementMinute"><i class="fa fa-chevron-down"></i></a></td>
									<td class="separator">&nbsp;</td>
									<td><a href="#" data-action="decrementSecond"><i class="fa fa-chevron-down"></i></a></td>
								</tr>
							</tbody>
						</table>
					</div>
					<input type="text" class="form-control input-timepicker24" v-model="time">
					<span class="input-group-btn">
						<a href="javascript:void(0)" class="btn btn-effect-ripple btn-primary" style="overflow: hidden; position: relative;"><span class="btn-ripple animate" style="height: 38px; width: 38px; top: -1px; left: 4.75px;"></span><i class="fa fa-clock-o"></i></a>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	data() {
		return {
			date: moment(new Date()).format("YYYY-MM-DD"),
			time: moment(new Date()).format("HH:mm"),
		}
	},
	mounted() {
		let vm = this;
		vm.$emit('input', vm.date + ' ' + vm.time);

		$('.input-datepicker').datepicker().on('changeDate', function(e){
			$(this).datepicker('hide');
			vm.date = $(this).val();
			vm.$emit('input', vm.date + ' ' + vm.time);
		});

		$('.input-timepicker24').timepicker({
			minuteStep: 1,
			//showSeconds: true,
			showMeridian: false
		}).on('changeTime.timepicker', function(e) {
			vm.time = e.time.value;
			vm.$emit('input', vm.date + ' ' + vm.time);
		});

		setInterval(function(){
			vm.date = moment(new Date()).format("YYYY-MM-DD");
 			vm.time = moment(new Date()).format("HH:mm");
			$('.input-datepicker').datepicker('update', vm.date);
			$('.input-timepicker24').timepicker('setTime', vm.time);
		}, 10000);
	}
}
</script>
