<template>

</template>

<script>
import moment from "moment";
import Select2 from "basic/Select2.vue";
import DatePicker from "basic/DatePicker.vue";

export default {
  data() {
    return {
      saving: false,
      date: moment(),
      expenseTitle: "",
      expenseAmount: 0,
      expenseMonth: "",
      expenseYear: "",
      monthOptions: [{ text: "Jan", id: 1 }, { text: "Feb", id: 2 }]
    };
  },
  methods: {
    show(id) {
      console.log(id);
    },
    save() {}
  },
  components: {
    select2: Select2,
    datePicker: DatePicker
  }
};
</script>
