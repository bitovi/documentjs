@page DocumentJS.guides.publishing.strider auto-publish with strider
@parent DocumentJS.publishing.linode 3

Set up the open-source Strider Continuous Integration server to automatically publish your site when changes are made to the repository.

## **What you'll need**

To complete this guide, you will need:

 - A [Linode](https://www.linode.com/) server.  Use Linode's [Getting Started](https://www.linode.com/docs/getting-started) tutorial.  Use the latest Ubuntu LTS release, or another distribution you prefer.
 - [Strider](http://stridercd.com) running on the server.  See this [tutorial](https://fosterelli.co/creating-a-private-ci-with-strider.html), starting at the heading "Bring the system up-to-date".
 - An [NginX](http://nginx.com/) web server installed on the same machine.  See this [tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-14-04-lts) for setup help on Ubuntu 14.04 LTS.
 - A MongoDB database.  You can set up a free sandbox database at Compose.io.  Once you've set up a database, add a database user from the "Users" tab, then get the MongoDB URI from the Admin tab and fill it in with your username and password.
 - SMTP (outgoing mail) server credentials.  Set up a free account at Mandrill and create an app on the [settings page](https://mandrillapp.com/settings/).
 - Create a GitHub application [Register a new OAuth Application](https://github.com/settings/applications/new) 

Here is a basic configuration you can use to set up virtual hosting in NginX.

```
server {
    listen   80;

    index index.html index.htm;

    server_name _;
    set $site_root /var/www/$host;

    root $site_root/public;

    location /release {
        alias $site_root/release;
        autoindex on;
    }
}
```


## **Add your project to Strider**

On the projects page, click "Manual Add":
<img src="http://i.imgur.com/GP1R2cb.png" alt="Manual Add" style="max-width:100%;">

Fill out the form with your project's details:
<img src="http://i.imgur.com/Mgvg11t.png" alt="Fill out the form" style="max-width:100%;">

Your project will appear in the list below the form. Click the wrench to configure it:
<img src="http://i.imgur.com/FMGsudg.png" alt="Click the wrench to configure your new site." style="max-width:100%;">

## **Configure the project**

On the `@Provider: GitHub` page, Click the `Add Service Hooks` button.
<img src="http://imgur.com/YIh6uP8.png" alt="Add GitHub Hooks." style="max-width:100%;">


On the `Branches` page, add gh-pages:
<img src="http://imgur.com/OS9q8Ct.png" alt="Add the gh-pages branch." style="max-width:100%;">


On the `Plugins` page, drag the `Custom Scripts` module and drop it below the `Node` module in the list on the left.
<img src="http://imgur.com/yY2CayF.png" alt="Enable Custom Scripts" style="max-width:100%;">

## **Add Custom Scripts**

Using the select box in the top left corner, make sure you're on the master branch, then open the `Custom Scripts` page and paste this code into the Deploy step:
```console
echo "Regenerating funcunit.com website"
cd ~/build/funcunit.com
node_modules/.bin/documentjs
rm -rf ~/www/funcunit.com/public
cp -R ~/build/funcunit.com ~/www/funcunit.com/public
```


Now switch to the gh-pages branch, open the `Custom Scripts` page and paste this code into the deploy step:
```console
echo "Removing build folders"
rm -rf ~/build/funcunit.com
echo "Copying canjs.com gh-pages to build directory"
cp -R $PWD ~/build/funcunit.com
echo "Rebuilding canjs.com and copying to publicly hosted folder"
cd ~/build/funcunit.com
node_modules/.bin/documentjs
rm -rf ~/www/funcunit.com/public
cp -R ~/build/funcunit.com ~/www/funcunit.com/public
```


## Test the configuration.
With the NginX configuration at the top of this page, you're ready to point your domain name to your web server.  If your domain name matches the folder name you put in the deploy scripts above, your site will be visible.



Push to either the `master` or `gh-pages` branch and your docs should automatically rebuild.

