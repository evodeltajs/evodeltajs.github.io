"use strict";

function MergeButton(container) {
	var that = this;
	var btnMerge = document.createElement("button");
	btnMerge.type = "button";		
	btnMerge.className = "merge-button fill";
	btnMerge.innerText = "Merge";
	btnMerge.textContent = "Merge";
	container.appendChild(btnMerge);
 	btnMerge.disabled = true;

	this.onErrorMessageReceived = function () {}; 

	this.activate = function() { 
		btnMerge.disabled = false; 
	};

	this.deactivate = function() {
		btnMerge.disabled = true;
	};

	this.validate = function(size1, size2) {		
		if(size1.width === size2.width && size2.width === size1.width) {
		 	that.onErrorMessageReceived("OK");
		 	return true;
		} else { 
			that.onErrorMessageReceived("Not the same sizes");
			return false;
		}
	};
}

module.exports = MergeButton;