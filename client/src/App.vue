<template>
	<div id="app">
		<app-side-bar-menu></app-side-bar-menu>
		<div id="main-container">
			<header class="navbar navbar-inverse navbar-fixed-top">
				<ul class="nav navbar-nav-custom">
					<li>
						<a href="javascript:void(0)" onclick="App.sidebar('toggle-sidebar');this.blur();">
							<i class="fa fa-ellipsis-v fa-fw animation-fadeInRight" id="sidebar-toggle-mini"></i>
							<i class="fa fa-bars fa-fw animation-fadeInRight" id="sidebar-toggle-full"></i>
						</a>
					</li>
					<li class="hidden-xs animation-fadeInQuick">
						<a href=""><strong>Hello, {{ name }}</strong></a>
					</li>
				</ul>
				<!-- Right Header Navigation -->
				<ul class="nav navbar-nav-custom pull-right">
					<li>
						<template v-if="!isLoggedIn">
							<a href="/api/auth/facebook"><i class="gi gi-log_in"></i> Login</a>
						</template>
						<template v-else>
							<a href="#" v-on:click='logout'><i class="gi gi-log_out"></i> Logout</a>
						</template>
					</li>
				</ul>
				<!-- END Right Header Navigation -->
			</header>
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
import UserService from './user/user.service';
import SideBarMenu from './components/SideBarMenu.vue';

export default {
	name: 'app',
	data () {
		return {
			isLoggedIn: false,
			name: ""
		}
	},
	created () {
		UserService.getCurrentUser().then(data => {
			this.isLoggedIn = true;
			this.name = data.name;
		}).catch(response => {
			console.log(response);
			this.isLoggedIn = false;
			location.href = '/login';
		});
	},
	methods: {
		logout: function(e) {
			e.preventDefault();
			UserService.logout((isLoggedIn) => {
				this.isLoggedIn = isLoggedIn;
				if (this.isLoggedIn === false) {
					location.href = '/login';
				}
			});
			return false;
		}
	},
	components: {
		appSideBarMenu: SideBarMenu
	}
}
</script>

<style scoped>
</style>
