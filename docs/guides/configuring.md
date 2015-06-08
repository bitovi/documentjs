@page DocumentJS.guides.configuring configuring
@parent DocumentJS.guides 1

Learn how to configure `documentjs.json` for your project.

@body

A `documentjs.json` file in the root folder of your project is used to configure your project's documentation. The [DocumentJS.docConfig docConfig API] specifies the high-level structure and options allowed in the `documentjs.json` file. There are a lot of options.  This guide shows you the two most common setups.

Before you get started with either setup option, make sure you have DocumentJS [DocumentJS.guides.installing installed] as an npm dependency in your master branch:

```console
npm install documentjs --save-dev
```


## Configuring for multiple versions

This workflow allows you to keep multiple sets of documentation for different versions your project.  If you're following, for example, [Semantic Versioning](http://semver.org/), and you want to give users the ability to see documentation for previous versions of your project, this section will show you how to get going.  You will first setup the code of your project to be documented in your git repository's master branch.  Then, you'll create a separate, empty branch to download and document that code.

### **Create a `documentjs.json` in your project's root folder.**

Specify a [DocumentJS.siteConfig site] that will find your project's
documented files and generate them within a folder. The following will get all `.md` and `.js` files in the `lib` and `docs` folders and put them in an `api` folder next to your project's folder:

```json
{
	"sites": {
		"api": {
			"glob": "{lib,docs}/**/*.{js,md}"
		}
	}
}
```

With the above configuration in place, if you run [DocumentJS.apis.generate.documentjs documentjs] in your project's root directory, an "api" folder with some generated html files will be created **in your project's parent directory**. Go ahead and open the index.html page to see what the output looks like.

```console
./node_modules/.bin/documentjs  #run the documentjs installed your project's node_modules folder
cd ../api
open index.html
```

Make sure to commit and push your project's `documentjs.json` file.

### **Create and clone a documentation branch**

A separate branch will be used to hold your site's template files, styles, and generated documentation pages.  What you want to name this branch will depend on where you plan to publish your documentation.  If you plan on hosting your site on GitHub pages, name the branch `gh-pages`; otherwise, name it something else (e.g. `docs`).  **This guide will refer to this separate branch as your documentation branch.**

In a terminal window in the root of your master branch, run:

```console
git checkout --orphan docs #if publishing to GitHub Pages, call it gh-pages
```

Remove files not needed in the static site. Commit and push the branch:

```console
git rm -rf .
touch documentjs.json
git add documentjs.json
git commit -m "first commit"
git push origin docs       #if publishing to GitHub Pages, call it gh-pages
```

Now, `cd ..` into your project's parent folder so you can clone the new branch into a separate folder.:

```console
git clone -b docs git://github.com/org/project project.com  #If you'll be publishing to Github Pages, replace 'docs' with 'gh-pages'.
cd project.com
```

### **Install DocumentJS as an npm dependency**

In your documentation branch, DocumentJS will need to be listed as a devDependency in your package.json.  Run the following command to accomplish this:

```console
npm install documentjs --save-dev
```

### **Create a `documentjs.json` in your documentation branch.**

Your documentation branch will need its own `documentjs.json` file.  Create one, listing the version number of your project and the branch where you added the first `documentjs.json`:

```json
{
	"versions": {
		"1.0.0": "git://github.com/org/project-name#master"
	}
}
```

This configures DocumentJS to download the contents of your `master` branch into your documentation branch (placed in a folder at _/1.0.0/project-name_) and then run its `documentjs.json`, creating _project.com/1.0.0/api/index.html_.  

For stable linking and SEO, you likely want your most recent production documentation in the same place.  For example, you might always want the latest production API docs at _project.com/api/index.html_.  The `defaultVersion` lets you specify a version that should get put in that location.  Set it to the version number of your project:

```json
{
	"versions": {
		"1.0.0": "git://github.com/org/project#master"
	},
	"defaultVersion": "1.0.0"
}
```

Checkout the [DocumentJS.docConfig docConfig API] for information on how to change the location of the default version, change the location of other versions, and add other behaviors.

### **Generate the docs.**

Use [DocumentJS.apis.generate.documentjs documentjs] to generate 
the docs:

```console
./node_modules/.bin/documentjs
```

The above command will download all versions and generate their docs. This isn't ideal if you are trying to document a single version.  You would have to commit and push to your master branch to see changes.  During development, it's more convenient to see the changes without having to push changes to the master branch.  You can use the command below to build a specific version from the local file system.

```console
project.com> node_modules/.bin/documentjs 1.0.0@../documentjs
```

This will use the local documentjs folder as the 1.0.0 version.

## Configuring for a simple single version.

Coming soon.