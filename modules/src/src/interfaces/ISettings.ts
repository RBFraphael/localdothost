export interface ISettings {
    autostart: {
        apache: boolean;
        mariadb: boolean;
        mongodb: boolean;
    },
    theme: "light"|"dark"
};