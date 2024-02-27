@echo off
start /B "" C:\local.host\modules\php\5.6\php-cgi.exe -b 127.0.0.1:9056 &
start /B "" C:\local.host\modules\php\7.0\php-cgi.exe -b 127.0.0.1:9070 &
start /B "" C:\local.host\modules\php\7.2\php-cgi.exe -b 127.0.0.1:9072 &
start /B "" C:\local.host\modules\php\7.4\php-cgi.exe -b 127.0.0.1:9074 &
start /B "" C:\local.host\modules\php\8.0\php-cgi.exe -b 127.0.0.1:9080 &
start /B "" C:\local.host\modules\php\8.2\php-cgi.exe -b 127.0.0.1:9082 &
start /B "" C:\local.host\modules\php\8.3\php-cgi.exe -b 127.0.0.1:9083 &