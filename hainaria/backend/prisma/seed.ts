import { PrismaClient, GarmentType } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

function getGarmentType(category: string): GarmentType {
    switch (category) {
        case 'Geci': return GarmentType.OUTER;
        case 'Tricouri': return GarmentType.TOP;
        case 'Pulovere': return GarmentType.TOP;
        case 'Blugi': return GarmentType.BOTTOM;
        case 'Rochii': return GarmentType.DRESS;
        case 'Încălțăminte': return GarmentType.SHOES;
        case 'Accesorii': return GarmentType.ACCESSORY;
        default: return GarmentType.ACCESSORY;
    }
}

async function main() {
    console.log('Seeding database...');
    await prisma.productTryOnConfig.deleteMany();
    await prisma.product.deleteMany();
    for (const p of products) {
        const product = await prisma.product.create({ data: { ...p, isTryOnCutout: true } });
        // NOTE: for MVP, taking original UN-CUT images and faking "isTryOnCutout=true" 
        // to have them show up on the canvas since we don't have cutout products
        await prisma.productTryOnConfig.create({
            data: {
                productId: product.id,
                garmentType: getGarmentType(p.category),
                anchorX: 0.5,
                anchorY: 0.5,
                scale: 1.0,
                rotationDeg: 0,
            }
        });
    }
    console.log(`✓ Seeded ${products.length} products with TryOn config.`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });

const products = [
    // Geci
    { title: 'Geacă de piele Biker Vintage', brand: 'Zara', price: 180, size: 'M', condition: 'Foarte bun', category: 'Geci', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600' },
    { title: 'Trench Coat Camel Oversize', brand: 'Mango', price: 210, size: 'L', condition: 'Nou cu etichetă', category: 'Geci', tag: 'Outlet', stock: 2, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600' },
    { title: 'Geacă Denim Supradimensionată', brand: 'H&M', price: 85, size: 'XL', condition: 'Bun', category: 'Geci', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600' },
    { title: 'Puffer Jacket Negru Mat', brand: 'Bershka', price: 150, size: 'S', condition: 'Nou cu etichetă', category: 'Geci', tag: 'Outlet', stock: 3, imageUrl: 'https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?auto=format&fit=crop&q=80&w=600' },
    { title: 'Jachetă Bombardier Kaki', brand: 'Stradivarius', price: 120, size: 'M', condition: 'Foarte bun', category: 'Geci', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600' },

    // Tricouri
    { title: 'Tricou Bumbac Organic Alb', brand: 'H&M', price: 35, size: 'M', condition: 'Nou cu etichetă', category: 'Tricouri', tag: 'Outlet', stock: 5, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
    { title: 'Tricou Oversize Negru Essential', brand: 'Zara', price: 45, size: 'L', condition: 'Foarte bun', category: 'Tricouri', tag: 'Second-hand', stock: 2, imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600' },
    { title: 'Tricou Polo Bleumarin', brand: 'Mango', price: 55, size: 'M', condition: 'Bun', category: 'Tricouri', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&q=80&w=600' },
    { title: 'Tricou Grafic Print Vintage', brand: 'Bershka', price: 65, size: 'L', condition: 'Bun', category: 'Tricouri', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600' },

    // Pulovere
    { title: 'Pulover Tricotat Bej', brand: 'Zara', price: 89, size: 'M', condition: 'Foarte bun', category: 'Pulovere', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600' },
    { title: 'Hanorac Oversize Gri', brand: 'H&M', price: 70, size: 'XL', condition: 'Nou cu etichetă', category: 'Pulovere', tag: 'Outlet', stock: 3, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600' },
    { title: 'Cardigan Lână Neagră', brand: 'Mango', price: 110, size: 'S', condition: 'Foarte bun', category: 'Pulovere', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600' },
    { title: 'Pulover Guler Înalt Camel', brand: 'Stradivarius', price: 95, size: 'M', condition: 'Bun', category: 'Pulovere', tag: 'Second-hand', stock: 2, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600' },

    // Blugi
    { title: 'Blugi Skinny Negri', brand: 'Zara', price: 65, size: '32', condition: 'Bun', category: 'Blugi', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600' },
    { title: 'Blugi Mom Fit Albastru Deschis', brand: 'Bershka', price: 120, size: '28', condition: 'Foarte bun', category: 'Blugi', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&q=80&w=600' },
    { title: 'Blugi Straight Clasici', brand: 'H&M', price: 75, size: '30', condition: 'Nou cu etichetă', category: 'Blugi', tag: 'Outlet', stock: 2, imageUrl: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&q=80&w=600' },
    { title: 'Pantaloni Cargo Negri', brand: 'Stradivarius', price: 90, size: 'M', condition: 'Bun', category: 'Blugi', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600' },

    // Rochii
    { title: 'Rochie Midi Florală de Vară', brand: 'Mango', price: 75, size: 'S', condition: 'Bun', category: 'Rochii', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&q=80&w=600' },
    { title: 'Rochie Neagră Minimalistă', brand: 'Zara', price: 150, size: 'M', condition: 'Nou cu etichetă', category: 'Rochii', tag: 'Outlet', stock: 2, imageUrl: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=600' },
    { title: 'Rochie Midi Cărămizie', brand: 'H&M', price: 95, size: 'S', condition: 'Foarte bun', category: 'Rochii', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600' },
    { title: 'Rochie de Seară Elegantă', brand: 'Mango', price: 260, size: 'M', condition: 'Foarte bun', category: 'Rochii', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=600' },
    { title: 'Sarafan Denim Clasic', brand: 'Bershka', price: 80, size: 'L', condition: 'Bun', category: 'Rochii', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1585914924626-15adac1e6402?auto=format&fit=crop&q=80&w=600' },

    // Încălțăminte
    { title: 'Tenisi Canvas Albi Classic', brand: 'Nike', price: 180, size: '39', condition: 'Nou cu etichetă', category: 'Încălțăminte', tag: 'Outlet', stock: 2, imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600' },
    { title: 'Bocanci Piele Negri', brand: 'Zara', price: 220, size: '37', condition: 'Foarte bun', category: 'Încălțăminte', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600' },
    { title: 'Sneakers Retro Alb/Negru', brand: 'Adidas', price: 199, size: '40', condition: 'Bun', category: 'Încălțăminte', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600' },
    { title: 'Pantofi cu Toc Maro', brand: 'Mango', price: 130, size: '38', condition: 'Bun', category: 'Încălțăminte', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600' },

    // Accesorii
    { title: 'Poșetă Piele Maro Camel', brand: 'Zara', price: 140, size: 'One Size', condition: 'Foarte bun', category: 'Accesorii', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=600' },
    { title: 'Șapcă Baseball Neagră', brand: 'H&M', price: 29, size: 'One Size', condition: 'Nou cu etichetă', category: 'Accesorii', tag: 'Outlet', stock: 4, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600' },
    { title: 'Centură Piele cu Cataramă', brand: 'Mango', price: 45, size: 'One Size', condition: 'Bun', category: 'Accesorii', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600' },
    { title: 'Ochelari de Soare Retro', brand: 'Stradivarius', price: 65, size: 'One Size', condition: 'Bun', category: 'Accesorii', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600' },
    { title: 'Fular Lână Gri', brand: 'H&M', price: 39, size: 'One Size', condition: 'Bun', category: 'Accesorii', tag: 'Second-hand', stock: 2, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=600' },
];


