@page DocumentJS.guides.publishing publishing
@parent DocumentJS.guides 5
@group DocumentJS.guides.travis 0 Travis CI
@group DocumentJS.guides.strider 1 Strider CI

Learn how to publish your DocumentJS site.  This guide will walk you through the steps necessary to prepare your site for publishing.  Once you've completed the preparation steps, you can select a publish method in the left sidebar to perform the final steps.

@body

## Prepare
Before you publish your site, you'll probably want to customize the generated output.  To keep the custom template files and generated documentation separate from your master branch, you'll need to set up your project using a two-branch approach.  This guide will use the setup from the [configuring](http://documentjs.com/docs/DocumentJS.guides.configuring.html) guide with one exception: **to allow automated publishing, the a branch called `documentjs` will be used instead of `gh-pages`.**  Let's go over what each branch should contain.

### Preparing the master branch.
The `master` branch should look something like this:
```
.
├── src   // or whatever your project's main folder is.
│   └── my-js-lib.js
│
├── docs  // or wherever you're putting your docs.
│   ├── setup-guide.md
│   └── something-else-guide.md
│
├── documentjs.json
├── package.json
└── README.md
```

The `documentjs.json` in master should look similar to what is below.  In this example, we're going to use all of the .js and .md files in the 'docs' and 'src' folders to build the docs.
```json
{
    "sites": {
        "docs": {
            "parent": "DocumentJS",
            "pageConfig": {"page":"docs"},
            "glob": "{docs,lib}/**/*.{js,md}"
        }
    }
}
```

### Preparing the documentjs branch
The `documentjs` branch (or any branch besides master) should look something like the example below.  You will be setting up the `_home` folder as the home page for the site. 
```
.
├── _home           // Name these whatever you want.
│   └── home.md
│
├── theme
│   ├── static      
│   │   ├──img      // contains custom logo and other images.
│   │   └──styles   // for overriding the default styles.
│   └── templates   // for changing the default HTML.
│
├── documentjs.json
└── package.json     // with documentjs listed as a dependency.
```

Here is an example of what the `documentjs.json` in the documentjs branch should look like.  The most important part is that you have the "home" site (it can be called anything you like) set up to publish to the root folder.  This is done using `"dest": "."`.  You can read about the `siteDefaults` in the [customizing](http://documentjs.com/docs/DocumentJS.guides.customizing.html) guide.
```js
{
    "versions": {
        "latest": "github.com/username/my-project#master"
    },
    "defaultVersion":"latest"
    "siteDefaults":{
        "static": "theme/static",
        "templates": "theme/templates"
    },
    "sites": {
        "home": {
            "glob": "_home/**/*.{js,md}",
            "dest": "."
        }
    }
}
```

With both branches fully setup, we are ready to build.

## Build

Open a terminal window in the root of the `documentjs` branch and run documentjs with the following command. (You might need to run `npm install`, first.)
```
./node_modules/.bin/documentjs
```
This will fetch the data from the repository in the documentjs branch's documentjs.json file and output the docs into the current folder.

In the current folder, you should now have an `index.html`, a `static` folder, and a folder for each "site" from the master branch.  Open the index.html file and make sure everything looks good. 

## Publish
If the built documentation looks good then you are ready to publish your site.  If you're planning on manually deploying to GitHub pages, at this point all you have to do is push the contents of the `documentjs` branch to the `gh-pages` branch of your GitHub repository.  You can access your GitHub pages site at `http://<username>.github.io/<repository-name>/`.

If you want to automate the process so that your published documentation is automatically updated when you change either the `master` branch or `documentjs` branch, follow one of the guides in the sidebar.

While you're publishing your DocumentJS site, if you run into problems or have other questions about building, feel free to come chat with us [on Gitter](https://gitter.im/bitovi/documentjs).