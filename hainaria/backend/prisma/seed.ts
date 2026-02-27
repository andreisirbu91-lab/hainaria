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
            storeName: 'Hainăria',
            accentColor: '#7A5C45',
            highlightColor: '#C6A76E',
            borderRadius: 18,
            contactEmail: 'contact@hainaria.ro',
            contactPhone: '+40 700 000 000',
            address: 'București, România',
            instagramUrl: 'https://instagram.com/hainaria',
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

    await prisma.page.createMany({
        data: [
            {
                title: 'Despre Noi',
                slug: 'despre-noi',
                content: `# Despre Hainăria

Hainăria s-a născut din dorința de a oferi o experiență de shopping diferită — una care pune accent pe calitate, sustenabilitate și stil autentic.

## Misiunea Noastră

Credem că moda poate fi frumoasă fără a compromite valorile. Fiecare piesă din colecția noastră este atent selectată și verificată pentru calitate, autenticitate și relevanță stilistică.

## Ce Ne Face Speciali

- **Selecție Premium** — Doar piese care trec standardele noastre stricte de calitate ajung în colecție
- **Verificare Autentică** — Fiecare articol este inspectat și autentificat manual
- **Tehnologie AI** — Studio-ul nostru Virtual Try-On îți permite să probezi ținutele digital, înainte de achiziție
- **Sustenabilitate** — Dăm o a doua viață pieselor vestimentare de calitate, reducând impactul asupra mediului

## Echipa

Suntem o echipă mică dar dedicată, pasionată de modă și tehnologie. Combinăm expertiza în fashion cu inovația digitală pentru a crea cea mai bună experiență de cumpărături online.`,
                status: 'PUBLISHED',
                metaTitle: 'Despre Noi | Hainăria',
                metaDescription: 'Descoperă povestea Hainăria — modă premium, sustenabilă și verificată, cu tehnologie AI pentru try-on virtual.'
            },
            {
                title: 'Termeni și Condiții',
                slug: 'termeni',
                content: `# Termeni și Condiții

Ultima actualizare: Februarie 2026

## 1. Informații Generale

Prezentul document stabilește termenii și condițiile de utilizare a platformei hainaria.ro, operată de Hainăria SRL, cu sediul în București, România.

## 2. Definiții

- **Platforma** — site-ul web hainaria.ro și toate serviciile asociate
- **Utilizator** — orice persoană care accesează sau utilizează Platforma
- **Produse** — articolele vestimentare puse la dispoziție spre vânzare

## 3. Cont de Utilizator

Pentru a efectua achiziții, este necesară crearea unui cont. Utilizatorul este responsabil pentru păstrarea confidențialității datelor de autentificare.

## 4. Cumpărarea Produselor

Toate produsele afișate sunt disponibile în limita stocului. Prețurile sunt exprimate în RON și includ TVA. Plata se efectuează online, prin metodele disponibile pe platformă.

## 5. Livrare și Retur

Livrarea se realizează prin curier, în termen de 2-5 zile lucrătoare. Dreptul de retur se exercită în termen de 14 zile de la primirea produsului, conform legislației în vigoare.

## 6. Proprietate Intelectuală

Toate materialele de pe platformă (texte, imagini, logo-uri, design) sunt proprietatea Hainăria SRL și sunt protejate de legea drepturilor de autor.

## 7. Contact

Pentru orice întrebări legate de acești termeni, ne puteți contacta la contact@hainaria.ro.`,
                status: 'PUBLISHED',
                metaTitle: 'Termeni și Condiții | Hainăria',
                metaDescription: 'Termenii și condițiile de utilizare ale platformei Hainăria.'
            },
            {
                title: 'Politică de Confidențialitate',
                slug: 'privacy',
                content: `# Politică de Confidențialitate

## Datele pe care le colectăm

Colectăm date personale necesare pentru procesarea comenzilor: nume, adresă de email, adresă de livrare, număr de telefon și informații de plată.

## Scopul prelucrării

Datele sunt utilizate exclusiv pentru:
- Procesarea și livrarea comenzilor
- Comunicări legate de statusul comenzii
- Îmbunătățirea serviciilor noastre

## Protecția datelor

Utilizăm măsuri tehnice și organizatorice adecvate pentru a proteja datele personale împotriva accesului neautorizat, pierderii sau distrugerii.

## Drepturile tale

Ai dreptul de a accesa, rectifica sau șterge datele tale personale în orice moment, contactându-ne la contact@hainaria.ro.`,
                status: 'PUBLISHED',
                metaTitle: 'Politică de Confidențialitate | Hainăria',
                metaDescription: 'Politica de confidențialitate și protecția datelor personale pe platforma Hainăria.'
            },
            {
                title: 'Contact',
                slug: 'contact',
                content: `# Contactează-ne

Ne bucurăm să auzim de la tine! Folosește una dintre metodele de mai jos pentru a ne contacta.

## Email
contact@hainaria.ro

## Telefon
+40 700 000 000

Programul de lucru: Luni - Vineri, 09:00 - 18:00

## Adresă
București, România

## Rețele Sociale
Ne găsești și pe Instagram: @hainaria`,
                status: 'PUBLISHED',
                metaTitle: 'Contact | Hainăria',
                metaDescription: 'Contactează echipa Hainăria — email, telefon sau rețele sociale.'
            },
            {
                title: 'Întrebări Frecvente',
                slug: 'faq',
                content: `# Întrebări Frecvente

## Cum funcționează procedura de try-on virtual?

Încarcă o fotografie cu tine, alege un produs din colecție, iar inteligența artificială va genera o imagine cu tine purtând articolul selectat.

## Care este politica de retur?

Acceptăm retururi în termen de 14 zile de la primirea produsului. Articolul trebuie să fie în starea originală, cu etichetele atașate.

## Cât durează livrarea?

Livrăm prin curier rapid în 2-5 zile lucrătoare, în toată România.

## Produsele sunt autentice?

Da, fiecare produs este verificat și autentificat manual de echipa noastră înainte de a fi listat pe platformă.

## Cum pot contacta echipa de suport?

Ne poți scrie la contact@hainaria.ro sau ne poți suna la +40 700 000 000, Luni - Vineri, 09:00 - 18:00.`,
                status: 'PUBLISHED',
                metaTitle: 'Întrebări Frecvente | Hainăria',
                metaDescription: 'Răspunsuri la cele mai frecvente întrebări despre Hainăria — livrare, returnări, try-on virtual.'
            },
            {
                title: 'Livrare și Retur',
                slug: 'livrare',
                content: `# Livrare și Retur

## Livrare

- **Termen de livrare:** 2-5 zile lucrătoare
- **Cost livrare:** Gratuit pentru comenzi peste 300 RON
- **Curier:** Fan Courier / Sameday
- **Zonă de acoperire:** Toată România

## Retur

- **Termen retur:** 14 zile de la primirea coletului
- **Condiții:** Produsul trebuie returnat în starea originală, cu etichetele atașate
- **Procedură:** Contactează-ne la contact@hainaria.ro cu numărul comenzii
- **Rambursare:** În termen de 7 zile lucrătoare de la primirea returului`,
                status: 'PUBLISHED',
                metaTitle: 'Livrare și Retur | Hainăria',
                metaDescription: 'Informații despre livrare și politica de retur — Hainăria.'
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
