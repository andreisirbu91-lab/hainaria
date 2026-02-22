require('dotenv').config();
const Replicate = require('replicate');

async function testReplicate() {
    console.log('Token check:', process.env.REPLICATE_API_TOKEN ? 'EXISTS' : 'MISSING');

    const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
    });

    try {
        console.log('Running specific IDM-VTON test...');
        const output = await replicate.run(
            "cuiaxi/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
            {
                input: {
                    crop: false,
                    seed: 42,
                    steps: 30,
                    category: "upper_body",
                    force_dc: false,
                    garm_img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
                    human_img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
                    garment_des: "t-shirt"
                }
            }
        );
        console.log('SUCCESS:', output);
    } catch (e) {
        console.error('ERROR during replicate RUN:', e.message || e);
    }
}

testReplicate();
