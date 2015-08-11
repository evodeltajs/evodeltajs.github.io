"use strict"; 

function ImageViewer(container, sizes) {
	var canvasImageViewer;
	var ctx;
	var imageDataNew; 
	this.sizes = sizes;

	this.init = function() {
		canvasImageViewer = document.createElement("canvas");
		ctx = canvasImageViewer.getContext("2d");
		canvasImageViewer.width =  sizes.width;
		canvasImageViewer.height = sizes.height;
		container.appendChild(canvasImageViewer);
	};

	this.setImage = function(imageData) {	
		ctx.putImageData(imageData, 0, 0);	
		return imageData;	
	};

	this.setFinal = function(myData) { 	
		this.init();
		var imageData = canvasImageViewer.getContext("2d").createImageData(sizes.width, sizes.height);
		imageData.data.set(myData);
		this.setImage(imageData); 
	};

	this.getCanvas = function() {
		return canvasImageViewer;
	};
}		

module.exports = ImageViewer;
