<template>
    <div class="block overflow-hidden">
        <div id="link-customer-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
						<h3 class="modal-title"><strong>Link Customer</strong></h3>
					</div>
					<div class="modal-body">
						<div class="row form-group">
							<div class="col-sm-6">
								<div class="input-group">
                                    <img class="img-thumbnail img-thumbnail-avatar" src="http://www.avinashdangeti.com/wp-content/uploads/2016/08/Avinash-Dangeti-Digital-Marketing-Facebook-Page-Update-1.png">
									{{ idForPage.id }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
        <div id="message-list">
            <div class="block-title clearfix">
                <div class="block-options pull-right">
                    <a href="javascript:void(0)" class="btn btn-effect-ripple btn-default" style="overflow: hidden; position: relative;">
                        <i class="fa fa-arrow-left"></i> Prev</a>
                    <a href="javascript:void(0)" class="btn btn-effect-ripple btn-default" style="overflow: hidden; position: relative;">Next
                        <i class="fa fa-arrow-right"></i>
                    </a>
                </div>
                <div class="block-options pull-left">
                    <a href="javascript:void(0)" class="btn btn-effect-ripple btn-info" data-toggle="tooltip" title="" style="overflow: hidden; position: relative;" data-original-title="Archive Selected">
                        <i class="fa fa-briefcase"></i>
                    </a>
                    <a href="javascript:void(0)" class="btn btn-effect-ripple btn-warning" data-toggle="tooltip" title="" style="overflow: hidden; position: relative;" data-original-title="Star Selected">
                        <i class="fa fa-star"></i>
                    </a>
                    <a href="javascript:void(0)" class="btn btn-effect-ripple btn-danger" data-toggle="tooltip" title="" style="overflow: hidden; position: relative;" data-original-title="Delete Selected">
                        <i class="fa fa-times"></i>
                    </a>
                </div>
            </div>
            <div class="block-content-full">
                <table class="table table-borderless table-striped table-vcenter remove-margin">
                    <tbody>
                        <tr v-for="conversation in conversations" v-bind:key="conversation.id">
                            <td class="td-label td-label-muted text-center" style="width: 5%;">
                                <label class="csscheckbox csscheckbox-primary">
                                    <input type="checkbox">
                                    <span></span>
                                </label>
                            </td>
                            <td class="text-center" style="width: 7%;">
                                <img :src="'https://graph.facebook.com/' + conversation.participant.id + '/picture?type=square'" alt="avatar" class="img-circle">
                            </td>
                            <td>
                                <h4>
                                    <a href="javascript:void(0)" class="text-dark">
                                        <strong>{{ conversation.participant.name }}</strong>
                                    </a>
                                </h4>
                                <span class="text-muted">{{ conversation.snippet }}</span>
                            </td>
                            <td class="hidden-xs text-center" style="width: 30px;">
                                <i class="fa fa-address-book fa-2x" :class="{ 'text-muted': !conversation.customer, 'text-primary': conversation.customer }"></i>
                                <span v-if="!conversation.customer">
                                    <a href="#link-customer-modal" data-toggle="modal">Create Customer</a>
                                </span>
                            </td>
                            <td class="hidden-xs text-right text-muted" style="width: 120px;">
                                <em>{{ conversation.updated_time | fromNow }}</em>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    props: ['page'],
    data() {
        return {
            conversations: [],
            idForPage: {},
        }
    },
    methods: {
        getPsidForPage(conversationUserId) {
            console.log("getPsidForPage", conversationUserId);
            this.$http.get('/api/pages/id_for_page/' + conversationUserId).then(response => {
                this.idForPage = response.body;
            });
        }
    },
    created() {
        this.$http.get('/api/pages/conversations').then(response => {
            this.conversations = response.body;
        });

        this.getPsidForPage('10154262244241332');
    }
}
</script>