::@echo off

set BIN_PATH=%1
set DEVICE_NAME=%2
set PROXY_ADDRESS=%3

:: example -> D:\proxy\tun2socks-windows-amd64.exe -device tun://tun0 -proxy socks5://127.0.0.1:1080
%BIN_PATH% -device tun://%DEVICE_NAME% -proxy %PROXY_ADDRESS%
