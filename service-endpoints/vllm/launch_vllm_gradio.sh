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

git clone https://github.com/sec-lm/seclm.git vllm
pushd vllm
git checkout c5a0239402257910609fb28b59a75ec47017422b

pushd service-endpoints/vllm

export SECLM_TMP_PORT=80

python vllm_openai_server.py \
    --port 8080 \
    --model $MODEL_NAME \
    --disable-log-requests \
    --disable-log-stats \
    2>&1 | tee openai_server.log &

while ! `cat openai_server.log | grep -q 'Uvicorn running on'`; do
    echo 'Waiting...'
    sleep 5
done

python vllm_gradio_openai_chatbot_webserver.py \
    -m $MODEL_NAME \
    --host 0.0.0.0 \
    --port 443 \
    --model-url http://127.0.0.1:8080/v1 \
    --stop-token-ids 128009,128001 \
    --ssl-keyfile $HOME/key.pem \
    --ssl-certfile $HOME/fullchain.pem

popd
popd
