#!/bin/bash
set -e

EMAIL=$1
DOMAIN_NAME=$2

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install socat -yq
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/socat

git clone https://github.com/acmesh-official/acme.sh.git
pushd acme.sh
git checkout 377a37e4c9c23bb6988fe5f8863f21b19d3e3a40
./acme.sh --register-account -m $EMAIL
./acme.sh --issue --standalone -d $DOMAIN_NAME
./acme.sh --install-cert -d $DOMAIN_NAME --key-file $HOME/key.pem --fullchain-file $HOME/fullchain.pem
popd

openssl x509 -in fullchain.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256
openssl x509 -in fullchain.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary > request-file.bin
dd if=/dev/zero bs=1 count=32 >> request-file.bin
sudo $HOME/snpguest/target/release/snpguest report report.bin request-file.bin
