<template>
    <div>
        <a href="#conversation-list-modal" :class="{ 'btn': !selectedConversation.participant, 'btn-info': !selectedConversation.participant}" data-toggle="modal" style="overflow: hidden; position: relative;">
            <span v-if="selectedConversation.participant">
                <img :src="'https://graph.facebook.com/' + selectedConversation.participant.id + '/picture?type=square'" alt="avatar" class="img-thumbnail-avatar-small">
                {{ selectedConversation.participant.name }}
            </span>
            <i v-else class="fa fa-facebook"></i>
        </a>
        <div id="conversation-list-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h3 class="modal-title">
                            <strong>Facebook Channel Customers</strong>
                        </h3>
                    </div>
                    <div class="modal-body">
                        <facebook-conversation-list-part v-model="selectedConversation" v-on:input="onSelectedConversation"></facebook-conversation-list-part>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import FacebookConversationListPart from './parts/FacebookConversationListPart.vue';

export default {
    data() {
        return {
            selectedConversation: {}
        }
    },
    methods: {
        onSelectedConversation(conversation) {
            if (conversation.participant) {
                this.$emit('input', {
                    id: conversation.id,
                    participant: conversation.participant
                });
            }
        }
    },
    components: {
        facebookConversationListPart: FacebookConversationListPart,
    }
}
</script>