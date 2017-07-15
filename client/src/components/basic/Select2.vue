<template>
	<select :data-placeholder="placeholder" style="width: 100%;">
		<slot></slot>
	</select>
</template>

<script>
export default {
	props: ['options', 'value', 'placeholder', 'allowClear'],
	mounted() {
		let allowClear = this.allowClear === "false" ? false : true;

		// update options
		var vm = this;
		$(this.$el).select2({ data: this.options, allowClear: allowClear }).on('change', function () {
			vm.$emit('input', vm.value);
		}).val(this.value).trigger("change");
	},
	watch: {
		value: function (value, oldValue) {
			if (value !== oldValue && $(this.$el).val() !== value) {
				this.value = value;
				// update value
				$(this.$el).val(value).trigger("change");
			}
		},
		options: function (options, oldOptions) {
			let allowClear = this.allowClear === "false" ? false : true;

			// update options
			$(this.$el).select2('destroy').empty().select2({
				placeholder: {
					id: '-1', // the value of the option
					text: this.placeholder
				},
				data: this.options,
				allowClear: allowClear
			}).val(this.value).trigger("change");
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
