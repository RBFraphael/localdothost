; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Local.Host"
#define MyAppVersion "1.9.0"
#define MyAppPublisher "RBFraphael"
#define MyAppURL "https://github.com/rbfraphael/localdothost"
#define MyAppExeName "modules\gui\Local.Host.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{08DEB286-C170-45F7-A411-78BDE7DC10A4}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\local.host
DisableDirPage=yes
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
; TODO: Change the line above pointing to the LICENSE.txt file on your computer
LicenseFile=C:\local.host\LICENSE.txt
; Uncomment the following line to run in non administrative install mode (install for current user only.)
;PrivilegesRequired=lowest
; TODO: Change the line above pointing to the directory you want to save the installer file
OutputDir=C:\
OutputBaseFilename=Local.Host_1.9.0_Setup_x64
; TODO: Change the line above pointing to the icon.ico file on your computer
SetupIconFile=C:\Git\localdothost\modules\src\icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Registry]
Root: HKCR; Subkey: "Directory\shell\localhost_symlink_dir"; ValueType: string; ValueName: ""; ValueData: "Create Local.Host Link"; Flags: uninsdeletekey
Root: HKCR; Subkey: "Directory\shell\localhost_symlink_dir"; ValueType: string; ValueName: "Icon"; ValueData: "C:\local.host\modules\gui\Local.Host.exe"; Flags: uninsdeletekey
Root: HKCR; Subkey: "Directory\shell\localhost_symlink_dir\command"; ValueType: string; ValueName: ""; ValueData: """C:\local.host\modules\tools\symlink.exe"" d ""%1"""; Flags: uninsdeletekey

Root: HKCR; Subkey: "Directory\Background\shell\localhost_symlink_dir"; ValueType: string; ValueName: ""; ValueData: "Create Local.Host Link"; Flags: uninsdeletekey
Root: HKCR; Subkey: "Directory\Background\shell\localhost_symlink_dir"; ValueType: string; ValueName: "Icon"; ValueData: "C:\local.host\modules\gui\Local.Host.exe"; Flags: uninsdeletekey
Root: HKCR; Subkey: "Directory\Background\shell\localhost_symlink_dir\command"; ValueType: string; ValueName: ""; ValueData: """C:\local.host\modules\tools\symlink.exe"" d ""%v."""; Flags: uninsdeletekey

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}";

[Files]
; TODO: Change the line above pointing to the root directory of the final Local.Host on your computer
Source: "C:\local.host\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\modules\setup\vcredist_11.x64.exe"; Parameters: "/install /passive /norestart"; StatusMsg: "Installing Visual C++ 11 Redistributables...";
Filename: "{app}\modules\setup\vcredist_14.x64.exe"; Parameters: "/install /passive /norestart"; StatusMsg: "Installing Visual C++ 14 Redistributables...";
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

