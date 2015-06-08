@page home
@hide sidebar
@hide title
@hide footer
@hide container
@hide article
@body

<section style="width: 800px; margin:100px auto 20px auto; overflow:hidden;">
<div style="border-right: 1px solid #ccc; padding-right:20px; margin-right:50px; float:left;">
<img src="theme/docjs-landing-page-logo.png" alt="StealJS Logo" />
</div>	
<div style="float:left; width: 320px; padding-top: 36px;">
<p style="-webkit-font-smoothing: antialiased; font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; font-weight: 300; ">Sophisticated JavaScript documentation engine. Create beautiful, articulate, multi-versioned documentation.
<br><small>(new site coming soon)</small></p>
</div>
</section>
<section style="width: 800px; margin:0 auto; overflow:hidden;">
<p>Install</p>
<pre> > npm install documentjs -S</pre>
</section>	

<section style="width: 800px; margin:0 auto; overflow:hidden;">

Configure [documentjs.json](/docs/DocumentJS.docConfig.html)

```
{
  "sites": {
    "docs": {
      "glob" : "**/*.{js,md}"
    }
  }
}
```

</section>	
<section style="width: 800px; margin:0 auto; overflow:hidden;">

Document with [tags](/docs/documentjs.tags.html)

```
/**
 * @module {function(new:lib/graph)} lib/graph
 * 
 * @signature `new Graph(graphData)`
 * @param {Object} graphData
 * @return {lib/graph}
 */
function Graph(graphData){ … }
/**
 * @prototype
 */
Graph.prototype = {
    /**
     * Converts the graph to a chart.
     * @param {String} type
     */
    toChart: function(type){ ... }
};
module.exports = Graph;
```

</section>	
<section style="width: 800px; margin:0 auto; overflow:hidden;">

[Generate your docs](/docs/DocumentJS.apis.generate.documentjs.html) and watch for changes

```
> ./node_modules/.bin/documentjs --watch
```

</section>