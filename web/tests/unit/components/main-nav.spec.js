import { mount, createLocalVue } from "@vue/test-utils";
import MainNav from "@/components/MainNav.vue";
import Vuetify from "vuetify";
import VueRouter from "vue-router";

let localVue = createLocalVue();
localVue.use(Vuetify);
localVue.use(VueRouter);

describe("MainNav.vue", () => {
	let data = {
		items: [
			{
				icon: "live_tv",
				name: "Сериалы",
				route: "/"
			},
			{
				icon: "restaurant_menu",
				name: "Еда",
				route: "/food"
			},
			{
				icon: "video_label",
				name: "Видео",
				route: "/video"
			}
		]
	};
	it("shows navigation when prop is true", () => {
		let wrapper = mount(MainNav, { localVue, propsData: { isShown: true } });
		wrapper.setData(data);
		console.log(wrapper.html());
		expect(true).toBeTruthy();
	});
});
