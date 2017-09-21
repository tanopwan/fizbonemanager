<template>
    <div>
        <div class="row">
            <div class="col-xs-6">
                <div class="form-group">
                    <select2 :options="productOptions" v-model="selectedProduct" allowClear="false" placeholder="Select Product...">
                        <option></option>
                    </select2>
                </div>
            </div>
            <div class="col-xs-6">
                <div class="form-group">
                    <select2 :options="batchOptions" v-model="selectedBatch" allowClear="false" placeholder="Select Batch...">
                        <option></option>
                    </select2>
                </div>
            </div>
        </div>
        <batch-report-table-block :batchId="selectedBatchId"></batch-report-table-block>
    </div>
</template>

<script>
import { EventBus } from 'src/bus';
import Select2 from './basic/Select2.vue';
import BatchReportTableBlock from './BatchReportTableBlock.vue';

export default {
    data() {
        return {
            productsWithBatches: [],
            selectedProduct: '',
            selectedBatch: '',
        }
    },
    computed: {
        selectedBatchId() {
            return this.selectedBatch.split('/')[0];
        },
        productOptions() {
			let options = [];
			this.productsWithBatches.forEach(product => {
				options.push({ id: product.name, text: product.name });
			});
			return options;
		},
		batchOptions() {
			let options = [];
			let productWithBatches = this.productsWithBatches.find(product => product.name === this.selectedProduct);
			if (productWithBatches) {
				productWithBatches.batches.forEach(batch => {
					let batchIdAndRef = batch._id + '/' + batch.batchRef;
					options.push({ id: batchIdAndRef, text: batch.batchRef });
				});
			}
			return options;
		},
    },
    created() {
        EventBus.getAllProductsWithBatches()
		.then(response => {
			this.productsWithBatches = response.body;
		})
		.catch(response => console.log(response));
    },
    components: {
        batchReportTableBlock: BatchReportTableBlock,
        select2: Select2,
    },
}
</script>
