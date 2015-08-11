"use strict";

var ImageReader = require("./ImageReader");
var ImageViewer = require("./ImageViewer");
var ImageUnmerger = require("./ImageUnmerger");
var ImageUpload = require("./ImageUpload");
var RefreshButton = require("./RefreshButton");
var DownloadButton = require("./DownloadButton");
var ImageSize = require("./ImageSize");
var ErrorBox = require("./ErrorBox");
var UnmergeButton = require("./UnmergeButton");

function UnmergeController() {

	var outputUnmergeViewFirst, outputUnmergeViewSecond;
	var imageUploadSingle;
	var imageDataSingle;
	var sizesSingle;
	var imageTimesLoaded = 0 ;
	var btnUnmergeOn = false;
	var unmergeButton;

	var imageContainerUnmergeFirst = document.getElementById("imageUnmergeFirst");
	var imageContainerUnmergeSecond = document.getElementById("imageUnmergeSecond");

 	var btnDownFirst = new DownloadButton( imageContainerUnmergeFirst.id);
	var btnDownSecond = new DownloadButton(imageContainerUnmergeSecond.id);

	init();
	btnDownSecond.hide();
	btnDownFirst.hide();

	function init() {

		var SingleImage = document.getElementById("SingleImageContainer");
		var UnmergeButtonContainer = document.getElementById("btnUnmergeContainer");
		var idRefresh = document.getElementById("refreshBtn");
		var refreshBtn = new RefreshButton(idRefresh);

		initImageUpload(SingleImage);
	 	initUnmergeButton(UnmergeButtonContainer);

	}

	function initImageUpload(singleImage) {
		var imageUploadContainerSingle = document.createElement("div");

		imageUploadContainerSingle.className = "image-upload";
		imageUploadSingle = new ImageUpload(imageUploadContainerSingle, "single");

		singleImage.appendChild(imageUploadContainerSingle);

		imageUploadSingle.initUploadButtons();

		var ErrorBoxSingleImage = new ErrorBox(imageUploadContainerSingle);
		ErrorBoxSingleImage.init();

		imageUploadSingle.onImageUpload = function(imageData) {		 
			imageTimesLoaded += 1;

			if(imageTimesLoaded === 1) {
				imageDataSingle = imageData;
				onImagesLoaded();
			} else if(imageTimesLoaded ===2) {
				imageDataSingle = imageData;
				imageTimesLoaded = 1;
			}
		};

		imageUploadSingle.onSizesRecieved = function(sizes) {
			sizesSingle = sizes;
		}; 

		imageUploadSingle.onErrorMessageReceived = function(message) {
			if(message ==="OK") {
				ErrorBoxSingleImage.clear();
			} else {		 	 
				ErrorBoxSingleImage.setMessage(message);
			}
		};
	}

	function onImagesLoaded() {
			if (imageTimesLoaded === 1) {
				unmergeButton.activate();
				btnUnmergeOn = true;
				imageTimesLoaded = 0;	
			} else {
			} 
	}

	function initUnmergeButton(container) {		
		unmergeButton = new UnmergeButton(container);

		container.addEventListener("click", function() {
			if (btnUnmergeOn) {		 
					initImageUnmerger(imageDataSingle, sizesSingle);	
			} else {
				imageTimesLoaded = 0;
			}			 							
		});
 	}
 
	function initImageUnmerger(imageDataSingle, sizes) {
		var imageUnmerger = new ImageUnmerger(imageDataSingle, sizes);
		var unmergedArray = imageUnmerger.unmerge();
		initUnmergeView(unmergedArray, sizes);
	}

	function initUnmergeView(unmergedArray, sizesFirst) {
		cleanUnmergedView(imageContainerUnmergeFirst);
		cleanUnmergedView(imageContainerUnmergeSecond);

		outputUnmergeViewFirst = new ImageViewer(imageContainerUnmergeFirst, sizesFirst);
		outputUnmergeViewSecond= new ImageViewer(imageContainerUnmergeSecond, sizesFirst);

	    outputUnmergeViewFirst.setFinal(unmergedArray[0]);
		outputUnmergeViewSecond.setFinal(unmergedArray[1]);

		var canvasUnmergedFirst = outputUnmergeViewFirst.getCanvas();
		var canvasUnmergedSecond = outputUnmergeViewSecond.getCanvas();
 	
 		btnDownFirst.setCanvas(canvasUnmergedFirst);
 		btnDownSecond.setCanvas(canvasUnmergedSecond);
	}

	function cleanUnmergedView(container) {
		var childNodes = container.childNodes;
		var i;
		for(i = 0; i < childNodes.length; i++) {
			if(childNodes[i].tagName === "CANVAS") {
				container.removeChild(container.childNodes[i]);
			}
		}
	}
}

module.exports = UnmergeController;