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
						<router-link to="/sale_report">
							<i class="hi hi-usd sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Sale Report</span>
						</router-link>
					</li>
					<li>
						<router-link to="/batch_report">
							<i class="hi hi-usd sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Batch Report</span>
						</router-link>
					</li>
          <li>
						<router-link to="/order_report">
							<i class="hi hi-usd sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Order Report</span>
						</router-link>
					</li>
					<li class="sidebar-separator">
						<i class="fa fa-ellipsis-h"></i>
					</li>
					<li>
						<a href="#" class="sidebar-nav-menu">
							<span class="sidebar-nav-ripple animate" style="height: 220px; width: 220px; top: -87px; left: 70px;"></span>
							<i class="fa fa-chevron-left sidebar-nav-indicator sidebar-nav-mini-hide"></i>
							<i class="gi gi-more_items sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Sell</span>
						</a>
						<ul>
							<li>
								<router-link to="/sale">
									<i class="gi gi-shopping_cart sidebar-nav-icon"></i>
									<span class="sidebar-nav-mini-hide">Create Sale</span>
								</router-link>
							</li>
							<li>
								<router-link to="/consignment">
									<i class="gi gi-shopping_cart sidebar-nav-icon"></i>
									<span class="sidebar-nav-mini-hide">Consignment</span>
								</router-link>
							</li>
							<li>
								<router-link to="/order">
									<i class="gi gi-shopping_cart sidebar-nav-icon"></i>
									<span class="sidebar-nav-mini-hide">Create Order</span>
								</router-link>
							</li>
						</ul>
					</li>
					<li class="sidebar-separator">
						<i class="fa fa-ellipsis-h"></i>
					</li>
					<li>
						<router-link to="/page_settings">
							<i class="fa fa-user-secret sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Page Settings</span>
						</router-link>
					</li>
					<li>
						<router-link to="/customer">
							<i class="fa fa-user-secret sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Customer</span>
						</router-link>
					</li>
					<li>
						<router-link to="/product">
							<i class="fa fa-trophy sidebar-nav-icon"></i>
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
							<i class="gi gi-shopping_bag sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Promotion</span>
						</router-link>
					</li>
					<li>
						<router-link to="/onlineshop">
							<i class="gi gi-shopping_bag sidebar-nav-icon"></i>
							<span class="sidebar-nav-mini-hide">Online Product</span>
						</router-link>
					</li>
				</ul>
				<!-- END Sidebar Navigation -->
			</div>
			<!-- END Sidebar Content -->
		</div>
	</div>
</template>
