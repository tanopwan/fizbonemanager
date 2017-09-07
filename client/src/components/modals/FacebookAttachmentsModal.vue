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
                    <div class="modal-body">
                        {{ attachment }}
                    </div>
                    <div class="modal-footer">
                        <button type="button" @click="save" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Save</button>
                        <button type="button" class="btn btn-effect-ripple btn-danger" data-dismiss="modal" style="overflow: hidden; position: relative;">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import FacebookAttachmentsPart from '../parts/FacebookAttachmentsPart.vue';

export default {
    props: ['order'],
    data() {
        return {
            attachment: {},
        }
    },
    watch: {
        order(val) {
            console.log(val);
        }
    },
    methods: {
        toDataURL(url) {
            return fetch(url)
                .then(response => response.blob())
            // .then(blob => new Promise((resolve, reject) => {
            //     const reader = new FileReader();
            //     reader.onloadend = () => resolve(reader.result);
            //     reader.onerror = reject;
            //     reader.readAsDataURL(blob);
            // }));
        },
        save() {
            console.log("order", this.order);
            if (this.attachment) {
                fetch(this.attachment.image_data.url)
                    .then(response => response.blob())
                    .then(blob => {
                        let formData = new FormData()
                        formData.append('image', blob, this.attachment.name);
                        console.log(blob);

                        // new Promise((resolve, reject) => {
                        //     const reader = new FileReader();
                        //     reader.onloadend = () => resolve(reader.result);
                        //     reader.onerror = reject;
                        //     reader.readAsDataURL(blob);
                        // }).then(dataUrl => console.log(dataUrl));
                        

                        return this.$http.post(`/api/sales/orders/${this.order._id}/upload_slip`, formData, {
                            headers: {
                                'Content-Type': 'multipart/formdata'
                            }
                        });
                    })
                    .then(result => {
                        console.log(result);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        },
    },
    components: {
        facebookAttachmentsPart: FacebookAttachmentsPart,
    }
}
</script>