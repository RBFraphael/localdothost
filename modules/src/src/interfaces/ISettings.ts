export interface ISettings {
    autostart: {
        apache: boolean;
        nginx: boolean;
        mariadb: boolean;
        mongodb: boolean;
        redis: boolean;
        postgres: boolean;
    },
    theme: "light"|"dark";
    closeToTray: boolean;
    minimizeToTray: boolean;
    startOnBoot: boolean;
    startMinimized: boolean;
};