import { createAccount, relay } from "./src";
const express = require('express');
const app = express();
var cors = require('cors')
app.use(cors())
app.use(express.json());

app.post('/', async (req: any, res: any) => {
    const body = req.body;
    const results = await relay(body)
    res.json({ message: 'Relayed', data: results });
});

app.post('/create-account', async (req: any, res: any) => {
    const body = req.body;
    const result = await createAccount(body.accountId, body.publicKey)
    res.json({ message: 'Relayed', data: result });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
