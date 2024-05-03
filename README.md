# SecLM

This repo extends [AMD SEV-SNP](https://github.com/AMDESE/AMDSEV/tree/snp-latest) [measured direct boot](https://static.sched.com/hosted_files/kvmforum2021/ed/securing-linux-vm-boot-with-amd-sev-measurement.pdf) to verify the OS image and the cloud-init configuration. We also provide scripts to integrate [NVIDIA Confidential Computing](https://www.nvidia.com/en-us/data-center/solutions/confidential-computing/).

Main use cases:
- Using cloud resources safely: you want to protect your data and make sure the cloud provider cannot see your workloads. This tool can help you attest that the providers provisioning the confidential VM with your requested configurations.
- Providing trustworthy services to users: you want to provide proof to your users that you are handling their data as you said.

Table of contents:
- [Getting Started](#getting-started)
  - [Use Case 1: using cloud resources safely](#use-case-1-using-cloud-resources-safely)
  - [Use Case 2: providing trustworthy services to users](#use-case-2-providing-trustworthy-services-to-users)
- [How to verify the attestation report and the measurement result?](#how-to-verify-the-attestation-report-and-the-measurement-result)

## Getting Started
Download the Ubuntu official image and our patched booting components
```
wget https://cloud-images.ubuntu.com/releases/22.04/release-20240416/ubuntu-22.04-server-cloudimg-amd64.img
wget https://github.com/sec-lm/measured-direct-boot/releases/download/fbb77fd/OVMF.fd
wget https://github.com/sec-lm/measured-direct-boot/releases/download/fbb77fd/vmlinuz-6.5.0-28-generic
wget https://github.com/sec-lm/measured-direct-boot/releases/download/fbb77fd/initrd.img-6.5.0-28-generic
```

### Use Case 1: using cloud resources safely
#### Host
1. Prepare AMD SEV-SNP environment: follow the instructions [here](https://github.com/AMDESE/AMDSEV/tree/snp-latest).
2. (Optional) Prepare NVIDIA Confidential Computing environment: follow the instructions [here](https://docs.nvidia.com/confidential-computing-deployment-guide.pdf).
3. (Optional) Get the VCEK certificate: install [snphost](https://github.com/virtee/snphost.git) and run `sudo snphost fetch vcek pem ./certs`, `sudo snphost import ./certs ./certs.blob`.
4. Receive the user-data.iso from the user.
5. Launch the confidential VM: modify `launch_vm.sh` and run `sudo ./launch_vm.sh`.

#### Guest
1. Prepare the init configuration: run `cp user-data-examples/init_cvm.cfg user-data.cfg`, and modify the configuration to add your sshkeys and init commands.
2. Make the user-data.iso: run `./make_user_data_iso.sh`.
3. Send the user-data.iso to the host.

### Use Case 2: providing trustworthy services to users
#### Service provider
In this scenario, the service provider plays both host and guest roles in [use case 1](#use-case-1-using-cloud-resources-safely). Once the confidential VM is launched, it should retrieve the attestation report and publish it together with the user-data.iso which specifies the program running inside the confidential VM.

Usually, the program will need a public-private key pair to securely communicate with end users, we also provide an [example config](user-data-examples/ssl_acme.cfg) to automatically issue an SSL certificate and include the pubkey sha256 to the report data field of the attestation report. To use this config, forward the 80 port on the host for certificate issuance `sudo socat TCP4-LISTEN:80,reuseaddr,fork TCP4:127.0.0.1:9980`, you can stop the forwarding after the VM provisioning stage.

#### End users
End users can identify the program running inside by combining the user-data.iso and the pubkey hash in the attestation report. The service provider should provide these together with the service.
We provide a [python library](https://pypi.org/project/seclm/) to help users to pin the pubkey in their applications.


## How to verify the attestation report and the measurement result?
Note: In the use case 2, it's the service provider's responsibility to publish the attestation report, VCEK certificate, and user-data.iso(step 2, 3, 7) to end users.

1. Install [snpguest](https://github.com/virtee/snpguest.git).
```
git clone https://github.com/virtee/snpguest.git
cd snpguest
cargo build -r
cd target/release
```

2. Retrieve the attestation report inside the guest VM.
```
sudo ./snpguest report report.bin request-file.txt --random
```

3. Retrieve the host VCEK certificate.

If the host configured the VCEK certificate, then run the following command inside the guest VM. Otherwise, ask the host to get the vcek.pem.
```
sudo ./snpguest certificates pem ./
```

4. Download the cert chain for the VCEK certificate.
```
curl --proto '=https' --tlsv1.2 -sSf https://kdsintf.amd.com/vcek/v1/Genoa/cert_chain -o ./vcek_cert_chain.pem
```

5. Verify the VCEK certificate and the attestation report.
```
openssl verify --CAfile ./vcek_cert_chain.pem vcek.pem
sudo ./snpguest verify attestation ./ report.bin
```

6. Next, read the measurement result from the attestation report. The report data field which may contain the pubkey hash in use case 2 is also revealed here.
```
./snpguest display report report.bin
```

7. Calculate the shasum for the user-data.iso.
```
sha512sum user-data.iso
```

8. Download the booting components and set the necessary parameters.
```
wget https://github.com/sec-lm/measured-direct-boot/releases/download/fbb77fd/OVMF.fd
wget https://github.com/sec-lm/measured-direct-boot/releases/download/fbb77fd/vmlinuz-6.5.0-28-generic
wget https://github.com/sec-lm/measured-direct-boot/releases/download/fbb77fd/initrd.img-6.5.0-28-generic

SDA1_SHASUM=0f37e75ed0067094d138a14593e916d234bcf64faf882c7e3f2e176a3bf0a40338b06a3a044ae39f030751d88e042d7c55544f02ff7aee1d9d427f275095a582
SDB_SHASUM=$(sha512sum user-data.iso | awk '{print $1}')
CPU_NUMS=32
```

9. Calculate the expected measurement and compare it with the measurement result you get in step 6.
```
pip install sev-snp-measure
sev-snp-measure --mode snp --vcpus=$CPU_NUMS --vcpu-type=EPYC-v4 --ovmf=OVMF.fd --kernel=vmlinuz-6.5.0-28-generic --initrd=initrd.img-6.5.0-28-generic --append="console=ttyS0 root=/dev/mapper/rootfs ds=none fs_setup_shasum_check sda1_shasum=$SDA1_SHASUM sdb_shasum=$SDB_SHASUM"
```
Note: If the measurement doesn't match, it may caused by recent changes in the kernel, use [this PR](https://github.com/virtee/sev-snp-measure/pull/48) instead.
