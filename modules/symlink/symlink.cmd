@setlocal
@echo off

if "%1" == "-f" (
    goto :FileLink
)

if "%1" == "-d" (
    goto :DirLink
)

goto :EOF

:FileLink
    echo "File Link"
    SET CMD="cmd /c mklink ""C:\\local.host\\www\\%~nx2"" ""%2"""
    goto :DoCommand

:DirLink
    echo "Dir Link"
    SET CMD="cmd /c mklink /D ""C:\\local.host\\www\\%~nx2"" ""%2"""
    goto :DoCommand

:DoCommand
    SET APP="cmd"

    start wscript //nologo admin.vbs %*
    goto :EOF

:EOF