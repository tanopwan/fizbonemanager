<template>
    <div class="block-section">
        <div class="row">
            <i v-if="loading" class="text-center fa fa-asterisk fa-2x fa-spin text-success"></i>
            <div v-else class="col-xs-12 col-sm-6 col-md-4" v-for="attachment in attachments" v-bind:key="attachment.id">
                <a href="javascript:void(0)" @click="select(attachment.id)">
                    <img :src="attachment.image_data.preview_url" class="img" :class="{ 'img-thumbnail': selectedId === attachment.id }">
                </a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['conversationId'],
    data() {
        return {
            loading: true,
            attachments: [],
            selectedId: '',
        }
    },
    methods: {
        select(id) {
            let attachment = this.attachments.find(attachment => attachment.id === id);
            this.selectedId = attachment.id;
            this.$emit('input', attachment);
        }
    },
    watch: {
        conversationId(conversationId) {
            if (conversationId) {
                this.$http.get(`/api/pages/conversations/${conversationId}/attachments`).then(response => {
                    this.attachments = response.body;
                    this.loading = false;
                }).catch(error => console.log(error));
            }
        }
    },
    created() {
        //t_mid.$cAAEuFndVCy1h1L0s5lbo3fi2SCMJ
    }

}
</script>

<style>
img {
    width: 100% !important;
    height: 160px !important;
}
</style>