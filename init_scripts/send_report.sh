#!/bin/bash
set -e

export SECLM_TMP_PORT=80

sudo setcap 'cap_net_bind_service=+ep' `which python3.10`

curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/sec-lm/snp-tools/72fd7d38ff2b5afe89730ae207f5aad1e2935445/guest_tools/send_report.py | python3

unset SECLM_TMP_PORT
