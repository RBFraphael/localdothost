import { Box } from "@mui/material";

export default function TabPanel(props: any) {
    const {children, value, index, ...other} = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
            <Box sx={{ p: 3, display: value === index ? "block" : "none" }}>
                { children }
            </Box>
        </div>
    );
}