import { AppBar, Avatar, CssBaseline, IconButton, makeStyles, Toolbar, Typography } from "@material-ui/core"
import React from "react"
import { useParams, Link } from "react-router-dom"
import { Settings as SettingsIcon, BorderInner as BorderIcon, DeveloperBoard as ComponentIcon, SignalCellularConnectedNoInternet0Bar as NoInternetIcon } from "@material-ui/icons"
const useStyle = makeStyles(theme => ({
    projectIdTitle: {
        flexGrow: 1
    },
    avatarNoInternet: {
        color: '#000000',
        backgroundColor: theme.palette.secondary.main
    }
}))

const AppBarProject = ({ wsReadyState }) => {

    const classes = useStyle()
    const { projectId } = useParams()

    return (
        <nav>
            <AppBar position="static">
                <CssBaseline />
                <Toolbar>
                    <Typography variant="h6" className={classes.projectIdTitle}>{projectId}</Typography>
                    <IconButton component={Link} to={`/project/${projectId}/setup`} color="inherit">
                        <SettingsIcon />
                    </IconButton>
                    <IconButton component={Link} to={`/project/${projectId}/matrix`} color="inherit">
                        <BorderIcon />
                    </IconButton>
                    <IconButton component={Link} to={`/project/${projectId}/component`} color="inherit">
                        <ComponentIcon />
                    </IconButton>
                    {wsReadyState != 1 && (
                        <Avatar className={classes.avatarNoInternet}>
                            <NoInternetIcon />
                        </Avatar>
                    )}
                </Toolbar>
            </AppBar>
        </nav>
    )
}

export default AppBarProject