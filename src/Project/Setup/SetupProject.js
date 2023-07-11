import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@material-ui/core";
import { Delete as DeleteIcon, Add as AddIcon } from "@material-ui/icons";
import React from "react";
import useWebSocket from "react-use-websocket";
import { APP_NAME, WS_URL } from "../../ConstConfig";

const useStyle = makeStyles(theme => ({
    list: {
        backgroundColor: theme.palette.background.paper,
        margin: theme.spacing(2)
    },
    submit: {
        marginTop: theme.spacing(4),
    }
}))

const SetupProject = ({ projectId }) => {
    React.useEffect(
        () => {
            document.title = 'Setup ' + projectId + ' | ' + APP_NAME
            return () => document.title = APP_NAME
        }
        , [])

    const classes = useStyle()
    const [mainSetupLast, setMainSetupLast] = React.useState(undefined)
    const [mainSetup, setMainSetup] = React.useState(undefined)
    const [dialogSaveConfirm, setDialogSetConfirm] = React.useState(false)
    const deleteIOOnClick = (type, index) => {
        mainSetup[type].splice(index, 1)
        setMainSetup({ ...mainSetup })
        remappingDevice(mainSetup)
    }

    const onMessage = e => {
        try {
            const data = JSON.parse(e.data)
            if (data.req == 'setup_project') {
                if (mainSetup == undefined) {
                    setMainSetup(data.data)
                    setMainSetupLast(undefined)
                } else
                    setMainSetupLast(data.data)
            }
        } catch (e) { }
    }

    const wsState = useWebSocket(WS_URL + '/project/' + encodeURI(projectId) + '/setup', {
        shouldReconnect: () => true,
        onMessage
    })

    const IOOnChange = (i_o, type, index, newVal) => {
        mainSetup[i_o].splice(index, 1, {
            ...mainSetup[i_o][index],
            [type]: newVal
        })
        setMainSetup({ ...mainSetup })
    }

    const addIOOnClick = (i_o) => {
        const mainSetupTemp = mainSetup || { in: [], out: [] }
        let to8 = 8 - (mainSetupTemp[i_o].length % 8)
        if (to8 == 0)
            to8 = 8
        to8 += mainSetupTemp[i_o].length
        for (let i = mainSetupTemp[i_o].length; i < to8; i++) {
            mainSetupTemp[i_o].push((i_o == 'in') ? {
                component_id: 'COMP' + i,
                component_pin: 'O',
            } : {
                component_id: 'COMP' + Math.floor(i / 2),
                component_pin: 'I' + (i % 2),
            })
        }
        setMainSetup({ ...mainSetupTemp })
        remappingDevice(mainSetupTemp)
    }

    const mapDeviceOnChange = (t, l, newVal) => {
        mainSetup.dev_position[t][l] = newVal
        setMainSetup({ ...mainSetup })
    }

    const saveOnClick = () => {
        wsState.sendJsonMessage({
            req: "setup_project",
            nama: window.sessionStorage.getItem('nama'),
            data: { in: mainSetup.in, out: mainSetup.out, dev_position: mainSetup.dev_position }
        })
        setDialogSetConfirm(false)
    }

    const remappingDevice = (mainSetupTemp) => {
        let dev_position = [];
        for (let t = 0; t < Math.ceil(mainSetupTemp.in.length / 8); t++) {
            if (dev_position[t] == undefined)
                dev_position[t] = []
            for (let l = 0; l < Math.ceil(mainSetupTemp.out.length / 8); l++) {
                dev_position[t][l] = ''
                if (Array.isArray(mainSetupTemp.dev_position) && Array.isArray(mainSetupTemp.dev_position[t]) && mainSetupTemp.dev_position[t][l] !== undefined)
                    dev_position[t][l] = mainSetupTemp.dev_position[t][l]
            }
        }
        setMainSetup(prev => ({ ...prev, dev_position }))
    }

    const IOMap = { in: [], out: [] }
    if (mainSetup != undefined) {
        for (let t = 0; t < Math.ceil(mainSetup.in.length / 8); t++)
            IOMap.in.push(`i_${t * 8} ... i_${t * 8 + 7}`)
        for (let l = 0; l < Math.ceil(mainSetup.out.length / 8); l++)
            IOMap.out.push(`o_${l * 8} ... o_${l * 8 + 7}`)
    }

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Input</Typography>
                    <i>(dari Output Komponen)</i>
                    <List className={classes.list}>
                        {mainSetup != undefined && mainSetup.in.map((in_val, i) => (
                            <ListItem>
                                <TextField
                                    label={'ID Grup Komponen (i_' + i.toString() + ')'}
                                    value={in_val.component_id}
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) => IOOnChange('in', 'component_id', i, e.target.value)} />
                                <TextField
                                    label={'Pin Komponen (i_' + i.toString() + ')'}
                                    value={in_val.component_pin}
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) => IOOnChange('in', 'component_pin', i, e.target.value)} />
                                <IconButton edge="end" onClick={() => deleteIOOnClick('in', i)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                        ))}
                        <ListItem button onClick={() => addIOOnClick('in')}>
                            <ListItemIcon>
                                <AddIcon />
                            </ListItemIcon>
                            <ListItemText primary="Tambah Input" />
                        </ListItem>
                    </List>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Output</Typography>
                    <i>(ke Input Komponen)</i>
                    <List className={classes.list}>
                        {mainSetup != undefined && mainSetup.out.map((out_val, i) => (
                            <ListItem>
                                <TextField
                                    label={'ID Grup Komponen (o_' + i.toString() + ')'}
                                    value={out_val.component_id}
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) => IOOnChange('out', 'component_id', i, e.target.value)} />
                                <TextField
                                    label={'Pin Komponen (o_' + i.toString() + ')'}
                                    value={out_val.component_pin}
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) => IOOnChange('out', 'component_pin', i, e.target.value)} />
                                <IconButton edge="end" onClick={() => deleteIOOnClick('out', i)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                        ))}
                        <ListItem button onClick={() => addIOOnClick('out')}>
                            <ListItemIcon>
                                <AddIcon />
                            </ListItemIcon>
                            <ListItemText primary="Tambah Output" />
                        </ListItem>
                    </List>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">Posisi Modul Matrix</Typography>
                    <i>(berhati-hatilah bila menggunakan modul yang sama pada projek lain)</i>
                </Grid>
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>I/O</TableCell>
                                    {
                                        IOMap.out.map(out_map => (<TableCell>{out_map}</TableCell>))
                                    }
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    IOMap.in.map((in_map, t) => (
                                        <TableRow>
                                            <TableCell><b>{in_map}</b></TableCell>
                                            {
                                                IOMap.out.map((out_map, l) => (
                                                    <TableCell>
                                                        <TextField
                                                            label={`ID Matrix ${in_map} ${out_map}`}
                                                            value={mainSetup.dev_position[t][l]}
                                                            variant="standard"
                                                            fullWidth
                                                            onChange={(e) => mapDeviceOnChange(t, l, e.target.value)} />
                                                    </TableCell>
                                                ))
                                            }
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item>
                    <Dialog
                        open={dialogSaveConfirm}
                        onClose={() => setDialogSetConfirm(false)}>
                        <DialogTitle>Konfirmasi</DialogTitle>
                        <DialogContent>Apakah Anda ingin menyimpan pengaturan projek ini?</DialogContent>
                        <DialogActions>
                            <Button variant="contained" color="primary" onClick={saveOnClick}>Ya</Button>
                            <Button variant="outlined" color="secondary" onClick={() => setDialogSetConfirm(false)}>Tidak</Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" className={classes.submit} color="primary" onClick={() => setDialogSetConfirm(true)}>Simpan</Button>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default SetupProject