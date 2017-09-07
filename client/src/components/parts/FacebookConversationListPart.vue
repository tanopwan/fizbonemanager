<template>
    <div>
        <i v-if="loading" class="fa fa-asterisk fa-2x fa-spin text-success"></i>
        <div v-else>
            <div class="block-section">
                <h4 class="inner-sidebar-header">
                    Active Customers
                    <a href="javascript:void(0)" @click="showInactiveCustomer=!showInactiveCustomer" class="btn btn-effect-ripple btn-xs btn-warning pull-right" style="overflow: hidden; position: relative;">
                        <i class="fa fa-ellipsis-v"></i> More</a>
                </h4>
                <ul class="nav-users nav-users-online">
                    <li v-for="conversation in onlineConversations" v-bind:key="conversation.id">
                        <a href="javascript:void(0)" @click="select(conversation.participant.id)" data-dismiss="modal">
                            <img :src="'https://graph.facebook.com/' + conversation.participant.id + '/picture?type=square'" class="nav-users-avatar">
                            <span class="label label-success nav-users-indicator">{{ conversation.unread_count }}</span>
                            <span class="nav-users-heading">{{ conversation.participant.name }}</span>
                            <span class="text-muted">{{ conversation.participant.email }}</span>
                        </a>
                    </li>
                </ul>
            </div>
            <div v-if="showInactiveCustomer" class="block-section">
                <h4 class="inner-sidebar-header">
                    Inactive Customers
                </h4>
                <ul class="nav-users nav-users-away">
                    <li v-for="conversation in awayConversations" v-bind:key="conversation.id">
                        <a href="javascript:void(0)" @click="select(conversation.participant.id)" data-dismiss="modal">
                            <img :src="'https://graph.facebook.com/' + conversation.participant.id + '/picture?type=square'" class="nav-users-avatar">
                            <span class="label label-success nav-users-indicator">{{ conversation.unread_count }}</span>
                            <span class="nav-users-heading">{{ conversation.participant.name }}</span>
                            <span class="text-muted">{{ conversation.participant.email }}</span>
                        </a>
                    </li>
                </ul>
            </div>
            <a href="javascript:void(0)" @click="deselect()" data-dismiss="modal" class="btn btn-effect-ripple btn-xs btn-danger" style="overflow: hidden; position: relative;">
                <i class="fa fa-minus"></i> Remove</a>
        </div>
    </div>
</template>

<script>
export default {
    props: ['page'],
    data() {
        return {
            conversations: [],
            showInactiveCustomer: false,
            loading: true,
        }
    },
    computed: {
        onlineConversations() {
            return this.conversations.filter(conversation => moment(conversation.updated_time).isSameOrAfter(moment().subtract(7, 'days').startOf('day')));
        },
        awayConversations() {
            if (this.showInactiveCustomer) {
                return this.conversations.filter(conversation => moment(conversation.updated_time).isBefore(moment().subtract(7, 'days').startOf('day')));
            }
            else {
                return [];
            }
        }
    },
    methods: {
        select(id) {
            let conversation = this.conversations.find(conversation => conversation.participant.id === id);
            this.$emit('input', conversation);
        },
        deselect() {
            this.$emit('input', {});
        }
    },
    created() {
        this.$http.get('/api/pages/conversations').then(response => {
            this.conversations = response.body;
            console.log(this.conversations);
            this.loading = false;
        });
    }
}
</script>
