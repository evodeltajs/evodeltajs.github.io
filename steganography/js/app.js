(function() {
	"use strict";

	var ImageReader = ns.ImageReader;
	var ImageViewer = ns.ImageViewer;
	var ImageMerger = ns.ImageMerger;
	var ImageUnmerger = ns.ImageUnmerger;

	var imageReader1, imageReader2, imageReader3, inputImageViewer1,inputImageViewer2, inputImageViewer3, outputUnmergeFirst, outputUnmergeSecond; 	
 	var imageData1, imageData2;

	init();

	function init() {
		initImageReaders();
		initImageViewers();		
	}

	function initImageReaders() {
		var imagesLoaded = 0;
		var imageReaderContainer1 = document.getElementById("imageReader1");
		var imageReaderContainer2 = document.getElementById("imageReader2");
		imageReader1 = new ImageReader(imageReaderContainer1);
		imageReader2 = new ImageReader(imageReaderContainer2);	


		imageReader1.onImageReceived = function(imageData) {
			inputImageViewer1.setImage(imageData);
			imageData1 = imageData;
			imagesLoaded +=1;
	 	
		 	if(imagesLoaded === 2){

				var rezImg = initImageMerger(imageData1,imageData2);
				initMergeView(rezImg);
			}
			else{
			 	console.log ("You need to input two files!");
			}

			};

		imageReader1.init();

		imageReader2.onImageReceived = function(imageData) {
			inputImageViewer2.setImage(imageData);
			imageData2 = imageData;
			imagesLoaded +=1;

			if(imagesLoaded === 2){
			 	
				var rezImg = initImageMerger(imageData1,imageData2);
				initMergeView(rezImg);
			}
			else {
			 	console.log ("You need to input two files!");
			 }
			};

		imageReader2.init();
	}

	function initImageViewers() {
		var inputImageViewerContainer1 = document.getElementById("inputImageViewer1");
		var inputImageViewerContainer2 = document.getElementById("inputImageViewer2");

		inputImageViewer1 = new ImageViewer(inputImageViewerContainer1);
		inputImageViewer1.init();

		inputImageViewer2 = new ImageViewer(inputImageViewerContainer2);
		inputImageViewer2.init();
	}

	function initImageMerger (imageData1,imageData2 ) {
		console.log ("Merge process has started");
		// console.log(imageData1);
		// console.log(imageData2);
		var imageMergerExecution =  new ImageMerger(imageData1,imageData2);
		var result = imageMergerExecution.merge();
		// console.log(result);
		return result;
	}

	function initMergeView(imageData){
		var imageContainerMerge = document.getElementById("imageMergerFinal");
		inputImageViewer3 = new ImageViewer(imageContainerMerge); 
		//inputImageViewer3.init();
		//console.log(imageData);		 
		inputImageViewer3.setFinal(imageData);

		initImageUnmerger(imageData);	//calling unmerge after merge is done
	}

	function initImageUnmerger (imageData){
		//TODO: integrate unmerger
		// console.log("A intrat aci");
		// console.log(imageData);
		var imageUnmerger = new ImageUnmerger(imageData);
		var imageArray = imageUnmerger.unmerge();	
		// console.log(imageArray);

		initUnmergeView(imageArray);
	}

	function initUnmergeView(imageArray){
		//TODO: paint on canvas the 2 resulting images
		// console.log(imageArray[0]);
		// console.log(imageArray[1]);
		var imageContainerUnmergeFirst = document.getElementById("imageUnmergeFirst");
		var imageContainerUnmergeSecond = document.getElementById("imageUnmergeSecond");

		outputUnmergeFirst = new ImageViewer(imageContainerUnmergeFirst);
		outputUnmergeSecond= new ImageViewer(imageContainerUnmergeSecond);

		outputUnmergeFirst.setFinal(imageArray[0]);
		outputUnmergeSecond.setFinal(imageArray[1]);

	
	}
 
}());