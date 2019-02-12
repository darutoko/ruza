import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home
		},
		{
			path: '/about',
			name: 'about',
			// route level code-splitting
			// this generates a separate chunk (about.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
		},
		{
			path: '/food',
			name: 'food',
			component: () => import('./views/Food/Food.vue'),
			children: [
				{
					path: '',
					name: 'food_list',
					component: () => import('./views/Food/List.vue'),
				}
			]
		},
		{
			path: '/video',
			name: 'video',
			component: () => import('./views/About.vue')
		},
		{
			path: '/403',
			name: 'forbidden',
			component: () => import('./views/403.vue')
		},
	]
})
