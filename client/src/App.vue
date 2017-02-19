<template>
	<div id="app">
		<div id="page-wrapper">
			<div id="page-container" class="header-fixed-top sidebar-visible-lg-full sidebar-light">
				<div id="sidebar">
					<div id="sidebar-brand" class="themed-background">
						<a href="index.html" class="sidebar-title">
							<i class="fa fa-hashtag"></i> <span class="sidebar-nav-mini-hide"><strong>Fizbone</strong> Manager</span>
						</a>
					</div>
					<div id="sidebar-scroll">
                        <!-- Sidebar Content -->
                        <div class="sidebar-content">
                            <!-- Sidebar Navigation -->
                            <ul class="sidebar-nav">
                                <li>
                                    <a href="index.html" class="active"><i class="gi gi-compass sidebar-nav-icon"></i><span class="sidebar-nav-mini-hide">Dashboard</span></a>
                                </li>
                                <li class="sidebar-separator">
                                    <i class="fa fa-ellipsis-h"></i>
                                </li>
								<li>
									<router-link to="/product">
										<i class="gi gi-inbox sidebar-nav-icon"></i>
										<span class="sidebar-nav-mini-hide">Product</span>
									</router-link>
                                </li>
								<li>
									<router-link to="/batch">
										<i class="gi gi-inbox sidebar-nav-icon"></i>
										<span class="sidebar-nav-mini-hide">Batch</span>
									</router-link>
                                </li>
								<li>
									<router-link to="/sell">
										<i class="gi gi-inbox sidebar-nav-icon"></i>
										<span class="sidebar-nav-mini-hide">Sell</span>
									</router-link>
                                </li>
                            </ul>
                            <!-- END Sidebar Navigation -->
                        </div>
                        <!-- END Sidebar Content -->
                    </div>
				</div>
				<div id="main-container">
					<header class="navbar navbar-inverse navbar-fixed-top">
						<ul class="nav navbar-nav-custom">
							<li class="hidden-xs animation-fadeInQuick">
                                <a href=""><strong>Hello, {{ name }}</strong></a>
                            </li>
						</ul>
						<!-- Right Header Navigation -->
						<ul class="nav navbar-nav-custom pull-right">
							<li>
								<a href="/api/auth/facebook"><i class="gi gi-settings"></i></a>
							</li>
						</ul>
						<!-- END Right Header Navigation -->
					</header>
					<div id="page-content">
						<!-- Page Header -->
                        <div class="content-header">
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="header-section">
                                        <h1>{{ msg }}</h1>
										<template v-if="isLoggedIn">
											<a href="#" v-on:click='logout'>Logout</a>
										</template>
                                    </div>
                                </div>
                                <div class="col-sm-6 hidden-xs">
                                    <div class="header-section">
                                        <ul class="breadcrumb breadcrumb-top">
                                            <li>Category</li>
                                            <li><a href="">Page</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- END Page Header -->
						<router-view></router-view>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import UserService from './user/user.service';

export default {
	name: 'app',
	data () {
		return {
			msg: 'Welcome to Your Vue.js App',
			isLoggedIn: false,
			name: ""
		}
	},
	created () {
		UserService.getCurrentUser().then(data => {
			this.isLoggedIn = true;
			this.name = data.name;
		}).catch(data => {
			this.isLoggedIn = false;
			window.location.href = "/login";
		});
	},
	methods: {
		logout: function(e) {
			e.preventDefault();
			UserService.logout((isLoggedIn) => {
				this.isLoggedIn = isLoggedIn;
				if (this.isLoggedIn === false) {
					window.location.href = "/login";
				}
			});
			return false;
		}
	}
}
</script>

<style scoped>
</style>
