"use strict";

function ImageUnmerger(ImageData, size) {
	this.inputImage= ImageData;
	this.sizes = size.width* size.height * 4;

	this.unmerge = function() {
		var i;
		var firstAux = new Uint8ClampedArray(this.sizes);
		var secondAux = new Uint8ClampedArray(this.sizes); 
		var temp = new Uint8ClampedArray(this.sizes);
		
		for (i = 0; i < this.sizes; i++) {
			firstAux[i] = 0;
			secondAux[i] = 0;	
			temp[i] =0;
		}
 		 
		for (i = 0; i < this.sizes; i++) {
			temp[i] = this.inputImage.data[i];
			temp[i] = temp[i] >> 2 << 2;
			firstAux[i] = temp[i];
			secondAux[i] = temp[i] ^ this.inputImage.data[i];
			secondAux[i] = secondAux[i] * 64;
		}		
		
		return [firstAux,secondAux];
	};
}

module.exports = ImageUnmerger;