const get_button = document.getElementById("get_button");
const bookmark_button = document.getElementById("bookmark_button");

if(get_button) {
	get_button.addEventListener("click", () => {
		get_button.hidden = true;
		bookmark_button.hidden = false;
	});
}

if(bookmark_button) {
	bookmark_button.addEventListener("click", () => {
		// todo
	});
}