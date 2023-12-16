// need to get both buttons at beginning in order to hide/unhide
const get_button = document.getElementById("get_button");
const bookmark_button = document.getElementById("bookmark_button");

// set up listeners while avoiding null pointer exceptions
if(get_button) {
	get_button.addEventListener("click", () => {
		
		// we only want tabs from the window that launches extension
		chrome.windows.getCurrent(w => {
			chrome.tabs.query({ windowId: w.id }, function(tabs) {
				if(tabs) {
					
					// make sure no tabs such as chrome://extensions are included
					tabs = tabs.filter(t => t.url);
					
					// populate tabs list
					const template = document.getElementById("li_template");
					const elements = new Set();
					for(const tab of tabs) {
						const element = template.content.firstElementChild.cloneNode(true);
							
						element.querySelector(".title").textContent = tab.title;
						elements.add(element); 
					}
					document.querySelector("ul").append(...elements);
				} else {
					console.log("tabs not found")
				}
			});
		});		
		
		// flip button visibility 
		get_button.hidden = true;
		bookmark_button.hidden = false;
	});
}

if(bookmark_button) {
	bookmark_button.addEventListener("click", () => {
		// todo
	});
}