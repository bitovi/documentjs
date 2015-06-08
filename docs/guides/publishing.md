@parent DocumentJS.guides 5
@page DocumentJS.guides.publishing publishing

@group DocumentJS.publishing.gh-pages 3 GitHub Pages
@group DocumentJS.publishing.linode 4 Linode VPS

@description Learn how to publish your DocumentJS site.

@body

Now that you have [DocumentJS.guides.configuring configured] your project and [DocumentJS.guides.documenting documented] your master branch, you're ready to publish.  

There are two methods available for publishing: 
 - **Manual publishing**, where _you_ push to hosting options like [GitHub Pages](https://pages.github.com/).
 - **Automated publishing**, which uses a continuous deployment tool to automatically perform the manual publishing steps for you.
 
It is recommended that you first follow the steps on this page, which will show you how to manually publish and the basic prerequisites for publishing to any location.  After that, you'll be ready to select an "auto-publish" option from options available in the sidebar.

## Create a home page

To prepare for adding a home page to your documentation branch, add a `sites` property to your `documentjs.json` as shown below.

```json
{
    "versions": {
        "1.0.0": "git://github.com/org/project#master"
    },
    "defaultVersion": "1.0.0",
    
    // Add a "pages" site to your documentation branch's configuration:
    "sites":{
        "pages":{
            "parent":"ProjectName",
            "glob": "_pages/**/*.md",
            "dest": "."
        }
    }
}
```

The above configuration set up your project to have a "site" called `home`. The `glob` property tells DocumentJS to look for any markdown files in the `_pages` folder.  The `"dest": "."` sets it up to publish what it finds into the root folder of your documentation branch.  See all available option in the [DocumentJS.siteConfig siteConfig API].

Create a file called `home.md` in the `_home` folder.  At the top of the file, add a [documentjs.tags.page @page] tag to name your page.  This will be something like `@page ProjectName Welcome to My Project`.  Below that, put any markdown or HTML content you want as your home page.  You can use other [documentjs.tags tags], like [documentjs.tags.hide @hide] to further customize the look of your home page.

## Build your site

In the console, run [DocumentJS.apis.generate.documentjs documentjs] to build the site.

```console
./node_modules/.bin/documentjs
```

Open the generated documentation to make sure everything looks ready for publishing.  If you open the main index.html, you'll see that the site has been built with the default template, which does not include a navigation menu in the top navbar.  To customize the way things look or add a custom navigation menu, see the [DocumentJS.guides.customizing customizing guide].

## Publish

Your site is ready for publishing.  If you're going to use GitHub pages, you can now push the generated documentation to the `gh-pages` branch on GitHub.

```console
git add -A
git commit -m "Deploy to Github Pages"
git push origin gh-pages
```

#### **Learn to how to automatically publish.**

At this point, you have learned everything you need to move on to automated publishing using a continuous deployment tool. To get started, choose a publishing destination from the sidebar.