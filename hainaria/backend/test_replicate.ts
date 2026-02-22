import { PrismaClient } from '@prisma/client';
import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const prisma = new PrismaClient();

async function runTest() {
    console.log('--- STARTING AI TRY-ON TEST ---');
    try {
        // 1. Verificare Replicate Token
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error('REPLICATE_API_TOKEN lipseste din .env!');
        }
        console.log('Token găsit:', process.env.REPLICATE_API_TOKEN.substring(0, 5) + '...');

        // 2. Găsește un user de test
        const user = await prisma.user.findFirst();
        if (!user) throw new Error('Nu exista utilizatori in DB.');
        console.log('Testam cu utilizatorul:', user.email);

        // 3. Ia un produs de try-on
        const prodConf = await prisma.productTryOnConfig.findFirst({
            include: { product: true }
        });
        if (!prodConf) throw new Error('Nu exista produse cu TryOnConfig.');
        console.log('Produs selectat:', prodConf.product.title);

        // 4. Testam Replicate API cu poze dummy direct din Unsplash pt a valida conexiunea
        console.log('--- TESTAM REPLICATE DIRECT ---');
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        const humanImgUrl = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80"; // random fashion model
        const garmImgUrl = prodConf.product.imageUrl; // The product image

        console.log('Calling Replicate cuiaxi/idm-vton...');
        const startTime = Date.now();

        try {
            const output = await replicate.run(
                "cuiaxi/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
                {
                    input: {
                        crop: false,
                        seed: 42,
                        steps: 30,
                        category: "upper_body",
                        force_dc: false,
                        garm_img: garmImgUrl,
                        human_img: humanImgUrl,
                        garment_des: "clothing item"
                    }
                }
            );
            console.log(`Replicate SUCCESS in ${(Date.now() - startTime) / 1000}s! Output:`, output);
        } catch (e: any) {
            console.error(`Replicate FAILED in ${(Date.now() - startTime) / 1000}s! Error:`, e.message || e);
        }

    } catch (e: any) {
        console.error('Test script failed:', e.message || e);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
