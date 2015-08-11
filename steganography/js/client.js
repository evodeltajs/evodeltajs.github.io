(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var MergeController = require("./image/MergeController");
var UnmergeController = require("./image/UnmergeController");

var pathname = window.location.pathname;

window.addEventListener("load", init, false);
 
function init() {
	if(pathname === "/") { 
		startMergeController();
	}
	else if(pathname === "/index.html") {
		startMergeController();
	}
	else if(pathname === "/unmerge.html") {
		startUnmergeController();
	}
}

function startMergeController() {
	var mergeController = new MergeController();
}

function startUnmergeController() {
	var unmergeController = new UnmergeController();
}

},{"./image/MergeController":11,"./image/UnmergeController":14}],2:[function(require,module,exports){
"use strict";

function DownloadButton(id) {
    this.canvas = null;
    var that = this;
	var container = document.getElementById(id);	
	var downloadBtn = document.createElement("a");
    
 	container.addEventListener("mouseenter", mouseEnterDownload, false);
    container.addEventListener("mouseleave", mouseLeaveDownload, false);  
    container.appendChild(downloadBtn); 

    function mouseEnterDownload() {      
        downloadBtn.className = "download-btn fill";
        downloadBtn.innerHTML = "Download";
        downloadBtn.textContent = "Download";
        
        if(that.canvas) {
            that.show();
        }
    }

    downloadBtn.addEventListener("click", function() {
        if(that.canvas) {
        	downloadBtn.href = that.canvas.toDataURL();
        	downloadBtn.download = "image.png";
        }
    }, false);
	 
    function mouseLeaveDownload() {   
        that.hide();
    }

    this.setCanvas = function(canvas) {
        this.canvas = canvas;
    };

    this.show = function() {
        downloadBtn.style.display = "inline";
    };

    this.hide=  function() {
        downloadBtn.style.display = "none";
    };	
}

module.exports = DownloadButton;
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
"use strict";

var ImageSize = require("./ImageSize");

function ImageReader(container) {
    var that = this;
   
    this.onImageReceived = function() {};
    this.onSizeRecieved = function() {};
    this.onErrorMessageReceived = function() {};

    this.init = function() {
        var reader, canvas, ctx;
        var inputElement = document.createElement("input");
        inputElement.setAttribute("type", "file");
        inputElement.addEventListener("change", handleFiles, false);
        container.appendChild(inputElement);    

        function handleFiles(ev) {
            var file = inputElement.files[0];

            if (file) {
                reader = new FileReader();
                canvas = document.createElement("canvas");
                ctx = canvas.getContext("2d");

                reader.readAsDataURL(file);
                reader.onload = function(event) {
                    var img = new Image();
                    img.onload = function() {
                        canvas.width = img.width;
                        canvas.height = img.height;

                        ctx.drawImage(img,0,0);
                        var imageData = ctx.getImageData(0, 0, img.width, img.height);

                        if (canvas.width < 1024 && canvas.height < 1024) {
                            that.onErrorMessageReceived("OK");  
                            that.onImageReceived(imageData);  
                            var sizes = new ImageSize(canvas.width,  canvas.height); 
                            that.onSizeRecieved(sizes); 
                        } else {
                            that.onErrorMessageReceived("Size is too big.");                            
                        }           
                    };
                    img.src = event.target.result;
                };            
            }
        }
    };    
}

module.exports = ImageReader;
},{"./ImageSize":6}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
"use strict";

var ImageReader = require("./ImageReader");
var ImageViewer = require("./ImageViewer");
var UrlReader = require("./UrlReader");

function ImageUpload(container, className) {
    var that = this;
    var errorMessage;
    var flag = false;
    this.onImageUpload = function() {};
    this.onSizesRecieved = function() {};
    this.onErrorMessageReceived = function() {};

    this.className = className;
    this.uploadDiv = container; 

    var buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    var imageContainer = document.createElement("div");
    imageContainer.className = "image-container";

    this.initUploadButtons = function() {
        var imageBtn = document.createElement("button");
        var urlBtn = document.createElement("button");
        imageBtn.className = "image-btn";
        imageBtn.innerHTML = "Image";
        urlBtn.className = "url-btn";
        urlBtn.innerHTML = "URL";

        buttonContainer.appendChild(imageBtn);
        buttonContainer.appendChild(urlBtn);

        imageBtn.addEventListener("click", function() {
           that.clean();
           that.initIMG();
        });
            
        urlBtn.addEventListener("click", function() {
            that.clean();
            that.initURL();
        });

    };

    this.uploadDiv.appendChild(buttonContainer);
    this.uploadDiv.appendChild(imageContainer);

    //For ImageView
	this.initIMG = function() {
        var inputImageViewer;
        var divViewer;
        var imageDataThis;
        var divReader =  document.createElement("div");
        divReader.className =  className;

        var reader = new ImageReader(divReader);
        reader.init();
        imageContainer.appendChild(divReader);
         
        reader.onImageReceived = function(imageData) {           
            if(flag) {
                divViewer = document.createElement("div");
                divViewer.className = "viewer";
                imageDataThis = imageData; 
            }
        };
        
        reader.onSizeRecieved = function(size) {
            if(flag) {
                var sizes = size;
                inputImageViewer = new ImageViewer(divViewer, sizes);
                inputImageViewer.init();

                imageDataThis = inputImageViewer.setImage(imageDataThis);                
                imageContainer.removeChild(divReader);                   
                imageContainer.appendChild(divViewer);

                newUploadButton(divViewer,divReader);
                that.onErrorMessageReceived(errorMessage);
                that.onImageUpload(imageDataThis);
                that.onSizesRecieved(sizes);    
            }            
        };

        reader.onErrorMessageReceived = function(message) {
            errorMessage = message;
            if(errorMessage === "OK") {
                flag = true;   
            }
            that.onErrorMessageReceived(errorMessage);
        };
	};

    //For URL view
    this.initURL = function() {
        var divURL = document.createElement("div");
        divURL.className = "url-reader";
        var divUrlViewer;
        var inputImageUrlViewer;
        var urlImageDataThis;
        var urlReader = new UrlReader(divURL);
        urlReader.init();

        imageContainer.appendChild(divURL);

        urlReader.onImageReceived = function(imageData) {
            if(flag) {
                urlImageDataThis = imageData;
                divUrlViewer = document.createElement("div");
                divUrlViewer.className = "viewer";
            }
        };    

        urlReader.onSizeRecieved = function(size) {
            if(flag) {
                var sizes = size;
                inputImageUrlViewer = new ImageViewer(divUrlViewer,sizes);
                inputImageUrlViewer.init();

                urlImageDataThis = inputImageUrlViewer.setImage(urlImageDataThis);

                imageContainer.removeChild(divURL);
                imageContainer.appendChild(divUrlViewer);

                newUploadButton(divUrlViewer,divURL);
                that.onImageUpload(urlImageDataThis);
                that.onSizesRecieved(sizes);
            }
        };  

        urlReader.onErrorMessageReceived = function(message) {
            errorMessage = message;

            if(errorMessage === "OK") {
                flag = true;     
            }

            that.onErrorMessageReceived(errorMessage);
        }; 
    }; 

    //to clear the image-container of children
    this.clean = function() {
        while(imageContainer.firstChild) {
            imageContainer.removeChild(imageContainer.firstChild);
        }
    };

    function newUploadButton(divViewer, Reader) {
        var newUploadBtn;

        divViewer.addEventListener("mouseenter", function() {            
            newUploadBtn = document.createElement("button");
            newUploadBtn.className = "uploadBtn fill";
            newUploadBtn.innerHTML = "New";
            divViewer.appendChild(newUploadBtn);

            newUploadBtn.addEventListener("click", function() {
                // imageContainer.removeChild(divViewer);
                that.clean();                      
                // imageContainer.appendChild(Reader);
                if(Reader.className =="url-reader"){
                    that.initURL();
                }
                if(Reader.className ==className){
                    that.initIMG();
                }
                 
            });
        });

        divViewer.addEventListener("mouseleave", function() {
            divViewer.removeChild(newUploadBtn);
        });   
    }
}

module.exports = ImageUpload;
},{"./ImageReader":5,"./ImageViewer":9,"./UrlReader":15}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
"use strict";

function MergeButton(container) {
	var that = this;
	var btnMerge = document.createElement("button");
	btnMerge.type = "button";		
	btnMerge.className = "merge-button fill";
	btnMerge.innerText = "Merge";
	btnMerge.textContent = "Merge";
	container.appendChild(btnMerge);
 	btnMerge.disabled = true;

	this.onErrorMessageReceived = function () {}; 

	this.activate = function() { 
		btnMerge.disabled = false; 
	};

	this.deactivate = function() {
		btnMerge.disabled = true;
	};

	this.validate = function(size1, size2) {		
		if(size1.width === size2.width && size2.width === size1.width) {
		 	that.onErrorMessageReceived("OK");
		 	return true;
		} else { 
			that.onErrorMessageReceived("Not the same sizes");
			return false;
		}
	};
}

