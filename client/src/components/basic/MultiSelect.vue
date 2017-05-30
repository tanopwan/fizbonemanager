<template>
	<div class="form-group">
		<select id="example-chosen-multiple" ref="selectChosen" class="select-chosen" :data-placeholder="placeholder" multiple>
			<option v-for="option in selectOptions" :value="option.value">{{ option.text }}</option>
		</select>
	</div>
</template>

<script>

export default {
	props: ['options', 'placeholder'],
	data() {
		return {
			selectOptions: []
		}
	},
	watch: {
		options(val) {
			this.selectOptions = [];
			val.forEach((option, index) => {
				this.selectOptions.push({ value: index, text: option });
			});
			this.$nextTick(function () {
				$(this.$refs.selectChosen).trigger("chosen:updated");
			});
		}
	},
	mounted() {
		$(this.$refs.selectChosen).chosen({width: "100%"}).on('change', function(e, params) {
			console.log(e);
			console.log(params);
		});
	}
}
</script>
