"use strict";

function ErrorBox(container) {
	var ErrorBoxMessage;

	this.init= function() {
		ErrorBoxMessage = document.createElement("div");
		ErrorBoxMessage.className = "error-box";
		container.appendChild(ErrorBoxMessage);
	};

	this.clear = function() {
		ErrorBoxMessage.innerHTML = "";
	};

	this.setMessage = function(message) {
		this.clear();
		ErrorBoxMessage.innerHTML = message;
	};
}

module.exports = ErrorBox;