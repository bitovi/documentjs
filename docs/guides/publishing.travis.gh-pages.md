@page DocumentJS.guides.publishing.travis.github-pages GitHub Pages
@parent DocumentJS.guides.travis

This guide will help you get set up to use TravisCI to automatically publish your site to your repository's gh-pages branch when the repository changes.

## Create the .travis.yml file
Be sure to customize the GH_REF to point to your repository.
```yml
language: node_js
node_js:
- '0.10'
script: npm run-script deploy
env:
 global:
 - GH_REF: github.com/<username>/<project-name>.git
```

The only thing missing from the above configuration is the secure token.  To create one you need to first create a Github token.  Go to your [Github Personal Access Tokens](https://github.com/settings/tokens) page, create a new token, and copy it to your clipboard.  You will now use this token to generate the encrypted token.

If you haven't done so already, install the `travis-encrypt` module using npm:
```console
npm install travis-encrypt -g
```

Now, to encrypt your new GitHub Personal Access Token, Open a new Terminal window **in the same folder** as your `.travis.yml` file and type the following command, replacing the information between brackets with the appropriate information.  `GH_TOKEN` portion of the command will become a global environment variable in the deploy script we create later.
```console
travis-encrypt -r [username/repo-name] GH_TOKEN=[personal access token] -add
```

Now check your `.travis.yml` file.  A `- secure` line should have been added to bottom of the global environment:
```yml
language: node_js
node_js:
- '0.10'
script: npm run-script deploy
env:
 global:
 - GH_REF: github.com/<username>/<project-name>.git
 - secure: <secure-token>
```

Your `.travis.yml` file has now been prepared with the environment variables needed for the deploy script.

## Prepare the package.json
In the script section of the `.travis.yml` file, above, you specified that you wanted to run `npm run-script deploy`.  You now need to set up your `package.json` file's "script" section with a "deploy" script.  Add the following to your package.json:

```json
"scripts": {
    "deploy": "./deploy-ghpages.sh"
},
```

## Create the deploy script
Since you named the deploy script `deploy-ghpages.sh`, you'll need to create that file, now.  Note, this script is currently only set to build from master.  It will need modifications in order to build from both the `master` and `documentjs` branches.
```console
#!/bin/bash
echo building with documentjs.
./node_modules/.bin/documentjs
rm -rf .git
(
echo initializing repo
 git init
 git config user.name "documentjs"
 git config user.email "documentjs@github.com"
echo adding files
 git add -A
echo committing changes
 git commit -m "Deployed to Github Pages"
echo pushing
 git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
)
```

Commit all of the above files to your repository and you'll enjoy automated DocumentJS builds to your repository's `gh-pages` branch.