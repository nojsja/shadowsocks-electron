netsh interface ip set address "tun0" static address=198.18.0.1 mask=128.0.0.0 gateway=198.18.0.2
netsh interface ip set dns name="tun0" static 198.18.0.2
route add 0.0.0.0 mask 128.0.0.0 198.18.0.2
route add 128.0.0.0 mask 128.0.0.0 198.18.0.2
route add 198.18.0.0 mask 255.255.0.0 0.0.0.0
route add 198.18.0.1 mask 255.255.255.255 0.0.0.0
route add 198.18.255.255 mask 255.255.255.255 0.0.0.0
route add 224.0.0.0 mask 240.0.0.0 0.0.0.0
route add 255.255.255.255 mask 255.255.255.255 0.0.0.0
