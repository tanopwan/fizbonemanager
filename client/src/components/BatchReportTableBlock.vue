<template>
    <div>
        <div class="block">
            <div class="block-title clearfix">
                <h2><span class="hidden-xs">Table </span> {{ batchId }}</h2>
            </div>
            <div class="text-center">
                <ul class="pagination">
                    <li>
                        <a @click="gotoPrev">
                            <i class="fa fa-chevron-left"></i>
                        </a>
                    </li>
                    <li v-for="page in Array.from(Array(totalPage).keys())" v-bind:key="page" :class="{ 'active': (page === currentPage) }">
                        <a @click="goto(page)">{{ page + 1 }}</a>
                    </li>
                    <li>
                        <a @click="gotoNext">
                            <i class="fa fa-chevron-right"></i>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="table-responsive">
                <table id="general-table" class="table table-vcenter table-borderless table-condensed table-hover">
                    <thead>
                        <tr>
                            <th style="width: 180px;" class="text-center">Date</th>
                            <th>Order</th>
                            <th>Promotion</th>
                            <th>Q</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th>Customer</th>
                            <th>Description</th>
                            <th style="width: 120px;" class="text-center">
                                <i class="fa fa-flash"></i>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="sale in sales" v-bind:key="sale._id">
                            <td class="text-center">{{ sale.saleDate | formatDate }}</td>
                            <td>{{ sale.orderId }}</td>
                            <td>{{ sale.promotion.name }}</td>
                            <td class="text-right">{{ sale.quantity }}</td>
                            <td class="text-right">{{ sale.promotion.price | formatBaht }}</td>
                            <td class="text-right">{{ sale.promotion.price * sale.quantity | formatBaht }}</td>
                            <td>{{ sale.customer ? sale.customer.name : "" }}</td>
                            <td>{{ sale.description }}</td>
                            <td class="text-center">
                                <a href="#show-sale-modal" @click="showSaleModal(sale._id)" data-toggle="modal" class="btn btn-effect-ripple btn-sm btn-success" style="overflow: hidden; position: relative;">
                                    <i class="fa fa-pencil"></i>
                                </a>
                                <a href="javascript:void(0)" @click="deleteSale(sale._id)" class="btn btn-effect-ripple btn-sm btn-danger" style="overflow: hidden; position: relative;">
                                    <i class="fa fa-times"></i>
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div id="show-sale-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h3 class="modal-title">
                            <strong>Sale </strong>
                            <small></small>
                        </h3>
                    </div>
                    <div class="modal-body">
                        <pre ref="saleStringEditor" style="background-color: #f5f5f5;" contenteditable="true">{{ saleString }}</pre>
                    </div>
                    <div class="modal-footer">
                        <i v-if="saving" class="fa fa-asterisk fa-2x fa-spin text-success"></i>
                        <span v-else>
                            <button type="button" @click="save" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Save</button>
                            <button type="button" class="btn btn-effect-ripple btn-danger" data-dismiss="modal" style="overflow: hidden; position: relative;">Close</button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['batchId'],
    data() {
        return {
            sales: [],
            saleString: "{}",
            saving: false,
            totalSales: 0,
            // Paging
            currentPage: 0,
            pageSize: 20,
        }
    },
    methods: {
        goto(page) {
            if (this.currentPage != page) {
                this.currentPage = page;
                this.search(this.batchId);
            }
        },
        gotoPrev() {
			if (this.currentPage > 0) {
				this.goto(this.currentPage - 1);
			}
		},
		gotoNext() {
			if (this.currentPage < this.totalPage - 1) {
				this.goto(this.currentPage + 1);
			}
		},
        search(batchId) {
            console.log("[BatchReportTableBlock]", batchId);
            this.$http.get('/api/sales?batchId=' + batchId + `&limit=${this.pageSize}&offset=${this.pageSize * this.currentPage}`).then(response => {
                console.log("return", response.data);
                this.sales = response.data.sales;
                this.totalSales = response.data.total;
            });
        },
        showSaleModal(id) {
            let sale = this.sales.find(sale => sale._id === id);
            if (sale) {
                this.saleString = JSON.stringify(sale, null, 4);
            }
            else {
                this.saleString = `{ \"error\": \"sale._id ${id} is not found.\" }`;
            }
        },
        save() {
            this.saving = true;
            this.saleString = $(this.$refs.saleStringEditor).text();
            let sale = JSON.parse(this.saleString);
            let vm = this;
            let id = sale._id;
            this.$http.post('/api/sales/' + id, sale).then(response => {
                let index = -1;
                vm.sales.forEach((sale, idx) => {
                    if (sale._id === id) {
                        index = idx;
                    }
                });
                if (index !== -1) {
                    vm.sales[index] = response.data;
                }
                vm.saving = false;
            }).catch(response => {
                console.log(response)
                vm.saving = false;
            });
        },
        deleteSale(id) {
            let vm = this;
            this.$http.delete('/api/sales/' + id).then(response => {
                let index = -1;
                vm.sales.forEach((sale, idx) => {
                    if (sale._id === id) {
                        index = idx;
                    }
                });
                if (index !== -1) {
                    vm.sales.splice(index, 1);
                }
            }, response => {
                console.log(response);
            });
        },
    },
    computed: {
        totalPage() {
            return Math.ceil(this.totalSales / this.pageSize);
        },
    },
    watch: {
        batchId(val) {
            if (val) {
                this.search(val);
            }
        },
    },
}
</script>