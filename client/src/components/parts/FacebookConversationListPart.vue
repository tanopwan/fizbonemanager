<template>
    <div>
        <div class="block-section">
            <h4 class="inner-sidebar-header">
                Active Customers
                <a href="javascript:void(0)" @click="deselect()" data-dismiss="modal" class="btn btn-effect-ripple btn-xs btn-danger pull-right" style="overflow: hidden; position: relative;"><i class="fa fa-minus"></i></a>
            </h4>
            <ul class="nav-users nav-users-online">
                <li v-for="conversation in conversations" v-bind:key="conversation.id">
                    <a href="javascript:void(0)" @click="select(conversation.participant.id)" data-dismiss="modal">
                        <img :src="'http://graph.facebook.com/' + conversation.participant.id + '/picture?type=square'" alt="avatar" class="nav-users-avatar">
                        <span class="label label-success nav-users-indicator">{{ conversation.unread_count }}</span>
                        <span class="nav-users-heading">{{ conversation.participant.name }}</span>
                        <span class="text-muted">{{ conversation.participant.email }}</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props: ['page'],
    data() {
        return {
            conversations: [],
        }
    },
    methods: {
        select(id) {
            this.$emit('input', id);
        },
        deselect() {
            this.$emit('input', '');
        }
    },
    created() {
        this.$http.get('/api/pages/conversations').then(response => {
            this.conversations = response.body;
            console.log(this.conversations);
        });
    }
}
</script>
