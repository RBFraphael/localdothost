export interface ISettings {
    autostart: {
        apache: boolean;
        mariadb: boolean;
        mongodb: boolean;
        redis: boolean;
    },
    theme: "light"|"dark";
    closeToTray: boolean;
    minimizeToTray: boolean;
};