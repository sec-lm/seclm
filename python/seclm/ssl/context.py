from cryptography.x509 import load_pem_x509_certificate
from cryptography.hazmat.primitives import serialization
import hashlib
import ssl
from urllib.parse import urlparse


def create_ssl_context(url: str, sha256: str = None):
    res = urlparse(url)
    host = res.hostname
    port = 443 if res.port == None else res.port
    cert_pem = ssl.get_server_certificate((host, port))
    cert = load_pem_x509_certificate(cert_pem.encode('utf-8'))
    pubkey_bytes = cert.public_key().public_bytes(encoding=serialization.Encoding.DER, format=serialization.PublicFormat.SubjectPublicKeyInfo)
    pubkey_sha256 = hashlib.sha256(pubkey_bytes).hexdigest()
    if sha256 is not None:
        assert pubkey_sha256 == sha256
    context = ssl.create_default_context(cadata=cert_pem)
    assert context.cert_store_stats() == {'x509': 1, 'crl': 0, 'x509_ca': 0}
    context.verify_flags = ssl.VERIFY_X509_PARTIAL_CHAIN
    return context
