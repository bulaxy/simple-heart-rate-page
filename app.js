
const express = require('express'), noble = require('@abandonware/noble'), { uuid } = require('./constants');
const app = express();
let curHr
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('index', { hr: 0 }));
app.listen(4000, () => console.log(`Server listening`));
app.get('/update', (req, res) => res.json(curHr));

noble.on('stateChange', async (state) => {
    if (state !== 'poweredOn') return
    await noble.startScanningAsync(['180d']);
});

noble.on('discover', async (peripheral) => {
    if (peripheral.uuid !== uuid) return
    console.log('Found')
    noble.stopScanningAsync();
    await peripheral.connectAsync();
    console.log('connected')
    const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(['180d'], ['2a37']);
    let characteristic = characteristics[0]
    characteristic.subscribe();
    console.log('subscribed')
    characteristic.on('data', (data) => curHr = data.toJSON().data[1]);
});
