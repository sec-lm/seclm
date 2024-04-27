# SecLM SNP Tools

This repo extends [AMD SEV-SNP](https://github.com/AMDESE/AMDSEV/tree/snp-latest) [measured direct boot](https://static.sched.com/hosted_files/kvmforum2021/ed/securing-linux-vm-boot-with-amd-sev-measurement.pdf) to verify the OS image and the cloud-init configuration. We also provide scripts to integrate [NVIDIA Confidential Computing](https://www.nvidia.com/en-us/data-center/solutions/confidential-computing/).

Main use cases:
- Using cloud resources safely: you want to protect your data and make sure the cloud provider cannot see your workloads. This tool can help you attest that the providers provisioning the confidential VM with your requested configurations.
- Providing trustworthy services to users: you want to provide proof to your users that you are handling their data as you said.

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
3. (Optional) Get vcek certs: install [snphost](https://github.com/virtee/snphost.git) and run `sudo snphost fetch vcek pem ./certs`, `sudo snphost import ./certs ./certs.blob`.
4. Receive the user-data.iso from the user.
5. Launch the confidential VM: modify `launch_vm.sh` and run `sudo ./launch_vm.sh`.

#### Guest
1. Prepare the init configuration: run `cp user-data-example.cfg user-data.cfg`, and modify the configuration to add your sshkeys and init commands.
2. Make init iso and record the shasum: run `./make_user_data_iso.sh`.
3. Send the user-data.iso to the host.

### Use Case 2: providing trustworthy services to users
TODO
