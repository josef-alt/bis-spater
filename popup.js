// need to get both buttons at beginning in order to hide/unhide
const bookmark_button = document.getElementById("bookmark_button");
const select_all = document.getElementById("selectAll");

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

// toggle all elements based on switch
// TODO - look into expected behavior of select all
if(select_all) {
	select_all.addEventListener("change", (e) => {
		let list = document.getElementsByTagName("li");
		for(var tab of list)
			tab.querySelector("#flag").checked = e.target.checked;
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
// save all tabs under 'Other bookmarks'
function bookmark_all(tabs) {
	console.log("bookmarking", tabs.length, "tabs");
	
	var pid;
	getOrCreateFolder()
		.then(folderId => pid = folderId)
		.catch(failure => console.log("failed to find and/or create folder"))
		.finally(function() {		
			console.log("pid is now", pid);
			let promises = []
			for(const tab of tabs)
				promises.push(bookmark_one(tab, pid));
			
			Promise.all(promises)
				.then(r => console.log("succeeded", r))
				.catch(e => console.log("failed ", e));
		});
}

// bookmark utility
// goes under 'Other bookmarks' if pid resolution fails
function bookmark_one(tab, pid) {
	return chrome.bookmarks.create({
		'parentId': pid,
		'url': tab.url,
		'title': tab.title
	});
}

// looks for an existing folder and creates one if none is found
// returns the folder id of 'bis-spater'
function getOrCreateFolder() {
	return new Promise((resolve, reject) => {
		findBookmarkFolder()
			.then(folderId => resolve(folderId))
			.catch(failure => {
				chrome.bookmarks.create({'title': 'bis-spater'})
					.then(folder => resolve(folder.id))
					.catch(failure => reject(failure));
			});
	});
}

// search for existing 'bis-spater' folder because folder id's are not
// constants; consequentially, this also allows the user to move their
// folder to wherever they wish.
function findBookmarkFolder() {	
	return new Promise((resolve, reject) => {
		chrome.bookmarks.getTree()
			.then(tree => {
				let stack = []
				for(var folder of tree[0].children) {
					stack.push(folder);
				}
				
				while(stack.length > 0) {
					const top = stack.pop();
					if(top.title === 'bis-spater') {
						resolve(top.id);
					}
					if(top.children) {
						for(var child of top.children) {
							stack.push(child);
						}
					}
				}
				reject("failed to locate folder");
			}).catch(e => console.log("failed to get tree"));
	});
}
