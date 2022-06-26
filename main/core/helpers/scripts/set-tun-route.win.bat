set TUN_GW=%1
set DEVICE_NAME=%2
set TUN_IP=198.18.0.1

netsh interface ip set address %DEVICE_NAME% static address=%TUN_IP% mask=255.255.0.0
netsh interface ip add route 0.0.0.0/0 %DEVICE_NAME% %TUN_GW% metric=0 store=active
netsh interface ip set interface %DEVICE_NAME% metric=0 store=active
netsh interface ip set dns name=%DEVICE_NAME% static 114.114.114.114
ipconfig /flushdns