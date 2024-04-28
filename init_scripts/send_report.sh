#!/bin/bash
set -e

export SECLM_TMP_PORT=80

sudo setcap 'cap_net_bind_service=+ep' `which python3.10`

curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/sec-lm/snp-tools/896b7ff1743b868fe7f1921a5bc04f7d9f5fcd8c/guest_tools/send_report.py | python3

unset SECLM_TMP_PORT
