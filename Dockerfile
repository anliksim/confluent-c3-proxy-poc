FROM nginx

COPY ./c3pro.conf /etc/nginx/conf.d/default.conf
COPY ./scripts /data/scripts
