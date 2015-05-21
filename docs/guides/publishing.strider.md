@page DocumentJS.guides.publishing.strider Local Web Server
@parent DocumentJS.guides.strider

Set up the open-source Strider Continuous Integration server to automatically publish your site when changes are made to the repository.

This guide gives an example of using Strider to publish to an NginX web server.  It is assumed that you have already setup a server with [Strider](https://github.com/Strider-CD/strider) and [NginX](http://wiki.nginx.org/Main) with a minimal configuration for virtual hosts.  Below is a basic, minimal NginX setup.

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

