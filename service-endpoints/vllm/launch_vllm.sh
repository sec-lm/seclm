#!/bin/bash
set -e

MODEL_NAME=$1

source $HOME/anaconda3/etc/profile.d/conda.sh

conda create -n vllm python=3.11 -y
conda activate vllm
pip install vllm==0.4.1
pip install gradio==4.28.3 openai==1.23.6
pip install flash-attn==2.5.8

sudo setcap 'cap_net_bind_service=+ep' `which python3.11`

git clone https://github.com/sec-lm/llm-endpoint.git
pushd llm-endpoint
git checkout 72a69752b7b82f46f15af4c701c0d0fe92c6aaa8

pushd vllm

export SECLM_TMP_PORT=80

python vllm_openai_server.py \
    --port 443 \
    --model $MODEL_NAME \
    --disable-log-requests \
    --disable-log-stats \
    --ssl-keyfile $HOME/key.pem \
    --ssl-certfile $HOME/fullchain.pem

popd
popd
