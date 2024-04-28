import socket
import os

REPORT_FILE = os.path.expanduser("~/report.bin")

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(("0.0.0.0", int(os.environ["SECLM_TMP_PORT"])))
s.listen(1)

conn, addr = s.accept()
with open(REPORT_FILE, "rb") as f:
    data = f.read()
    conn.sendall(data)

conn.close()
s.close()
