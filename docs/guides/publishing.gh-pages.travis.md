@page DocumentJS.guides.publishing.github-pages auto-publish with travis
@parent DocumentJS.publishing.gh-pages 1

#### Learn how to automatically publish to GitHub Pages using TravisCI.

Before you try to start this section, complete the [DocumentJS.guides.publishing.start Getting Started] section.

It's time to automate the publishing process.  In this guide, you are going to learn how to set up the free service TravisCI to integrate with your GitHub repository and automatically publish a new version of your site whenever there is a change made to one of the branches.

## **Set up TravisCI**

**[TravisCI](https://travis-ci.org/getting_started) is a Continuous Integration service that integrates with GitHub.  If you're not very familiar with it, read their short [Getting Started with Travis CI](https://travis-ci.org/getting_started) page before continuing.**  It is also assumed that you already have a TravisCI account and that you have already enabled the service on [your Travis profile page](https://travis-ci.org/profile/) for the repository with which you are working.


## **Create a `.travis.yml` file**
Travis follows instructions found in `.travis.yml` files in the root of your project.  In order to publish, we need to first create this file.  Below is an example.  Custom environment variables may need to be set depending on the publish destination you decide to use.

```yml
language: node_js
node_js:
- '0.10'
script: npm run-script deploy
env:
 global:
 - GH_REF: github.com/<username>/<project-name>.git
```

### Encrypt your password in your .travis.yml file.
It's not a good idea to put sensitive data like passwords and auth tokens in plain text anywhere.  In order to prevent this from happening, Travis offers an encryption solution with the [travis-encrypt](https://www.npmjs.com/package/travis-encrypt) module.

You first install it globally:
```console
npm install travis-encrypt -g
```

To use it, you open a new Terminal window **in the same folder** as your `.travis.yml` file and type the following command, replacing the information between brackets with your repository's information.

```console
travis-encrypt -r [username/repo-name] GH_TOKEN=[personal access token] -add
```

You know it's successful when the console reports a blob having been added to your `.travis.yml` file.  Behind the scenes, the travis-encrypt module took the [personal access token] and set it up as the `GH_TOKEN` environment variable, all encrypted into one string that is only decipherable to Travis.  Now, if you open `.travis.yml` you'll notice that a line beginning with `- secure` has been added to bottom of the global environment:
```yml
language: node_js
node_js:
- '0.10'
script: npm run-script deploy
env:
 global:
 - GH_REF: github.com/<username>/<project-name>.git
 - secure: <encrypted-token>
```

With your `.travis.yml` prepared, you are now ready to setup and create the deploy script.


## **Setup the `package.json` to use a deploy script**
In the script section of the `.travis.yml` file, above, you specified that you wanted to run `npm run-script deploy`.  You now need to set up your `package.json` file's "script" section with a "deploy" script.  Add the following to your package.json:

```json
"scripts": {
    "deploy": ". ./deploy.sh"
},
```


## **Create the `master` branch's deploy script**
Create a file called `deploy.sh` in your project's root folder.  It's important that the filename you put in your `package.json` exactly matches the filename in order for the deploy step to work.

Copy and paste this script into your new `deploy.sh` file and customize .

```console
#!/bin/bash

# Use documentjs to build the docs from the master branch.
echo building with documentjs.
./node_modules/.bin/documentjs master

rm -rf .git
(
echo deploying to gh-pages
 git init
 git config user.name "documentjs"
 git config user.email "documentjs@github.com"
 git add -A
 git commit -m "Deployed to Github Pages"
 git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
)
```

Commit all of the above files to your repository and you'll enjoy automated DocumentJS builds to your repository's `gh-pages` branch.

## **Set up the documentation branch**
To set up the documentation branch: 
 - Create a travis.yml file identical to the one you created above.
 - Setup the documentation branch's package.json in the same way you did above.
 - Create a `deploy.sh` file with the following script (don't forget to customize the name and email):

 ```console
 #!/bin/bash

 # Use documentjs to build the docs from the master branch.
 echo building with documentjs.
 ./node_modules/.bin/documentjs master

 rm -rf .git
 (
 echo deploying to gh-pages
  git init
  git config user.name "documentjs"
  git config user.email "documentjs@github.com"
  git add -A
  git commit -m "Deployed to Github Pages"
  git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
 )
 ```


### **Publish**
Your work is done.  TravisCI will handle things from here forward.  Every time you push to any branch of your repository, Travis will run the above scripts and deploy your site to GitHub Pages.