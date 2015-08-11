"use strict";

function UnmergeButton(container) {
	var that = this;
	var btnUnmerge = document.createElement("button");
	btnUnmerge.type = "button";		
	btnUnmerge.className = "unmerge-button fill";
	btnUnmerge.innerText = "Unmerge";
	btnUnmerge.textContent = "Unmerge";
	container.appendChild(btnUnmerge);
 	btnUnmerge.disabled = true;

	this.onErrorMessageReceived = function () {}; 

	this.activate = function() {
		btnUnmerge.disabled = false; 
	};

	this.deactivate = function() {
		btnUnmerge.disabled = true;
	};
}

module.exports = UnmergeButton;