module.exports = MergeButton;
},{}],11:[function(require,module,exports){
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
},{"./DownloadButton":2,"./ErrorBox":3,"./ImageMerger":4,"./ImageReader":5,"./ImageSize":6,"./ImageUpload":8,"./ImageViewer":9,"./MergeButton":10,"./RefreshButton":12}],12:[function(require,module,exports){
"use strict";

function RefreshButton(container) {
	var btnRefresh = document.createElement("a");

	document.getElementById(container.id).appendChild(btnRefresh);

	container.addEventListener("click",function() {
 		location.reload();
	});
}

module.exports = RefreshButton;
},{}],13:[function(require,module,exports){
"use strict";

function UnmergeButton(container) {
	var that = this;
	var btnUnmerge = document.createElement("button");
	btnUnmerge.type = "button";		
	btnUnmerge.className = "unmerge-button fill";
	btnUnmerge.innerText = "Unmerge";
	btnUnmerge.textContent = "Unmerge";
	container.appendChild(btnUnmerge);
 	btnUnmerge.disabled = true;

	this.onErrorMessageReceived = function () {}; 

	this.activate = function() {
		btnUnmerge.disabled = false; 
	};

	this.deactivate = function() {
		btnUnmerge.disabled = true;
	};
}

module.exports = UnmergeButton;
},{}],14:[function(require,module,exports){
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
},{"./DownloadButton":2,"./ErrorBox":3,"./ImageReader":5,"./ImageSize":6,"./ImageUnmerger":7,"./ImageUpload":8,"./ImageViewer":9,"./RefreshButton":12,"./UnmergeButton":13}],15:[function(require,module,exports){
"use strict";

var ImageSize = require("./ImageSize");

function UrlReader(container, urlLink) {
    var that = this;
    
    this.onImageReceived = function() {};
    this.onSizeRecieved = function() {};
    this.onErrorMessageReceived = function() {};

    this.init = function() {

        var reader, canvas, ctx;
    	var urlField = document.createElement("input");
        urlField.placeholder = "Paste an url...";
        var urlBtn = document.createElement("button");
        urlBtn.innerHTML = "Upload";
        urlBtn.contentText = "Upload";

    	container.appendChild(urlField);
   		container.appendChild(urlBtn); 
        //https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/pie.png 
        //http://1.bp.blogspot.com/-QfUis3-tLhQ/URKQq5esHvI/AAAAAAAAAC4/MxsDX4gsTEw/s1600/dynamic01.png
        urlBtn.addEventListener("click", function() {
            
            if(urlField.value !== "") {
	            var url = urlField.value;
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if(xhr.readyState === 4) {
                        if(xhr.status === 200) {
                         
                            canvas = document.createElement("canvas");  
                            ctx = canvas.getContext("2d");

                            var img = new Image();
                            container.removeChild(urlField);
                            container.removeChild(urlBtn);

                            img.onload = function() {
                                that.onErrorMessageReceived("OK");
                                canvas.width = img.width;
                                canvas.height = img.height;                               
                                ctx.drawImage(this,0,0);
                                
                                var imageData = ctx.getImageData(0, 0, img.width, img.height);                                
                                that.onImageReceived(imageData); 
                                var sizes = new ImageSize(canvas.width, canvas.height);
                                that.onSizeRecieved(sizes);        
                            };

                            img.crossOrigin = "Anonymous";  
                            img.src = url;
                        } else {
                            handleError();
                        }
                    }
                };

                xhr.open("GET", url, true);
                xhr.send();
            } else {
				alert("Input a link");
			}
        });
    };

    function handleError() {
          that.onErrorMessageReceived("URL is invalid.");
    }
}

module.exports = UrlReader;
},{"./ImageSize":6}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwLmpzIiwic3JjL2pzL2ltYWdlL0Rvd25sb2FkQnV0dG9uLmpzIiwic3JjL2pzL2ltYWdlL0Vycm9yQm94LmpzIiwic3JjL2pzL2ltYWdlL0ltYWdlTWVyZ2VyLmpzIiwic3JjL2pzL2ltYWdlL0ltYWdlUmVhZGVyLmpzIiwic3JjL2pzL2ltYWdlL0ltYWdlU2l6ZS5qcyIsInNyYy9qcy9pbWFnZS9JbWFnZVVubWVyZ2VyLmpzIiwic3JjL2pzL2ltYWdlL0ltYWdlVXBsb2FkLmpzIiwic3JjL2pzL2ltYWdlL0ltYWdlVmlld2VyLmpzIiwic3JjL2pzL2ltYWdlL01lcmdlQnV0dG9uLmpzIiwic3JjL2pzL2ltYWdlL01lcmdlQ29udHJvbGxlci5qcyIsInNyYy9qcy9pbWFnZS9SZWZyZXNoQnV0dG9uLmpzIiwic3JjL2pzL2ltYWdlL1VubWVyZ2VCdXR0b24uanMiLCJzcmMvanMvaW1hZ2UvVW5tZXJnZUNvbnRyb2xsZXIuanMiLCJzcmMvanMvaW1hZ2UvVXJsUmVhZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTWVyZ2VDb250cm9sbGVyID0gcmVxdWlyZShcIi4vaW1hZ2UvTWVyZ2VDb250cm9sbGVyXCIpO1xudmFyIFVubWVyZ2VDb250cm9sbGVyID0gcmVxdWlyZShcIi4vaW1hZ2UvVW5tZXJnZUNvbnRyb2xsZXJcIik7XG5cbnZhciBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGluaXQsIGZhbHNlKTtcbiBcbmZ1bmN0aW9uIGluaXQoKSB7XG5cdGlmKHBhdGhuYW1lID09PSBcIi9cIikgeyBcblx0XHRzdGFydE1lcmdlQ29udHJvbGxlcigpO1xuXHR9XG5cdGVsc2UgaWYocGF0aG5hbWUgPT09IFwiL2luZGV4Lmh0bWxcIikge1xuXHRcdHN0YXJ0TWVyZ2VDb250cm9sbGVyKCk7XG5cdH1cblx0ZWxzZSBpZihwYXRobmFtZSA9PT0gXCIvdW5tZXJnZS5odG1sXCIpIHtcblx0XHRzdGFydFVubWVyZ2VDb250cm9sbGVyKCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gc3RhcnRNZXJnZUNvbnRyb2xsZXIoKSB7XG5cdHZhciBtZXJnZUNvbnRyb2xsZXIgPSBuZXcgTWVyZ2VDb250cm9sbGVyKCk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0VW5tZXJnZUNvbnRyb2xsZXIoKSB7XG5cdHZhciB1bm1lcmdlQ29udHJvbGxlciA9IG5ldyBVbm1lcmdlQ29udHJvbGxlcigpO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIERvd25sb2FkQnV0dG9uKGlkKSB7XG4gICAgdGhpcy5jYW52YXMgPSBudWxsO1xuICAgIHZhciB0aGF0ID0gdGhpcztcblx0dmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcdFxuXHR2YXIgZG93bmxvYWRCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBcbiBcdGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBtb3VzZUVudGVyRG93bmxvYWQsIGZhbHNlKTtcbiAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgbW91c2VMZWF2ZURvd25sb2FkLCBmYWxzZSk7ICBcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZG93bmxvYWRCdG4pOyBcblxuICAgIGZ1bmN0aW9uIG1vdXNlRW50ZXJEb3dubG9hZCgpIHsgICAgICBcbiAgICAgICAgZG93bmxvYWRCdG4uY2xhc3NOYW1lID0gXCJkb3dubG9hZC1idG4gZmlsbFwiO1xuICAgICAgICBkb3dubG9hZEJ0bi5pbm5lckhUTUwgPSBcIkRvd25sb2FkXCI7XG4gICAgICAgIGRvd25sb2FkQnRuLnRleHRDb250ZW50ID0gXCJEb3dubG9hZFwiO1xuICAgICAgICBcbiAgICAgICAgaWYodGhhdC5jYW52YXMpIHtcbiAgICAgICAgICAgIHRoYXQuc2hvdygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZG93bmxvYWRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZih0aGF0LmNhbnZhcykge1xuICAgICAgICBcdGRvd25sb2FkQnRuLmhyZWYgPSB0aGF0LmNhbnZhcy50b0RhdGFVUkwoKTtcbiAgICAgICAgXHRkb3dubG9hZEJ0bi5kb3dubG9hZCA9IFwiaW1hZ2UucG5nXCI7XG4gICAgICAgIH1cbiAgICB9LCBmYWxzZSk7XG5cdCBcbiAgICBmdW5jdGlvbiBtb3VzZUxlYXZlRG93bmxvYWQoKSB7ICAgXG4gICAgICAgIHRoYXQuaGlkZSgpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0Q2FudmFzID0gZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIH07XG5cbiAgICB0aGlzLnNob3cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZG93bmxvYWRCdG4uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lXCI7XG4gICAgfTtcblxuICAgIHRoaXMuaGlkZT0gIGZ1bmN0aW9uKCkge1xuICAgICAgICBkb3dubG9hZEJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfTtcdFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERvd25sb2FkQnV0dG9uOyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBFcnJvckJveChjb250YWluZXIpIHtcblx0dmFyIEVycm9yQm94TWVzc2FnZTtcblxuXHR0aGlzLmluaXQ9IGZ1bmN0aW9uKCkge1xuXHRcdEVycm9yQm94TWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0RXJyb3JCb3hNZXNzYWdlLmNsYXNzTmFtZSA9IFwiZXJyb3ItYm94XCI7XG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKEVycm9yQm94TWVzc2FnZSk7XG5cdH07XG5cblx0dGhpcy5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHRcdEVycm9yQm94TWVzc2FnZS5pbm5lckhUTUwgPSBcIlwiO1xuXHR9O1xuXG5cdHRoaXMuc2V0TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cdFx0RXJyb3JCb3hNZXNzYWdlLmlubmVySFRNTCA9IG1lc3NhZ2U7XG5cdH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRXJyb3JCb3g7IiwiXCJ1c2Ugc3RyaWN0XCI7XG4gXG5mdW5jdGlvbiBJbWFnZU1lcmdlcihJbWFnZURhdGExLCBJbWFnZURhdGEyKSB7XG5cblx0dGhpcy5JbWFnZVJlc3VsdDEgPSBJbWFnZURhdGExO1xuXHR0aGlzLkltYWdlUmVzdWx0MiA9IEltYWdlRGF0YTI7XG5cblx0dGhpcy5tZXJnZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpO1xuXHRcdHZhciBzaXplSW1hZ2VSZXN1bHQyID0gdGhpcy5JbWFnZVJlc3VsdDIuZGF0YS5sZW5ndGg7XG5cdFx0dmFyIHNpemVJbWFnZVJlc3VsdDEgPSB0aGlzLkltYWdlUmVzdWx0MS5kYXRhLmxlbmd0aDtcdFx0XG5cdFx0dmFyIGF1eCA9IG5ldyBVaW50OENsYW1wZWRBcnJheShzaXplSW1hZ2VSZXN1bHQyKTtcblx0XHR2YXIgZmluYWxJbWFnZSA9IG5ldyBVaW50OENsYW1wZWRBcnJheShzaXplSW1hZ2VSZXN1bHQyKTtcblxuXHRcdGZvcihpID0wOyBpPHNpemVJbWFnZVJlc3VsdDI7IGkrKykge1xuXHRcdFx0YXV4W2ldID0gTWF0aC5mbG9vcih0aGlzLkltYWdlUmVzdWx0Mi5kYXRhW2ldIC8gNjQpO1xuXHRcdH1cblxuXHRcdGZvcihpPTA7IGk8c2l6ZUltYWdlUmVzdWx0MTsgaSsrKSB7XG5cdFx0XHR0aGlzLkltYWdlUmVzdWx0MS5kYXRhW2ldID0gdGhpcy5JbWFnZVJlc3VsdDEuZGF0YVtpXSA+PiAyICA8PCAyO1xuXHRcdFx0ZmluYWxJbWFnZVtpXSA9IHRoaXMuSW1hZ2VSZXN1bHQxLmRhdGFbaV0gKyBhdXhbaV07XG5cdFx0fVxuXHRcdHZhciBJbWFnZUZpbmFsID0gZmluYWxJbWFnZTtcblxuXHRcdHJldHVybiBJbWFnZUZpbmFsO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VNZXJnZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBJbWFnZVNpemUgPSByZXF1aXJlKFwiLi9JbWFnZVNpemVcIik7XG5cbmZ1bmN0aW9uIEltYWdlUmVhZGVyKGNvbnRhaW5lcikge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgIFxuICAgIHRoaXMub25JbWFnZVJlY2VpdmVkID0gZnVuY3Rpb24oKSB7fTtcbiAgICB0aGlzLm9uU2l6ZVJlY2lldmVkID0gZnVuY3Rpb24oKSB7fTtcbiAgICB0aGlzLm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbigpIHt9O1xuXG4gICAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWFkZXIsIGNhbnZhcywgY3R4O1xuICAgICAgICB2YXIgaW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICBpbnB1dEVsZW1lbnQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImZpbGVcIik7XG4gICAgICAgIGlucHV0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGhhbmRsZUZpbGVzLCBmYWxzZSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dEVsZW1lbnQpOyAgICBcblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVGaWxlcyhldikge1xuICAgICAgICAgICAgdmFyIGZpbGUgPSBpbnB1dEVsZW1lbnQuZmlsZXNbMF07XG5cbiAgICAgICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgICAgICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICAgICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cbiAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsMCwwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYW52YXMud2lkdGggPCAxMDI0ICYmIGNhbnZhcy5oZWlnaHQgPCAxMDI0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5vbkVycm9yTWVzc2FnZVJlY2VpdmVkKFwiT0tcIik7ICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uSW1hZ2VSZWNlaXZlZChpbWFnZURhdGEpOyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNpemVzID0gbmV3IEltYWdlU2l6ZShjYW52YXMud2lkdGgsICBjYW52YXMuaGVpZ2h0KTsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5vblNpemVSZWNpZXZlZChzaXplcyk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQoXCJTaXplIGlzIHRvbyBiaWcuXCIpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpbWcuc3JjID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTsgICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VSZWFkZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEltYWdlU2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG5cdHRoaXMud2lkdGggPSB3aWR0aDtcblx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cblx0dGhpcy5zZXRTaXplcyA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdH07XG59XHRcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZVNpemU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEltYWdlVW5tZXJnZXIoSW1hZ2VEYXRhLCBzaXplKSB7XG5cdHRoaXMuaW5wdXRJbWFnZT0gSW1hZ2VEYXRhO1xuXHR0aGlzLnNpemVzID0gc2l6ZS53aWR0aCogc2l6ZS5oZWlnaHQgKiA0O1xuXG5cdHRoaXMudW5tZXJnZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpO1xuXHRcdHZhciBmaXJzdEF1eCA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh0aGlzLnNpemVzKTtcblx0XHR2YXIgc2Vjb25kQXV4ID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHRoaXMuc2l6ZXMpOyBcblx0XHR2YXIgdGVtcCA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh0aGlzLnNpemVzKTtcblx0XHRcblx0XHRmb3IgKGkgPSAwOyBpIDwgdGhpcy5zaXplczsgaSsrKSB7XG5cdFx0XHRmaXJzdEF1eFtpXSA9IDA7XG5cdFx0XHRzZWNvbmRBdXhbaV0gPSAwO1x0XG5cdFx0XHR0ZW1wW2ldID0wO1xuXHRcdH1cbiBcdFx0IFxuXHRcdGZvciAoaSA9IDA7IGkgPCB0aGlzLnNpemVzOyBpKyspIHtcblx0XHRcdHRlbXBbaV0gPSB0aGlzLmlucHV0SW1hZ2UuZGF0YVtpXTtcblx0XHRcdHRlbXBbaV0gPSB0ZW1wW2ldID4+IDIgPDwgMjtcblx0XHRcdGZpcnN0QXV4W2ldID0gdGVtcFtpXTtcblx0XHRcdHNlY29uZEF1eFtpXSA9IHRlbXBbaV0gXiB0aGlzLmlucHV0SW1hZ2UuZGF0YVtpXTtcblx0XHRcdHNlY29uZEF1eFtpXSA9IHNlY29uZEF1eFtpXSAqIDY0O1xuXHRcdH1cdFx0XG5cdFx0XG5cdFx0cmV0dXJuIFtmaXJzdEF1eCxzZWNvbmRBdXhdO1xuXHR9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlVW5tZXJnZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBJbWFnZVJlYWRlciA9IHJlcXVpcmUoXCIuL0ltYWdlUmVhZGVyXCIpO1xudmFyIEltYWdlVmlld2VyID0gcmVxdWlyZShcIi4vSW1hZ2VWaWV3ZXJcIik7XG52YXIgVXJsUmVhZGVyID0gcmVxdWlyZShcIi4vVXJsUmVhZGVyXCIpO1xuXG5mdW5jdGlvbiBJbWFnZVVwbG9hZChjb250YWluZXIsIGNsYXNzTmFtZSkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgZXJyb3JNZXNzYWdlO1xuICAgIHZhciBmbGFnID0gZmFsc2U7XG4gICAgdGhpcy5vbkltYWdlVXBsb2FkID0gZnVuY3Rpb24oKSB7fTtcbiAgICB0aGlzLm9uU2l6ZXNSZWNpZXZlZCA9IGZ1bmN0aW9uKCkge307XG4gICAgdGhpcy5vbkVycm9yTWVzc2FnZVJlY2VpdmVkID0gZnVuY3Rpb24oKSB7fTtcblxuICAgIHRoaXMuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICAgIHRoaXMudXBsb2FkRGl2ID0gY29udGFpbmVyOyBcblxuICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGJ1dHRvbkNvbnRhaW5lci5jbGFzc05hbWUgPSBcImJ1dHRvbi1jb250YWluZXJcIjtcblxuICAgIHZhciBpbWFnZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaW1hZ2VDb250YWluZXIuY2xhc3NOYW1lID0gXCJpbWFnZS1jb250YWluZXJcIjtcblxuICAgIHRoaXMuaW5pdFVwbG9hZEJ1dHRvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGltYWdlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgdmFyIHVybEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgIGltYWdlQnRuLmNsYXNzTmFtZSA9IFwiaW1hZ2UtYnRuXCI7XG4gICAgICAgIGltYWdlQnRuLmlubmVySFRNTCA9IFwiSW1hZ2VcIjtcbiAgICAgICAgdXJsQnRuLmNsYXNzTmFtZSA9IFwidXJsLWJ0blwiO1xuICAgICAgICB1cmxCdG4uaW5uZXJIVE1MID0gXCJVUkxcIjtcblxuICAgICAgICBidXR0b25Db250YWluZXIuYXBwZW5kQ2hpbGQoaW1hZ2VCdG4pO1xuICAgICAgICBidXR0b25Db250YWluZXIuYXBwZW5kQ2hpbGQodXJsQnRuKTtcblxuICAgICAgICBpbWFnZUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgIHRoYXQuY2xlYW4oKTtcbiAgICAgICAgICAgdGhhdC5pbml0SU1HKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIHVybEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGF0LmNsZWFuKCk7XG4gICAgICAgICAgICB0aGF0LmluaXRVUkwoKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgdGhpcy51cGxvYWREaXYuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcbiAgICB0aGlzLnVwbG9hZERpdi5hcHBlbmRDaGlsZChpbWFnZUNvbnRhaW5lcik7XG5cbiAgICAvL0ZvciBJbWFnZVZpZXdcblx0dGhpcy5pbml0SU1HID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbnB1dEltYWdlVmlld2VyO1xuICAgICAgICB2YXIgZGl2Vmlld2VyO1xuICAgICAgICB2YXIgaW1hZ2VEYXRhVGhpcztcbiAgICAgICAgdmFyIGRpdlJlYWRlciA9ICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkaXZSZWFkZXIuY2xhc3NOYW1lID0gIGNsYXNzTmFtZTtcblxuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEltYWdlUmVhZGVyKGRpdlJlYWRlcik7XG4gICAgICAgIHJlYWRlci5pbml0KCk7XG4gICAgICAgIGltYWdlQ29udGFpbmVyLmFwcGVuZENoaWxkKGRpdlJlYWRlcik7XG4gICAgICAgICBcbiAgICAgICAgcmVhZGVyLm9uSW1hZ2VSZWNlaXZlZCA9IGZ1bmN0aW9uKGltYWdlRGF0YSkgeyAgICAgICAgICAgXG4gICAgICAgICAgICBpZihmbGFnKSB7XG4gICAgICAgICAgICAgICAgZGl2Vmlld2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICBkaXZWaWV3ZXIuY2xhc3NOYW1lID0gXCJ2aWV3ZXJcIjtcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFUaGlzID0gaW1hZ2VEYXRhOyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHJlYWRlci5vblNpemVSZWNpZXZlZCA9IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgICAgICAgIGlmKGZsYWcpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2l6ZXMgPSBzaXplO1xuICAgICAgICAgICAgICAgIGlucHV0SW1hZ2VWaWV3ZXIgPSBuZXcgSW1hZ2VWaWV3ZXIoZGl2Vmlld2VyLCBzaXplcyk7XG4gICAgICAgICAgICAgICAgaW5wdXRJbWFnZVZpZXdlci5pbml0KCk7XG5cbiAgICAgICAgICAgICAgICBpbWFnZURhdGFUaGlzID0gaW5wdXRJbWFnZVZpZXdlci5zZXRJbWFnZShpbWFnZURhdGFUaGlzKTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW1hZ2VDb250YWluZXIucmVtb3ZlQ2hpbGQoZGl2UmVhZGVyKTsgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW1hZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2Vmlld2VyKTtcblxuICAgICAgICAgICAgICAgIG5ld1VwbG9hZEJ1dHRvbihkaXZWaWV3ZXIsZGl2UmVhZGVyKTtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uSW1hZ2VVcGxvYWQoaW1hZ2VEYXRhVGhpcyk7XG4gICAgICAgICAgICAgICAgdGhhdC5vblNpemVzUmVjaWV2ZWQoc2l6ZXMpOyAgICBcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgfTtcblxuICAgICAgICByZWFkZXIub25FcnJvck1lc3NhZ2VSZWNlaXZlZCA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICBpZihlcnJvck1lc3NhZ2UgPT09IFwiT0tcIikge1xuICAgICAgICAgICAgICAgIGZsYWcgPSB0cnVlOyAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5vbkVycm9yTWVzc2FnZVJlY2VpdmVkKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH07XG5cdH07XG5cbiAgICAvL0ZvciBVUkwgdmlld1xuICAgIHRoaXMuaW5pdFVSTCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGl2VVJMID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZGl2VVJMLmNsYXNzTmFtZSA9IFwidXJsLXJlYWRlclwiO1xuICAgICAgICB2YXIgZGl2VXJsVmlld2VyO1xuICAgICAgICB2YXIgaW5wdXRJbWFnZVVybFZpZXdlcjtcbiAgICAgICAgdmFyIHVybEltYWdlRGF0YVRoaXM7XG4gICAgICAgIHZhciB1cmxSZWFkZXIgPSBuZXcgVXJsUmVhZGVyKGRpdlVSTCk7XG4gICAgICAgIHVybFJlYWRlci5pbml0KCk7XG5cbiAgICAgICAgaW1hZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2VVJMKTtcblxuICAgICAgICB1cmxSZWFkZXIub25JbWFnZVJlY2VpdmVkID0gZnVuY3Rpb24oaW1hZ2VEYXRhKSB7XG4gICAgICAgICAgICBpZihmbGFnKSB7XG4gICAgICAgICAgICAgICAgdXJsSW1hZ2VEYXRhVGhpcyA9IGltYWdlRGF0YTtcbiAgICAgICAgICAgICAgICBkaXZVcmxWaWV3ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIGRpdlVybFZpZXdlci5jbGFzc05hbWUgPSBcInZpZXdlclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9OyAgICBcblxuICAgICAgICB1cmxSZWFkZXIub25TaXplUmVjaWV2ZWQgPSBmdW5jdGlvbihzaXplKSB7XG4gICAgICAgICAgICBpZihmbGFnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNpemVzID0gc2l6ZTtcbiAgICAgICAgICAgICAgICBpbnB1dEltYWdlVXJsVmlld2VyID0gbmV3IEltYWdlVmlld2VyKGRpdlVybFZpZXdlcixzaXplcyk7XG4gICAgICAgICAgICAgICAgaW5wdXRJbWFnZVVybFZpZXdlci5pbml0KCk7XG5cbiAgICAgICAgICAgICAgICB1cmxJbWFnZURhdGFUaGlzID0gaW5wdXRJbWFnZVVybFZpZXdlci5zZXRJbWFnZSh1cmxJbWFnZURhdGFUaGlzKTtcblxuICAgICAgICAgICAgICAgIGltYWdlQ29udGFpbmVyLnJlbW92ZUNoaWxkKGRpdlVSTCk7XG4gICAgICAgICAgICAgICAgaW1hZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2VXJsVmlld2VyKTtcblxuICAgICAgICAgICAgICAgIG5ld1VwbG9hZEJ1dHRvbihkaXZVcmxWaWV3ZXIsZGl2VVJMKTtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uSW1hZ2VVcGxvYWQodXJsSW1hZ2VEYXRhVGhpcyk7XG4gICAgICAgICAgICAgICAgdGhhdC5vblNpemVzUmVjaWV2ZWQoc2l6ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9OyAgXG5cbiAgICAgICAgdXJsUmVhZGVyLm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBtZXNzYWdlO1xuXG4gICAgICAgICAgICBpZihlcnJvck1lc3NhZ2UgPT09IFwiT0tcIikge1xuICAgICAgICAgICAgICAgIGZsYWcgPSB0cnVlOyAgICAgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQub25FcnJvck1lc3NhZ2VSZWNlaXZlZChlcnJvck1lc3NhZ2UpO1xuICAgICAgICB9OyBcbiAgICB9OyBcblxuICAgIC8vdG8gY2xlYXIgdGhlIGltYWdlLWNvbnRhaW5lciBvZiBjaGlsZHJlblxuICAgIHRoaXMuY2xlYW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgd2hpbGUoaW1hZ2VDb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgaW1hZ2VDb250YWluZXIucmVtb3ZlQ2hpbGQoaW1hZ2VDb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbmV3VXBsb2FkQnV0dG9uKGRpdlZpZXdlciwgUmVhZGVyKSB7XG4gICAgICAgIHZhciBuZXdVcGxvYWRCdG47XG5cbiAgICAgICAgZGl2Vmlld2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGZ1bmN0aW9uKCkgeyAgICAgICAgICAgIFxuICAgICAgICAgICAgbmV3VXBsb2FkQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgICAgIG5ld1VwbG9hZEJ0bi5jbGFzc05hbWUgPSBcInVwbG9hZEJ0biBmaWxsXCI7XG4gICAgICAgICAgICBuZXdVcGxvYWRCdG4uaW5uZXJIVE1MID0gXCJOZXdcIjtcbiAgICAgICAgICAgIGRpdlZpZXdlci5hcHBlbmRDaGlsZChuZXdVcGxvYWRCdG4pO1xuXG4gICAgICAgICAgICBuZXdVcGxvYWRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vIGltYWdlQ29udGFpbmVyLnJlbW92ZUNoaWxkKGRpdlZpZXdlcik7XG4gICAgICAgICAgICAgICAgdGhhdC5jbGVhbigpOyAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBpbWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZChSZWFkZXIpO1xuICAgICAgICAgICAgICAgIGlmKFJlYWRlci5jbGFzc05hbWUgPT1cInVybC1yZWFkZXJcIil7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaW5pdFVSTCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihSZWFkZXIuY2xhc3NOYW1lID09Y2xhc3NOYW1lKXtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5pbml0SU1HKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBkaXZWaWV3ZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBkaXZWaWV3ZXIucmVtb3ZlQ2hpbGQobmV3VXBsb2FkQnRuKTtcbiAgICAgICAgfSk7ICAgXG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlVXBsb2FkOyIsIlwidXNlIHN0cmljdFwiOyBcblxuZnVuY3Rpb24gSW1hZ2VWaWV3ZXIoY29udGFpbmVyLCBzaXplcykge1xuXHR2YXIgY2FudmFzSW1hZ2VWaWV3ZXI7XG5cdHZhciBjdHg7XG5cdHZhciBpbWFnZURhdGFOZXc7IFxuXHR0aGlzLnNpemVzID0gc2l6ZXM7XG5cblx0dGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0Y2FudmFzSW1hZ2VWaWV3ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdGN0eCA9IGNhbnZhc0ltYWdlVmlld2VyLmdldENvbnRleHQoXCIyZFwiKTtcblx0XHRjYW52YXNJbWFnZVZpZXdlci53aWR0aCA9ICBzaXplcy53aWR0aDtcblx0XHRjYW52YXNJbWFnZVZpZXdlci5oZWlnaHQgPSBzaXplcy5oZWlnaHQ7XG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKGNhbnZhc0ltYWdlVmlld2VyKTtcblx0fTtcblxuXHR0aGlzLnNldEltYWdlID0gZnVuY3Rpb24oaW1hZ2VEYXRhKSB7XHRcblx0XHRjdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XHRcblx0XHRyZXR1cm4gaW1hZ2VEYXRhO1x0XG5cdH07XG5cblx0dGhpcy5zZXRGaW5hbCA9IGZ1bmN0aW9uKG15RGF0YSkgeyBcdFxuXHRcdHRoaXMuaW5pdCgpO1xuXHRcdHZhciBpbWFnZURhdGEgPSBjYW52YXNJbWFnZVZpZXdlci5nZXRDb250ZXh0KFwiMmRcIikuY3JlYXRlSW1hZ2VEYXRhKHNpemVzLndpZHRoLCBzaXplcy5oZWlnaHQpO1xuXHRcdGltYWdlRGF0YS5kYXRhLnNldChteURhdGEpO1xuXHRcdHRoaXMuc2V0SW1hZ2UoaW1hZ2VEYXRhKTsgXG5cdH07XG5cblx0dGhpcy5nZXRDYW52YXMgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gY2FudmFzSW1hZ2VWaWV3ZXI7XG5cdH07XG59XHRcdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlVmlld2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIE1lcmdlQnV0dG9uKGNvbnRhaW5lcikge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBidG5NZXJnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG5cdGJ0bk1lcmdlLnR5cGUgPSBcImJ1dHRvblwiO1x0XHRcblx0YnRuTWVyZ2UuY2xhc3NOYW1lID0gXCJtZXJnZS1idXR0b24gZmlsbFwiO1xuXHRidG5NZXJnZS5pbm5lclRleHQgPSBcIk1lcmdlXCI7XG5cdGJ0bk1lcmdlLnRleHRDb250ZW50ID0gXCJNZXJnZVwiO1xuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoYnRuTWVyZ2UpO1xuIFx0YnRuTWVyZ2UuZGlzYWJsZWQgPSB0cnVlO1xuXG5cdHRoaXMub25FcnJvck1lc3NhZ2VSZWNlaXZlZCA9IGZ1bmN0aW9uICgpIHt9OyBcblxuXHR0aGlzLmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7IFxuXHRcdGJ0bk1lcmdlLmRpc2FibGVkID0gZmFsc2U7IFxuXHR9O1xuXG5cdHRoaXMuZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGJ0bk1lcmdlLmRpc2FibGVkID0gdHJ1ZTtcblx0fTtcblxuXHR0aGlzLnZhbGlkYXRlID0gZnVuY3Rpb24oc2l6ZTEsIHNpemUyKSB7XHRcdFxuXHRcdGlmKHNpemUxLndpZHRoID09PSBzaXplMi53aWR0aCAmJiBzaXplMi53aWR0aCA9PT0gc2l6ZTEud2lkdGgpIHtcblx0XHQgXHR0aGF0Lm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQoXCJPS1wiKTtcblx0XHQgXHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2UgeyBcblx0XHRcdHRoYXQub25FcnJvck1lc3NhZ2VSZWNlaXZlZChcIk5vdCB0aGUgc2FtZSBzaXplc1wiKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWVyZ2VCdXR0b247IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBJbWFnZVJlYWRlciA9IHJlcXVpcmUoXCIuL0ltYWdlUmVhZGVyXCIpO1xudmFyIEltYWdlVmlld2VyID0gcmVxdWlyZShcIi4vSW1hZ2VWaWV3ZXJcIik7XG52YXIgSW1hZ2VNZXJnZXIgPSByZXF1aXJlKFwiLi9JbWFnZU1lcmdlclwiKTtcbnZhciBJbWFnZVVwbG9hZCA9IHJlcXVpcmUoXCIuL0ltYWdlVXBsb2FkXCIpO1xudmFyIE1lcmdlQnV0dG9uID0gcmVxdWlyZShcIi4vTWVyZ2VCdXR0b25cIik7XG52YXIgUmVmcmVzaEJ1dHRvbiA9IHJlcXVpcmUoXCIuL1JlZnJlc2hCdXR0b25cIik7XG52YXIgRG93bmxvYWRCdXR0b24gPSByZXF1aXJlKFwiLi9Eb3dubG9hZEJ1dHRvblwiKTtcbnZhciBJbWFnZVNpemUgPSByZXF1aXJlKFwiLi9JbWFnZVNpemVcIik7XG52YXIgRXJyb3JCb3ggPSByZXF1aXJlKFwiLi9FcnJvckJveFwiKTtcblxuZnVuY3Rpb24gTWVyZ2VDb250cm9sbGVyKCkge1xuXG5cdHZhciBpbWFnZVJlYWRlckZpcnN0LCBpbWFnZVJlYWRlclNlY29uZCwgaW1hZ2VSZWFkZXJNZXJnZWQ7XG5cdHZhciBpbnB1dEltYWdlVmlld2VyRmlyc3QsIGlucHV0SW1hZ2VWaWV3ZXJTZWNvbmQsIGlucHV0TWVyZ2VWaWV3OyBcdFxuXHR2YXIgaW1hZ2VEYXRhRmlyc3QsIGltYWdlRGF0YVNlY29uZDtcblx0dmFyIGltYWdlc0xvYWRlZCA9IDA7XG5cdHZhciBpbWFnZUxvYWRlZEZpcnN0ID0gMDtcblx0dmFyIGltYWdlTG9hZGVkU2Vjb25kID0gMDtcblx0dmFyIGJ0bk1lcmdlT24gPSBmYWxzZTtcblx0dmFyIGltYWdlVXBsb2FkRmlyc3QsIGltYWdlVXBsb2FkU2Vjb25kO1xuXHR2YXIgc2l6ZXNGaXJzdCwgc2l6ZXNTZWNvbmQgO1xuXHR2YXIgZXJyTXNnRmlyc3QsIGVyck1zZ1NlY29uZCAsZXJyTXNnTWVyZ2U7XG5cdHZhciBmbGFnRmlyc3QgPSBmYWxzZTtcblxuXHR2YXIgaW1hZ2VDb250YWluZXJNZXJnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW1hZ2VNZXJnZXJGaW5hbFwiKTtcblxuXHR2YXIgYnRuRG93biA9IG5ldyBEb3dubG9hZEJ1dHRvbihpbWFnZUNvbnRhaW5lck1lcmdlLmlkKTtcblx0XHRcblx0aW5pdCgpO1xuXHRidG5Eb3duLmhpZGUoKTtcblxuXHRmdW5jdGlvbiBpbml0KCkge1x0XG5cdFx0dmFyIEZpcnN0SW1hZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIkZpcnN0SW1hZ2VcIik7XG5cdFx0dmFyIFNlY29uZEltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJTZWNvbmRJbWFnZVwiKTtcblx0XHRpbml0SW1hZ2VVcGxvYWQoRmlyc3RJbWFnZSwgU2Vjb25kSW1hZ2UpO1xuXG5cdFx0dmFyIGlkUmVmcmVzaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVmcmVzaEJ0blwiKTtcblx0XHR2YXIgcmVmcmVzaEJ0biA9IG5ldyBSZWZyZXNoQnV0dG9uKGlkUmVmcmVzaCk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIGluaXRJbWFnZVVwbG9hZChmaXJzdEltYWdlQ29udGFpbmVyLCBzZWNvbmRJbWFnZUNvbnRhaW5lcikge1xuXHRcdHZhciBpbWFnZVVwbG9hZENvbnRhaW5lckZpcnN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHR2YXIgaW1hZ2VVcGxvYWRDb250YWluZXJTZWNvbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXG5cdFx0aW1hZ2VVcGxvYWRDb250YWluZXJGaXJzdC5jbGFzc05hbWUgPSBcImltYWdlLXVwbG9hZC1maXJzdFwiO1xuXHRcdGltYWdlVXBsb2FkQ29udGFpbmVyU2Vjb25kLmNsYXNzTmFtZSA9IFwiaW1hZ2UtdXBsb2FkLXNlY29uZFwiO1xuXG5cdFx0aW1hZ2VVcGxvYWRGaXJzdCA9IG5ldyBJbWFnZVVwbG9hZChpbWFnZVVwbG9hZENvbnRhaW5lckZpcnN0LCBcImZpcnN0LXVwbG9hZFwiICk7IFxuXHRcdGltYWdlVXBsb2FkU2Vjb25kICA9IG5ldyBJbWFnZVVwbG9hZChpbWFnZVVwbG9hZENvbnRhaW5lclNlY29uZCwgXCJzZWNvbmQtdXBsb2FkXCIpO1xuXG5cdFx0Zmlyc3RJbWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZChpbWFnZVVwbG9hZENvbnRhaW5lckZpcnN0KTtcblx0XHRzZWNvbmRJbWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZChpbWFnZVVwbG9hZENvbnRhaW5lclNlY29uZCk7XG5cblx0XHRpbWFnZVVwbG9hZEZpcnN0LmluaXRVcGxvYWRCdXR0b25zKCk7XG5cdFx0aW1hZ2VVcGxvYWRTZWNvbmQuaW5pdFVwbG9hZEJ1dHRvbnMoKTtcblxuXHRcdHZhciBFcnJvckJveEZpcnN0SW1hZ2UgPSBuZXcgRXJyb3JCb3goZmlyc3RJbWFnZUNvbnRhaW5lcik7XG5cdFx0dmFyIEVycm9yQm94U2Vjb25kSW1hZ2UgPSBuZXcgRXJyb3JCb3goc2Vjb25kSW1hZ2VDb250YWluZXIpO1xuXG5cdFx0RXJyb3JCb3hGaXJzdEltYWdlLmluaXQoKTtcblx0XHRFcnJvckJveFNlY29uZEltYWdlLmluaXQoKTtcblx0XHRcblx0XHR2YXIgYnRuTWVyZ2VDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bk1lcmdlQ29udGFpbmVyXCIpO1xuXHRcdHZhciBtZXJnZUJ0biA9IG5ldyBNZXJnZUJ1dHRvbihidG5NZXJnZUNvbnRhaW5lcik7XG5cdFx0dmFyIEVycm9yQm94TWVyZ2VCdXR0b24gPSBuZXcgRXJyb3JCb3goYnRuTWVyZ2VDb250YWluZXIpO1xuXG5cdFx0RXJyb3JCb3hNZXJnZUJ1dHRvbi5pbml0KCk7XG5cdFx0aW5pdEJ0bk1lcmdlKCk7XG5cblx0XHRpbWFnZVVwbG9hZEZpcnN0Lm9uSW1hZ2VVcGxvYWQgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcblx0XHRcdGltYWdlTG9hZGVkRmlyc3QgKz0gMTtcblxuXHRcdFx0aWYoaW1hZ2VMb2FkZWRGaXJzdCA9PT0gMSkge1xuXHRcdFx0XHRpbWFnZURhdGFGaXJzdCA9IGltYWdlRGF0YTtcblx0XHRcdFx0b25JbWFnZXNMb2FkZWQoKTtcblx0XHRcdH0gXG5cdFx0XHRlbHNlIGlmKGltYWdlTG9hZGVkRmlyc3QgPT09IDIpIHtcblx0XHRcdFx0aW1hZ2VEYXRhRmlyc3QgPSBpbWFnZURhdGE7XG5cdFx0XHRcdGltYWdlTG9hZGVkRmlyc3QgPSAxO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRpbWFnZVVwbG9hZEZpcnN0Lm9uU2l6ZXNSZWNpZXZlZCA9IGZ1bmN0aW9uKHNpemVzKSB7XG5cdFx0XHRzaXplc0ZpcnN0ID0gc2l6ZXM7XG5cdFx0fTsgXG5cblx0XHRpbWFnZVVwbG9hZEZpcnN0Lm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0XHRpZihtZXNzYWdlID09PSBcIk9LXCIpIHtcblx0XHRcdFx0RXJyb3JCb3hGaXJzdEltYWdlLmNsZWFyKCk7XG5cdFx0XHR9IGVsc2Uge1x0XHQgXHQgXG5cdFx0XHRcdEVycm9yQm94Rmlyc3RJbWFnZS5zZXRNZXNzYWdlKG1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRpbWFnZVVwbG9hZFNlY29uZC5vbkltYWdlVXBsb2FkID0gZnVuY3Rpb24oaW1hZ2VEYXRhKSB7XG5cdFx0XHRpbWFnZUxvYWRlZFNlY29uZCArPSAxO1xuXG5cdFx0XHRpZihpbWFnZUxvYWRlZFNlY29uZCA9PT0gMSkge1xuXHRcdFx0XHRpbWFnZURhdGFTZWNvbmQgPSBpbWFnZURhdGE7XG5cdFx0XHRcdG9uSW1hZ2VzTG9hZGVkKCk7XHRcdFx0XHRcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoaW1hZ2VMb2FkZWRTZWNvbmQgPT09IDIpIHtcblx0XHRcdFx0aW1hZ2VEYXRhU2Vjb25kID0gaW1hZ2VEYXRhO1xuXHRcdFx0XHRpbWFnZUxvYWRlZFNlY29uZCA9IDE7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGltYWdlVXBsb2FkU2Vjb25kLm9uU2l6ZXNSZWNpZXZlZCA9IGZ1bmN0aW9uKHNpemVzKSB7XG5cdFx0XHRzaXplc1NlY29uZCA9IHNpemVzO1xuXHRcdH07XG5cblx0XHRpbWFnZVVwbG9hZFNlY29uZC5vbkVycm9yTWVzc2FnZVJlY2VpdmVkID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdFx0aWYobWVzc2FnZSA9PT1cIk9LXCIpIHtcblx0XHRcdFx0RXJyb3JCb3hTZWNvbmRJbWFnZS5jbGVhcigpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0RXJyb3JCb3hTZWNvbmRJbWFnZS5zZXRNZXNzYWdlKG1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRtZXJnZUJ0bi5vbkVycm9yTWVzc2FnZVJlY2VpdmVkID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdFx0aWYobWVzc2FnZSA9PT0gXCJPS1wiKSB7XG5cdFx0XHRcdEVycm9yQm94TWVyZ2VCdXR0b24uY2xlYXIoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdEVycm9yQm94TWVyZ2VCdXR0b24uc2V0TWVzc2FnZShtZXNzYWdlKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0ZnVuY3Rpb24gb25JbWFnZXNMb2FkZWQoKSB7XG5cdFx0XHRpbWFnZXNMb2FkZWQgPSBpbWFnZUxvYWRlZEZpcnN0ICsgaW1hZ2VMb2FkZWRTZWNvbmQ7XG5cdFx0XHRpZiAoaW1hZ2VzTG9hZGVkID09PSAyKSB7XG5cdFx0XHRcdG1lcmdlQnRuLmFjdGl2YXRlKCk7XG5cdFx0XHRcdGJ0bk1lcmdlT24gPSB0cnVlO1xuXHRcdFx0XHRpbWFnZXNMb2FkZWQgPSAwO1x0XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0fSBcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBpbml0QnRuTWVyZ2UoKSB7XG5cdFx0XHRidG5NZXJnZUNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmIChidG5NZXJnZU9uKSB7XG5cdFx0XHRcdCBcdHZhciBib29sTWVyZ2UgPSBtZXJnZUJ0bi52YWxpZGF0ZShzaXplc0ZpcnN0LCBzaXplc1NlY29uZCk7XHRcblxuXHRcdFx0XHQgXHRpZihib29sTWVyZ2UpIHtcblx0XHRcdFx0XHRcdHZhciByZXpJbWcgPSBpbml0SW1hZ2VNZXJnZXIoaW1hZ2VEYXRhRmlyc3QsaW1hZ2VEYXRhU2Vjb25kLCBzaXplc0ZpcnN0LCBzaXplc1NlY29uZCk7XG5cdFx0XHRcdFx0XHRpbml0TWVyZ2VWaWV3KHJlekltZyk7XHRcdFxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpbWFnZXNMb2FkZWQgPSAwO1xuXHRcdFx0XHRcdH1cdFx0XHQgXG5cdFx0XHRcdH1cdFx0XHRcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGluaXRJbWFnZU1lcmdlcihpbWFnZURhdGFGaXJzdCwgaW1hZ2VEYXRhU2Vjb25kLCBzaXplc0ZpcnN0LCBzaXplc1NlY29uZCkge1xuXHRcdHZhciBpbWFnZU1lcmdlckV4ZWN1dGlvbiA9ICBuZXcgSW1hZ2VNZXJnZXIoaW1hZ2VEYXRhRmlyc3QsIGltYWdlRGF0YVNlY29uZCk7XG5cdFx0dmFyIHJlc3VsdCA9IGltYWdlTWVyZ2VyRXhlY3V0aW9uLm1lcmdlKCk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGluaXRNZXJnZVZpZXcobWVyZ2VkSW1hZ2VEYXRhKSB7XG5cdFx0Y2xlYW5NZXJnZWRWaWV3KGltYWdlQ29udGFpbmVyTWVyZ2UpO1xuXG5cdFx0aW5wdXRNZXJnZVZpZXcgPSBuZXcgSW1hZ2VWaWV3ZXIoaW1hZ2VDb250YWluZXJNZXJnZSxzaXplc0ZpcnN0KTsgXG5cdFx0aW5wdXRNZXJnZVZpZXcuc2V0RmluYWwobWVyZ2VkSW1hZ2VEYXRhKTtcblxuXHRcdHZhciBjYW52YXNNZXJnZWQgPSBpbnB1dE1lcmdlVmlldy5nZXRDYW52YXMoKTtcblx0XHRcblx0XHRidG5Eb3duLnNldENhbnZhcyhjYW52YXNNZXJnZWQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gY2xlYW5NZXJnZWRWaWV3KGNvbnRhaW5lcikge1xuICAgICBcdHZhciBjaGlsZE5vZGVzID0gY29udGFpbmVyLmNoaWxkTm9kZXM7XG5cdFx0dmFyIGk7XG5cdFx0Zm9yKGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYoY2hpbGROb2Rlc1tpXS50YWdOYW1lID09PSBcIkNBTlZBU1wiKSB7XG5cdFx0XHRcdGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuY2hpbGROb2Rlc1tpXSk7XG5cdFx0XHR9XG5cdFx0fVxuICAgIH1cbiAgICBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZXJnZUNvbnRyb2xsZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIFJlZnJlc2hCdXR0b24oY29udGFpbmVyKSB7XG5cdHZhciBidG5SZWZyZXNoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG5cblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyLmlkKS5hcHBlbmRDaGlsZChidG5SZWZyZXNoKTtcblxuXHRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsZnVuY3Rpb24oKSB7XG4gXHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZWZyZXNoQnV0dG9uOyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBVbm1lcmdlQnV0dG9uKGNvbnRhaW5lcikge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBidG5Vbm1lcmdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcblx0YnRuVW5tZXJnZS50eXBlID0gXCJidXR0b25cIjtcdFx0XG5cdGJ0blVubWVyZ2UuY2xhc3NOYW1lID0gXCJ1bm1lcmdlLWJ1dHRvbiBmaWxsXCI7XG5cdGJ0blVubWVyZ2UuaW5uZXJUZXh0ID0gXCJVbm1lcmdlXCI7XG5cdGJ0blVubWVyZ2UudGV4dENvbnRlbnQgPSBcIlVubWVyZ2VcIjtcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKGJ0blVubWVyZ2UpO1xuIFx0YnRuVW5tZXJnZS5kaXNhYmxlZCA9IHRydWU7XG5cblx0dGhpcy5vbkVycm9yTWVzc2FnZVJlY2VpdmVkID0gZnVuY3Rpb24gKCkge307IFxuXG5cdHRoaXMuYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRidG5Vbm1lcmdlLmRpc2FibGVkID0gZmFsc2U7IFxuXHR9O1xuXG5cdHRoaXMuZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGJ0blVubWVyZ2UuZGlzYWJsZWQgPSB0cnVlO1xuXHR9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVubWVyZ2VCdXR0b247IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBJbWFnZVJlYWRlciA9IHJlcXVpcmUoXCIuL0ltYWdlUmVhZGVyXCIpO1xudmFyIEltYWdlVmlld2VyID0gcmVxdWlyZShcIi4vSW1hZ2VWaWV3ZXJcIik7XG52YXIgSW1hZ2VVbm1lcmdlciA9IHJlcXVpcmUoXCIuL0ltYWdlVW5tZXJnZXJcIik7XG52YXIgSW1hZ2VVcGxvYWQgPSByZXF1aXJlKFwiLi9JbWFnZVVwbG9hZFwiKTtcbnZhciBSZWZyZXNoQnV0dG9uID0gcmVxdWlyZShcIi4vUmVmcmVzaEJ1dHRvblwiKTtcbnZhciBEb3dubG9hZEJ1dHRvbiA9IHJlcXVpcmUoXCIuL0Rvd25sb2FkQnV0dG9uXCIpO1xudmFyIEltYWdlU2l6ZSA9IHJlcXVpcmUoXCIuL0ltYWdlU2l6ZVwiKTtcbnZhciBFcnJvckJveCA9IHJlcXVpcmUoXCIuL0Vycm9yQm94XCIpO1xudmFyIFVubWVyZ2VCdXR0b24gPSByZXF1aXJlKFwiLi9Vbm1lcmdlQnV0dG9uXCIpO1xuXG5mdW5jdGlvbiBVbm1lcmdlQ29udHJvbGxlcigpIHtcblxuXHR2YXIgb3V0cHV0VW5tZXJnZVZpZXdGaXJzdCwgb3V0cHV0VW5tZXJnZVZpZXdTZWNvbmQ7XG5cdHZhciBpbWFnZVVwbG9hZFNpbmdsZTtcblx0dmFyIGltYWdlRGF0YVNpbmdsZTtcblx0dmFyIHNpemVzU2luZ2xlO1xuXHR2YXIgaW1hZ2VUaW1lc0xvYWRlZCA9IDAgO1xuXHR2YXIgYnRuVW5tZXJnZU9uID0gZmFsc2U7XG5cdHZhciB1bm1lcmdlQnV0dG9uO1xuXG5cdHZhciBpbWFnZUNvbnRhaW5lclVubWVyZ2VGaXJzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW1hZ2VVbm1lcmdlRmlyc3RcIik7XG5cdHZhciBpbWFnZUNvbnRhaW5lclVubWVyZ2VTZWNvbmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlVW5tZXJnZVNlY29uZFwiKTtcblxuIFx0dmFyIGJ0bkRvd25GaXJzdCA9IG5ldyBEb3dubG9hZEJ1dHRvbiggaW1hZ2VDb250YWluZXJVbm1lcmdlRmlyc3QuaWQpO1xuXHR2YXIgYnRuRG93blNlY29uZCA9IG5ldyBEb3dubG9hZEJ1dHRvbihpbWFnZUNvbnRhaW5lclVubWVyZ2VTZWNvbmQuaWQpO1xuXG5cdGluaXQoKTtcblx0YnRuRG93blNlY29uZC5oaWRlKCk7XG5cdGJ0bkRvd25GaXJzdC5oaWRlKCk7XG5cblx0ZnVuY3Rpb24gaW5pdCgpIHtcblxuXHRcdHZhciBTaW5nbGVJbWFnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiU2luZ2xlSW1hZ2VDb250YWluZXJcIik7XG5cdFx0dmFyIFVubWVyZ2VCdXR0b25Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0blVubWVyZ2VDb250YWluZXJcIik7XG5cdFx0dmFyIGlkUmVmcmVzaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVmcmVzaEJ0blwiKTtcblx0XHR2YXIgcmVmcmVzaEJ0biA9IG5ldyBSZWZyZXNoQnV0dG9uKGlkUmVmcmVzaCk7XG5cblx0XHRpbml0SW1hZ2VVcGxvYWQoU2luZ2xlSW1hZ2UpO1xuXHQgXHRpbml0VW5tZXJnZUJ1dHRvbihVbm1lcmdlQnV0dG9uQ29udGFpbmVyKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdEltYWdlVXBsb2FkKHNpbmdsZUltYWdlKSB7XG5cdFx0dmFyIGltYWdlVXBsb2FkQ29udGFpbmVyU2luZ2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuXHRcdGltYWdlVXBsb2FkQ29udGFpbmVyU2luZ2xlLmNsYXNzTmFtZSA9IFwiaW1hZ2UtdXBsb2FkXCI7XG5cdFx0aW1hZ2VVcGxvYWRTaW5nbGUgPSBuZXcgSW1hZ2VVcGxvYWQoaW1hZ2VVcGxvYWRDb250YWluZXJTaW5nbGUsIFwic2luZ2xlXCIpO1xuXG5cdFx0c2luZ2xlSW1hZ2UuYXBwZW5kQ2hpbGQoaW1hZ2VVcGxvYWRDb250YWluZXJTaW5nbGUpO1xuXG5cdFx0aW1hZ2VVcGxvYWRTaW5nbGUuaW5pdFVwbG9hZEJ1dHRvbnMoKTtcblxuXHRcdHZhciBFcnJvckJveFNpbmdsZUltYWdlID0gbmV3IEVycm9yQm94KGltYWdlVXBsb2FkQ29udGFpbmVyU2luZ2xlKTtcblx0XHRFcnJvckJveFNpbmdsZUltYWdlLmluaXQoKTtcblxuXHRcdGltYWdlVXBsb2FkU2luZ2xlLm9uSW1hZ2VVcGxvYWQgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcdFx0IFxuXHRcdFx0aW1hZ2VUaW1lc0xvYWRlZCArPSAxO1xuXG5cdFx0XHRpZihpbWFnZVRpbWVzTG9hZGVkID09PSAxKSB7XG5cdFx0XHRcdGltYWdlRGF0YVNpbmdsZSA9IGltYWdlRGF0YTtcblx0XHRcdFx0b25JbWFnZXNMb2FkZWQoKTtcblx0XHRcdH0gZWxzZSBpZihpbWFnZVRpbWVzTG9hZGVkID09PTIpIHtcblx0XHRcdFx0aW1hZ2VEYXRhU2luZ2xlID0gaW1hZ2VEYXRhO1xuXHRcdFx0XHRpbWFnZVRpbWVzTG9hZGVkID0gMTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aW1hZ2VVcGxvYWRTaW5nbGUub25TaXplc1JlY2lldmVkID0gZnVuY3Rpb24oc2l6ZXMpIHtcblx0XHRcdHNpemVzU2luZ2xlID0gc2l6ZXM7XG5cdFx0fTsgXG5cblx0XHRpbWFnZVVwbG9hZFNpbmdsZS5vbkVycm9yTWVzc2FnZVJlY2VpdmVkID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdFx0aWYobWVzc2FnZSA9PT1cIk9LXCIpIHtcblx0XHRcdFx0RXJyb3JCb3hTaW5nbGVJbWFnZS5jbGVhcigpO1xuXHRcdFx0fSBlbHNlIHtcdFx0IFx0IFxuXHRcdFx0XHRFcnJvckJveFNpbmdsZUltYWdlLnNldE1lc3NhZ2UobWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKCkge1xuXHRcdFx0aWYgKGltYWdlVGltZXNMb2FkZWQgPT09IDEpIHtcblx0XHRcdFx0dW5tZXJnZUJ1dHRvbi5hY3RpdmF0ZSgpO1xuXHRcdFx0XHRidG5Vbm1lcmdlT24gPSB0cnVlO1xuXHRcdFx0XHRpbWFnZVRpbWVzTG9hZGVkID0gMDtcdFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdH0gXG5cdH1cblxuXHRmdW5jdGlvbiBpbml0VW5tZXJnZUJ1dHRvbihjb250YWluZXIpIHtcdFx0XG5cdFx0dW5tZXJnZUJ1dHRvbiA9IG5ldyBVbm1lcmdlQnV0dG9uKGNvbnRhaW5lcik7XG5cblx0XHRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKGJ0blVubWVyZ2VPbikge1x0XHQgXG5cdFx0XHRcdFx0aW5pdEltYWdlVW5tZXJnZXIoaW1hZ2VEYXRhU2luZ2xlLCBzaXplc1NpbmdsZSk7XHRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGltYWdlVGltZXNMb2FkZWQgPSAwO1xuXHRcdFx0fVx0XHRcdCBcdFx0XHRcdFx0XHRcdFxuXHRcdH0pO1xuIFx0fVxuIFxuXHRmdW5jdGlvbiBpbml0SW1hZ2VVbm1lcmdlcihpbWFnZURhdGFTaW5nbGUsIHNpemVzKSB7XG5cdFx0dmFyIGltYWdlVW5tZXJnZXIgPSBuZXcgSW1hZ2VVbm1lcmdlcihpbWFnZURhdGFTaW5nbGUsIHNpemVzKTtcblx0XHR2YXIgdW5tZXJnZWRBcnJheSA9IGltYWdlVW5tZXJnZXIudW5tZXJnZSgpO1xuXHRcdGluaXRVbm1lcmdlVmlldyh1bm1lcmdlZEFycmF5LCBzaXplcyk7XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0VW5tZXJnZVZpZXcodW5tZXJnZWRBcnJheSwgc2l6ZXNGaXJzdCkge1xuXHRcdGNsZWFuVW5tZXJnZWRWaWV3KGltYWdlQ29udGFpbmVyVW5tZXJnZUZpcnN0KTtcblx0XHRjbGVhblVubWVyZ2VkVmlldyhpbWFnZUNvbnRhaW5lclVubWVyZ2VTZWNvbmQpO1xuXG5cdFx0b3V0cHV0VW5tZXJnZVZpZXdGaXJzdCA9IG5ldyBJbWFnZVZpZXdlcihpbWFnZUNvbnRhaW5lclVubWVyZ2VGaXJzdCwgc2l6ZXNGaXJzdCk7XG5cdFx0b3V0cHV0VW5tZXJnZVZpZXdTZWNvbmQ9IG5ldyBJbWFnZVZpZXdlcihpbWFnZUNvbnRhaW5lclVubWVyZ2VTZWNvbmQsIHNpemVzRmlyc3QpO1xuXG5cdCAgICBvdXRwdXRVbm1lcmdlVmlld0ZpcnN0LnNldEZpbmFsKHVubWVyZ2VkQXJyYXlbMF0pO1xuXHRcdG91dHB1dFVubWVyZ2VWaWV3U2Vjb25kLnNldEZpbmFsKHVubWVyZ2VkQXJyYXlbMV0pO1xuXG5cdFx0dmFyIGNhbnZhc1VubWVyZ2VkRmlyc3QgPSBvdXRwdXRVbm1lcmdlVmlld0ZpcnN0LmdldENhbnZhcygpO1xuXHRcdHZhciBjYW52YXNVbm1lcmdlZFNlY29uZCA9IG91dHB1dFVubWVyZ2VWaWV3U2Vjb25kLmdldENhbnZhcygpO1xuIFx0XG4gXHRcdGJ0bkRvd25GaXJzdC5zZXRDYW52YXMoY2FudmFzVW5tZXJnZWRGaXJzdCk7XG4gXHRcdGJ0bkRvd25TZWNvbmQuc2V0Q2FudmFzKGNhbnZhc1VubWVyZ2VkU2Vjb25kKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNsZWFuVW5tZXJnZWRWaWV3KGNvbnRhaW5lcikge1xuXHRcdHZhciBjaGlsZE5vZGVzID0gY29udGFpbmVyLmNoaWxkTm9kZXM7XG5cdFx0dmFyIGk7XG5cdFx0Zm9yKGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYoY2hpbGROb2Rlc1tpXS50YWdOYW1lID09PSBcIkNBTlZBU1wiKSB7XG5cdFx0XHRcdGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuY2hpbGROb2Rlc1tpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVW5tZXJnZUNvbnRyb2xsZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBJbWFnZVNpemUgPSByZXF1aXJlKFwiLi9JbWFnZVNpemVcIik7XG5cbmZ1bmN0aW9uIFVybFJlYWRlcihjb250YWluZXIsIHVybExpbmspIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgXG4gICAgdGhpcy5vbkltYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbigpIHt9O1xuICAgIHRoaXMub25TaXplUmVjaWV2ZWQgPSBmdW5jdGlvbigpIHt9O1xuICAgIHRoaXMub25FcnJvck1lc3NhZ2VSZWNlaXZlZCA9IGZ1bmN0aW9uKCkge307XG5cbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgcmVhZGVyLCBjYW52YXMsIGN0eDtcbiAgICBcdHZhciB1cmxGaWVsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgdXJsRmllbGQucGxhY2Vob2xkZXIgPSBcIlBhc3RlIGFuIHVybC4uLlwiO1xuICAgICAgICB2YXIgdXJsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgdXJsQnRuLmlubmVySFRNTCA9IFwiVXBsb2FkXCI7XG4gICAgICAgIHVybEJ0bi5jb250ZW50VGV4dCA9IFwiVXBsb2FkXCI7XG5cbiAgICBcdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh1cmxGaWVsZCk7XG4gICBcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHVybEJ0bik7IFxuICAgICAgICAvL2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcy5jZHBuLmlvLzMvcGllLnBuZyBcbiAgICAgICAgLy9odHRwOi8vMS5icC5ibG9nc3BvdC5jb20vLVFmVWlzMy10TGhRL1VSS1FxNWVzSHZJL0FBQUFBQUFBQUM0L014c0RYNGdzVEV3L3MxNjAwL2R5bmFtaWMwMS5wbmdcbiAgICAgICAgdXJsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYodXJsRmllbGQudmFsdWUgIT09IFwiXCIpIHtcblx0ICAgICAgICAgICAgdmFyIHVybCA9IHVybEZpZWxkLnZhbHVlO1xuICAgICAgICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpOyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQodXJsRmllbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZCh1cmxCdG4pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQoXCJPS1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcywwLDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGltYWdlRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uSW1hZ2VSZWNlaXZlZChpbWFnZURhdGEpOyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNpemVzID0gbmV3IEltYWdlU2l6ZShjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uU2l6ZVJlY2lldmVkKHNpemVzKTsgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcuY3Jvc3NPcmlnaW4gPSBcIkFub255bW91c1wiOyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nLnNyYyA9IHVybDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB4aHIub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHhoci5zZW5kKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXHRcdFx0XHRhbGVydChcIklucHV0IGEgbGlua1wiKTtcblx0XHRcdH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgICAgIHRoYXQub25FcnJvck1lc3NhZ2VSZWNlaXZlZChcIlVSTCBpcyBpbnZhbGlkLlwiKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXJsUmVhZGVyOyJdfQ==
