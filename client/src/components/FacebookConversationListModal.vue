<template>
    <div>
        <a href="#conversation-list-modal" :class="{ 'btn': selectedId.length == 0, 'btn-info': selectedId.length == 0}" data-toggle="modal" style="overflow: hidden; position: relative;">
            <img v-if="selectedId.length > 0" :src="'http://graph.facebook.com/' + selectedId + '/picture?type=square'" alt="avatar" class="img-thumbnail-avatar-small">
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
                        <facebook-conversation-list-part v-model="selectedId"></facebook-conversation-list-part>
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
            selectedId: ''
        }
    },
    components: {
        facebookConversationListPart: FacebookConversationListPart,
    }
}
</script>