#!/bin/bash
set -e

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install linux-modules-extra-`uname -r` -yq
sudo modprobe sev-guest
sudo DEBIAN_FRONTEND=noninteractive apt-get install build-essential pkg-config libssl-dev -yq

sudo DEBIAN_FRONTEND=noninteractive apt-get install linux-headers-`uname -r` -yq
sudo DEBIAN_FRONTEND=noninteractive apt-get install gcc-12 python3-pip -yq
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-12 12
sudo modprobe ecdsa_generic ecdh
wget -q https://developer.download.nvidia.com/compute/cuda/12.2.1/local_installers/cuda_12.2.1_535.86.10_linux.run
sudo sh cuda_12.2.1_535.86.10_linux.run -m=kernel-open --silent
rm cuda_12.2.1_535.86.10_linux.run
sudo nvidia-persistenced
nvidia-smi conf-compute -f
nvidia-smi conf-compute -grs
# sudo nvidia-smi conf-compute -srs 1
git clone https://github.com/NVIDIA/nvtrust.git
pushd nvtrust
git checkout 01e29a10d951bc18edfce21d98308be909d9b9dd
pushd guest_tools/gpu_verifiers/local_gpu_verifier
sudo python3 -m pip install --upgrade setuptools
sudo pip install -U pip
sudo pip3 install .
sudo python3 -m verifier.cc_admin
popd
popd
sudo rm -rf nvtrust
nvidia-smi conf-compute -grs

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env
git clone https://github.com/virtee/snpguest.git
pushd snpguest
git checkout c47fa2800d173741d5a3fe82c0d5d1d7016f621b
cargo build -q -r
popd
sudo $HOME/snpguest/target/release/snpguest report report.bin request-file-random.txt --random

wget -q https://repo.anaconda.com/archive/Anaconda3-2024.02-1-Linux-x86_64.sh
sh Anaconda3-2024.02-1-Linux-x86_64.sh -b
rm Anaconda3-2024.02-1-Linux-x86_64.sh
source $HOME/anaconda3/etc/profile.d/conda.sh

conda create -n nvtrust python=3.11 -y
conda activate nvtrust
git clone https://github.com/NVIDIA/nvtrust.git
pushd nvtrust
git checkout 01e29a10d951bc18edfce21d98308be909d9b9dd
pushd guest_tools/gpu_verifiers/local_gpu_verifier
pip install .
popd
pushd guest_tools/attestation_sdk
pip install .
popd
popd
conda deactivate
