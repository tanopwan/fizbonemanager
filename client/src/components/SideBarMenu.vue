<template>
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
						<router-link to="/dashboard">
							<i class="gi gi-compass sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Dashboard</span>
						</router-link>
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
						<router-link to="/promotion">
							<i class="gi gi-inbox sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Promotion</span>
						</router-link>
					</li>
					<li>
						<router-link to="/sale">
							<i class="gi gi-inbox sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Sale</span>
						</router-link>
					</li>
				</ul>
				<!-- END Sidebar Navigation -->
			</div>
			<!-- END Sidebar Content -->
		</div>
	</div>
</template>
