<template>
	<div id="app">
		<h1>{{ msg }}</h1>
		<template v-if="isLoggedIn">
			<a href="#" v-on:click='logout'>Logout</a>
			<br>
			{{ name }}
			<br>
		</template>
		<a v-else href="/api/auth/facebook">Facebook Login</a>
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
			console.log("not logged in: " + data.message);
		});
	},
	methods: {
		logout: function(e) {
			e.preventDefault();
			UserService.logout((isLoggedIn) => {
				this.isLoggedIn = isLoggedIn;
			});
			return false;
		}
	},
	components: {
	}
}
</script>

<style scoped>
#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

h1, h2 {
	font-weight: normal;
}

ul {
	list-style-type: none;
	padding: 0;
}

li {
	display: inline-block;
	margin: 0 10px;
}

a {
	color: #42b983;
}
</style>
