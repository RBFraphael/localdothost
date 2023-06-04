import { Box, Typography } from "@mui/material";

export default function AppHelp()
{
    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Local.Host Help</Typography>

            <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                <h2><strong>Web Server</strong></h2>

                <p>The bundled web server in Local.Host is Apache 2.4.57, with some custom configurations that are covered above.</p>

                <p><strong>Multi PHP Support</strong></p>

                <p>Bundled with Local.Host, there are 6 PHP versions: 5.6, 7.0, 7.2, 7.4, 8.0 and 8.2. By default, PHP version 8.2 will respond on Apache requests, but you can change it by setting the needed PHP version in .htaccess. Just copy the snippet bellow and change the PHPXX_CGI variable according.</p>

                <code className="language-apache">
                    &lt;Files ~ "\.php$"&gt;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;FcgidWrapper $&#123;PHP82_CGI&#125; .php<br/>
                    &lt;/Files&gt;
                </code>

                <p><strong>Dynamic Subdomains</strong></p>

                <p>When using the bundled DNS server (Acrylic DNS Proxy), you have a top-level domain <u>http://local.host</u>, and can dynamically create 3-level subdomains just creating folders on the&nbsp;<u>www</u>&nbsp;(the document root directory) folder. The above table explains how dynamic subdomains work on this folder tree.</p>

                <table border="1" cellPadding={1} cellSpacing={1} style={{width:"100%"}}>
                    <tbody>
                        <tr>
                            <td><strong>Directory</strong></td>
                            <td><strong>URL</strong></td>
                        </tr>
                        <tr>
                            <td>www</td>
                            <td>http://local.host</td>
                        </tr>
                        <tr>
                            <td>www\folder</td>
                            <td>http://folder.local.host</td>
                        </tr>
                        <tr>
                            <td>www\folder\subfolder</td>
                            <td>http://subfolder.folder.local.host</td>
                        </tr>
                        <tr>
                            <td>www\folder\subfolder\subsubfolder</td>
                            <td>http://subsubfolder.subfolder.folder.local.host</td>
                        </tr>
                        <tr>
                            <td>www\client</td>
                            <td>http://client.local.host</td>
                        </tr>
                        <tr>
                            <td>www\client\project</td>
                            <td>http://project.client.local.host</td>
                        </tr>
                        <tr>
                            <td>www\client\project\admin</td>
                            <td>http://admin.project.client.local.host</td>
                        </tr>
                        <tr>
                            <td>www\client\project\api</td>
                            <td>http://api.project.client.local.host</td>
                        </tr>
                    </tbody>
                </table>

                <p>&nbsp;</p>

                <hr />
                <p>&nbsp;</p>

                <h2><strong>Database Server</strong></h2>

                <p>MariaDB version 10.11.3 is the bundled database server within Local.Host. You can just start the database server and use it with some client (like phpMyAdmin, Heidi SQL, MySQL Workbench or any other) and websites. Also, all bundled PHP versions have MySQL/MySQLi extensions enabled by default.&nbsp;</p>

                <p>There is a bundled phpMyAdmin version already configured included with Local.Host that you can easily access though the control panel.</p>

                <p>&nbsp;</p>

                <hr />
                <p>&nbsp;</p>

                <h2><strong>DNS Server</strong></h2>

                <p>To explore the dynamic subdomains feature, you need to use the pre-configured bundled version of Acrylic DNS. First, install the service (through the control panel), then you need to configure your computer to use 127.0.0.1 as the DNS server. You can check how to manage that <a href="https://www.windowscentral.com/how-change-your-pcs-dns-settings-windows-10" target="_blank">here</a>. It&#39;s a easy process and you will not use more than 2 minutes on that. Also, after installing the Acrylic DNS as a service on your computer, it will start automatically on each boot.</p>
            </Box>
        </Box>
    )
}