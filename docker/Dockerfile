FROM node:22 as build

USER root
WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm --activate

COPY . .
COPY ./.env ./.env
RUN pnpm install
RUN pnpm run build

FROM nginx:stable

RUN apt update ; apt upgrade -y
RUN apt install -y git curl iputils-ping telnet supervisor haproxy
RUN apt autoremove -y ; apt clean ; apt autoclean

COPY docker/supervisor/supervisor.conf /etc/supervisor/conf.d/
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/health-check.conf /etc/nginx/conf.d/health-check.conf

WORKDIR /usr/share/nginx/html

COPY --chown=nginx:nginx --from=build /app/dist /usr/share/nginx/html

ENV TZ "Europe/Moscow"

CMD ["/usr/bin/supervisord"]

HEALTHCHECK --start-period=10s --interval=10s --timeout=5s --retries=3 CMD curl -f http://127.0.0.1:1000/health-check || exit 1

EXPOSE 3000