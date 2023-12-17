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
						element.querySelector(".url").textContent = tab.url;
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
		let list = document.querySelectorAll("li");
		let to_book = []
		
		// filter out the desired tabs
		for(const tab of list) {
			if(tab.querySelector("#flag").checked) {
				let tab_data = {}
				tab_data.url = tab.querySelector(".url").textContent;
				tab_data.title = tab.querySelector(".title").textContent;
				to_book.push(tab_data);
			}
		}
		
		bookmark_all(to_book);
	});
}

// break list up to handle individual tabs
function bookmark_all(tabs) {
	console.log("bookmarking", tabs.length, "tabs");
	let promises = []
	for(const tab of tabs)
		promises.push(bookmark_one(tab));
	
	Promise.all(promises)
		.then(r => console.log("succeeded", r))
		.catch(e => console.log("failed ", e));
}

// bookmark utility
function bookmark_one(tab) {
	console.log("bookmarking", tab.url);
	return chrome.bookmarks.create({
		'url': tab.url,
		'title': tab.title
	});
}