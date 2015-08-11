(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var MergeController = require("./image/MergeController");
var UnmergeController = require("./image/UnmergeController");

var pathname = window.location.pathname;

window.addEventListener("load", init, false);


function init() {
	
	var appId = document.getElementsByTagName("html")[0].getAttribute("app-id");
	
	if(appId === "merge") { 
		startMergeController();
	}
	else if(appId === "unmerge") {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwLmpzIiwic3JjL2pzL2ltYWdlL0Rvd25sb2FkQnV0dG9uLmpzIiwic3JjL2pzL2ltYWdlL0Vycm9yQm94LmpzIiwic3JjL2pzL2ltYWdlL0ltYWdlTWVyZ2VyLmpzIiwic3JjL2pzL2ltYWdlL0ltYWdlUmVhZGVyLmpzIiwic3JjL2pzL2ltYWdlL0ltYWdlU2l6ZS5qcyIsInNyYy9qcy9pbWFnZS9JbWFnZVVubWVyZ2VyLmpzIiwic3JjL2pzL2ltYWdlL0ltYWdlVXBsb2FkLmpzIiwic3JjL2pzL2ltYWdlL0ltYWdlVmlld2VyLmpzIiwic3JjL2pzL2ltYWdlL01lcmdlQnV0dG9uLmpzIiwic3JjL2pzL2ltYWdlL01lcmdlQ29udHJvbGxlci5qcyIsInNyYy9qcy9pbWFnZS9SZWZyZXNoQnV0dG9uLmpzIiwic3JjL2pzL2ltYWdlL1VubWVyZ2VCdXR0b24uanMiLCJzcmMvanMvaW1hZ2UvVW5tZXJnZUNvbnRyb2xsZXIuanMiLCJzcmMvanMvaW1hZ2UvVXJsUmVhZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE1lcmdlQ29udHJvbGxlciA9IHJlcXVpcmUoXCIuL2ltYWdlL01lcmdlQ29udHJvbGxlclwiKTtcbnZhciBVbm1lcmdlQ29udHJvbGxlciA9IHJlcXVpcmUoXCIuL2ltYWdlL1VubWVyZ2VDb250cm9sbGVyXCIpO1xuXG52YXIgcGF0aG5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBpbml0LCBmYWxzZSk7XG5cblxuZnVuY3Rpb24gaW5pdCgpIHtcblx0XG5cdHZhciBhcHBJZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaHRtbFwiKVswXS5nZXRBdHRyaWJ1dGUoXCJhcHAtaWRcIik7XG5cdFxuXHRpZihhcHBJZCA9PT0gXCJtZXJnZVwiKSB7IFxuXHRcdHN0YXJ0TWVyZ2VDb250cm9sbGVyKCk7XG5cdH1cblx0ZWxzZSBpZihhcHBJZCA9PT0gXCJ1bm1lcmdlXCIpIHtcblx0XHRzdGFydFVubWVyZ2VDb250cm9sbGVyKCk7XG5cdH1cblx0IFxufVxuXG5mdW5jdGlvbiBzdGFydE1lcmdlQ29udHJvbGxlcigpIHtcblx0dmFyIG1lcmdlQ29udHJvbGxlciA9IG5ldyBNZXJnZUNvbnRyb2xsZXIoKTtcbn1cblxuZnVuY3Rpb24gc3RhcnRVbm1lcmdlQ29udHJvbGxlcigpIHtcblx0dmFyIHVubWVyZ2VDb250cm9sbGVyID0gbmV3IFVubWVyZ2VDb250cm9sbGVyKCk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gRG93bmxvYWRCdXR0b24oaWQpIHtcbiAgICB0aGlzLmNhbnZhcyA9IG51bGw7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXHR2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1x0XG5cdHZhciBkb3dubG9hZEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIFxuIFx0Y29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIG1vdXNlRW50ZXJEb3dubG9hZCwgZmFsc2UpO1xuICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBtb3VzZUxlYXZlRG93bmxvYWQsIGZhbHNlKTsgIFxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkb3dubG9hZEJ0bik7IFxuXG4gICAgZnVuY3Rpb24gbW91c2VFbnRlckRvd25sb2FkKCkgeyAgICAgIFxuICAgICAgICBkb3dubG9hZEJ0bi5jbGFzc05hbWUgPSBcImRvd25sb2FkLWJ0biBmaWxsXCI7XG4gICAgICAgIGRvd25sb2FkQnRuLmlubmVySFRNTCA9IFwiRG93bmxvYWRcIjtcbiAgICAgICAgZG93bmxvYWRCdG4udGV4dENvbnRlbnQgPSBcIkRvd25sb2FkXCI7XG4gICAgICAgIFxuICAgICAgICBpZih0aGF0LmNhbnZhcykge1xuICAgICAgICAgICAgdGhhdC5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkb3dubG9hZEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKHRoYXQuY2FudmFzKSB7XG4gICAgICAgIFx0ZG93bmxvYWRCdG4uaHJlZiA9IHRoYXQuY2FudmFzLnRvRGF0YVVSTCgpO1xuICAgICAgICBcdGRvd25sb2FkQnRuLmRvd25sb2FkID0gXCJpbWFnZS5wbmdcIjtcbiAgICAgICAgfVxuICAgIH0sIGZhbHNlKTtcblx0IFxuICAgIGZ1bmN0aW9uIG1vdXNlTGVhdmVEb3dubG9hZCgpIHsgICBcbiAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRDYW52YXMgPSBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgfTtcblxuICAgIHRoaXMuc2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBkb3dubG9hZEJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmVcIjtcbiAgICB9O1xuXG4gICAgdGhpcy5oaWRlPSAgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvd25sb2FkQnRuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9O1x0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRG93bmxvYWRCdXR0b247IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEVycm9yQm94KGNvbnRhaW5lcikge1xuXHR2YXIgRXJyb3JCb3hNZXNzYWdlO1xuXG5cdHRoaXMuaW5pdD0gZnVuY3Rpb24oKSB7XG5cdFx0RXJyb3JCb3hNZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHRFcnJvckJveE1lc3NhZ2UuY2xhc3NOYW1lID0gXCJlcnJvci1ib3hcIjtcblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoRXJyb3JCb3hNZXNzYWdlKTtcblx0fTtcblxuXHR0aGlzLmNsZWFyID0gZnVuY3Rpb24oKSB7XG5cdFx0RXJyb3JCb3hNZXNzYWdlLmlubmVySFRNTCA9IFwiXCI7XG5cdH07XG5cblx0dGhpcy5zZXRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0XHRFcnJvckJveE1lc3NhZ2UuaW5uZXJIVE1MID0gbWVzc2FnZTtcblx0fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFcnJvckJveDsiLCJcInVzZSBzdHJpY3RcIjtcbiBcbmZ1bmN0aW9uIEltYWdlTWVyZ2VyKEltYWdlRGF0YTEsIEltYWdlRGF0YTIpIHtcblxuXHR0aGlzLkltYWdlUmVzdWx0MSA9IEltYWdlRGF0YTE7XG5cdHRoaXMuSW1hZ2VSZXN1bHQyID0gSW1hZ2VEYXRhMjtcblxuXHR0aGlzLm1lcmdlID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGk7XG5cdFx0dmFyIHNpemVJbWFnZVJlc3VsdDIgPSB0aGlzLkltYWdlUmVzdWx0Mi5kYXRhLmxlbmd0aDtcblx0XHR2YXIgc2l6ZUltYWdlUmVzdWx0MSA9IHRoaXMuSW1hZ2VSZXN1bHQxLmRhdGEubGVuZ3RoO1x0XHRcblx0XHR2YXIgYXV4ID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHNpemVJbWFnZVJlc3VsdDIpO1xuXHRcdHZhciBmaW5hbEltYWdlID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHNpemVJbWFnZVJlc3VsdDIpO1xuXG5cdFx0Zm9yKGkgPTA7IGk8c2l6ZUltYWdlUmVzdWx0MjsgaSsrKSB7XG5cdFx0XHRhdXhbaV0gPSBNYXRoLmZsb29yKHRoaXMuSW1hZ2VSZXN1bHQyLmRhdGFbaV0gLyA2NCk7XG5cdFx0fVxuXG5cdFx0Zm9yKGk9MDsgaTxzaXplSW1hZ2VSZXN1bHQxOyBpKyspIHtcblx0XHRcdHRoaXMuSW1hZ2VSZXN1bHQxLmRhdGFbaV0gPSB0aGlzLkltYWdlUmVzdWx0MS5kYXRhW2ldID4+IDIgIDw8IDI7XG5cdFx0XHRmaW5hbEltYWdlW2ldID0gdGhpcy5JbWFnZVJlc3VsdDEuZGF0YVtpXSArIGF1eFtpXTtcblx0XHR9XG5cdFx0dmFyIEltYWdlRmluYWwgPSBmaW5hbEltYWdlO1xuXG5cdFx0cmV0dXJuIEltYWdlRmluYWw7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZU1lcmdlcjsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEltYWdlU2l6ZSA9IHJlcXVpcmUoXCIuL0ltYWdlU2l6ZVwiKTtcblxuZnVuY3Rpb24gSW1hZ2VSZWFkZXIoY29udGFpbmVyKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgXG4gICAgdGhpcy5vbkltYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbigpIHt9O1xuICAgIHRoaXMub25TaXplUmVjaWV2ZWQgPSBmdW5jdGlvbigpIHt9O1xuICAgIHRoaXMub25FcnJvck1lc3NhZ2VSZWNlaXZlZCA9IGZ1bmN0aW9uKCkge307XG5cbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlYWRlciwgY2FudmFzLCBjdHg7XG4gICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgIGlucHV0RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiZmlsZVwiKTtcbiAgICAgICAgaW5wdXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgaGFuZGxlRmlsZXMsIGZhbHNlKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGlucHV0RWxlbWVudCk7ICAgIFxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUZpbGVzKGV2KSB7XG4gICAgICAgICAgICB2YXIgZmlsZSA9IGlucHV0RWxlbWVudC5maWxlc1swXTtcblxuICAgICAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgICAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgICAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltZywwLDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGltYWdlRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbnZhcy53aWR0aCA8IDEwMjQgJiYgY2FudmFzLmhlaWdodCA8IDEwMjQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQoXCJPS1wiKTsgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25JbWFnZVJlY2VpdmVkKGltYWdlRGF0YSk7ICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2l6ZXMgPSBuZXcgSW1hZ2VTaXplKGNhbnZhcy53aWR0aCwgIGNhbnZhcy5oZWlnaHQpOyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uU2l6ZVJlY2lldmVkKHNpemVzKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25FcnJvck1lc3NhZ2VSZWNlaXZlZChcIlNpemUgaXMgdG9vIGJpZy5cIik7ICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGltZy5zcmMgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9OyAgICBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZVJlYWRlcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gSW1hZ2VTaXplKHdpZHRoLCBoZWlnaHQpIHtcblx0dGhpcy53aWR0aCA9IHdpZHRoO1xuXHR0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuXHR0aGlzLnNldFNpemVzID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXHRcdHRoaXMud2lkdGggPSB3aWR0aDtcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodDtcblx0fTtcbn1cdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlU2l6ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gSW1hZ2VVbm1lcmdlcihJbWFnZURhdGEsIHNpemUpIHtcblx0dGhpcy5pbnB1dEltYWdlPSBJbWFnZURhdGE7XG5cdHRoaXMuc2l6ZXMgPSBzaXplLndpZHRoKiBzaXplLmhlaWdodCAqIDQ7XG5cblx0dGhpcy51bm1lcmdlID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGk7XG5cdFx0dmFyIGZpcnN0QXV4ID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHRoaXMuc2l6ZXMpO1xuXHRcdHZhciBzZWNvbmRBdXggPSBuZXcgVWludDhDbGFtcGVkQXJyYXkodGhpcy5zaXplcyk7IFxuXHRcdHZhciB0ZW1wID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHRoaXMuc2l6ZXMpO1xuXHRcdFxuXHRcdGZvciAoaSA9IDA7IGkgPCB0aGlzLnNpemVzOyBpKyspIHtcblx0XHRcdGZpcnN0QXV4W2ldID0gMDtcblx0XHRcdHNlY29uZEF1eFtpXSA9IDA7XHRcblx0XHRcdHRlbXBbaV0gPTA7XG5cdFx0fVxuIFx0XHQgXG5cdFx0Zm9yIChpID0gMDsgaSA8IHRoaXMuc2l6ZXM7IGkrKykge1xuXHRcdFx0dGVtcFtpXSA9IHRoaXMuaW5wdXRJbWFnZS5kYXRhW2ldO1xuXHRcdFx0dGVtcFtpXSA9IHRlbXBbaV0gPj4gMiA8PCAyO1xuXHRcdFx0Zmlyc3RBdXhbaV0gPSB0ZW1wW2ldO1xuXHRcdFx0c2Vjb25kQXV4W2ldID0gdGVtcFtpXSBeIHRoaXMuaW5wdXRJbWFnZS5kYXRhW2ldO1xuXHRcdFx0c2Vjb25kQXV4W2ldID0gc2Vjb25kQXV4W2ldICogNjQ7XG5cdFx0fVx0XHRcblx0XHRcblx0XHRyZXR1cm4gW2ZpcnN0QXV4LHNlY29uZEF1eF07XG5cdH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VVbm1lcmdlcjsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEltYWdlUmVhZGVyID0gcmVxdWlyZShcIi4vSW1hZ2VSZWFkZXJcIik7XG52YXIgSW1hZ2VWaWV3ZXIgPSByZXF1aXJlKFwiLi9JbWFnZVZpZXdlclwiKTtcbnZhciBVcmxSZWFkZXIgPSByZXF1aXJlKFwiLi9VcmxSZWFkZXJcIik7XG5cbmZ1bmN0aW9uIEltYWdlVXBsb2FkKGNvbnRhaW5lciwgY2xhc3NOYW1lKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBlcnJvck1lc3NhZ2U7XG4gICAgdmFyIGZsYWcgPSBmYWxzZTtcbiAgICB0aGlzLm9uSW1hZ2VVcGxvYWQgPSBmdW5jdGlvbigpIHt9O1xuICAgIHRoaXMub25TaXplc1JlY2lldmVkID0gZnVuY3Rpb24oKSB7fTtcbiAgICB0aGlzLm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbigpIHt9O1xuXG4gICAgdGhpcy5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgdGhpcy51cGxvYWREaXYgPSBjb250YWluZXI7IFxuXG4gICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgYnV0dG9uQ29udGFpbmVyLmNsYXNzTmFtZSA9IFwiYnV0dG9uLWNvbnRhaW5lclwiO1xuXG4gICAgdmFyIGltYWdlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBpbWFnZUNvbnRhaW5lci5jbGFzc05hbWUgPSBcImltYWdlLWNvbnRhaW5lclwiO1xuXG4gICAgdGhpcy5pbml0VXBsb2FkQnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW1hZ2VCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgICAgICB2YXIgdXJsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgaW1hZ2VCdG4uY2xhc3NOYW1lID0gXCJpbWFnZS1idG5cIjtcbiAgICAgICAgaW1hZ2VCdG4uaW5uZXJIVE1MID0gXCJJbWFnZVwiO1xuICAgICAgICB1cmxCdG4uY2xhc3NOYW1lID0gXCJ1cmwtYnRuXCI7XG4gICAgICAgIHVybEJ0bi5pbm5lckhUTUwgPSBcIlVSTFwiO1xuXG4gICAgICAgIGJ1dHRvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChpbWFnZUJ0bik7XG4gICAgICAgIGJ1dHRvbkNvbnRhaW5lci5hcHBlbmRDaGlsZCh1cmxCdG4pO1xuXG4gICAgICAgIGltYWdlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgdGhhdC5jbGVhbigpO1xuICAgICAgICAgICB0aGF0LmluaXRJTUcoKTtcbiAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgdXJsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoYXQuY2xlYW4oKTtcbiAgICAgICAgICAgIHRoYXQuaW5pdFVSTCgpO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICB0aGlzLnVwbG9hZERpdi5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgIHRoaXMudXBsb2FkRGl2LmFwcGVuZENoaWxkKGltYWdlQ29udGFpbmVyKTtcblxuICAgIC8vRm9yIEltYWdlVmlld1xuXHR0aGlzLmluaXRJTUcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGlucHV0SW1hZ2VWaWV3ZXI7XG4gICAgICAgIHZhciBkaXZWaWV3ZXI7XG4gICAgICAgIHZhciBpbWFnZURhdGFUaGlzO1xuICAgICAgICB2YXIgZGl2UmVhZGVyID0gIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGRpdlJlYWRlci5jbGFzc05hbWUgPSAgY2xhc3NOYW1lO1xuXG4gICAgICAgIHZhciByZWFkZXIgPSBuZXcgSW1hZ2VSZWFkZXIoZGl2UmVhZGVyKTtcbiAgICAgICAgcmVhZGVyLmluaXQoKTtcbiAgICAgICAgaW1hZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2UmVhZGVyKTtcbiAgICAgICAgIFxuICAgICAgICByZWFkZXIub25JbWFnZVJlY2VpdmVkID0gZnVuY3Rpb24oaW1hZ2VEYXRhKSB7ICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGZsYWcpIHtcbiAgICAgICAgICAgICAgICBkaXZWaWV3ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIGRpdlZpZXdlci5jbGFzc05hbWUgPSBcInZpZXdlclwiO1xuICAgICAgICAgICAgICAgIGltYWdlRGF0YVRoaXMgPSBpbWFnZURhdGE7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgcmVhZGVyLm9uU2l6ZVJlY2lldmVkID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgICAgICAgaWYoZmxhZykge1xuICAgICAgICAgICAgICAgIHZhciBzaXplcyA9IHNpemU7XG4gICAgICAgICAgICAgICAgaW5wdXRJbWFnZVZpZXdlciA9IG5ldyBJbWFnZVZpZXdlcihkaXZWaWV3ZXIsIHNpemVzKTtcbiAgICAgICAgICAgICAgICBpbnB1dEltYWdlVmlld2VyLmluaXQoKTtcblxuICAgICAgICAgICAgICAgIGltYWdlRGF0YVRoaXMgPSBpbnB1dEltYWdlVmlld2VyLnNldEltYWdlKGltYWdlRGF0YVRoaXMpOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpbWFnZUNvbnRhaW5lci5yZW1vdmVDaGlsZChkaXZSZWFkZXIpOyAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpbWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXZWaWV3ZXIpO1xuXG4gICAgICAgICAgICAgICAgbmV3VXBsb2FkQnV0dG9uKGRpdlZpZXdlcixkaXZSZWFkZXIpO1xuICAgICAgICAgICAgICAgIHRoYXQub25FcnJvck1lc3NhZ2VSZWNlaXZlZChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHRoYXQub25JbWFnZVVwbG9hZChpbWFnZURhdGFUaGlzKTtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uU2l6ZXNSZWNpZXZlZChzaXplcyk7ICAgIFxuICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICB9O1xuXG4gICAgICAgIHJlYWRlci5vbkVycm9yTWVzc2FnZVJlY2VpdmVkID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgICAgIGlmKGVycm9yTWVzc2FnZSA9PT0gXCJPS1wiKSB7XG4gICAgICAgICAgICAgICAgZmxhZyA9IHRydWU7ICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0Lm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfTtcblx0fTtcblxuICAgIC8vRm9yIFVSTCB2aWV3XG4gICAgdGhpcy5pbml0VVJMID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaXZVUkwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkaXZVUkwuY2xhc3NOYW1lID0gXCJ1cmwtcmVhZGVyXCI7XG4gICAgICAgIHZhciBkaXZVcmxWaWV3ZXI7XG4gICAgICAgIHZhciBpbnB1dEltYWdlVXJsVmlld2VyO1xuICAgICAgICB2YXIgdXJsSW1hZ2VEYXRhVGhpcztcbiAgICAgICAgdmFyIHVybFJlYWRlciA9IG5ldyBVcmxSZWFkZXIoZGl2VVJMKTtcbiAgICAgICAgdXJsUmVhZGVyLmluaXQoKTtcblxuICAgICAgICBpbWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXZVUkwpO1xuXG4gICAgICAgIHVybFJlYWRlci5vbkltYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcbiAgICAgICAgICAgIGlmKGZsYWcpIHtcbiAgICAgICAgICAgICAgICB1cmxJbWFnZURhdGFUaGlzID0gaW1hZ2VEYXRhO1xuICAgICAgICAgICAgICAgIGRpdlVybFZpZXdlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgZGl2VXJsVmlld2VyLmNsYXNzTmFtZSA9IFwidmlld2VyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07ICAgIFxuXG4gICAgICAgIHVybFJlYWRlci5vblNpemVSZWNpZXZlZCA9IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgICAgICAgIGlmKGZsYWcpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2l6ZXMgPSBzaXplO1xuICAgICAgICAgICAgICAgIGlucHV0SW1hZ2VVcmxWaWV3ZXIgPSBuZXcgSW1hZ2VWaWV3ZXIoZGl2VXJsVmlld2VyLHNpemVzKTtcbiAgICAgICAgICAgICAgICBpbnB1dEltYWdlVXJsVmlld2VyLmluaXQoKTtcblxuICAgICAgICAgICAgICAgIHVybEltYWdlRGF0YVRoaXMgPSBpbnB1dEltYWdlVXJsVmlld2VyLnNldEltYWdlKHVybEltYWdlRGF0YVRoaXMpO1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VDb250YWluZXIucmVtb3ZlQ2hpbGQoZGl2VVJMKTtcbiAgICAgICAgICAgICAgICBpbWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXZVcmxWaWV3ZXIpO1xuXG4gICAgICAgICAgICAgICAgbmV3VXBsb2FkQnV0dG9uKGRpdlVybFZpZXdlcixkaXZVUkwpO1xuICAgICAgICAgICAgICAgIHRoYXQub25JbWFnZVVwbG9hZCh1cmxJbWFnZURhdGFUaGlzKTtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uU2l6ZXNSZWNpZXZlZChzaXplcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07ICBcblxuICAgICAgICB1cmxSZWFkZXIub25FcnJvck1lc3NhZ2VSZWNlaXZlZCA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IG1lc3NhZ2U7XG5cbiAgICAgICAgICAgIGlmKGVycm9yTWVzc2FnZSA9PT0gXCJPS1wiKSB7XG4gICAgICAgICAgICAgICAgZmxhZyA9IHRydWU7ICAgICBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5vbkVycm9yTWVzc2FnZVJlY2VpdmVkKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH07IFxuICAgIH07IFxuXG4gICAgLy90byBjbGVhciB0aGUgaW1hZ2UtY29udGFpbmVyIG9mIGNoaWxkcmVuXG4gICAgdGhpcy5jbGVhbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB3aGlsZShpbWFnZUNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBpbWFnZUNvbnRhaW5lci5yZW1vdmVDaGlsZChpbWFnZUNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBuZXdVcGxvYWRCdXR0b24oZGl2Vmlld2VyLCBSZWFkZXIpIHtcbiAgICAgICAgdmFyIG5ld1VwbG9hZEJ0bjtcblxuICAgICAgICBkaXZWaWV3ZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgZnVuY3Rpb24oKSB7ICAgICAgICAgICAgXG4gICAgICAgICAgICBuZXdVcGxvYWRCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgICAgICAgICAgbmV3VXBsb2FkQnRuLmNsYXNzTmFtZSA9IFwidXBsb2FkQnRuIGZpbGxcIjtcbiAgICAgICAgICAgIG5ld1VwbG9hZEJ0bi5pbm5lckhUTUwgPSBcIk5ld1wiO1xuICAgICAgICAgICAgZGl2Vmlld2VyLmFwcGVuZENoaWxkKG5ld1VwbG9hZEJ0bik7XG5cbiAgICAgICAgICAgIG5ld1VwbG9hZEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gaW1hZ2VDb250YWluZXIucmVtb3ZlQ2hpbGQoZGl2Vmlld2VyKTtcbiAgICAgICAgICAgICAgICB0aGF0LmNsZWFuKCk7ICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGltYWdlQ29udGFpbmVyLmFwcGVuZENoaWxkKFJlYWRlcik7XG4gICAgICAgICAgICAgICAgaWYoUmVhZGVyLmNsYXNzTmFtZSA9PVwidXJsLXJlYWRlclwiKXtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5pbml0VVJMKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKFJlYWRlci5jbGFzc05hbWUgPT1jbGFzc05hbWUpe1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmluaXRJTUcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRpdlZpZXdlci5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRpdlZpZXdlci5yZW1vdmVDaGlsZChuZXdVcGxvYWRCdG4pO1xuICAgICAgICB9KTsgICBcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VVcGxvYWQ7IiwiXCJ1c2Ugc3RyaWN0XCI7IFxuXG5mdW5jdGlvbiBJbWFnZVZpZXdlcihjb250YWluZXIsIHNpemVzKSB7XG5cdHZhciBjYW52YXNJbWFnZVZpZXdlcjtcblx0dmFyIGN0eDtcblx0dmFyIGltYWdlRGF0YU5ldzsgXG5cdHRoaXMuc2l6ZXMgPSBzaXplcztcblxuXHR0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRjYW52YXNJbWFnZVZpZXdlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0Y3R4ID0gY2FudmFzSW1hZ2VWaWV3ZXIuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdGNhbnZhc0ltYWdlVmlld2VyLndpZHRoID0gIHNpemVzLndpZHRoO1xuXHRcdGNhbnZhc0ltYWdlVmlld2VyLmhlaWdodCA9IHNpemVzLmhlaWdodDtcblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoY2FudmFzSW1hZ2VWaWV3ZXIpO1xuXHR9O1xuXG5cdHRoaXMuc2V0SW1hZ2UgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcdFxuXHRcdGN0eC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcdFxuXHRcdHJldHVybiBpbWFnZURhdGE7XHRcblx0fTtcblxuXHR0aGlzLnNldEZpbmFsID0gZnVuY3Rpb24obXlEYXRhKSB7IFx0XG5cdFx0dGhpcy5pbml0KCk7XG5cdFx0dmFyIGltYWdlRGF0YSA9IGNhbnZhc0ltYWdlVmlld2VyLmdldENvbnRleHQoXCIyZFwiKS5jcmVhdGVJbWFnZURhdGEoc2l6ZXMud2lkdGgsIHNpemVzLmhlaWdodCk7XG5cdFx0aW1hZ2VEYXRhLmRhdGEuc2V0KG15RGF0YSk7XG5cdFx0dGhpcy5zZXRJbWFnZShpbWFnZURhdGEpOyBcblx0fTtcblxuXHR0aGlzLmdldENhbnZhcyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBjYW52YXNJbWFnZVZpZXdlcjtcblx0fTtcbn1cdFx0XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VWaWV3ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gTWVyZ2VCdXR0b24oY29udGFpbmVyKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dmFyIGJ0bk1lcmdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcblx0YnRuTWVyZ2UudHlwZSA9IFwiYnV0dG9uXCI7XHRcdFxuXHRidG5NZXJnZS5jbGFzc05hbWUgPSBcIm1lcmdlLWJ1dHRvbiBmaWxsXCI7XG5cdGJ0bk1lcmdlLmlubmVyVGV4dCA9IFwiTWVyZ2VcIjtcblx0YnRuTWVyZ2UudGV4dENvbnRlbnQgPSBcIk1lcmdlXCI7XG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZChidG5NZXJnZSk7XG4gXHRidG5NZXJnZS5kaXNhYmxlZCA9IHRydWU7XG5cblx0dGhpcy5vbkVycm9yTWVzc2FnZVJlY2VpdmVkID0gZnVuY3Rpb24gKCkge307IFxuXG5cdHRoaXMuYWN0aXZhdGUgPSBmdW5jdGlvbigpIHsgXG5cdFx0YnRuTWVyZ2UuZGlzYWJsZWQgPSBmYWxzZTsgXG5cdH07XG5cblx0dGhpcy5kZWFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0YnRuTWVyZ2UuZGlzYWJsZWQgPSB0cnVlO1xuXHR9O1xuXG5cdHRoaXMudmFsaWRhdGUgPSBmdW5jdGlvbihzaXplMSwgc2l6ZTIpIHtcdFx0XG5cdFx0aWYoc2l6ZTEud2lkdGggPT09IHNpemUyLndpZHRoICYmIHNpemUyLndpZHRoID09PSBzaXplMS53aWR0aCkge1xuXHRcdCBcdHRoYXQub25FcnJvck1lc3NhZ2VSZWNlaXZlZChcIk9LXCIpO1xuXHRcdCBcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZSB7IFxuXHRcdFx0dGhhdC5vbkVycm9yTWVzc2FnZVJlY2VpdmVkKFwiTm90IHRoZSBzYW1lIHNpemVzXCIpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZXJnZUJ1dHRvbjsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEltYWdlUmVhZGVyID0gcmVxdWlyZShcIi4vSW1hZ2VSZWFkZXJcIik7XG52YXIgSW1hZ2VWaWV3ZXIgPSByZXF1aXJlKFwiLi9JbWFnZVZpZXdlclwiKTtcbnZhciBJbWFnZU1lcmdlciA9IHJlcXVpcmUoXCIuL0ltYWdlTWVyZ2VyXCIpO1xudmFyIEltYWdlVXBsb2FkID0gcmVxdWlyZShcIi4vSW1hZ2VVcGxvYWRcIik7XG52YXIgTWVyZ2VCdXR0b24gPSByZXF1aXJlKFwiLi9NZXJnZUJ1dHRvblwiKTtcbnZhciBSZWZyZXNoQnV0dG9uID0gcmVxdWlyZShcIi4vUmVmcmVzaEJ1dHRvblwiKTtcbnZhciBEb3dubG9hZEJ1dHRvbiA9IHJlcXVpcmUoXCIuL0Rvd25sb2FkQnV0dG9uXCIpO1xudmFyIEltYWdlU2l6ZSA9IHJlcXVpcmUoXCIuL0ltYWdlU2l6ZVwiKTtcbnZhciBFcnJvckJveCA9IHJlcXVpcmUoXCIuL0Vycm9yQm94XCIpO1xuXG5mdW5jdGlvbiBNZXJnZUNvbnRyb2xsZXIoKSB7XG5cblx0dmFyIGltYWdlUmVhZGVyRmlyc3QsIGltYWdlUmVhZGVyU2Vjb25kLCBpbWFnZVJlYWRlck1lcmdlZDtcblx0dmFyIGlucHV0SW1hZ2VWaWV3ZXJGaXJzdCwgaW5wdXRJbWFnZVZpZXdlclNlY29uZCwgaW5wdXRNZXJnZVZpZXc7IFx0XG5cdHZhciBpbWFnZURhdGFGaXJzdCwgaW1hZ2VEYXRhU2Vjb25kO1xuXHR2YXIgaW1hZ2VzTG9hZGVkID0gMDtcblx0dmFyIGltYWdlTG9hZGVkRmlyc3QgPSAwO1xuXHR2YXIgaW1hZ2VMb2FkZWRTZWNvbmQgPSAwO1xuXHR2YXIgYnRuTWVyZ2VPbiA9IGZhbHNlO1xuXHR2YXIgaW1hZ2VVcGxvYWRGaXJzdCwgaW1hZ2VVcGxvYWRTZWNvbmQ7XG5cdHZhciBzaXplc0ZpcnN0LCBzaXplc1NlY29uZCA7XG5cdHZhciBlcnJNc2dGaXJzdCwgZXJyTXNnU2Vjb25kICxlcnJNc2dNZXJnZTtcblx0dmFyIGZsYWdGaXJzdCA9IGZhbHNlO1xuXG5cdHZhciBpbWFnZUNvbnRhaW5lck1lcmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbWFnZU1lcmdlckZpbmFsXCIpO1xuXG5cdHZhciBidG5Eb3duID0gbmV3IERvd25sb2FkQnV0dG9uKGltYWdlQ29udGFpbmVyTWVyZ2UuaWQpO1xuXHRcdFxuXHRpbml0KCk7XG5cdGJ0bkRvd24uaGlkZSgpO1xuXG5cdGZ1bmN0aW9uIGluaXQoKSB7XHRcblx0XHR2YXIgRmlyc3RJbWFnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiRmlyc3RJbWFnZVwiKTtcblx0XHR2YXIgU2Vjb25kSW1hZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlNlY29uZEltYWdlXCIpO1xuXHRcdGluaXRJbWFnZVVwbG9hZChGaXJzdEltYWdlLCBTZWNvbmRJbWFnZSk7XG5cblx0XHR2YXIgaWRSZWZyZXNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWZyZXNoQnRuXCIpO1xuXHRcdHZhciByZWZyZXNoQnRuID0gbmV3IFJlZnJlc2hCdXR0b24oaWRSZWZyZXNoKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gaW5pdEltYWdlVXBsb2FkKGZpcnN0SW1hZ2VDb250YWluZXIsIHNlY29uZEltYWdlQ29udGFpbmVyKSB7XG5cdFx0dmFyIGltYWdlVXBsb2FkQ29udGFpbmVyRmlyc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdHZhciBpbWFnZVVwbG9hZENvbnRhaW5lclNlY29uZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cblx0XHRpbWFnZVVwbG9hZENvbnRhaW5lckZpcnN0LmNsYXNzTmFtZSA9IFwiaW1hZ2UtdXBsb2FkLWZpcnN0XCI7XG5cdFx0aW1hZ2VVcGxvYWRDb250YWluZXJTZWNvbmQuY2xhc3NOYW1lID0gXCJpbWFnZS11cGxvYWQtc2Vjb25kXCI7XG5cblx0XHRpbWFnZVVwbG9hZEZpcnN0ID0gbmV3IEltYWdlVXBsb2FkKGltYWdlVXBsb2FkQ29udGFpbmVyRmlyc3QsIFwiZmlyc3QtdXBsb2FkXCIgKTsgXG5cdFx0aW1hZ2VVcGxvYWRTZWNvbmQgID0gbmV3IEltYWdlVXBsb2FkKGltYWdlVXBsb2FkQ29udGFpbmVyU2Vjb25kLCBcInNlY29uZC11cGxvYWRcIik7XG5cblx0XHRmaXJzdEltYWdlQ29udGFpbmVyLmFwcGVuZENoaWxkKGltYWdlVXBsb2FkQ29udGFpbmVyRmlyc3QpO1xuXHRcdHNlY29uZEltYWdlQ29udGFpbmVyLmFwcGVuZENoaWxkKGltYWdlVXBsb2FkQ29udGFpbmVyU2Vjb25kKTtcblxuXHRcdGltYWdlVXBsb2FkRmlyc3QuaW5pdFVwbG9hZEJ1dHRvbnMoKTtcblx0XHRpbWFnZVVwbG9hZFNlY29uZC5pbml0VXBsb2FkQnV0dG9ucygpO1xuXG5cdFx0dmFyIEVycm9yQm94Rmlyc3RJbWFnZSA9IG5ldyBFcnJvckJveChmaXJzdEltYWdlQ29udGFpbmVyKTtcblx0XHR2YXIgRXJyb3JCb3hTZWNvbmRJbWFnZSA9IG5ldyBFcnJvckJveChzZWNvbmRJbWFnZUNvbnRhaW5lcik7XG5cblx0XHRFcnJvckJveEZpcnN0SW1hZ2UuaW5pdCgpO1xuXHRcdEVycm9yQm94U2Vjb25kSW1hZ2UuaW5pdCgpO1xuXHRcdFxuXHRcdHZhciBidG5NZXJnZUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuTWVyZ2VDb250YWluZXJcIik7XG5cdFx0dmFyIG1lcmdlQnRuID0gbmV3IE1lcmdlQnV0dG9uKGJ0bk1lcmdlQ29udGFpbmVyKTtcblx0XHR2YXIgRXJyb3JCb3hNZXJnZUJ1dHRvbiA9IG5ldyBFcnJvckJveChidG5NZXJnZUNvbnRhaW5lcik7XG5cblx0XHRFcnJvckJveE1lcmdlQnV0dG9uLmluaXQoKTtcblx0XHRpbml0QnRuTWVyZ2UoKTtcblxuXHRcdGltYWdlVXBsb2FkRmlyc3Qub25JbWFnZVVwbG9hZCA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1xuXHRcdFx0aW1hZ2VMb2FkZWRGaXJzdCArPSAxO1xuXG5cdFx0XHRpZihpbWFnZUxvYWRlZEZpcnN0ID09PSAxKSB7XG5cdFx0XHRcdGltYWdlRGF0YUZpcnN0ID0gaW1hZ2VEYXRhO1xuXHRcdFx0XHRvbkltYWdlc0xvYWRlZCgpO1xuXHRcdFx0fSBcblx0XHRcdGVsc2UgaWYoaW1hZ2VMb2FkZWRGaXJzdCA9PT0gMikge1xuXHRcdFx0XHRpbWFnZURhdGFGaXJzdCA9IGltYWdlRGF0YTtcblx0XHRcdFx0aW1hZ2VMb2FkZWRGaXJzdCA9IDE7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGltYWdlVXBsb2FkRmlyc3Qub25TaXplc1JlY2lldmVkID0gZnVuY3Rpb24oc2l6ZXMpIHtcblx0XHRcdHNpemVzRmlyc3QgPSBzaXplcztcblx0XHR9OyBcblxuXHRcdGltYWdlVXBsb2FkRmlyc3Qub25FcnJvck1lc3NhZ2VSZWNlaXZlZCA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHRcdGlmKG1lc3NhZ2UgPT09IFwiT0tcIikge1xuXHRcdFx0XHRFcnJvckJveEZpcnN0SW1hZ2UuY2xlYXIoKTtcblx0XHRcdH0gZWxzZSB7XHRcdCBcdCBcblx0XHRcdFx0RXJyb3JCb3hGaXJzdEltYWdlLnNldE1lc3NhZ2UobWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGltYWdlVXBsb2FkU2Vjb25kLm9uSW1hZ2VVcGxvYWQgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcblx0XHRcdGltYWdlTG9hZGVkU2Vjb25kICs9IDE7XG5cblx0XHRcdGlmKGltYWdlTG9hZGVkU2Vjb25kID09PSAxKSB7XG5cdFx0XHRcdGltYWdlRGF0YVNlY29uZCA9IGltYWdlRGF0YTtcblx0XHRcdFx0b25JbWFnZXNMb2FkZWQoKTtcdFx0XHRcdFxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihpbWFnZUxvYWRlZFNlY29uZCA9PT0gMikge1xuXHRcdFx0XHRpbWFnZURhdGFTZWNvbmQgPSBpbWFnZURhdGE7XG5cdFx0XHRcdGltYWdlTG9hZGVkU2Vjb25kID0gMTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aW1hZ2VVcGxvYWRTZWNvbmQub25TaXplc1JlY2lldmVkID0gZnVuY3Rpb24oc2l6ZXMpIHtcblx0XHRcdHNpemVzU2Vjb25kID0gc2l6ZXM7XG5cdFx0fTtcblxuXHRcdGltYWdlVXBsb2FkU2Vjb25kLm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0XHRpZihtZXNzYWdlID09PVwiT0tcIikge1xuXHRcdFx0XHRFcnJvckJveFNlY29uZEltYWdlLmNsZWFyKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRFcnJvckJveFNlY29uZEltYWdlLnNldE1lc3NhZ2UobWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1lcmdlQnRuLm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0XHRpZihtZXNzYWdlID09PSBcIk9LXCIpIHtcblx0XHRcdFx0RXJyb3JCb3hNZXJnZUJ1dHRvbi5jbGVhcigpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0RXJyb3JCb3hNZXJnZUJ1dHRvbi5zZXRNZXNzYWdlKG1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBvbkltYWdlc0xvYWRlZCgpIHtcblx0XHRcdGltYWdlc0xvYWRlZCA9IGltYWdlTG9hZGVkRmlyc3QgKyBpbWFnZUxvYWRlZFNlY29uZDtcblx0XHRcdGlmIChpbWFnZXNMb2FkZWQgPT09IDIpIHtcblx0XHRcdFx0bWVyZ2VCdG4uYWN0aXZhdGUoKTtcblx0XHRcdFx0YnRuTWVyZ2VPbiA9IHRydWU7XG5cdFx0XHRcdGltYWdlc0xvYWRlZCA9IDA7XHRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHR9IFxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGluaXRCdG5NZXJnZSgpIHtcblx0XHRcdGJ0bk1lcmdlQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKGJ0bk1lcmdlT24pIHtcblx0XHRcdFx0IFx0dmFyIGJvb2xNZXJnZSA9IG1lcmdlQnRuLnZhbGlkYXRlKHNpemVzRmlyc3QsIHNpemVzU2Vjb25kKTtcdFxuXG5cdFx0XHRcdCBcdGlmKGJvb2xNZXJnZSkge1xuXHRcdFx0XHRcdFx0dmFyIHJlekltZyA9IGluaXRJbWFnZU1lcmdlcihpbWFnZURhdGFGaXJzdCxpbWFnZURhdGFTZWNvbmQsIHNpemVzRmlyc3QsIHNpemVzU2Vjb25kKTtcblx0XHRcdFx0XHRcdGluaXRNZXJnZVZpZXcocmV6SW1nKTtcdFx0XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGltYWdlc0xvYWRlZCA9IDA7XG5cdFx0XHRcdFx0fVx0XHRcdCBcblx0XHRcdFx0fVx0XHRcdFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdEltYWdlTWVyZ2VyKGltYWdlRGF0YUZpcnN0LCBpbWFnZURhdGFTZWNvbmQsIHNpemVzRmlyc3QsIHNpemVzU2Vjb25kKSB7XG5cdFx0dmFyIGltYWdlTWVyZ2VyRXhlY3V0aW9uID0gIG5ldyBJbWFnZU1lcmdlcihpbWFnZURhdGFGaXJzdCwgaW1hZ2VEYXRhU2Vjb25kKTtcblx0XHR2YXIgcmVzdWx0ID0gaW1hZ2VNZXJnZXJFeGVjdXRpb24ubWVyZ2UoKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdE1lcmdlVmlldyhtZXJnZWRJbWFnZURhdGEpIHtcblx0XHRjbGVhbk1lcmdlZFZpZXcoaW1hZ2VDb250YWluZXJNZXJnZSk7XG5cblx0XHRpbnB1dE1lcmdlVmlldyA9IG5ldyBJbWFnZVZpZXdlcihpbWFnZUNvbnRhaW5lck1lcmdlLHNpemVzRmlyc3QpOyBcblx0XHRpbnB1dE1lcmdlVmlldy5zZXRGaW5hbChtZXJnZWRJbWFnZURhdGEpO1xuXG5cdFx0dmFyIGNhbnZhc01lcmdlZCA9IGlucHV0TWVyZ2VWaWV3LmdldENhbnZhcygpO1xuXHRcdFxuXHRcdGJ0bkRvd24uc2V0Q2FudmFzKGNhbnZhc01lcmdlZCk7XG5cdH1cblxuXHRmdW5jdGlvbiBjbGVhbk1lcmdlZFZpZXcoY29udGFpbmVyKSB7XG4gICAgIFx0dmFyIGNoaWxkTm9kZXMgPSBjb250YWluZXIuY2hpbGROb2Rlcztcblx0XHR2YXIgaTtcblx0XHRmb3IoaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZihjaGlsZE5vZGVzW2ldLnRhZ05hbWUgPT09IFwiQ0FOVkFTXCIpIHtcblx0XHRcdFx0Y29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5jaGlsZE5vZGVzW2ldKTtcblx0XHRcdH1cblx0XHR9XG4gICAgfVxuICAgIFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lcmdlQ29udHJvbGxlcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gUmVmcmVzaEJ1dHRvbihjb250YWluZXIpIHtcblx0dmFyIGJ0blJlZnJlc2ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcblxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXIuaWQpLmFwcGVuZENoaWxkKGJ0blJlZnJlc2gpO1xuXG5cdGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixmdW5jdGlvbigpIHtcbiBcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZnJlc2hCdXR0b247IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIFVubWVyZ2VCdXR0b24oY29udGFpbmVyKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dmFyIGJ0blVubWVyZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuXHRidG5Vbm1lcmdlLnR5cGUgPSBcImJ1dHRvblwiO1x0XHRcblx0YnRuVW5tZXJnZS5jbGFzc05hbWUgPSBcInVubWVyZ2UtYnV0dG9uIGZpbGxcIjtcblx0YnRuVW5tZXJnZS5pbm5lclRleHQgPSBcIlVubWVyZ2VcIjtcblx0YnRuVW5tZXJnZS50ZXh0Q29udGVudCA9IFwiVW5tZXJnZVwiO1xuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoYnRuVW5tZXJnZSk7XG4gXHRidG5Vbm1lcmdlLmRpc2FibGVkID0gdHJ1ZTtcblxuXHR0aGlzLm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbiAoKSB7fTsgXG5cblx0dGhpcy5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGJ0blVubWVyZ2UuZGlzYWJsZWQgPSBmYWxzZTsgXG5cdH07XG5cblx0dGhpcy5kZWFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0YnRuVW5tZXJnZS5kaXNhYmxlZCA9IHRydWU7XG5cdH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVW5tZXJnZUJ1dHRvbjsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEltYWdlUmVhZGVyID0gcmVxdWlyZShcIi4vSW1hZ2VSZWFkZXJcIik7XG52YXIgSW1hZ2VWaWV3ZXIgPSByZXF1aXJlKFwiLi9JbWFnZVZpZXdlclwiKTtcbnZhciBJbWFnZVVubWVyZ2VyID0gcmVxdWlyZShcIi4vSW1hZ2VVbm1lcmdlclwiKTtcbnZhciBJbWFnZVVwbG9hZCA9IHJlcXVpcmUoXCIuL0ltYWdlVXBsb2FkXCIpO1xudmFyIFJlZnJlc2hCdXR0b24gPSByZXF1aXJlKFwiLi9SZWZyZXNoQnV0dG9uXCIpO1xudmFyIERvd25sb2FkQnV0dG9uID0gcmVxdWlyZShcIi4vRG93bmxvYWRCdXR0b25cIik7XG52YXIgSW1hZ2VTaXplID0gcmVxdWlyZShcIi4vSW1hZ2VTaXplXCIpO1xudmFyIEVycm9yQm94ID0gcmVxdWlyZShcIi4vRXJyb3JCb3hcIik7XG52YXIgVW5tZXJnZUJ1dHRvbiA9IHJlcXVpcmUoXCIuL1VubWVyZ2VCdXR0b25cIik7XG5cbmZ1bmN0aW9uIFVubWVyZ2VDb250cm9sbGVyKCkge1xuXG5cdHZhciBvdXRwdXRVbm1lcmdlVmlld0ZpcnN0LCBvdXRwdXRVbm1lcmdlVmlld1NlY29uZDtcblx0dmFyIGltYWdlVXBsb2FkU2luZ2xlO1xuXHR2YXIgaW1hZ2VEYXRhU2luZ2xlO1xuXHR2YXIgc2l6ZXNTaW5nbGU7XG5cdHZhciBpbWFnZVRpbWVzTG9hZGVkID0gMCA7XG5cdHZhciBidG5Vbm1lcmdlT24gPSBmYWxzZTtcblx0dmFyIHVubWVyZ2VCdXR0b247XG5cblx0dmFyIGltYWdlQ29udGFpbmVyVW5tZXJnZUZpcnN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbWFnZVVubWVyZ2VGaXJzdFwiKTtcblx0dmFyIGltYWdlQ29udGFpbmVyVW5tZXJnZVNlY29uZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW1hZ2VVbm1lcmdlU2Vjb25kXCIpO1xuXG4gXHR2YXIgYnRuRG93bkZpcnN0ID0gbmV3IERvd25sb2FkQnV0dG9uKCBpbWFnZUNvbnRhaW5lclVubWVyZ2VGaXJzdC5pZCk7XG5cdHZhciBidG5Eb3duU2Vjb25kID0gbmV3IERvd25sb2FkQnV0dG9uKGltYWdlQ29udGFpbmVyVW5tZXJnZVNlY29uZC5pZCk7XG5cblx0aW5pdCgpO1xuXHRidG5Eb3duU2Vjb25kLmhpZGUoKTtcblx0YnRuRG93bkZpcnN0LmhpZGUoKTtcblxuXHRmdW5jdGlvbiBpbml0KCkge1xuXG5cdFx0dmFyIFNpbmdsZUltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJTaW5nbGVJbWFnZUNvbnRhaW5lclwiKTtcblx0XHR2YXIgVW5tZXJnZUJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuVW5tZXJnZUNvbnRhaW5lclwiKTtcblx0XHR2YXIgaWRSZWZyZXNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWZyZXNoQnRuXCIpO1xuXHRcdHZhciByZWZyZXNoQnRuID0gbmV3IFJlZnJlc2hCdXR0b24oaWRSZWZyZXNoKTtcblxuXHRcdGluaXRJbWFnZVVwbG9hZChTaW5nbGVJbWFnZSk7XG5cdCBcdGluaXRVbm1lcmdlQnV0dG9uKFVubWVyZ2VCdXR0b25Db250YWluZXIpO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBpbml0SW1hZ2VVcGxvYWQoc2luZ2xlSW1hZ2UpIHtcblx0XHR2YXIgaW1hZ2VVcGxvYWRDb250YWluZXJTaW5nbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXG5cdFx0aW1hZ2VVcGxvYWRDb250YWluZXJTaW5nbGUuY2xhc3NOYW1lID0gXCJpbWFnZS11cGxvYWRcIjtcblx0XHRpbWFnZVVwbG9hZFNpbmdsZSA9IG5ldyBJbWFnZVVwbG9hZChpbWFnZVVwbG9hZENvbnRhaW5lclNpbmdsZSwgXCJzaW5nbGVcIik7XG5cblx0XHRzaW5nbGVJbWFnZS5hcHBlbmRDaGlsZChpbWFnZVVwbG9hZENvbnRhaW5lclNpbmdsZSk7XG5cblx0XHRpbWFnZVVwbG9hZFNpbmdsZS5pbml0VXBsb2FkQnV0dG9ucygpO1xuXG5cdFx0dmFyIEVycm9yQm94U2luZ2xlSW1hZ2UgPSBuZXcgRXJyb3JCb3goaW1hZ2VVcGxvYWRDb250YWluZXJTaW5nbGUpO1xuXHRcdEVycm9yQm94U2luZ2xlSW1hZ2UuaW5pdCgpO1xuXG5cdFx0aW1hZ2VVcGxvYWRTaW5nbGUub25JbWFnZVVwbG9hZCA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1x0XHQgXG5cdFx0XHRpbWFnZVRpbWVzTG9hZGVkICs9IDE7XG5cblx0XHRcdGlmKGltYWdlVGltZXNMb2FkZWQgPT09IDEpIHtcblx0XHRcdFx0aW1hZ2VEYXRhU2luZ2xlID0gaW1hZ2VEYXRhO1xuXHRcdFx0XHRvbkltYWdlc0xvYWRlZCgpO1xuXHRcdFx0fSBlbHNlIGlmKGltYWdlVGltZXNMb2FkZWQgPT09Mikge1xuXHRcdFx0XHRpbWFnZURhdGFTaW5nbGUgPSBpbWFnZURhdGE7XG5cdFx0XHRcdGltYWdlVGltZXNMb2FkZWQgPSAxO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRpbWFnZVVwbG9hZFNpbmdsZS5vblNpemVzUmVjaWV2ZWQgPSBmdW5jdGlvbihzaXplcykge1xuXHRcdFx0c2l6ZXNTaW5nbGUgPSBzaXplcztcblx0XHR9OyBcblxuXHRcdGltYWdlVXBsb2FkU2luZ2xlLm9uRXJyb3JNZXNzYWdlUmVjZWl2ZWQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0XHRpZihtZXNzYWdlID09PVwiT0tcIikge1xuXHRcdFx0XHRFcnJvckJveFNpbmdsZUltYWdlLmNsZWFyKCk7XG5cdFx0XHR9IGVsc2Uge1x0XHQgXHQgXG5cdFx0XHRcdEVycm9yQm94U2luZ2xlSW1hZ2Uuc2V0TWVzc2FnZShtZXNzYWdlKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gb25JbWFnZXNMb2FkZWQoKSB7XG5cdFx0XHRpZiAoaW1hZ2VUaW1lc0xvYWRlZCA9PT0gMSkge1xuXHRcdFx0XHR1bm1lcmdlQnV0dG9uLmFjdGl2YXRlKCk7XG5cdFx0XHRcdGJ0blVubWVyZ2VPbiA9IHRydWU7XG5cdFx0XHRcdGltYWdlVGltZXNMb2FkZWQgPSAwO1x0XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0fSBcblx0fVxuXG5cdGZ1bmN0aW9uIGluaXRVbm1lcmdlQnV0dG9uKGNvbnRhaW5lcikge1x0XHRcblx0XHR1bm1lcmdlQnV0dG9uID0gbmV3IFVubWVyZ2VCdXR0b24oY29udGFpbmVyKTtcblxuXHRcdGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoYnRuVW5tZXJnZU9uKSB7XHRcdCBcblx0XHRcdFx0XHRpbml0SW1hZ2VVbm1lcmdlcihpbWFnZURhdGFTaW5nbGUsIHNpemVzU2luZ2xlKTtcdFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aW1hZ2VUaW1lc0xvYWRlZCA9IDA7XG5cdFx0XHR9XHRcdFx0IFx0XHRcdFx0XHRcdFx0XG5cdFx0fSk7XG4gXHR9XG4gXG5cdGZ1bmN0aW9uIGluaXRJbWFnZVVubWVyZ2VyKGltYWdlRGF0YVNpbmdsZSwgc2l6ZXMpIHtcblx0XHR2YXIgaW1hZ2VVbm1lcmdlciA9IG5ldyBJbWFnZVVubWVyZ2VyKGltYWdlRGF0YVNpbmdsZSwgc2l6ZXMpO1xuXHRcdHZhciB1bm1lcmdlZEFycmF5ID0gaW1hZ2VVbm1lcmdlci51bm1lcmdlKCk7XG5cdFx0aW5pdFVubWVyZ2VWaWV3KHVubWVyZ2VkQXJyYXksIHNpemVzKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGluaXRVbm1lcmdlVmlldyh1bm1lcmdlZEFycmF5LCBzaXplc0ZpcnN0KSB7XG5cdFx0Y2xlYW5Vbm1lcmdlZFZpZXcoaW1hZ2VDb250YWluZXJVbm1lcmdlRmlyc3QpO1xuXHRcdGNsZWFuVW5tZXJnZWRWaWV3KGltYWdlQ29udGFpbmVyVW5tZXJnZVNlY29uZCk7XG5cblx0XHRvdXRwdXRVbm1lcmdlVmlld0ZpcnN0ID0gbmV3IEltYWdlVmlld2VyKGltYWdlQ29udGFpbmVyVW5tZXJnZUZpcnN0LCBzaXplc0ZpcnN0KTtcblx0XHRvdXRwdXRVbm1lcmdlVmlld1NlY29uZD0gbmV3IEltYWdlVmlld2VyKGltYWdlQ29udGFpbmVyVW5tZXJnZVNlY29uZCwgc2l6ZXNGaXJzdCk7XG5cblx0ICAgIG91dHB1dFVubWVyZ2VWaWV3Rmlyc3Quc2V0RmluYWwodW5tZXJnZWRBcnJheVswXSk7XG5cdFx0b3V0cHV0VW5tZXJnZVZpZXdTZWNvbmQuc2V0RmluYWwodW5tZXJnZWRBcnJheVsxXSk7XG5cblx0XHR2YXIgY2FudmFzVW5tZXJnZWRGaXJzdCA9IG91dHB1dFVubWVyZ2VWaWV3Rmlyc3QuZ2V0Q2FudmFzKCk7XG5cdFx0dmFyIGNhbnZhc1VubWVyZ2VkU2Vjb25kID0gb3V0cHV0VW5tZXJnZVZpZXdTZWNvbmQuZ2V0Q2FudmFzKCk7XG4gXHRcbiBcdFx0YnRuRG93bkZpcnN0LnNldENhbnZhcyhjYW52YXNVbm1lcmdlZEZpcnN0KTtcbiBcdFx0YnRuRG93blNlY29uZC5zZXRDYW52YXMoY2FudmFzVW5tZXJnZWRTZWNvbmQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gY2xlYW5Vbm1lcmdlZFZpZXcoY29udGFpbmVyKSB7XG5cdFx0dmFyIGNoaWxkTm9kZXMgPSBjb250YWluZXIuY2hpbGROb2Rlcztcblx0XHR2YXIgaTtcblx0XHRmb3IoaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZihjaGlsZE5vZGVzW2ldLnRhZ05hbWUgPT09IFwiQ0FOVkFTXCIpIHtcblx0XHRcdFx0Y29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5jaGlsZE5vZGVzW2ldKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBVbm1lcmdlQ29udHJvbGxlcjsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEltYWdlU2l6ZSA9IHJlcXVpcmUoXCIuL0ltYWdlU2l6ZVwiKTtcblxuZnVuY3Rpb24gVXJsUmVhZGVyKGNvbnRhaW5lciwgdXJsTGluaykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBcbiAgICB0aGlzLm9uSW1hZ2VSZWNlaXZlZCA9IGZ1bmN0aW9uKCkge307XG4gICAgdGhpcy5vblNpemVSZWNpZXZlZCA9IGZ1bmN0aW9uKCkge307XG4gICAgdGhpcy5vbkVycm9yTWVzc2FnZVJlY2VpdmVkID0gZnVuY3Rpb24oKSB7fTtcblxuICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciByZWFkZXIsIGNhbnZhcywgY3R4O1xuICAgIFx0dmFyIHVybEZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICB1cmxGaWVsZC5wbGFjZWhvbGRlciA9IFwiUGFzdGUgYW4gdXJsLi4uXCI7XG4gICAgICAgIHZhciB1cmxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgICAgICB1cmxCdG4uaW5uZXJIVE1MID0gXCJVcGxvYWRcIjtcbiAgICAgICAgdXJsQnRuLmNvbnRlbnRUZXh0ID0gXCJVcGxvYWRcIjtcblxuICAgIFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHVybEZpZWxkKTtcbiAgIFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQodXJsQnRuKTsgXG4gICAgICAgIC8vaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9zLmNkcG4uaW8vMy9waWUucG5nIFxuICAgICAgICAvL2h0dHA6Ly8xLmJwLmJsb2dzcG90LmNvbS8tUWZVaXMzLXRMaFEvVVJLUXE1ZXNIdkkvQUFBQUFBQUFBQzQvTXhzRFg0Z3NURXcvczE2MDAvZHluYW1pYzAxLnBuZ1xuICAgICAgICB1cmxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZih1cmxGaWVsZC52YWx1ZSAhPT0gXCJcIikge1xuXHQgICAgICAgICAgICB2YXIgdXJsID0gdXJsRmllbGQudmFsdWU7XG4gICAgICAgICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7ICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZCh1cmxGaWVsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKHVybEJ0bik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25FcnJvck1lc3NhZ2VSZWNlaXZlZChcIk9LXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLDAsMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25JbWFnZVJlY2VpdmVkKGltYWdlRGF0YSk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2l6ZXMgPSBuZXcgSW1hZ2VTaXplKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25TaXplUmVjaWV2ZWQoc2l6ZXMpOyAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZy5jcm9zc09yaWdpbiA9IFwiQW5vbnltb3VzXCI7ICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcuc3JjID0gdXJsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVFcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHhoci5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgeGhyLnNlbmQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cdFx0XHRcdGFsZXJ0KFwiSW5wdXQgYSBsaW5rXCIpO1xuXHRcdFx0fVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAgICAgdGhhdC5vbkVycm9yTWVzc2FnZVJlY2VpdmVkKFwiVVJMIGlzIGludmFsaWQuXCIpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBVcmxSZWFkZXI7Il19
