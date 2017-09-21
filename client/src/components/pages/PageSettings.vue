<template>
    <div>
        Page Settings
        <br> {{ conversations.length }}
        <div v-for="conversation in conversations" v-bind:key="conversation.id">
            {{ conversation.participants }}
        </div>
        <conversation-inbox :page="page"></conversation-inbox>
    </div>
</template>

<script>
import { EventBus } from 'src/bus';
import ConversationInbox from 'blocks/ConversationInbox.vue'

export default {
    data() {
        return {
            conversations: '',
            page: {},
        }
    },
    computed: {
    },
    methods: {

    },
    created() {
        this.$http.get('/api/users/page').then(response => {
            this.page = response.data;
            console.log(this.page);
        });
        
    },
    components: {
        conversationInbox: ConversationInbox,
    }
}
</script>