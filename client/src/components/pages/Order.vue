<template>
  <div>
    <order-widget :onAddOrder="onAddOrder"></order-widget>
  </div>
</template>

<script>
import moment from "moment";
import OrderWidget from "blocks/OrderWidget.vue";
import { EventBus } from "src/bus";

export default {
  methods: {
    onAddOrder(order) {
      EventBus.expireCache("/api/sales");
      EventBus.expireCache("/api/sales/orders");
    },
  },
  components: {
    orderWidget: OrderWidget
  }
};
</script>
