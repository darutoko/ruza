import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

const routes = [
	{
		path: "/shows",
		alias: "/",
		component: () => import("@/views/Shows/Shows.vue"),
		children: [
			{
				path: "",
				name: "shows_list",
				component: () => import("@/views/Shows/List.vue"),
			},
			{
				path: "shows/:id",
				name: "shows_show",
				beforeEnter: adminOnly,
				component: () => import("@/views/Shows/Show.vue"),
			},
		],
	},
	{
		path: "/food",
		component: () => import("@/views/Food/Food.vue"),
		children: [
			{
				path: "",
				name: "food_list",
				component: () => import("@/views/Food/List.vue"),
			},
			{
				path: "dish/:id?",
				name: "food_dish",
				beforeEnter: adminOnly,
				component: () => import("@/views/Food/Dish.vue"),
			},
			{
				path: "ingredient",
				name: "food_ingredient",
				beforeEnter: adminOnly,
				component: () => import("@/views/Food/Ingredient.vue"),
			},
			{
				path: "type",
				name: "food_type",
				beforeEnter: adminOnly,
				component: () => import("@/views/Food/Ingredient.vue"),
			},
		],
	},
	{
		path: "/videos",
		component: () => import("@/views/Videos/Videos.vue"),
		children: [
			{
				path: "",
				name: "videos_disk",
				component: () => import("@/views/Videos/Disk.vue"),
			},
			{
				path: "internet",
				name: "videos_internet",
				component: () => import("@/views/Videos/Internet.vue"),
			},
		],
	},
	{
		path: "/403",
		name: "forbidden",
		component: () => import("@/views/403.vue"),
	},
	{
		path: "/login",
		name: "login",
		component: () => import("@/views/Login.vue"),
	},
]

function adminOnly(to, from, next) {
	if (!store.state.user.isAdmin) {
		next({ name: "forbidden" })
		return
	}

	next()
}

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
})

export default router
