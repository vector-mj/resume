# How to turn your old USB into something


## Monitor to find your device
```bash
udevadm monitor --property
```

## /usr/local/bin/usb_action.sh
```bash
#!/bin/bash

DEVPATH="$1"
ACTION="$2"

logger "USB event: Action=$ACTION, DEVPATH=$DEVPATH"

if [ "$ACTION" != "add" ]; then
    exit 0
fi

PORT=$(echo "$DEVPATH" | grep -oP 'usb[0-9]+/\K[0-9]+-[0-9]+')

# You can also extract using the full path if ports have more complex numbers
# PORT=$(echo "$DEVPATH" | awk -F'/' '{print $NF}')

case "$PORT" in
    "1-5")
        echo "USB connected to Port 5 - SHUTTING DOWN"
        logger "USB plugged into Port 5 - Shutting down system"
        /sbin/shutdown -h now
        ;;
    "1-6")
        echo "USB connected to Port 6 - RESTARTING"
        logger "USB plugged into Port 6 - Restarting system"
        /sbin/reboot
        ;;
    "1-3")
        echo "USB connected to Port 3 - SUSPENDING"
        logger "USB plugged into Port 3 - Suspending system"
        /usr/bin/systemctl suspend
        ;;
    *)
        echo "USB connected to unknown port: $PORT - No action"
        ;;
esac
```

```bash
root@server:~# lsusb
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 001 Device 009: ID 13fe:3e00 Phison Electronics Corp. Flash Drive
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
```

```bash
root@server:~# dmesg -Hw
[ 3424.877813] usb 1-3: new high-speed USB device number 9 using xhci_hcd
[ 3425.006386] usb 1-3: New USB device found, idVendor=13fe, idProduct=3e00, bcdDevice= 1.00
[ 3425.006390] usb 1-3: New USB device strings: Mfr=1, Product=2, SerialNumber=3
[ 3425.006391] usb 1-3: Product: Silicon-Power8G
[ 3425.006392] usb 1-3: Manufacturer: UFD 2.0
[ 3425.006393] usb 1-3: SerialNumber: 12050650048E60025CB8DD13B3D
[ 3425.007237] usb-storage 1-3:1.0: USB Mass Storage device detected
[ 3425.007322] scsi host8: usb-storage 1-3:1.0
[ 3426.093984] scsi 8:0:0:0: Direct-Access     UFD 2.0  Silicon-Power8G  PMAP PQ: 0 ANSI: 4
[ 3426.094125] sd 8:0:0:0: Attached scsi generic sg1 type 0
[ 3427.330539] sd 8:0:0:0: [sdb] 15124992 512-byte logical blocks: (7.74 GB/7.21 GiB)
[ 3427.331050] sd 8:0:0:0: [sdb] Write Protect is off
[ 3427.331052] sd 8:0:0:0: [sdb] Mode Sense: 23 00 00 00
[ 3427.331188] sd 8:0:0:0: [sdb] No Caching mode page found
[ 3427.331189] sd 8:0:0:0: [sdb] Assuming drive cache: write through
[ 3427.362655]  sdb: sdb1 sdb2
[ 3427.362721] sd 8:0:0:0: [sdb] Attached SCSI removable disk
```


## /etc/udev/rules.d/99-usb-port-action.rules
```rules
ACTION=="add", SUBSYSTEM=="usb", ATTRS{idVendor}=="13fe", ATTRS{idProduct}=="3e00", RUN+="/usr/local/bin/usb_action.sh $env{DEVPATH} add"
```

```sh
Aug 05 20:14:13 server kernel: usb-storage 1-3:1.0: USB Mass Storage device detected
Aug 05 20:14:13 server root[12967]: USB event: Action=add, DEVPATH=/devices/pci0000:00/0000:00:14.0/usb1/1-3
Aug 05 20:14:13 server root[12971]: USB plugged into Port 3 - Suspending system
Aug 05 20:14:13 server root[12975]: USB event: Action=add, DEVPATH=/devices/pci0000:00/0000:00:14.0/usb1/1-3/1-3:1.0
Aug 05 20:14:13 server root[12979]: USB plugged into Port 3 - Suspending system
Connection to server closed by remote host.
Connection to server closed.
---
Aug 05 20:19:04 server kernel: usb-storage 1-6:1.0: USB Mass Storage device detected
Aug 05 20:19:04 server root[13896]: USB event: Action=add, DEVPATH=/devices/pci0000:00/0000:00:14.0/usb1/1-6
Aug 05 20:19:04 server root[13900]: USB plugged into Port 6 - Restarting system
Aug 05 20:19:04 server root[13904]: USB event: Action=add, DEVPATH=/devices/pci0000:00/0000:00:14.0/usb1/1-6/1-6:1.0
Aug 05 20:19:04 server root[13908]: USB plugged into Port 6 - Restarting system
Connection to server closed by remote host.
Connection to server closed.
---
Aug 05 20:20:46 server kernel: usb 1-5: new high-speed USB device number 14 using xhci_hcd
Aug 05 20:20:46 server kernel: usb 1-5: New USB device found, idVendor=13fe, idProduct=3e00, bcdDevice= 1.00
Aug 05 20:20:46 server kernel: usb 1-5: New USB device strings: Mfr=1, Product=2, SerialNumber=3
Aug 05 20:20:46 server kernel: usb-storage 1-5:1.0: USB Mass Storage device detected
Aug 05 20:20:46 server root[14437]: USB event: Action=add, DEVPATH=/devices/pci0000:00/0000:00:14.0/usb1/1-5
Aug 05 20:20:46 server root[14441]: USB plugged into Port 5 - Shutting down system
Aug 05 20:20:46 server root[14445]: USB event: Action=add, DEVPATH=/devices/pci0000:00/0000:00:14.0/usb1/1-5/1-5:1.0
Aug 05 20:20:46 server root[14449]: USB plugged into Port 5 - Shutting down system
Connection to server closed by remote host.
Connection to server closed.
```