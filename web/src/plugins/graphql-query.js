import Vue from "vue";
import gql from "graphql-tag";

let GraphQLQuery = {
	install(Vue) {
		Vue.mixin({
			methods: {
				async graphql(request, callback) {
					let loading;
					if (request.loadingKey) loading = (isLoading) => this[request.loadingKey].loading = isLoading;
					else loading = (isLoading) => this.$store.commit("loading", isLoading);

					loading(true);
					try {
						let result;
						if (request.query) {
							result = await this.$apollo.query({
								query: gql(request.query),
								variables: request.variables,
								fetchPolicy: request.fetchPolicy
							});
						} else if (request.mutation) {
							result = await this.$apollo.mutate({
								mutation: gql(request.mutation),
								variables: request.variables,
								fetchPolicy: request.fetchPolicy
							});
						} else {
							throw "Unknown query type";
						}
						callback(result.data, result);
					} catch (error) {
						this.$store.commit("error", error.message);
					}
					loading(false);
				}
			}
		});
	}
};

Vue.use(GraphQLQuery);
