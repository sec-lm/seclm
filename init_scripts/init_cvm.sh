#!/bin/bash
set -e

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install linux-modules-extra-`uname -r` -yq
sudo modprobe sev-guest
sudo DEBIAN_FRONTEND=noninteractive apt-get install build-essential pkg-config libssl-dev -yq

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env
git clone https://github.com/virtee/snpguest.git
pushd snpguest
git checkout c47fa2800d173741d5a3fe82c0d5d1d7016f621b
cargo build -q -r
popd
sudo $HOME/snpguest/target/release/snpguest report report.bin request-file-random.txt --random
