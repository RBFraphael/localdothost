Just copy the desired ".phpXY" file to the root of your website. No more need to edit your .htaccess file!

Files and their corresponding PHP versions:

.php56 => PHP 5.6
.php70 => PHP 7.0
.php72 => PHP 7.2
.php74 => PHP 7.4
.php80 => PHP 8.0
.php82 => PHP 8.2

For PHP 8.3, just leave without a .phpXX file, since 8.3 is the default version.

==========================

NOTE FOR NGINX:

Due to how NGINX handle configurations, the content of the .phpXX file doesn't matter. To set the corresponding PHP version, you just need a file named .phpXX in your website root.