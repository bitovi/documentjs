HOSTNAME="conductorjs"
FQDN="conductorjs.com"
ACCOUNTNAME="strider"
ACCOUNTPW="swains"
MONGODBURI="mongodb://strider:build-my-site11@c295.candidate.32.mongolayer.com:10295,candidate.33.mongolayer.com:10295/strider?replicaSet=set-53a9dd519941dfe469003c91"
GITHUBCLIENTID="e01127b746f514f365d2"
GITHUBCLIENTSECRET="75b1780910a4de5e1987f33fbe43fad3594d8504"
MANDRILLHOST="smtp.mandrillapp.com"
MANDRILLPORT=587
MANDRILLUSERNAME="marshall@creativeideal.net"
MANDRILLPASSWORD="CB748JlDpDO4Q_B65NBkWw"
IPADDR=$(/sbin/ifconfig eth0 | awk '/inet / { print $2 }' | sed 's/addr://')
apt-get update
apt-get upgrade -y < "/dev/null"
echo $HOSTNAME > /etc/hostname
hostname -F /etc/hostname
echo $IPADDR $FQDN $HOSTNAME >> /etc/hosts
apt-get install nodejs -y  < "/dev/null"
apt-get install npm -y  < "/dev/null"
echo 'export NODE_ENV=production' >> /home/$ACCOUNTNAME/.bashrc
ln -s /usr/bin/nodejs /usr/bin/node
npm install n -g
n latest
apt-get install git -y < "/dev/null"
useradd -p $(openssl passwd -1 $ACCOUNTPW) $ACCOUNTNAME
gpasswd -a $ACCOUNTNAME sudo
mkdir /home/$ACCOUNTNAME         
cp /etc/skel/* /home/$ACCOUNTNAME      
chown -R $ACCOUNTNAME:$ACCOUNTNAME /home/$ACCOUNTNAME
su - $ACCOUNTNAME


ACCOUNTNAME="strider"
ACCOUNTPW="swains"
echo $ACCOUNTPW | sudo -S apt-get install nginx -y
cd /etc/nginx
sudo curl https://gist.githubusercontent.com/marshallswain/984c05ef50423a1a279c/raw/04b3daed435e2536db113925a4f7bd3066ee6355/nginx.conf -O
cd ~
git clone https://github.com/Strider-CD/strider.git strider
cd strider
npm install
exit

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

start strider