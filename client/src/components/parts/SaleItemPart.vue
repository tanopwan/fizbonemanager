<template>
    <div class="form">
        <div class="row">
            <div class="col-md-3">
                <div class="form-group">
                    <select2 :options="productOptions" v-model="selectedProduct" allowClear="false" placeholder="Select Product..." v-on:input="onSelectProduct">
                        <option></option>
                    </select2>
                </div>
            </div>
            <div class="col-md-3">
                <div class="form-group">
                    <select2 :options="promotionOptions" v-model="selectedPromotion" allowClear="false" placeholder="Select Promotion..." v-on:input="onSelectPromotion">
                        <option></option>
                    </select2>
                </div>
            </div>
            <div class="col-md-3">
                <div class="form-group">
                    <select2 :options="batchOptions" v-model="selectedBatch" allowClear="false" placeholder="Select Batch...">
                        <option></option>
                    </select2>
                </div>
            </div>
            <div class="col-md-3 form-inline">
                <div class="form-group">
                    <div class="input-group">
                        <span class="input-group-addon" @click="minus">
                            <i class="fa fa-minus"></i>
                        </span>
                        <input type="text" class="form-control" v-model="quantity" size="3" maxlength="3" v-on:input="filterQuantity">
                        <span class="input-group-addon" @click="plus">
                            <i class="fa fa-plus"></i>
                        </span>
                    </div>
                    <div class="input-group">
                        <input type="text" class="form-control" v-model="priceBaht" size="5" maxlength="5" v-on:input="filterPriceBaht">
                        <span class="input-group-addon">฿</span>
                    </div>
                    <div class="input-group">
                        <button type="button" @click="remove" class="btn btn-danger" style="overflow: hidden; position: relative;"><i class="fa fa-minus"></i></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { EventBus } from '../../bus';
import Select2 from '../basic/Select2.vue';

export default {
    props: ['removeItem'],
    data() {
        return {
            selectedProduct: '',
            selectedProductLink: '',
            selectedProductBarcode: '',
            selectedProductCode: '',
            selectedPromotion: '',
            selectedBatch: '',
            selectedGroup: '',
            quantity: 1,
            priceBaht: 0,
            productsWithBatches: [],
            promotions: [],
            isNeedDelivery: false,
        }
    },
    methods: {
        add() {
            if (!this.selectedProduct) {
                return null;
            }

            if (!this.selectedBatch) {
                return null;
            }

            if (!this.selectedPromotion) {
                return null;
            }

            let item = {
                quantity: this.quantity,
                product: {
                    name: this.selectedProduct,
                    link: this.selectedProductLink,
                    barcode: this.selectedProductBarcode,
                    productCode: this.selectedProductCode,
                },
                batch: {
                    batchId: this.selectedBatch.split('/')[0],
                    batchRef: this.selectedBatch.split('/')[1]
                },
                promotion: {
                    name: this.selectedPromotion,
                    price: this.price,
                    group: this.selectedGroup,
                    isNeedDelivery: this.isNeedDelivery,
                },
            };

            if (this.selectedGroup !== "Consignment") {
                item.bill = {
                    bills: {
                        quantity: this.quantity,
                        price: this.price,
                        date: moment()
                    },
                    total: this.quantity * this.price,
                }
            }

            return item;
        },
        remove() {
            this.$emit('remove');
        },
        plus() {
            ++this.quantity;
            if (this.quantity > 999) {
                this.quantity = 999
            }
        },
        minus() {
            --this.quantity;
            if (this.quantity < 1) {
                this.quantity = 1
            }
        },
        filterQuantity() {
            this.quantity = +this.quantity.replace(/[^0-9]/, '');
        },
        filterPriceBaht() {
            this.priceBaht = +this.priceBaht.replace(/[^0-9]/, '');
        },
        onSelectProduct(value) {
            this.selectedBatch = '';
            this.selectedPromotion = '';
            this.selectedGroup = '';
            this.priceBaht = 0;

            let productWithBatches = this.productsWithBatches.find(product => product.name === value);
            if (productWithBatches) {
                this.selectedProductLink = productWithBatches.link;
                this.selectedProductBarcode = productWithBatches.barcode;
                this.selectedProductCode = productWithBatches.productCode;
            }
        },
        onSelectPromotion(value) {
            this.selectedBatch = '';
            this.selectedGroup = '';
            this.priceBaht = 0;
            this.quantity = 0
            this.isNeedDelivery = false;

            let promotion = this.promotions.find(promotion => promotion.name === value && promotion.product.name === this.selectedProduct);
            if (promotion) {
                let batchIdAndRef = promotion.batch.batchId + '/' + promotion.batch.batchRef;
                this.selectedBatch = batchIdAndRef;
                this.selectedGroup = promotion.group;
                this.priceBaht = promotion.price / 100;
                this.quantity = promotion.quantity;
                this.isNeedDelivery = promotion.isNeedDelivery;
            }
        },
    },
    computed: {
        price() {
            return this.priceBaht * 100;
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
        promotionOptions() {
            let options = [];
            this.promotions.filter(promotion => {
                return promotion.product.name === this.selectedProduct;
            }).forEach(promotion => {
                options.push({ id: promotion.name, text: promotion.name + " [Group: " + promotion.group + "]" });
            });
            return options;
        },
    },
    created() {
        EventBus.getProductsWithBatches()
            .then(response => {
                this.productsWithBatches = response.body;
            })
            .catch(response => console.log(response));

        EventBus.getPromotions()
            .then(response => {
                this.promotions = response.body;
            })
            .catch(response => console.log(response));
    },
    components: {
        select2: Select2,
    },
}
</script>
