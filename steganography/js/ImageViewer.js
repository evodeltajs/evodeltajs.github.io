(function() {

	"use strict";

	var ImageDefaultSize = ns.ImageDefaultSize;

	function ImageViewer(container) {
		var canvasImageViewer;
		var ctx;
		var imageDataNew;
		
		this.init = function() {
			canvasImageViewer = document.createElement("canvas");
			ctx = canvasImageViewer.getContext("2d");

			canvasImageViewer.width = ImageDefaultSize;
			canvasImageViewer.height = ImageDefaultSize;

			container.appendChild(canvasImageViewer);

		};

		this.setImage = function(imageData) {			
			ctx.putImageData(imageData, 0, 0);			
		};
 		
 		this.setFinal = function(myData){ 			
 			this.init();

 			var imageData = canvasImageViewer.getContext("2d").createImageData(ImageDefaultSize, ImageDefaultSize);
 			imageData.data.set(myData);

 			this.setImage(imageData); 
 		}
	}

	ns.ImageViewer = ImageViewer;

}());
