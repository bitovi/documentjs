load('jmvcdoc/scripts/build.js');
new steal.File("jmvcdoc/production.js").copyTo("documentjs/jmvcdoc/production.js");
new steal.File("jmvcdoc/style.css").copyTo("documentjs/jmvcdoc/style.css");
new steal.File("jmvcdoc/summary.ejs").copyTo("documentjs/jmvcdoc/summary.ejs");

new steal.File("jmvcdoc/images").copyTo("documentjs/jmvcdoc/images");
