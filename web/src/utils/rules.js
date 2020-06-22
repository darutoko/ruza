module.exports = {
	textRequired(value) {
		if (value !== "") return true
		return "Field is required"
	},
}
