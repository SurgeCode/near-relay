
import { NextRequest, NextResponse } from "next/server";
import { createAccount } from '@near-relay/server'

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { publicKey, accountId } = await req.json();

        const receipt = await createAccount(accountId, publicKey)

        return NextResponse.json(receipt, {
            status: 200,
            headers: { "content-type": "application/json" },
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { msg: error.toString(), error },
            { headers: { "content-type": "application/json" }, status: 500 }
        );
    }
}
