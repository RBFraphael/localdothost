# How to properly build Local.Host

### Step 1 - Get auxiliary tools

|Tool|Link|
|-|-|
|Inno Setup Compiler|https://jrsoftware.org/isdl.php|
|Microsoft Visual C++ 2015+ Redistributable|https://aka.ms/vs/17/release/vc_redist.x64.exe|
|Microsoft Visual C++ 2012 Redistributable|https://download.microsoft.com/download/1/6/B/16B06F60-3B20-4FF2-B699-5E9B7962F9AE/VSU_4/vcredist_x64.exe|
|NodeJS*|https://nodejs.org/en/download|
|Go|https://go.dev/|

###### (*) You're free to use NVM if you prefer. I've used NodeJS 18, so it's secure to use that version. Older (and newer) versions aren't tested yet, so if you want to try with any other version(s) than 18, be at your own risk.

### Step 2 - Get third-party open-source softwares

For easy build process, prefer to download ZIP version of all the following third-party software.

|Software|Link|Additional Info|
|-|-|-|
|Apache Lounge|https://www.apachelounge.com/download/|Also download the ```mod_fcgi```, ```mod_wasm``` and ```mod_view``` modules|
|PHP for Windows|https://windows.php.net/downloads/releases/archives/|Download latest nts releases for 5.6, 7.0, 7.2, 7.4, 8.0, 8.2 and 8.3|
|MariaDB|https://mariadb.org/download/|-|
|Acrylic DNS Proxy|https://mayakron.altervista.org/support/acrylic/Home.htm|-|
|MongoDB Community Server|https://www.mongodb.com/try/download/community|-|
|MongoDB Compass|https://www.mongodb.com/try/download/compass|-|
|HeidiSQL|https://www.heidisql.com/download.php|-|
|phpMyAdmin|https://www.phpmyadmin.net/downloads/|-|
|Composer|https://getcomposer.org/download/|-|
|Node Version Manager (NVM)|https://github.com/coreybutler/nvm-windows|Download the source code, and build yourself for versions 1.1.12 and newer, removing the verification for terminal inside /src/nvm.go|
|Redis for Windows|https://github.com/zkteco-home/redis-windows|-|

### Step 3 - Add all third-party software to their respective /modules/* dir

After downloading all third-party softwares listed above, extract all ZIP files to it's corresponding directory inside the ```/modules``` directory.

**!!! IMPORTANT !!!** Remember to NOT OVERRIDE existing files inside each module directory, because they are fundamental to the properly execution and the default configuration of Local.Host.

If you're not sure where any module goes on, here's a table describing that:

|Module|Directory|
|-|-|
|Acrylic DNS Proxy|/modules/acrylic|
|Apache Lounge|/modules/apache|
|MongoDB Compass|/modules/compass|
|Composer|/modules/composer|
|HeidiSQL|/modules/heidisql|
|MariaDB|/modules/mariadb|
|MongoDB Community Server|/modules/mongodb|
|Node Version Manager (NVM)|/modules/nvm|
|PHP 5.6.X|/modules/php/5.6|
|PHP 7.0.X|/modules/php/7.0|
|PHP 7.2.X|/modules/php/7.2|
|PHP 7.4.X|/modules/php/7.4|
|PHP 8.0.X|/modules/php/8.0|
|PHP 8.2.X|/modules/php/8.2|
|PHP 8.3.X|/modules/php/8.3|
|phpMyAdmin|/modules/phpmyadmin|
|Redis|/modules/redis|

### Step 4 - Install the GUI NodeJS dependencies

First, open the ```/modules/src``` directory on your favorite IDE with a terminal, or just open it on your terminal. Then, run the traditional ```npm install``` command to download all required packages to build the Local.Host GUI.

### Step 5 - Build the Local.Host GUI

After downloading all dependencies, when `cd`ed on ```/modules/src``` dir, run ```npm run build``` to build the Local.Host GUI executables.

When the build completes, copy (or move) all contents from ```/modules/src/dist/win-unpacked``` to the ```/modules/gui``` directory.

If you want to test, you can, instead of building, just run ```npm run dev``` to start the Local.Host GUI from source code. Or, if you want to test it after building, make sure all your source code are on the ```C:\local.host``` directory, then run the ```Local.Host.exe``` file located at ```/modules/gui``` directory (after you moved it from ```/modules/src/dist/win-unpacked```, obviously).

### Step 6 - Add the Visual C++ installer to the root of Local.Host

Before building the Setup/Installer, you need to copy the installers of both Microsoft Visual C++ Redistributable 2012 and 2015+ to the `modules/setup` directory of your Local.Host, and make sure you have named them to `VC_redist_12.x64.exe` and `VC_redist_17.x64.exe`.

### Step 7 - Prepare the Setup/Installer

//

### Step 8 - Patch the installer script

//

### Step 9 - Build the Setup/Installer

After patching the install script, compile it and wait a bit for all things to be done.

### Step 10 - Test the final product

When the setup was built, test it installing on your computer. If it's the same computer you used to build your Local.Host, maybe you already have a `C:\local.host` folder. Make sure to rename, move or delete it before running the installer.

Another approach I prefer is to create a virtual machine (using VirtualBox, VMWare or anything else) with a clean Windows installation, then install the setup on that virtual machine. This way you be sure that there will be no conflicts and none of the required software (MS Visual C++ Redistributable) is installed, so you will also test if your installer will install it.
