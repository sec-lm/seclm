#!/bin/bash

mkisofs -o user-data.iso -r -J ./user-data.cfg
sha512sum user-data.iso
