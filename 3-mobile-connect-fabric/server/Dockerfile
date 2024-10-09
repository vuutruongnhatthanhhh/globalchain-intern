FROM envoyproxy/envoy-dev:latest

COPY ./envoy.yaml /etc/envoy/envoy.yaml

ADD ./ca.crt /etc/envoy/ca.crt
ADD ./server.crt /etc/envoy/server.crt
ADD ./server.key /etc/envoy/server.key


CMD /usr/local/bin/envoy -c /etc/envoy/envoy.yaml -l trace --log-path /tmp/envoy_info.log
