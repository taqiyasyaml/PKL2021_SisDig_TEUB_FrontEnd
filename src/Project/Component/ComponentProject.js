import Diagram from "beautiful-react-diagrams";
import React from "react";
import useWebSocket from "react-use-websocket";
import { APP_NAME, WS_URL } from "../../ConstConfig";
import 'beautiful-react-diagrams/styles.css';

const ComponentProject = ({ projectId }) => {
    React.useEffect(
        () => {
            document.title = 'Komponen ' + projectId + ' | ' + APP_NAME
            return () => document.title = APP_NAME
        }
        , [])

    const [nodesComponent, setNodesComponent] = React.useState([])
    const [linksComponent, setLinksComponent] = React.useState([])

    const onRemoveLinks = (links) => {
        if (!Array.isArray(links) || links.length == 0)
            return;
        links.forEach(l => disconnectIO(l.output, l.input))
    }

    const onAddLinks = (links) => {
        if (!Array.isArray(links) || links.length == 0)
            return;
        links.forEach(l => connectIO(l.output, l.input))
    }

    const onDiagramChange = (data) => {
        const addedLinks = (oldLinks, newLinks) => {
            const links = []
            for (const link of newLinks) {
                const indexOldLink = oldLinks.findIndex(l => (l.input == link.input && l.output == link.output) || (l.input == link.output && l.output == link.input))
                if (indexOldLink >= 0)
                    oldLinks.splice(indexOldLink, 1)
                else
                    links.push(link)
            }
            return links
        }
        if (data.nodes !== undefined)
            setNodesComponent([...data.nodes])
        if (Array.isArray(data.links)) {
            // setLinksComponent([...data.links])
            onRemoveLinks(addedLinks(data.links, linksComponent))
            onAddLinks(addedLinks(linksComponent, data.links))
        }
    }


    const setNodesComponentRaw = (data) => {
        if (!Array.isArray(data))
            data = []
        let x = 50, y = 50
        if (nodesComponent.length > 0 && Array.isArray(nodesComponent[nodesComponent.length - 1].coordinates))
            [x, y] = nodesComponent[nodesComponent.length - 1].coordinates
        for (const i in data) {
            if (data[i].coordinates == undefined) {
                const sameNode = nodesComponent.find(e => e.id == data[i].id)
                if (sameNode && sameNode.coordinates)
                    data[i].coordinates = sameNode.coordinates
                else {
                    data[i].coordinates = [x, y]
                    x += 150
                    if (x > window.innerWidth) {
                        x = 50
                        y += 150
                    }
                }
            }
            data[i].render = CustomNode
        }
        setNodesComponent(data)
    }

    const onMessage = e => {
        try {
            const data = JSON.parse(e.data)
            if (data.req == 'setup_component') {
                setNodesComponentRaw(data.data)
            } else if (data.req == 'data_component') {
                setLinksComponent(data.data)
            }
        } catch (e) { }
    }

    const wsState = useWebSocket(WS_URL + '/project/' + encodeURI(projectId) + '/component', {
        shouldReconnect: () => true,
        onMessage
    })

    const connectIO = (o, i) => {
        wsState.sendJsonMessage({
            req: 'connect_io',
            nama: window.sessionStorage.getItem('nama'),
            data: { i, o }
        })
    }

    const disconnectIO = (o, i) => {
        wsState.sendJsonMessage({
            req: 'disconnect_io',
            nama: window.sessionStorage.getItem('nama'),
            data: { i, o }
        })
    }

    const CustomNode = (props) => {
        const { content, inputs, outputs } = props;

        return (
            <div style={{ background: 'rgba(80,80,80,0.3)', borderRadius: '10px' }}>
                <div style={{ padding: '5px', width: 'auto', textAlign: 'center' }}>
                    {content}
                </div>
                <div style={{ paddingBottom: '10px', display: 'flex' }}>
                    <div style={{ marginRight: '5px' }}>
                        {inputs.map((port) => (
                            <div>
                                <span style={{ marginLeft: '3px' }}>{port.props.label} ({port.props.id})</span>
                                {
                                    React.cloneElement(port,
                                        { style: { width: '20px', height: '20px', background: 'darkgray' } })
                                }
                            </div>
                        ))}
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        {outputs.map((port) => (
                            <div>
                                <span style={{ marginRight: '3px' }}>{port.props.label} ({port.props.id})</span>
                                {
                                    React.cloneElement(port,
                                        { style: { width: '20px', height: '20px', background: 'darkgray', marginLeft: 'auto' } })
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <React.Fragment>
            <Diagram
                schema={{ nodes: nodesComponent, links: linksComponent }}
                style={{ height: '100vh' }}
                onChange={onDiagramChange} />
        </React.Fragment>
    )
}

export default ComponentProject