<template>
	<div class="form-group" :class="{ 'has-error': hasError }">
		<div class="input-group">
			<span class="input-group-addon">{{ label }}</span>
			<input ref="picker" type="text" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" v-model="date">
		</div>
	</div>
</template>

<script>
import moment from 'moment';

export default {
	props: ['label', 'hasError'],
	data() {
		return {
			date: moment(new Date()).format('YYYY-MM-DD')
		}
	},
	mounted() {
		let vm = this;
		$(this.$refs.picker).datepicker().on('changeDate', function(e){
			$(this).datepicker('hide');
			vm.date = $(this).val();
			vm.$emit('input', vm.date);
		});
		vm.$emit('input', vm.date);
	}
}
</script>
