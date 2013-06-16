(function(){

var hadSteal = true;

if(typeof steal === "undefined"){
	hadSteal = false;
	load('steal/rhino/rhino.js')
}

steal('steal','steal/build',function(steal){
	
	var builder = function(){
		
		steal.build("documentjs/site/static/build/static.js",{
			// have to send it here so paths to images work
			to: "documentjs/site/static/build"
		})
		
		// copy production.js and production.css
		steal.File("documentjs/site/static/dist/production.js")
			.save(readFile("documentjs/site/static/build/production.js"))
		
		steal.File("documentjs/site/static/dist/production.css")
			.save(readFile("documentjs/site/static/build/production.css"))
		
		
		// copy steal and html5shiv.js
		steal.File("documentjs/site/static/dist/steal.production.js")
			.save(readFile("steal/steal.production.js"))
		
		steal.File("documentjs/site/static/dist/html5shiv.js")
			.save(readFile("documentjs/site/static/build/html5shiv.js"))
		
		// copy fonts and images
		steal.URI("documentjs/site/static/dist/fonts").mkdirs();
		steal.URI("documentjs/site/static/dist/img").mkdirs();
		
		steal.URI("documentjs/site/static/build/fonts")
			.copyTo("documentjs/site/static/dist/fonts");
		steal.URI("documentjs/site/static/build/img")
			.copyTo("documentjs/site/static/dist/img")
		
	}
	
	if(!hadSteal){
		builder();
	}
	return builder;
	
})


})()