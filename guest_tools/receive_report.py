import socket

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect(("127.0.0.1", 9980))

with open("./report.bin", "wb") as f:
    while True:
        data = client_socket.recv(1024)
        if not data:
            break
        f.write(data)

client_socket.close()
