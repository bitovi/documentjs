@page DocumentJS.guides.publishing.travis Setting Up Travis
@parent DocumentJS.guides.travis

**[TravisCI](https://travis-ci.org/getting_started) is a Continuous Integration service that integrates with GitHub.  If you're not very familiar with it, read their short [Getting Started with Travis CI](https://travis-ci.org/getting_started) page before continuing.**  This guide also assumes that you already have a TravisCI account setup and that you have already enabled the service on [your Travis profile page](https://travis-ci.org/profile/) for the repository with which you are working.

Now that you have prepared your site for publishing by following the main [DocumentJS.guides.publishing publishing guide], it's time to automate the publishing process whenever changes are made to the repository.

Preparing a project to use Travis involves these steps:

## 1. Create the .travis.yml file
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

### Encrypting data in your .travis.yml file.
It's not a good idea to put sensitive data like passwords and auth tokens in plain sight inside your configuration files.  In order to prevent this from happening, Travis offers an encryption solution with the [travis-encrypt](https://www.npmjs.com/package/travis-encrypt) module.

You first install it globally:
```console
npm install travis-encrypt -g
```

To use it, you open a new Terminal window **in the same folder** as your `.travis.yml` file and type the following command, replacing the information between brackets with your repository's information.  

```console
travis-encrypt -r [username/repo-name] VAR_1=123 VAR_2=456 -add
```

You know it's successful when it reports a blob having been added to your .travis.yml file.  In the example above, the values in `VAR_1` and `VAR_2` will be encrypted and appended to the .travis.yml file.  When Travis runs the build process, the values will be decrypted and set up as variables in the build environment called `VAR_1` and `VAR_2`.

If you check your `.travis.yml` file after running the above command, you'll notice a line beginning with `- secure` has been added to bottom of the global environment:
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

This means that your `.travis.yml` file has now been prepared with the environment variables needed for the deploy script.

## 2. Prepare the package.json
In the script section of the `.travis.yml` file, above, you specified that you wanted to run `npm run-script deploy`.  You now need to set up your `package.json` file's "script" section with a "deploy" script.  Add the following to your package.json:

```json
"scripts": {
    "deploy": ". ./deploy.sh"
},
```

## 3. Create the deploy script
Each publishing destination will need a specific, custom deploy script.
In the package.json file, above, because you named the deploy script `deploy.sh`, you'll need to create a file with that exact name in order for the deploy step to work.  Examples of deploy scripts can be found in the other TravisCI guides.  You'll find them in the sidebar.