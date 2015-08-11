"use strict";

var ImageReader = require("./ImageReader");
var ImageViewer = require("./ImageViewer");
var ImageMerger = require("./ImageMerger");
var ImageUpload = require("./ImageUpload");
var MergeButton = require("./MergeButton");
var RefreshButton = require("./RefreshButton");
var DownloadButton = require("./DownloadButton");
var ImageSize = require("./ImageSize");
var ErrorBox = require("./ErrorBox");

function MergeController() {

	var imageReaderFirst, imageReaderSecond, imageReaderMerged;
	var inputImageViewerFirst, inputImageViewerSecond, inputMergeView; 	
	var imageDataFirst, imageDataSecond;
	var imagesLoaded = 0;
	var imageLoadedFirst = 0;
	var imageLoadedSecond = 0;
	var btnMergeOn = false;
	var imageUploadFirst, imageUploadSecond;
	var sizesFirst, sizesSecond ;
	var errMsgFirst, errMsgSecond ,errMsgMerge;
	var flagFirst = false;

	var imageContainerMerge = document.getElementById("imageMergerFinal");

	var btnDown = new DownloadButton(imageContainerMerge.id);
		
	init();
	btnDown.hide();

	function init() {	
		var FirstImage = document.getElementById("FirstImage");
		var SecondImage = document.getElementById("SecondImage");
		initImageUpload(FirstImage, SecondImage);

		var idRefresh = document.getElementById("refreshBtn");
		var refreshBtn = new RefreshButton(idRefresh);
	}


	function initImageUpload(firstImageContainer, secondImageContainer) {
		var imageUploadContainerFirst = document.createElement("div");
		var imageUploadContainerSecond = document.createElement("div");

		imageUploadContainerFirst.className = "image-upload-first";
		imageUploadContainerSecond.className = "image-upload-second";

		imageUploadFirst = new ImageUpload(imageUploadContainerFirst, "first-upload" ); 
		imageUploadSecond  = new ImageUpload(imageUploadContainerSecond, "second-upload");

		firstImageContainer.appendChild(imageUploadContainerFirst);
		secondImageContainer.appendChild(imageUploadContainerSecond);

		imageUploadFirst.initUploadButtons();
		imageUploadSecond.initUploadButtons();

		var ErrorBoxFirstImage = new ErrorBox(firstImageContainer);
		var ErrorBoxSecondImage = new ErrorBox(secondImageContainer);

		ErrorBoxFirstImage.init();
		ErrorBoxSecondImage.init();
		
		var btnMergeContainer = document.getElementById("btnMergeContainer");
		var mergeBtn = new MergeButton(btnMergeContainer);
		var ErrorBoxMergeButton = new ErrorBox(btnMergeContainer);

		ErrorBoxMergeButton.init();
		initBtnMerge();

		imageUploadFirst.onImageUpload = function(imageData) {
			imageLoadedFirst += 1;

			if(imageLoadedFirst === 1) {
				imageDataFirst = imageData;
				onImagesLoaded();
			} 
			else if(imageLoadedFirst === 2) {
				imageDataFirst = imageData;
				imageLoadedFirst = 1;
			}
		};

		imageUploadFirst.onSizesRecieved = function(sizes) {
			sizesFirst = sizes;
		}; 

		imageUploadFirst.onErrorMessageReceived = function(message) {
			if(message === "OK") {
				ErrorBoxFirstImage.clear();
			} else {		 	 
				ErrorBoxFirstImage.setMessage(message);
			}
		};

		imageUploadSecond.onImageUpload = function(imageData) {
			imageLoadedSecond += 1;

			if(imageLoadedSecond === 1) {
				imageDataSecond = imageData;
				onImagesLoaded();				
			}
			else if(imageLoadedSecond === 2) {
				imageDataSecond = imageData;
				imageLoadedSecond = 1;
			}
		};

		imageUploadSecond.onSizesRecieved = function(sizes) {
			sizesSecond = sizes;
		};

		imageUploadSecond.onErrorMessageReceived = function(message) {
			if(message ==="OK") {
				ErrorBoxSecondImage.clear();
			} else {
				ErrorBoxSecondImage.setMessage(message);
			}
		};

		mergeBtn.onErrorMessageReceived = function(message) {
			if(message === "OK") {
				ErrorBoxMergeButton.clear();
			} else {
				ErrorBoxMergeButton.setMessage(message);
			}
		};

		function onImagesLoaded() {
			imagesLoaded = imageLoadedFirst + imageLoadedSecond;
			if (imagesLoaded === 2) {
				mergeBtn.activate();
				btnMergeOn = true;
				imagesLoaded = 0;	
			} else {
			} 
		}

		function initBtnMerge() {
			btnMergeContainer.addEventListener("click", function() {
				if (btnMergeOn) {
				 	var boolMerge = mergeBtn.validate(sizesFirst, sizesSecond);	

				 	if(boolMerge) {
						var rezImg = initImageMerger(imageDataFirst,imageDataSecond, sizesFirst, sizesSecond);
						initMergeView(rezImg);		
					} else {
						imagesLoaded = 0;
					}			 
				}			
			});
		}
	}

	function initImageMerger(imageDataFirst, imageDataSecond, sizesFirst, sizesSecond) {
		var imageMergerExecution =  new ImageMerger(imageDataFirst, imageDataSecond);
		var result = imageMergerExecution.merge();
		return result;
	}

	function initMergeView(mergedImageData) {
		cleanMergedView(imageContainerMerge);

		inputMergeView = new ImageViewer(imageContainerMerge,sizesFirst); 
		inputMergeView.setFinal(mergedImageData);

		var canvasMerged = inputMergeView.getCanvas();
		
		btnDown.setCanvas(canvasMerged);
	}

	function cleanMergedView(container) {
     	var childNodes = container.childNodes;
		var i;
		for(i = 0; i < childNodes.length; i++) {
			if(childNodes[i].tagName === "CANVAS") {
				container.removeChild(container.childNodes[i]);
			}
		}
    }
    
}

module.exports = MergeController;