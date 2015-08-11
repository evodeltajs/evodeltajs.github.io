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