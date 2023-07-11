import React from 'react';
import { Avatar, Button, TextField, Paper, Grid, Typography, CssBaseline } from '@material-ui/core';
import { AccountTree } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { APP_NAME } from './ConstConfig';
import { Link } from 'react-router-dom';
const useStyles = makeStyles((theme) => ({
    bg: {
        height: '100vh',
        backgroundImage: 'url(/electronic_unsplash.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        padding: theme.spacing(2)
    },
    avatar: {
        padding: theme.spacing(0.5),
        backgroundColor: theme.palette.primary.main
    },
    cp: {
        marginTop: theme.spacing(2)
    }
}));

const Home = () => {

    React.useEffect(()=>document.title=APP_NAME,[])

    const classes = useStyles();

    const [inputValue,setInputValue] = React.useState({
        projectId:undefined,
        nama:window.sessionStorage.getItem('nama')
    })
    window.sessionStorage.setItem('nama',inputValue.nama)
    return (
        <main>
            <Grid container className={classes.bg} justifyContent="center" alignItems="center">
                <CssBaseline />
                <Grid item xs="10" md="4" >
                    <Paper className={classes.paper}>
                        <Grid
                            container
                            direction="column"
                            alignItems="center">
                            <Avatar className={classes.avatar} variant="square" component={AccountTree} />
                            <TextField
                                id="projectId"
                                label="ID Projek"
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                value={inputValue.projectId}
                                onChange={(e)=>setInputValue(prev=>({...prev,projectId:e.target.value}))}/>
                            <TextField
                                id="nama"
                                label="Nama"
                                autoComplete="name"
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                value={window.sessionStorage.getItem('nama')}
                                onChange={(e)=>setInputValue(prev=>({...prev,nama:e.target.value}))}/>
                            <Button variant="contained" component={Link} to={typeof inputValue.projectId == 'string' && inputValue.projectId.length > 0 ? `/project/${encodeURIComponent(inputValue.projectId)}` : '#'} color="primary" fullWidth>Masuk</Button>
                            <Typography variant="body2" color="textSecondary" className={classes.cp}>Copyright © Taqiy Asyam 2021</Typography>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </main>
    );
}

export default Home