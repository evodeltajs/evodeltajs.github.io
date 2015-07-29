var ImageDefaultSize = ns.ImageDefaultSize;

function ImageReader(container) {
    var that = this;

	this.onImageReceived = function() {};

	this.init = function() {

		var inputElement = document.createElement("input");
		inputElement.setAttribute("type", "file");
        container.appendChild(inputElement);

        var btnElement = document.createElement("button");
        btnElement.type = "button";
        btnElement.innerText = "Load";
        btnElement.addEventListener("click", handleFiles);
        container.appendChild(btnElement);

        var reader, canvas, ctx;
 
        function handleFiles(ev) {

            var file = inputElement.files[0];

            if (file) {
                reader = new FileReader();

                canvas = document.createElement("canvas");
                canvas.width = ImageDefaultSize;
                canvas.height = ImageDefaultSize;

                ctx = canvas.getContext("2d");

                reader.onload = function(event) {

                    var img = new Image();
                    img.onload = function() {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img,0,0);

                        var imageData = ctx.getImageData(0, 0, img.width, img.height);
                        that.onImageReceived(imageData);
                    };

                    img.src = event.target.result;
                };

                reader.readAsDataURL(file);
            }
        }
    };
}

ns.ImageReader = ImageReader;