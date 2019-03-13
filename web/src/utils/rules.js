module.exports = {
	textRequired(value) {
		if (value !== "") return true;
		return "Поле необходимо заполнить";
	},
}