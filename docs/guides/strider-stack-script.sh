#!/bin/bash
# This block defines the variables the user of the script needs to input
# when deploying using this script.
#
#
#<UDF name="hostname" label="The hostname for the new Linode.">
# HOSTNAME=
#
#<UDF name="fqdn" label="The new Linode's Fully Qualified Domain Name">
# FQDN=
#
#<UDF name="accountname" label="The name of the linux account that will be used to run Strider & NginX.">
# ACCOUNTNAME=
#
#<UDF name="accountpw" label="The password for the above linux account.">
# ACCOUNTPW=
#
#<UDF name="mongodburi" label="The full MongoDB URI.">
# MONGODBURI=
#
#<UDF name="githubclientid" label="GitHub App's Client ID">
# GITHUBCLIENTID=
#
#<UDF name="githubclientsecret" label="GitHub App's Client Secret ">
# GITHUBCLIENTSECRET=
#
#<UDF name="mandrillhost" label="Mandrill Host">
# MANDRILLHOST=
#
#<UDF name="mandrillport" label="Mandrill Port.">
# MANDRILLPORT=
#
#<UDF name="mandrillusername" label="Mandrill Username.">
# MANDRILLUSERNAME=
#
#<UDF name="mandrillpassword" label="Mandrill Password">
# MANDRILLPASSWORD=

# This sets the variable $IPADDR to the IP address the new Linode receives.
IPADDR=$(/sbin/ifconfig eth0 | awk '/inet / { print $2 }' | sed 's/addr://')

# This updates the packages on the system from the distribution repositories.
apt-get update
apt-get upgrade -y

# This section sets the hostname.
echo $HOSTNAME > /etc/hostname
hostname -F /etc/hostname

# This section sets the Fully Qualified Domain Name (FQDN) in the hosts file.
echo $IPADDR $FQDN $HOSTNAME >> /etc/hosts
#
#
# NEW USER SETUP
# 
# Set up a new user, so we don't run Strider or NginX as root.
useradd -p $(openssl passwd -1 $ACCOUNTPW) $ACCOUNTNAME
# useradd -p $(openssl passwd -1 swains) strider
# Add sudo priviliges to the above user.
gpasswd -a $ACCOUNTNAME sudo
# gpasswd -a strider sudo
# Switch to the newly-created account.
su - $ACCOUNTNAME
# su - strider
#
#
# NGINX SETUP AND CONFIGURATION
# 
# Install NginX.
echo $ACCOUNTPW | sudo -S apt-get install nginx -y
# echo swains | sudo -S apt-get install nginx -y
# Switch to the nginx configuration directory
cd /etc/nginx
# Replace the default nginx.conf with the one from this gist.
sudo curl https://gist.githubusercontent.com/marshallswain/984c05ef50423a1a279c/raw/04b3daed435e2536db113925a4f7bd3066ee6355/nginx.conf -O
# switch back to root user.
exit
#
#
# NODE.JS SETUP
# 
# Install Node.
apt-get install nodejs -y
# Install NPM.
apt-get install npm -y
# Set NODE_ENV to production
echo 'export NODE_ENV=production' >> /home/$ACCOUNTNAME/.bashrc
# echo 'export NODE_ENV=production' >> ~/.bashrc
# symlink "node" to "nodejs", since many tools require the "node" name to execute.
ln -s /usr/bin/nodejs /usr/bin/node
# Install n for version management.
npm install n -g
# Update to latest version of Node.js !!!this will probably be a fail point in the future!!!
n latest
#
#
# Install Git.
apt-get install git -y
#
#
# STRIDER SETUP
# 
# Install Strider.
cd ~
git clone https://github.com/Strider-CD/strider.git strider
cd strider
npm install

# Create the Strider start script
cat >/etc/init/strider.conf <<EOL
#!upstart
description "Strider upstart job"

start on startup
stop on shutdown

script
    exec sudo -u strider \
     NODE_ENV="production" DB_URI=$MONGODBURI SERVER_NAME="http://$FQDN" PLUGIN_GITHUB_APP_ID=$GITHUBAPPCLIENTID \
     PLUGIN_GITHUB_APP_SECRET=$GITHUBAPPCLIENTSECRET SMTP_HOST=$MANDRILLHOST SMTP_PORT=$MANDRILLPORT \
     SMTP_USER=$MANDRILLUSERNAME SMTP_PASS=$MANDRILLPASSWORD PORT=80 STRIDER_CLONE_DEST="/home/strider/builds/" \
     strider >> /var/log/strider.log 2>&1
end script

pre-start script
    echo "[`date -u +%Y-%m-%dT%T.%3NZ`] (sys) Starting" >> /var/log/strider.log
end script

pre-stop script
    rm /var/run/strider.pid
    echo "[`date -u +%Y-%m-%dT%T.%3NZ`] (sys) Stopping" >> /var/log/strider.log
end script
EOL





# DB_URI="mongodb://strider:build-my-site11@c295.candidate.32.mongolayer.com:10295,candidate.33.mongolayer.com:10295/strider?replicaSet=set-53a9dd519941dfe469003c91" bin/strider addUser
# DB_URI="mongodb://strider:build-my-site11@c295.candidate.32.mongolayer.com:10295,candidate.33.mongolayer.com:10295/strider?replicaSet=set-53a9dd519941dfe469003c91" PORT=80 SERVER_NAME="http://conductorjs.com" PLUGIN_GITHUB_APP_ID="e01127b746f514f365d2" PLUGIN_GITHUB_APP_SECRET="75b1780910a4de5e1987f33fbe43fad3594d8504" npm start