#!/bin/bash

KDE_PROXY_CONF=$HOME/.config/kioslaverc;
PROXY_TYPE_NONE=0;
PROXY_TYPE_MANUAL=1;
PROXY_TYPE_AUTO=2;
all_proxy=(ftpProxy httpProxy httpsProxy socksProxy);

function rewrite_proxy_file() {
    PROXY_TYPE=$1;
    shift;
    PROXY_TEXT=$1;
    shift;
    PROXY_TARGET=$@;

    echo '' > $KDE_PROXY_CONF;
    echo ProxyUrlDisplayFlags=8>> $KDE_PROXY_CONF;
    echo "[Proxy Settings]" >> $KDE_PROXY_CONF
    echo NoProxyFor= >> $KDE_PROXY_CONF;
    if [ $PROXY_TYPE = $PROXY_TYPE_AUTO ]; then
        echo Proxy Config Script=$PROXY_TEXT >> $KDE_PROXY_CONF;
    else
        echo Proxy Config Script= >> $KDE_PROXY_CONF;
    fi
    echo ProxyType=$PROXY_TYPE >> $KDE_PROXY_CONF;
    echo ReversedException=false >> $KDE_PROXY_CONF;
    for proxy in ${all_proxy[@]}; do
        for target in $PROXY_TARGET; do
            if [ $proxy = $target ]; then
                echo $proxy=$PROXY_TEXT >> $KDE_PROXY_CONF;
            fi
        done
    done;
}

function usage(){
    echo "Usage: proxy.sh [command]"
    echo "  - start [proxy_type] [proxy_text] [proxy_target]"
    echo "  - stop"
    echo "Demo: bash ./kde-proxy-set.sh start 1 http://127.0.0.1:1095 httpProxy httpsProxy"
}

function proxy_start(){
    echo "Start..."
    rewrite_proxy_file "$@";
    # kwriteconfig5 --file $HOME/.config/kioslaverc --group "Proxy Settings" --key "ProxyType" 2
    echo "Done."
}

function proxy_stop(){
    echo "End..."
    rewrite_proxy_file 0;
    # kwriteconfig5 --file $HOME/.config/kioslaverc --group "Proxy Settings" --key "ProxyType" 0
    echo "Done."
}

if [ $# -ge 1 ]
then
    if [ $1 = "start" ]
    then
        shift;
        proxy_start $@;
    elif [ $1 = "stop" ]
    then
        proxy_stop
    else
        usage
    fi
else
    usage
fi

