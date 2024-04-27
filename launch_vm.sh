#!/bin/bash

AMD_SEV_DIR=/home/stneng/AMDSEV/snp-release-2024-04-22
OS_IMAGE=./ubuntu-22.04-server-cloudimg-amd64.img
DISK_IMAGE=./cvm.qcow2
SEED_IMAGE=./user-data.iso
SDA1_SHASUM=0f37e75ed0067094d138a14593e916d234bcf64faf882c7e3f2e176a3bf0a40338b06a3a044ae39f030751d88e042d7c55544f02ff7aee1d9d427f275095a582
SDB_SHASUM=`sha512sum user-data.iso | awk '{ print $1 }'`
CERTS_PATH=./certs.blob

CPU=32
MEM=256 # G
DISK=256 # G
PORTFWD=",hostfwd=tcp::9922-:22,hostfwd=tcp::9980-:80,hostfwd=tcp::9443-:443"
NVIDIA_GPU=e4:00.0

USE_SNP=true
USE_GPU=true

cp $OS_IMAGE $DISK_IMAGE
qemu-img resize $DISK_IMAGE ${DISK}G

$AMD_SEV_DIR/usr/local/bin/qemu-system-x86_64 \
-enable-kvm -nographic -no-reboot \
-cpu EPYC-v4 -machine q35 -smp ${CPU},maxcpus=255 -m ${MEM}G,slots=2,maxmem=$((${MEM}+8))G \
-bios ./OVMF.fd \
${USE_SNP:+ -machine confidential-guest-support=sev0,vmport=off} \
${USE_SNP:+ -object sev-snp-guest,id=sev0,cbitpos=51,reduced-phys-bits=1,kernel-hashes=on,certs-path=$CERTS_PATH} \
${USE_SNP:+ -kernel ./vmlinuz-6.5.0-28-generic} \
${USE_SNP:+ -initrd ./initrd.img-6.5.0-28-generic} \
${USE_SNP:+ -append "console=ttyS0 root=/dev/mapper/rootfs ds=none fs_setup_shasum_check sda1_shasum=$SDA1_SHASUM sdb_shasum=$SDB_SHASUM"} \
-drive file=$DISK_IMAGE,if=none,id=disk0,format=qcow2 \
-device virtio-scsi-pci,id=scsi0,disable-legacy=on,iommu_platform=true \
-device scsi-hd,drive=disk0 \
-drive file=$SEED_IMAGE,if=none,id=disk1,format=raw,readonly=on \
-device virtio-scsi-pci,id=scsi1,disable-legacy=on,iommu_platform=true \
-device scsi-hd,drive=disk1 \
-device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,romfile= \
-netdev user,id=vmnic$PORTFWD \
${USE_GPU:+ -device pcie-root-port,id=pci.1,bus=pcie.0} \
${USE_GPU:+ -device vfio-pci,host=$NVIDIA_GPU,bus=pci.1} \
${USE_GPU:+ -fw_cfg name=opt/ovmf/X-PciMmio64Mb,string=262144}
