// app/api/s3-presign/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";

const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY;

function iso8601(date = new Date()) {
    return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

export async function POST(req) {
    try {
        const { filename, type } = await req.json();
        if (!filename) throw new Error("filename requerido");

        // generamos un key único
        const ext = filename.split(".").pop();
        const key = `uploads/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext || "bin"}`;

        const host = `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;
        const url = `https://${host}/${key}`;

        const algorithm = "AWS4-HMAC-SHA256";
        const service = "s3";
        const date = new Date();
        const amzDate = iso8601(date); // yyyymmddThhmmssZ
        const shortDate = amzDate.slice(0, 8);
        const credential = `${S3_ACCESS_KEY}/${shortDate}/${S3_REGION}/${service}/aws4_request`;

        const policy = {
            expiration: new Date(date.getTime() + 10 * 60 * 1000).toISOString(),
            conditions: [
                { bucket: S3_BUCKET },
                ["starts-with", "$key", "uploads/"],
                { acl: "public-read" },
                ["content-length-range", 0, 15 * 1024 * 1024],
                { "x-amz-credential": credential },
                { "x-amz-algorithm": algorithm },
                { "x-amz-date": amzDate },
                ["starts-with", "$Content-Type", ""],
            ],
        };

        const policyBase64 = Buffer.from(JSON.stringify(policy)).toString("base64");

        function hmac(key, data) {
            return crypto.createHmac("sha256", key).update(data).digest();
        }
        const dateKey = hmac(`AWS4${S3_SECRET_KEY}`, shortDate);
        const dateRegionKey = hmac(dateKey, S3_REGION);
        const dateRegionServiceKey = hmac(dateRegionKey, service);
        const signingKey = hmac(dateRegionServiceKey, "aws4_request");
        const signature = crypto.createHmac("sha256", signingKey).update(policyBase64).digest("hex");

        const formUrl = `https://${host}/`;
        const fields = {
            key,
            acl: "public-read",
            "Content-Type": type || "application/octet-stream",
            "x-amz-algorithm": algorithm,
            "x-amz-credential": credential,
            "x-amz-date": amzDate,
            Policy: policyBase64,
            "X-Amz-Signature": signature,
        };

        return NextResponse.json({
            method: "POST",
            url: formUrl,
            fields,
            fileUrl: url,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
