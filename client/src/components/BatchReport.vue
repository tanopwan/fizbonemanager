<template>
    <div>
        <div class="row">
            <div class="col-xs-12 col-md-6 form-group">
                <select2 :options="batchOptions" v-model="selectedFilterBatch" placeholder="Filter Batch...">
                    <option></option>
                </select2>
            </div>
        </div>
        <batch-report-table-block :batchId="selectedBatchId"></batch-report-table-block>
    </div>
</template>

<script>
import { EventBus } from '../bus';
import Select2 from './basic/Select2.vue';
import BatchReportTableBlock from './BatchReportTableBlock.vue';

export default {
    data() {
        return {
            batches: [],
            selectedFilterBatch: '',
        }
    },
    computed: {
        selectedBatchId() {
            return this.selectedFilterBatch.split('/')[0];
        },
		batchOptions() {
			let options = [];
			this.batches.forEach(batch => {
				options.push({ id: batch._id + '/' + batch.batchRef, text: batch.batchRef });
			});
			return options;
		},
    },
    created() {
        EventBus.getBatches()
		.then(response => {
            this.batches = response.body
        })
		.catch(response => console.log(response));
    },
    components: {
        batchReportTableBlock: BatchReportTableBlock,
        select2: Select2,
    },
}
</script>
