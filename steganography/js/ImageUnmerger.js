(function() {

"use strict";


function ImageUnmerger (ImageData) {
    this.inputImage= ImageData;
    this.sizes = ns.ImageDefaultSize* ns.ImageDefaultSize * 4;

	this.unmerge = function(){
	 	 
		var firstAux = new Uint8ClampedArray(this.sizes);
		var secondAux = new Uint8ClampedArray(this.sizes); 
	    var temp = new Uint8ClampedArray(this.sizes);

		for (var i=0; i<this.sizes; i++) {

			firstAux[i] = 0;
			secondAux[i] = 0;	
			temp[i] =0;
		}
	 	
		for (var i=0; i<this.sizes; i++) {

			temp[i] = this.inputImage[i];
			temp[i] = temp[i] >> 2 << 2;
			firstAux[i] = temp[i];
			secondAux[i] = temp[i] ^ this.inputImage[i];
			secondAux[i] = secondAux[i] * 64;
		}

	   	return [firstAux, secondAux];
	};  

}
ns.ImageUnmerger = ImageUnmerger;
	
}()); 