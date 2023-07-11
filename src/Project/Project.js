import { Redirect, Route, Switch, useParams } from "react-router-dom"
import React from "react"
import AppBarProject from "./AppBarProject"
import SetupProject from "./Setup/SetupProject"
import { Container, makeStyles, Snackbar } from "@material-ui/core"
import useWebSocket from "react-use-websocket"
import { WS_URL } from "../ConstConfig"
import MatrixProject from "./Matrix/MatrixProject"
import ComponentProject from "./Component/ComponentProject"

const useStyle = makeStyles(theme => ({
    container: {
        padding: theme.spacing(2)
    }
}))

const Project = () => {
    const { projectId } = useParams()

    const classes = useStyle()
    const [notification, setNotification] = React.useState({
        open: false,
        data: []
    })
    const onMessage = data => {
        try {
            data = JSON.parse(data.data)
            if (data.req == 'notification') {
                setNotification(prev => {
                    if (prev.data.length == 0)
                        prev.open = true
                    else if (prev.data[prev.data.length - 1] == data.data)
                        return { ...prev }
                    prev.data.push(data.data)
                    return { ...prev }
                })
            }
        } catch (error) { }
    }
    const wsState = useWebSocket(WS_URL + '/project/' + encodeURI(projectId) + '/notification', {
        shouldReconnect: () => true,
        onMessage
    })

    if (!projectId || !window.sessionStorage.getItem('nama'))
        return (<Redirect to='/' />)

    return (
        <React.Fragment>
            <AppBarProject
                wsReadyState={wsState.readyState} />
            <main>
                <Container maxWidth="xl" className={classes.container}>
                    <Switch>
                        <Route path="/project/:projectId" exact>
                            <SetupProject projectId={projectId} />
                        </Route>
                        <Route path="/project/:projectId/setup" exact>
                            <SetupProject projectId={projectId} />
                        </Route>
                        <Route path="/project/:projectId/matrix" exact>
                            <MatrixProject projectId={projectId} />
                        </Route>
                        <Route path="/project/:projectId/component" exact>
                            <ComponentProject projectId={projectId} />
                        </Route>
                        <Route path="*">
                            <Redirect to="/404" />
                        </Route>
                    </Switch>
                </Container>
            </main>
            <Snackbar
                open={notification.open}
                autoHideDuration={1000}
                onClose={() => {
                    setNotification(prev => ({ ...prev, open: false }))
                    setTimeout(() => {
                        setNotification(prev => {
                            prev.data.shift()
                            return { ...prev, open: prev.data.length > 0 }
                        })
                    }, 100)
                }}
                message={notification.data[0]} />
        </React.Fragment>
    )
}

export default Project