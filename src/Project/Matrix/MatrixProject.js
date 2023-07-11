import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Paper, Tab, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip } from "@material-ui/core"
import React from "react"
import useWebSocket from "react-use-websocket"
import { APP_NAME, WS_URL } from "../../ConstConfig"
import { SignalCellularConnectedNoInternet0Bar as NoInternetIcon, RotateLeft as ResetIcon, Sync as SyncIcon, SyncAlt as ReadIOIcon, Settings as SettingsIcon } from "@material-ui/icons"
const MatrixProject = ({ projectId }) => {
    React.useEffect(() => {
        document.title = 'Matrix ' + projectId + ' | ' + APP_NAME
        return () => document.title = APP_NAME
    }, [])
    const [hoverableIO, setHoverableIO] = React.useState({
        in: [],
        out: []
    })
    const resetHoverable = () => setHoverableIO({ in: [], out: [] })

    const [setupData, setSetupData] = React.useState(undefined)
    const [mainMatrixData, setMainMatrixData] = React.useState(undefined)
    const [matrixData, setMatrixData] = React.useState(undefined)

    const [valReadIO, setValReadIO] = React.useState({
        open: false,
        tabIndex: 0,
        read_io: {
            i: true,
            o: true
        },
        set_read: {
            dly_r_min_ms: 500,
            i_margin: 1,
            o_margin: 1
        }
    })

    const [in7Data, setIn7Data] = React.useState({
        i: undefined,
        i_7_no: false,
        dly_us: 0,
        dly_ms: 0
    })

    const onMessage = e => {
        try {
            const data = JSON.parse(e.data)
            if (data.req == 'setup_matrix') {
                setSetupData(data.data)
            } else if (data.req == 'data_main_matrix') {
                setMainMatrixData(data.data)
            } else if (data.req == 'data_matrix') {
                setMatrixData(data.data)
            }
        } catch (e) { }
    }

    const wsState = useWebSocket(WS_URL + '/project/' + encodeURI(projectId) + '/matrix', {
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

    const syncOnClick = () => wsState.sendJsonMessage({
        req: 'sync',
        nama: window.sessionStorage.getItem('nama'),
    })

    const resetAllOnClick = () => wsState.sendJsonMessage({
        req: 'reset_all',
        nama: window.sessionStorage.getItem('nama'),
    })

    const resetOutOnClick = (out) => wsState.sendJsonMessage({
        req: 'reset_out',
        nama: window.sessionStorage.getItem('nama'),
        data: out
    })

    const readIODialogOnClick = () => {
        setValReadIO({
            open: true,
            tabIndex: 0,
            read_io: {
                i: true,
                o: true
            },
            set_read: {
                dly_r_min_ms: 500,
                i_margin: 1,
                o_margin: 1
            }
        })
    }

    const setReadOnClick = () => {
        setValReadIO(prev => ({ ...prev, open: false }))
        wsState.sendJsonMessage({
            req: "set_read",
            nama: window.sessionStorage.getItem('nama'),
            data: valReadIO.set_read
        })
    }

    const readIOOnClick = () => {
        setValReadIO(prev => ({ ...prev, open: false }))
        wsState.sendJsonMessage({
            req: "read_io",
            nama: window.sessionStorage.getItem('nama'),
            data: valReadIO.read_io
        })
    }

    const in7DialogOnClick = (i_7) => {
        setIn7Data({
            i: i_7,
            i_7_no: mainMatrixData.o_0.i_7.no===true,
            dly_us: 0,
            dly_ms: 0
        })
    }

    const setIn7OnClick = () => {
        setIn7Data(prev => ({ ...prev, i: undefined }))
        wsState.sendJsonMessage({
            req: "set_in_7",
            nama: window.sessionStorage.getItem('nama'),
            data: in7Data
        })
    }

    return (
        <React.Fragment>
            <TableContainer component={Paper}>
                <TableHead>
                    <TableCell>I/O</TableCell>
                    {
                        setupData != undefined && Object.keys(setupData.o).map(val => (
                            <TableCell
                                style={hoverableIO.out.includes(val) ? { backgroundColor: 'gray' } : {}}
                                onMouseEnter={() => {
                                    if (matrixData != undefined && matrixData[val] != undefined)
                                        setHoverableIO({ in: matrixData[val], out: [val] })
                                }}
                                onMouseLeave={resetHoverable}>
                                {val}<br />{setupData.o[val]}
                            </TableCell>
                        ))
                    }
                </TableHead>
                <TableBody>
                    {
                        setupData != undefined && Object.keys(setupData.i).map((in_val, in_i) => (
                            <TableRow>
                                <TableCell
                                    style={hoverableIO.in.includes(in_val) ? { backgroundColor: 'gray' } : {}}
                                    onMouseEnter={() => {
                                        if (matrixData != undefined && matrixData[in_val] != undefined)
                                            setHoverableIO({ in: [in_val], out: matrixData[in_val] })
                                    }}
                                    onMouseLeave={resetHoverable}>
                                    <b>{in_val}<br />{setupData.i[in_val]}</b>
                                    {
                                        in_i % 8 == 7 && in_val == 'i_' + in_i && (
                                            <div>
                                                <IconButton onClick={()=>in7DialogOnClick(in_val)}>
                                                    <SettingsIcon />
                                                </IconButton>
                                            </div>
                                        )
                                    }
                                </TableCell>
                                {
                                    setupData != undefined && Object.keys(setupData.o).map(out_val => (
                                        <TableCell
                                            style={(hoverableIO.in.includes(in_val) || hoverableIO.out.includes(out_val)) ? { backgroundColor: 'lightgray' } : {}}
                                            onMouseEnter={() => setHoverableIO({ in: [in_val], out: [out_val] })}
                                            onMouseLeave={resetHoverable} >
                                            {
                                                mainMatrixData != undefined && mainMatrixData[out_val][in_val].is_online === true ? (
                                                    <React.Fragment>
                                                        <Checkbox
                                                            checked={mainMatrixData[out_val][in_val].wired === true}
                                                            onChange={() => {
                                                                if (mainMatrixData[out_val][in_val].wired === false)
                                                                    connectIO(out_val, in_val)
                                                                else
                                                                    disconnectIO(out_val, in_val)
                                                            }} />
                                                        {(mainMatrixData[out_val][in_val].wired === true || (hoverableIO.in.includes(in_val) && hoverableIO.out.includes(out_val))) && (
                                                            <div>
                                                                {mainMatrixData[out_val][in_val].in.toFixed(3)} V ({in_val})
                                                                <br />{mainMatrixData[out_val][in_val].out.toFixed(3)} V ({out_val})
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                ) : (<NoInternetIcon />)
                                            }
                                        </TableCell>
                                    ))
                                }
                            </TableRow>
                        ))
                    }
                    <TableRow>
                        <TableCell>
                            <Tooltip title="Sync">
                                <IconButton onClick={syncOnClick}>
                                    <SyncIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Read I/O">
                                <IconButton>
                                    <ReadIOIcon onClick={readIODialogOnClick} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Reset All">
                                <IconButton>
                                    <ResetIcon onClick={resetAllOnClick} />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                        {
                            setupData != undefined && Object.keys(setupData.o).map(val => (
                                <TableCell>
                                    <Button
                                        onMouseEnter={() => setHoverableIO({ in: [], out: [val] })}
                                        onMouseLeave={resetHoverable}
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => resetOutOnClick(val)}
                                        fullWidth>
                                        Reset ({val})
                                    </Button>
                                </TableCell>
                            ))
                        }
                    </TableRow>
                </TableBody>
            </TableContainer>

            <Dialog
                open={valReadIO.open}
                onClose={() => setValReadIO(prev => ({ ...prev, open: false }))}>
                <DialogTitle>Membaca I/O</DialogTitle>
                <DialogContent>
                    <div>
                        <Tabs value={valReadIO.tabIndex} onChange={(e, i) => setValReadIO({ ...valReadIO, tabIndex: i })}>
                            <Tab label="Membaca Sekali" />
                            <Tab label="Membaca Terus" />
                        </Tabs>
                        <div
                            role="tabpanel"
                            hidden={valReadIO.tabIndex != 0}>
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        checked={valReadIO.read_io.i}
                                        onChange={e => setValReadIO(prev => {
                                            prev.read_io.i = e.target.checked
                                            return { ...prev }
                                        })}
                                    />
                                )}
                                label="Membaca Pin Input" />
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        checked={valReadIO.read_io.o}
                                        onChange={e => setValReadIO(prev => {
                                            prev.read_io.o = e.target.checked
                                            return { ...prev }
                                        })}
                                    />
                                )}
                                label="Membaca Pin Output" />
                        </div>
                        <div
                            role="tabpanel"
                            hidden={valReadIO.tabIndex != 1}>
                            <TextField
                                label="Lama Jarak Minimum Pembacaan (ms)"
                                fullWidth
                                variant="outlined"
                                style={{ margin: '10px' }}
                                type="number"
                                InputProps={{
                                    inputProps: { step: 100, min: -100 }
                                }}
                                value={valReadIO.set_read.dly_r_min_ms}
                                onChange={e => setValReadIO(prev => {
                                    prev.set_read.dly_r_min_ms = parseInt(e.target.value)
                                    return { ...prev }
                                })} />
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        checked={valReadIO.set_read.dly_r_min_ms < 0}
                                        onChange={e => setValReadIO(prev => {
                                            prev.set_read.dly_r_min_ms = (e.target.checked) ? -1 : 500
                                            return { ...prev }
                                        })}
                                    />
                                )}
                                label="Matikan Pembacaan" />
                            <TextField
                                label="Minimum Selisih Nilai Pembacaan Input"
                                fullWidth
                                variant="outlined"
                                style={{ margin: '10px' }}
                                type="number"
                                InputProps={{
                                    inputProps: { step: 0.05, min: -0.05 }
                                }}
                                value={valReadIO.set_read.i_margin}
                                onChange={e => setValReadIO(prev => {
                                    prev.set_read.i_margin = parseFloat(e.target.value)
                                    return { ...prev }
                                })}
                            />
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        checked={valReadIO.set_read.i_margin < 0}
                                        onChange={e => setValReadIO(prev => {
                                            prev.set_read.i_margin = (e.target.checked) ? -0.05 : 1.0
                                            return { ...prev }
                                        })}
                                    />
                                )}
                                label="Matikan Pembacaan Pin Input" />
                            <TextField
                                label="Minimum Selisih Nilai Pembacaan Output"
                                fullWidth
                                variant="outlined"
                                style={{ margin: '10px' }}
                                type="number"
                                InputProps={{
                                    inputProps: { step: 0.05, min: -0.05 }
                                }}
                                value={valReadIO.set_read.o_margin}
                                onChange={e => setValReadIO(prev => {
                                    prev.set_read.o_margin = parseFloat(e.target.value)
                                    return { ...prev }
                                })}
                            />
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        checked={valReadIO.set_read.o_margin < 0}
                                        onChange={e => setValReadIO(prev => {
                                            prev.set_read.o_margin = (e.target.checked) ? -0.05 : 1.0
                                            return { ...prev }
                                        })}
                                    />
                                )}
                                label="Matikan Pembacaan Pin Output" />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    {
                        valReadIO.tabIndex == 0 && (
                            <Button variant="contained" color="primary" onClick={readIOOnClick}>Baca Sekali</Button>
                        )
                    }
                    {
                        valReadIO.tabIndex == 1 && (
                            <Button variant="contained" color="primary" onClick={setReadOnClick}>Baca Terus</Button>
                        )
                    }
                    <Button variant="outlined" color="secondary" onClick={() => setValReadIO(prev => ({ ...prev, open: false }))}>Batal</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={in7Data.i !== undefined}
                onClose={()=>setIn7Data(prev=>({...prev, i:undefined}))}>
                <DialogTitle>Pengaturan {in7Data.i}</DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={(
                            <Checkbox
                                checked={in7Data.i_7_no === true}
                                onChange={e => setIn7Data(prev => ({ ...prev, i_7_no: e.target.checked }))}
                            />
                        )}
                        label="I_7 modul terhubung NO" />
                    <FormControlLabel
                        control={(
                            <Checkbox
                                checked={in7Data.dly_us > 0 || in7Data.dly_ms > 0}
                                onChange={e => setIn7Data(prev => {
                                    if (e.target.checked)
                                        prev = { ...prev, dly_ms: 2, dly_us: 0 }
                                    else
                                        prev = { ...prev, dly_ms: 0, dly_us: 0 }
                                    return { ...prev }
                                })}
                            />
                        )}
                        label={`Dengan Pulsa (${in7Data.i_7_no === true ? 'NO-NC-NO' : 'NC-NO-NC'})`} />
                    <TextField
                        label="Lama Pulsa (us)"
                        fullWidth
                        variant="outlined"
                        type="number"
                        InputProps={{
                            inputProps: { step: 100, min: 0 }
                        }}
                        value={in7Data.dly_us}
                        onChange={e => setIn7Data(prev => {
                            prev.dly_us = parseInt(e.target.value)
                            return { ...prev }
                        })}
                    />
                    <TextField
                        label="Lama Pulsa (ms)"
                        fullWidth
                        variant="outlined"
                        style={{ marginTop: '10px' }}
                        type="number"
                        InputProps={{
                            inputProps: { step: 1, min: 0 }
                        }}
                        value={in7Data.dly_ms}
                        onChange={e => setIn7Data(prev => {
                            prev.dly_ms = parseInt(e.target.value)
                            return { ...prev }
                        })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={setIn7OnClick}>Set</Button>
                    <Button variant="outlined" color="secondary" onClick={()=>setIn7Data(prev=>({...prev, i:undefined}))}>Batal</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

export default MatrixProject