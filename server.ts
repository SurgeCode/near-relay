import { relay } from ".";
const express = require('express');
const app = express();

app.use(express.json());

app.post('/', async (req: any, res: any) => {
    const body = req.body;

    const result = await relay(body, { network: 'testnet', relayerAccountId: "", relayerPrivateKey: "" })

    res.json({ message: 'Relayer ', data: result });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
