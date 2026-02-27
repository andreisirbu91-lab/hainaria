import React from 'react';

export default function Privacy() {
    return (
        <div className="bg-[#Fdfbf7] min-h-screen font-sans text-[#2D241E] overflow-hidden pt-32 pb-32">
            {/* ── SEO Meta ── */}
            <title>Politica de Confidențialitate | Hainaria</title>
            <meta name="description" content="Află cum colectăm, folosim și protejăm datele tale personale la Hainaria." />

            <div className="container mx-auto px-6 max-w-3xl">
                <header className="mb-16 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A68A7C] block mb-6">
                        Informații Legale
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A1512] leading-tight italic">
                        Politica de Confidențialitate
                    </h1>
                    <div className="w-16 h-[1px] bg-[#DBC6BB] mx-auto mt-10" />
                </header>

                <div className="prose prose-lg prose-p:text-[#5C4D43] prose-p:font-light prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-[#1A1512] prose-headings:font-normal max-w-none">

                    <p className="lead text-xl text-[#2D241E] italic mb-10">
                        La Hainaria, respectăm intimitatea ta și ne angajăm să îți protejăm datele personale cu aceeași rigoare cu care selectăm piesele din colecție. Această politică explică clar și simplu ce informații colectăm și cum le folosim.
                    </p>

                    <h3>Cine suntem</h3>
                    <p>
                        Suntem Hainaria, platformă online dedicată modei circulare și a experiențelor premium de shopping second-hand. Înțelegem prin "noi" sau "Hainaria" operatorul datelor tale personale conform legislației GDPR în vigoare.
                    </p>

                    <h3>Ce date colectăm</h3>
                    <p>
                        Când vizitezi site-ul nostru, creezi un cont sau plasezi o comandă, colectăm doar datele strict necesare pentru a-ți oferi cea mai bună experiență:
                    </p>
                    <ul>
                        <li><strong className="text-[#2D241E]">Date de identificare și contact:</strong> Nume, prenume, adresă de email, număr de telefon.</li>
                        <li><strong className="text-[#2D241E]">Date de livrare și facturare:</strong> Adresa fizică necesară pentru curierat și aspecte fiscale.</li>
                        <li><strong className="text-[#2D241E]">Imagini (doar pentru Virtual Try-On):</strong> Fotografiile încărcate în portalul Studio sunt procesate temporar prin inteligență artificială. Le stocăm doar atâta timp cât sesiunea ta este activă.</li>
                    </ul>

                    <h3>Cum folosim datele</h3>
                    <p>
                        Nu vom folosi niciodată datele tale în moduri neașteptate. Le utilizăm exclusiv pentru:
                    </p>
                    <ul>
                        <li>Procesarea și expedierea comenzilor tale.</li>
                        <li>Generarea imaginilor AI cu ținutele probate (dacă folosești funcția Studio Virtual Try-On).</li>
                        <li>Asistență clienți și rezolvarea eventualelor probleme privind retururile sau plățile.</li>
                        <li>Îmbunătățirea securității și a performanței site-ului nostru.</li>
                    </ul>

                    <h3>Temeiul legal</h3>
                    <p>
                        Prelucrăm datele tale pe baza consimțământului tău (când ne oferi explicit poze pentru Try-On sau te abonezi la newsletter), pentru executarea unui contract (la plasarea unei comenzi) și în baza obligațiilor noastre legale (pentru facturare și contabilitate).
                    </p>

                    <div className="p-8 bg-white border border-[#E5D7D0] rounded-2xl my-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#8C6E5D]" />
                        <h4 className="font-serif text-[#1A1512] text-xl mb-2 mt-0">Promisiunea Noastră</h4>
                        <p className="m-0 text-[#5C4D43] font-light">
                            <strong>Hainaria nu vinde, nu închiriază și nu comercializează niciodată datele tale personale către terțe părți.</strong> Accesul este limitat doar la partenerii de livrare și procesare plăți strict pentru executarea funcțiilor lor.
                        </p>
                    </div>

                    <h3>Perioada de stocare</h3>
                    <p>
                        Păstrăm datele tale personale doar atât cât este necesar scopurilor menționate. Datele fiscale sunt păstrate conform cerințelor legale (de regulă 10 ani). Fotografiile de la Virtual Try-On sunt șterse sau trecute în anonimat odată cu ștergerea contului tău.
                    </p>

                    <h3>Drepturile utilizatorilor</h3>
                    <p>
                        Conform GDPR, ai control total asupra datelor tale. Ai dreptul:
                    </p>
                    <ul>
                        <li>Să știi ce date deținem despre tine (dreptul de acces).</li>
                        <li>Să corectezi datele inexacte (dreptul la rectificare).</li>
                        <li>Să soliciți ștergerea datelor (dreptul de a fi uitat).</li>
                        <li>Să retragi oricând consimțământul pentru marketing.</li>
                    </ul>

                    <h3>Cookie-uri</h3>
                    <p>
                        Pentru a asigura funcționalitatea platformei (ex: păstrarea produselor în coș) și a analiza traficul, folosim cookie-uri. Acestea sunt fișiere text mici salvate în browserul tău. Poți vizita oricând pagina dedicată Politicii de Cookie-uri pentru a le gestiona.
                    </p>

                    <h3>Contact</h3>
                    <p>
                        Dacă ai întrebări despre cum îți protejăm intimitatea sau dorești să îți exerciți drepturile, ne poți scrie direct la:<br />
                        <a href="mailto:contact@hainaria.ro" className="font-medium text-[#8C6E5D] hover:text-[#5C4D43] transition-colors">contact@hainaria.ro</a>
                    </p>

                </div>
            </div>
        </div>
    );
}
