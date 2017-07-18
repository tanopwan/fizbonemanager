<template>
	<select :data-placeholder="placeholder" style="width: 100%;">
		<slot></slot>
	</select>
</template>

<script>
export default {
	props: ['options', 'value', 'placeholder', 'allowClear'],
	mounted() {
		console.log("mounted value", this.value);
		let allowClear = this.allowClear === "false" ? false : true;

		// update options
		var vm = this;
		$(this.$el).select2({ data: this.options, allowClear: allowClear }).on('change', function () {
			// Change from select2
			console.log("Change from select input", $(vm.$el).val());
			console.log(this);
			console.log("---------------");
			vm.$emit('input', $(vm.$el).val());
		}).val(this.value).trigger("change");
	},
	watch: {
		value: function (value, oldValue) {
			// Change from v-model
			console.log("Change from v-model", oldValue, value);
			// if (value !== oldValue && $(this.$el).val() !== value) {
			// 	// update value
			// 	$(this.$el).val(value).trigger("change");
			// }
		},
		options: function (options, oldOptions) {
			let allowClear = this.allowClear === "false" ? false : true;
			console.log("New options trigger change with current value", this.value);
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
