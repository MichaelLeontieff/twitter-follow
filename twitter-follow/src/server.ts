import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(express.static('serve/client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(8000, () => {
    console.log('server started');
});