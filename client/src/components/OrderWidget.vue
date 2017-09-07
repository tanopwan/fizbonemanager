<template>
    <div class="block full">
        <div class="row">
            <div class="col-xs-10">
                <date-time-picker update="false" v-on:input="onDatetime"></date-time-picker>
            </div>
            <div class="col-xs-2">
                <label class="csscheckbox csscheckbox-info">
                    <input type="checkbox" v-model="now">
                    <span></span> Now
                </label>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-4">
                <div class="form-group">
                    <select2 :options="channelOptions" v-model="channel" allowClear="true" placeholder="Select Channel...">
                        <option></option>
                    </select2>
                </div>
            </div>
            <div class="col-xs-8" v-if="channel==='Offline'">
                <div class="form-group">
                    <select2 :options="customerOptions" v-model="selectedCustomer" allowClear="true" placeholder="Select Customer...">
                        <option></option>
                    </select2>
                </div>
            </div>
            <div class="col-xs-8" v-if="channel==='Facebook'">
                <div class="form-group">
                    <facebook-conversation-list-modal v-model="fbConversation" v-if="channel==='Facebook'"></facebook-conversation-list-modal>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12 col-md-6">
                <div class="form-group">
                    <div class="input-group">
                        <span class="input-group-addon">Tags</span>
                        <input type="text" class="form-control" v-model="tagString"></input>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-6">
                <div class="form-group">
                    <div class="input-group">
                        <span class="input-group-addon">Desc</span>
                        <input type="text" class="form-control" v-model="description"></input>
                    </div>
                </div>
            </div>
        </div>
        <sale-item-part v-for="(saleItem, $index) in saleItems" ref="saleItems" v-bind:key="saleItem._id" @remove="removeItem($index)"></sale-item-part>
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
import FacebookConversationListModal from './FacebookConversationListModal.vue';

export default {
    props: ['onAddOrder'],
    data() {
        return {
            saleItems: [],
            datetime: null,
            now: true,
            selectedCustomer: '',
            customers: [],
            tagString: '',
            description: '',
            channel: '',
            saving: false,
            fbConversation: {},
        }
    },
    computed: {
        customerOptions: function () {
            let options = [];
            this.customers.forEach(customer => {
                options.push({ text: customer.name, id: customer._id });
            })
            return options;
        },
        channelOptions: function () {
            return [
                { text: "Facebook", id: "Facebook" },
                { text: "Line@", id: "Line@" },
                { text: "Offline", id: "Offline" },
            ];
        }
    },
    methods: {
        addItem() {
            this.saleItems.push({});
        },
        removeItem(index) {
            this.saleItems.splice(index, 1);
        },
        addOrder() {
            let order = {
                saleItems: [],
                saleDate: this.now ? moment() : moment(this.datetime, "YYYY-MM-DD HH:mm"),
                tags: this.tagString.split(' '),
                description: this.description,
                payment: {},
                shipping: {},
                channel: this.channel,
                extendsInfo: {},
            };

            if (this.channel === "Facebook") {
                order.customer = {
                    name: this.fbConversation.participant.name,
                    type: "FacebookMessenger",
                    refUserId: this.fbConversation.participant.id,
                }
                order.extendsInfo["conversationId"] = this.fbConversation.id;
            }
            else if (this.channel === "Offline") {
                if (this.selectedCustomer) {
                    let customer = this.customers.find(customer => customer._id === this.selectedCustomer);
                    order.customer = {
                        name: customer.name,
                        type: customer.type,
                        refUserId: customer.refUserId,
                    }
                }
            }

            let itemError = false;
            this.$refs.saleItems.forEach(saleItem => {
                let item = saleItem.add();

                if (item != null && item !== false) {
                    item.description = this.description;
                    order.saleItems.push(item);
                }
                else if (item === false) {
                    itemError = true;
                }
            });

            if (itemError || order.saleItems.length === 0) {
                return;
            }

            if (order.saleItems.every(item => item.promotion.group === 'Online')) {
                order.payment.status = 'SLIP_PENDING';
                order.shipping.status = 'WAIT_VERIFIED';
            }
            else if (order.saleItems.every(item => item.promotion.group === 'Booth')) {
                order.payment.status = 'PAID';
                order.shipping.status = 'DELIVERED';
            }
            else if (order.saleItems.every(item => item.promotion.group === 'Wholesale')) {
                order.payment.status = 'SLIP_PENDING';
                order.shipping.status = 'READY';
            }

            console.log("order", order);
            this.saving = true;
            this.$http.post('/api/sales/orders', order).then(response => {
                this.saving = false;
                this.onAddOrder(response.data);

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
        facebookConversationListModal: FacebookConversationListModal,
    },
    created() {
        this.saleItems.push({});

        EventBus.getCustomers()
            .then(response => this.customers = response.body)
            .catch(response => console.log(response));
    },
}
</script>
