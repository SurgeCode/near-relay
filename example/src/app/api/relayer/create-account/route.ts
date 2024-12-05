
import { NextRequest, NextResponse } from "next/server";
import { createAccount } from '@near-relay/server'
import { FinalExecutionStatus } from "near-api-js/lib/providers";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { publicKey, accountId } = await req.json();

        const receipt = await createAccount(accountId, publicKey)
        if ((receipt.status as FinalExecutionStatus).SuccessValue === 'ZmFsc2U=') {
            return NextResponse.json(
                { error: "Account creation failed" },
                { headers: { "content-type": "application/json" }, status: 409 }
            );
        }
        return NextResponse.json(receipt, {
            status: 201,
            headers: { "content-type": "application/json" },
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { headers: { "content-type": "application/json" }, status: 500 }
        );
    }
}
