"use strict";
 
function ImageMerger(ImageData1, ImageData2) {

	this.ImageResult1 = ImageData1;
	this.ImageResult2 = ImageData2;

	this.merge = function() {
		var i;
		var sizeImageResult2 = this.ImageResult2.data.length;
		var sizeImageResult1 = this.ImageResult1.data.length;		
		var aux = new Uint8ClampedArray(sizeImageResult2);
		var finalImage = new Uint8ClampedArray(sizeImageResult2);

		for(i =0; i<sizeImageResult2; i++) {
			aux[i] = Math.floor(this.ImageResult2.data[i] / 64);
		}

		for(i=0; i<sizeImageResult1; i++) {
			this.ImageResult1.data[i] = this.ImageResult1.data[i] >> 2  << 2;
			finalImage[i] = this.ImageResult1.data[i] + aux[i];
		}
		var ImageFinal = finalImage;

		return ImageFinal;
    };
}

module.exports = ImageMerger;