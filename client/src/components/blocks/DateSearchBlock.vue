<template>
  <div class="block full">
    <div class="block-title">
      <h4>
        Search
        <small> ค้นหา...</small>
      </h4>
    </div>
    <div class="row">
      <div class="col-xs-12 col-md-4">
        <ul class="pagination pagination-sm" style="margin-top: 3px;">
          <li :class="{ active : todayFilter }">
            <a href="javascript:void(0)" @click="todayClick">Today</a>
          </li>
          <li :class="{ active : thisWeekFilter }">
            <a href="javascript:void(0)" @click="thisWeekClick">7 days</a>
          </li>
          <li :class="{ active : customFilter }">
            <a href="javascript:void(0)" @click="thisCustomClick">Custom</a>
          </li>
        </ul>
      </div>
      <div class="col-xs-12 col-md-8">
        <div class="input-group">
          <span class="input-group-addon">From Date</span>
          <input type="text" id="from-datepicker" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" placeholder="yyyy-mm-dd" v-model="from">
          <span class="input-group-addon">00:00</span>
          <span class="input-group-addon">To Date</span>
          <input type="text" id="to-datepicker" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" placeholder="yyyy-mm-dd" v-model="to">
          <span class="input-group-addon">23:59</span>
          <span class="input-group-btn">
            <button type="button" @click="search" class="btn btn-success" style="overflow: hidden; position: relative;">Search</button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["onSearch"],
  data() {
    return {
      todayFilter: true,
      thisWeekFilter: false,
      customFilter: false,
      from: moment()
        .startOf("day")
        .format("YYYY-MM-DD"),
      to: moment()
        .endOf("day")
        .format("YYYY-MM-DD")
    };
  },
  methods: {
    todayClick() {
      this.todayFilter = true;
      this.thisWeekFilter = false;
      this.customFilter = false;
      this.from = moment().format("YYYY-MM-DD");
      this.to = moment().format("YYYY-MM-DD");
    },
    thisWeekClick() {
      this.todayFilter = false;
      this.thisWeekFilter = true;
      this.customFilter = false;
      this.from = moment()
        .add(-6, "days")
        .format("YYYY-MM-DD");
      this.to = moment().format("YYYY-MM-DD");
    },
    thisCustomClick() {
      this.todayFilter = false;
      this.thisWeekFilter = false;
      this.customFilter = true;
    },
    search() {
      let from = encodeURIComponent(moment(this.from).startOf('day').format());
      let to = encodeURIComponent(moment(this.to).endOf('day').format());
      this.onSearch(from, to);
    }
  },
  mounted() {
    let vm = this;
		$('#from-datepicker').datepicker().on('changeDate', function (e) {
			$(this).datepicker('hide');
			vm.from = moment($(this).val()).format("YYYY-MM-DD");
			vm.todayFilter = false;
			vm.thisWeekFilter = false;
			vm.customFilter = true;
		});

		$('#to-datepicker').datepicker().on('changeDate', function (e) {
			$(this).datepicker('hide');
			vm.to = moment($(this).val()).format("YYYY-MM-DD");
			vm.todayFilter = false;
			vm.thisWeekFilter = false;
			vm.customFilter = true;
		});
  }
};
</script>

<style>

</style>
