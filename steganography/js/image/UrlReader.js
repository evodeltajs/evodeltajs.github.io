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