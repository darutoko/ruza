import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import store from './store.js'

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
			path: '/login',
			name: 'login',
			component: () => import('./views/Login.vue')
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
			component: () => import('./views/Food/Food.vue'),
			children: [
				{
					path: '',
					name: 'food_list',
					component: () => import('./views/Food/List.vue'),
				},
				{
					path: 'dish/:id?',
					name: 'food_dish',
					beforeEnter: adminOnly,
					component: () => import('./views/Food/Dish.vue'),
				},
				{
					path: 'ingredient',
					name: 'food_ingredient',
					beforeEnter: adminOnly,
					component: () => import('./views/Food/Ingredient.vue'),
				},
				{
					path: 'type',
					name: 'food_type',
					beforeEnter: adminOnly,
					component: () => import('./views/Food/Ingredient.vue'),
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

function adminOnly(to, from, next) {
	if (!store.state.user.isAdmin) {
		next({ name: 'forbidden' })
		return
	}

	next();
}
