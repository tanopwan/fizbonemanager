<template>
	<select :data-placeholder="placeholder">
		<slot></slot>
	</select>
</template>

<script>
export default {
	props: ['options', 'value', 'placeholder', 'allowClear'],
	mounted: function () {
		let allowClear = this.allowClear === "false" ? false : true;
		var vm = this
		$(this.$el)
		.val(this.value)
		// init select2
		.select2({ data: this.options, allowClear: allowClear, placeholder: {
			id: "-1"
		}})
		// emit event on change.
		.on('change', function () {
			vm.$emit('input', this.value)
		});
	},
	watch: {
		value: function (value) {
			// update value
			$(this.$el).val(value)
		},
		options: function (options) {
			// update options
			$(this.$el).select2({ data: options, allowClear: true });
		}
	},
	destroyed: function () {
		$(this.$el).off().select2('destroy');
	}
}
</script>

<style scoped>
select {
	width: 100%
}
</style>
