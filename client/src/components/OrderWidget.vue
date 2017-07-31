<template>
	<div class="block full">
        <div class="row">
            <div class="col-xs-9">
                <date-time-picker update="false" v-on:input="onDatetime"></date-time-picker>
            </div>
            <div class="col-xs-3">
                <label class="csscheckbox csscheckbox-info">
                    <input type="checkbox" v-model="now"><span></span> Now
                </label>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-6">
                <div class="form-group">
                    <select2 :options="customerOptions" v-model="selectedCustomer" allowClear="true" placeholder="Select Customer...">
                        <option></option>
                    </select2>
                </div>
            </div>
            <div class="col-xs-6">
                <input type="text" class="form-control" v-model="tagString" placeholder="tags"></input>
            </div>
        </div>
        <div class="form-group">
            <div class="input-group">
                <span class="input-group-addon">Desc</span>
                <input type="text" class="form-control" v-model="description"></input>
            </div>
        </div>
    	<sale-item-part v-for="saleItem in saleItems" ref="saleItems"></sale-item-part>
        <br>
        <div class="form-group">
            <i v-if="saving" class="fa fa-asterisk fa-2x fa-spin text-success"></i>
            <div v-else class="input-group">
                <button type="submit" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;" @click="addItem">Add Item</button>
                <button type="submit" class="btn btn-effect-ripple btn-info" style="overflow: hidden; position: relative;" @click="addOrder">Add Order</button>
            </div>
        </div>
	</div>
</template>

<script>
import { EventBus } from '../bus';
import Select2 from './basic/Select2.vue';
import SaleItemPart from './parts/SaleItemPart.vue';
import DateTimePicker from './basic/DateTimePicker.vue';

export default {
    data() {
        return {
            saleItems: [],
            datetime: null,
            now: true,
            selectedCustomer: '',
            customers: [],
            tagString: '',
            description: '',
            saving: false,
        }
    },
    computed: {
        customerOptions: function() {
			let options = [];
			this.customers.forEach(customer => {
				options.push({ text: customer.name, id: customer._id });
			})
			return options;
		},
    },
    methods: {
		addItem() {
            this.saleItems.push({});
		},
        addOrder() {
            let order = {
                saleItems: [],
                saleDate: this.now ? moment() : moment(this.datetime, "YYYY-MM-DD HH:mm"),
                tags: this.tagString.split(' '),
                description: this.description,
            };

            this.$refs.saleItems.forEach(saleItem => {
                let item = saleItem.add();
                if (item) {
                    order.saleItems.push(item);
                }
            });

            if (this.selectedCustomer) {
                let customer = this.customers.find(customer => customer._id === this.selectedCustomer);
				order.customer = {
					name: customer.name,
					type: customer.type,
					refUserId: customer.refUserId,
				}
            }
            console.log(order);
            this.saving = true;
            this.$http.post('/api/sales/orders', order).then(response => {
                this.saving = false;
            }).catch(response => {
                console.log(response);
                this.saving = false;
            });
        },
        onDatetime(value) {
            if (this.datetime) {
                // No need to update first time
                this.now = false;
            }
			this.datetime = value;
		},
    },
    components: {
        select2: Select2,
		saleItemPart: SaleItemPart,
        dateTimePicker: DateTimePicker,
	},
    created() {
        this.saleItems.push({});

        EventBus.getCustomers()
		.then(response => this.customers = response.body)
		.catch(response => console.log(response));
    },
}
</script>
