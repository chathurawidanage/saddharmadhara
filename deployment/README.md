## Components

```
     ┌─────────┐                                ┌──────────┐
     │         │                                │          │
     │         │                                │          │
     │         │                                │          │
     └─────────┘                                └──────────┘
      PostgreSQL                                    MySQL
          ▲                                           ▲
          │                                           │
          │                                           │
          │                                           │
     ┌────┴────┐            ┌─────────┐         ┌─────┴────┐
     │         │            │         │         │          │
     │         │◄───────────┤         │         │          │
     │         │            │         │         │          │
     └─────────┘            └─────────┘         └──────────┘

        DHIS2           Application Backend     Main Website
                                 ▲
                                 │
                                 │
                                 │
                           ┌─────┴────┐
                           │          │
                           │          │
                           │          │
                           └──────────┘
                            Application

──────────────────────────────────────────────────────────────────


                           ┌──────────┐
                           │          │
                           │          │
                           │          │
                           └──────────┘
                               Nginx
```

### DHIS2

[DHIS2](https://dhis2.org/) is deployed as `dhis2` user on `tomcat9`. The deployment follows the [DHIS2 official deployment guide](https://docs.dhis2.org/en/manage/performing-system-administration/dhis-core-version-master/installation.html).

DHIS2 is served via the `manager` subdomain.

### PostgreSQL

DHIS2 is backed by Postgresql. PostgreSQL installation is done based on the recommendations in the [DHIS2 official deployment guide](https://docs.dhis2.org/en/manage/performing-system-administration/dhis-core-version-master/installation.html).

### Nginx

Nginx is used as the webserver and the proxy. Configurations of Nginx can be found in the `nginx` folder.

Nginx serves following components

- The Yogi Application
- Yogi Application backend
- DHI2
- Main Wordpress website
- Monit

### Wordpress

The main website https://srisambuddhamission.org/ runs on Wordpress. Wordpress has been configured with Nginx based on [this guide](https://www.ionos.com/digitalguide/hosting/blogs/wordpress-nginx/).

### MySQL

Wordpress uses MySQL as the database.

### Yogi Application

Yogi application is a React app based on the SurveyJS app. Application is served via the `application` subdomain.

### Yogi Application backend

Yogi application backend is a wrapper for DHIS2 API to perform some complex operations and make some endpoints publicly accessible. Backend is a NodeJS application and deployed with `pm2`.

Application is served via the `application` subdomain and `/api` path.

> **_NOTE:_** DHIS2 doesn't support MySQL and Wordpress doesn't support PostgreSQL. Hence the two DB servers.

## Monitoring

The deployment uses [monit](https://mmonit.com/monit/) for monitoring and configurations for monitoring can be found in the `monit` folder.

Monit is served via the `monit` subdomain.
