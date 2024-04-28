import socket
import os

HF_TOKEN = os.environ["HF_TOKEN"]

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect(("127.0.0.1", 9980))
client_socket.sendall(HF_TOKEN.encode("utf-8"))
client_socket.close()
