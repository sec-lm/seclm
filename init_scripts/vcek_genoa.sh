#!/bin/bash
set -e

sudo $HOME/snpguest/target/release/snpguest certificates pem ./
sudo curl --proto '=https' --tlsv1.2 -sSf https://kdsintf.amd.com/vcek/v1/Genoa/cert_chain -o ./vcek_cert_chain.pem
openssl verify --CAfile ./vcek_cert_chain.pem vcek.pem
sudo $HOME/snpguest/target/release/snpguest verify attestation ./ report.bin
