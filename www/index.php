<?php
const DS = DIRECTORY_SEPARATOR;

$versionsFile = file_get_contents(dirname(__DIR__).DS."modules".DS."versions.json");
$versions = json_decode($versionsFile, true);

if($_GET['action'] == "open-control-panel"){
    $exePath = dirname(__DIR__).DS."modules".DS."gui".DS."Local.Host.exe";
    exec($exePath);
}

function listWebsites($dir = null, $depth = 0){
    if ($depth > 3) { return; }

    if($dir == null){
        $dir = dirname(__FILE__);
    }
    $subdirs = [];

    $dirFiles = array_diff(scandir($dir), [".", ".."]);
    $dirHasIndex = false;

    foreach($dirFiles as $file){
        $filePath = $dir.DS.$file;
        $fileStats = pathinfo($filePath);

        if(is_file($filePath)){
            $fileExtension = $fileStats['extension'];
            $fileName = $fileStats['filename'];

            if($fileName == "index" && in_array($fileExtension, ["php", "html", "htm"])){
                if($depth == 0){
                    ?>
                    <li>
                        <a href="http://local.host/">http://local.host/</a>
                    </li>
                    <?php
                } else {
                    $dirHasIndex = true;

                    $subdomain = [];
                    $filePathSegments = explode(DS, dirname($filePath));
                    for($i = 0; $i < $depth; $i++){
                        $subdomain[] = array_pop($filePathSegments);
                    }

                    $website = join(".", $subdomain).".local.host";
                    ?>
                    <li>
                        <a href="http://<?= $website ?>">http://<?= $website; ?>/</a>
                    </li>
                    <?php
                }
            }
        } else if(is_dir($filePath)){
            $subdirs[] = $file;
        }
    }

    if(!$dirHasIndex){
        foreach($subdirs as $subdir){
            $subdirPath = $dir.DS.$subdir;
            listWebsites($subdirPath, $depth + 1);
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local.Host <?= $versions['gui']; ?></title>
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    <style>
        :root {
            font-size: 16px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: 300;
            line-height: 1;
        }
        @media (prefers-color-scheme: dark){
            body {
                color: #FFF;
                background-color: #222;
            }
        }
        .container {
            width: 100%;
            max-width: 1200px;
            padding: 1.5rem;
            margin: 0 auto;
        }

        .row {
            display: flex;
            flex-direction: row;
            gap: 1rem;
        }

        .row section {
            flex-grow: 1;
            flex-shrink: 1;
            margin-bottom: 1.5rem;
        }
        
        section.logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            text-align: center;
        }
        section.logo img {
            width: 100%;
            max-width: 250px;
            filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.5))
        }
        section.logo h1 {
            font-size: 3.5rem;
            font-weight: 300;
            margin: 0;
        }
        section.logo h1 small{
            font-size: 1.5rem;
        }

        section.sites {
            background-color: rgba(0, 0, 0, 0.5);
            padding: .5rem 1.5rem;
            border-radius: .5rem;
            color: #FFF;
        }
        section.sites ul {
            list-style: decimal;
        }
        section.sites ul li {
            line-height: 1.25;
        }
        section.sites ul li a {
            color: #FFF;
            font-weight: 500;
        }

        section.actions {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: start;
            justify-content: center;
            gap: 1rem;
        }
        section.actions a {
            background: #3498db;
            border: none;
            border-radius: .25rem;
            outline: none;
            color: #FFF;
            font-weight: 500;
            padding: .5rem 1.5rem;
            text-decoration: none;
            transition: background 0.3s ease-in-out;
        }
        section.actions a:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row">
            <section class="logo">
                <img src="logo.png" alt="Local.Host Logo">
                <h1><small>Welcome to</small><br/>Local.Host <?= $versions['gui'] ?></h1>
            </section>
        </div>
        <div class="row">
            <section class="actions">
                <a href="./index.php?action=open-control-panel">Open Control Panel</a>
                <a href="https://github.com/rbfraphael/localdothost" target="_blank">Visit Repository</a>
                <a href="https://github.com/rbfraphael/localdothost/releases/latest" target="_blank">Check Latest Version</a>
                <a href="https://github.com/rbfraphael/localdothost/wiki" target="_blank">Online Help/Wiki</a>
            </section>
        </div>
        <div class="row">
            <section class="sites">
                <h3>Websites List:</h3>
                <ul>
                    <?php listWebsites(); ?>
                </ul>
            </section>
        </div>
    </div>
</body>
</html>