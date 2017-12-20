<template>
    <div>
        <div id="attachment-list-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h3 class="modal-title">
                            <strong>Attachments</strong>
                        </h3>
                    </div>
                    <div class="modal-body">
                        <facebook-attachments-part v-model="attachment" :conversationId="order && order.extendsInfo ? order.extendsInfo['conversationId'] : null"></facebook-attachments-part>
                    </div>
                    <div class="modal-footer">
                        <i v-if="saving" class="fa fa-asterisk fa-2x fa-spin text-success"></i>
                        <div v-else>
                            <button type="button" @click="save" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Save</button>
                            <button type="button" class="btn btn-effect-ripple btn-danger" data-dismiss="modal" style="overflow: hidden; position: relative;">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import FacebookAttachmentsPart from 'parts/FacebookAttachmentsPart.vue';
import { EventBus } from 'src/bus';

export default {
    props: ['order', 'onUpdatedOrder'],
    data() {
        return {
            attachment: {},
            saving: false,
        }
    },
    methods: {
        save() {
            if (this.attachment) {
                this.saving = true;
                EventBus.uploadSlip(this.attachment.name, this.attachment.image_data.url).then(uploadedUrl => {
                    return this.$http.post('api/sales/order/' + this.order._id, { slipUrl: uploadedUrl });
                }).then(response => {
                    this.onUpdatedOrder(response.body);
                    this.saving = false;
                    $("#attachment-list-modal").modal('hide');
                }).catch(error => console.log(error));
            }
        },
    },
    components: {
        facebookAttachmentsPart: FacebookAttachmentsPart,
    }
}
</script>