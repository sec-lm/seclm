import socket
import os
import time

REPORT_FILE = os.path.expanduser("~/report.bin")

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
count = 0
while True:
    try:
        s.bind(("0.0.0.0", int(os.environ["SECLM_TMP_PORT"])))
        break
    except:
        time.sleep(5)
        print("Waiting...")
        count += 1
        if count > 60:
            raise

s.listen(1)

conn, addr = s.accept()
with open(REPORT_FILE, "rb") as f:
    data = f.read()
    conn.sendall(data)

conn.close()
s.close()
