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
  data() {
    return {
    };
  },
  methods: {
    onAddOrder(order) {
      this.orders.push(order);
      EventBus.expireCache("/api/sales");
      EventBus.expireCache("/api/sales/orders");
    },
  },
  components: {
    orderWidget: OrderWidget
  }
};
</script>
