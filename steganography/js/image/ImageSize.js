"use strict";

function ImageSize(width, height) {
	this.width = width;
	this.height = height;

	this.setSizes = function(width, height) {
		this.width = width;
		this.height = height;
	};
}	

module.exports = ImageSize;