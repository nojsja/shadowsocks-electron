set TUN_GW=%1
set DEVICE_NAME=%2

netsh interface ip set address %DEVICE_NAME% static address=198.18.0.1 mask=128.0.0.0
netsh interface ip set dns name=%DEVICE_NAME% static %TUN_GW%

netsh interface ip add route 0.0.0.0/0 %DEVICE_NAME% %TUN_GW% metric=0 store=active
netsh interface ip set interface %DEVICE_NAME% metric=0 store=active
netsh interface ipv6 set interface %DEVICE_NAME% metric=0 store=active
:: excludes proxy server, break loop
:: params: ss-server | gateway
route add [120.232.190.102] mask 255.255.255.255 [10.30.1.1]
ipconfig /flushdns
