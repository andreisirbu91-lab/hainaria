import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding luxury Hainaria database...');

    // 1. Seed Admin User
    const adminEmail = 'admin@site.com';
    const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
        await prisma.adminUser.create({
            data: {
                email: adminEmail,
                passwordHash,
                name: 'Super Admin',
                role: AdminRole.ADMIN
            }
        });
        console.log('✓ Seeded Admin User: admin@site.com / ChangeMe123!');
    }

    // 1.5 Seed Demo User for TryOn
    const demoEmail = 'demo@hainaria.ro';
    const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });
    if (!existingDemo) {
        const passwordHash = await bcrypt.hash('Demo123!', 10);
        await prisma.user.create({
            data: {
                id: 'demo_user_id',
                email: demoEmail,
                passwordHash
            }
        });
        console.log('✓ Seeded Demo User for TryOn');
    }

    // 2. Clean existing dynamic data (but keep users/products if possible or clean for fresh start)
    console.log('Cleaning existing data...');
    await prisma.contentBlock.deleteMany();
    await prisma.page.deleteMany();
    await prisma.settingsStore.deleteMany();
    await prisma.productTryOnConfig.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.collection.deleteMany();

    // 3. Seed Global Settings (Autumn Feminine)
    await prisma.settingsStore.create({
        data: {
            storeName: 'Hainaria',
            accentColor: '#7A5C45',
            highlightColor: '#C6A76E',
            borderRadius: 18,
            contactEmail: 'contact@hainaria.ro',
            contactPhone: '+40 700 000 000',
            menuItems: [
                { label: 'Colecție', href: '/shop' },
                { label: 'Studio VTO', href: '/studio' },
            ],
            footerColumns: [
                {
                    title: 'Cumpărături',
                    links: [
                        { label: 'Toate Produsele', href: '/shop' },
                        { label: 'Rochii', href: '/shop?category=Rochii' },
                        { label: 'Accesorii', href: '/shop?category=Accesorii' }
                    ]
                },
                {
                    title: 'Informații',
                    links: [
                        { label: 'Despre Noi', href: '/p/despre-noi' },
                        { label: 'Termeni și Condiții', href: '/p/termeni' },
                        { label: 'Politică de Confidențialitate', href: '/p/privacy' }
                    ]
                }
            ]
        }
    });

    // 4. Seed Homepage Blocks
    await prisma.contentBlock.createMany({
        data: [
            {
                type: 'HERO',
                position: 0,
                active: true,
                content: {
                    slides: [
                        {
                            image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600',
                            title: 'Studio Virtual Try-On',
                            subtitle: 'Vizualizează cum prind viață piesele tale preferate. Îmbină tehnologia AI cu stilul personal pentru a găsi ținuta perfectă înainte de achiziție.',
                            ctaText: 'Probează ținutele cu AI',
                            ctaLink: '/studio'
                        }
                    ]
                }
            },
            {
                type: 'CATEGORY_GRID',
                position: 1,
                active: true,
                content: {
                    title: 'Cumpără după Categorie',
                    categories: [
                        { label: 'Rochii & Fuste', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600', span: 'normal', link: '/shop?category=Rochii' },
                        { label: 'Geci & Paltoane', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600', span: 'normal', link: '/shop?category=Geci' },
                        { label: 'Accesorii Premium', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600', span: 'large', link: '/shop?category=Accesorii' }
                    ]
                }
            },
            {
                type: 'NEWSLETTER',
                position: 2,
                active: true,
                content: {
                    title: 'Alătură-te Comunității Hainaria',
                    subtitle: 'Fii prima care află despre noile piese adăugate și oferte exclusive.'
                }
            }
        ]
    });

    // 5. Seed Legal Pages
    await prisma.page.createMany({
        data: [
            {
                title: 'Despre Noi',
                slug: 'despre-noi',
                content: '# Povestea Hainaria\n\nHainaria a început din pasiunea pentru modă sustenabilă și dorința de a oferi o nouă viață pieselor vestimentare de calitate.',
                status: 'PUBLISHED',
                metaTitle: 'Hainaria | Boutique Lux Sustenabil',
                metaDescription: 'Descoperă povestea noastră și angajamentul pentru modă sustenabilă.'
            },
            {
                title: 'Termeni și Condiții',
                slug: 'termeni',
                content: '# Termeni și Condiții\n\nBun venit pe Hainaria.ro. Utilizând acest site, ești de acord cu următoarele reguli...',
                status: 'PUBLISHED',
                metaTitle: 'Termeni și Condiții | Hainaria',
                metaDescription: 'Regulile și condițiile de utilizare ale platformei Hainaria.'
            }
        ]
    });

    // 6. Seed Products
    for (const p of products) {
        const { imageUrl, ...productData } = p;
        const slug = p.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(7);
        const product = await prisma.product.create({
            data: {
                ...productData,
                slug,
                status: 'PUBLISHED',
                stock: 10,
                description: `O piesă vestimentară premium: ${p.title}. Brand: ${p.brand}. Calitate garantată și autentificată.`,
                isTryOnCutout: true
            }
        });

        await prisma.productImage.create({
            data: {
                productId: product.id,
                url: imageUrl,
                isMain: true,
                position: 0
            }
        });
    }

    console.log('✓ Database seeded successfully with luxury brand data!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });

const products = [
    { title: 'Rochie Midi Cărămizie de Toamnă', brand: 'Hainaria Select', price: 240, category: 'Rochii', condition: 'Nou cu etichetă', tag: 'NEW' },
    { title: 'Cardigan Lână Merino Bej', brand: 'Mango Premium', price: 185, category: 'Pulovere', condition: 'Foarte bun' },
    { title: 'Palton Lână Oversize Camel', brand: 'Zara Studio', price: 420, category: 'Geci', condition: 'Nou cu etichetă', tag: 'LUXURY' },
    { title: 'Tricou Bumbac Basic Alb', brand: 'H&M Basic', price: 45, category: 'Tricouri', condition: 'Nou' },
    { title: 'Blugi Mom Fit Vintage', brand: 'Levi\'s', price: 155, category: 'Blugi', condition: 'Foarte bun' },
    { title: 'Poșetă Piele Cognac', brand: 'Boutique Italy', price: 310, category: 'Accesorii', condition: 'Nou cu etichetă' },
    { title: 'Rochie de Seară Smarald', brand: 'H&M Conscious', price: 195, category: 'Rochii', condition: 'Excelent', tag: 'TRENDING' },
].map(p => ({
    ...p,
    imageUrl: getProductImage(p.category)
}));

function getProductImage(cat: string) {
    const images: Record<string, string> = {
        'Rochii': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
        'Pulovere': 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600',
        'Geci': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600',
        'Tricouri': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
        'Blugi': 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&q=80&w=600',
        'Accesorii': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600',
    };
    return images[cat] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=600';
}
