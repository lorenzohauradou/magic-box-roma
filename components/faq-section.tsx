import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white" id="faq">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-secondary-600 to-secondary-900">
            <span className="text-primary">Domande</span> Frequenti
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tutto ciò che serve sapere su MagicBox. Non trovi la risposta che cerchi? Contattaci il nostro team di supporto.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100/50 backdrop-blur-sm">
            <Accordion type="single" collapsible className="divide-y divide-gray-100">
              {/* Question 1 */}
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="px-8 py-6 hover:no-underline text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <span className="text-lg font-semibold text-secondary">Quali sono i servizi di imballaggio offerti da Magic Box Roma?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 pt-2 text-gray-600">
                  <div className="space-y-4">
                    <p>Offriamo una vasta gamma di servizi di imballaggio professionale, tra cui:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Imballaggio standard per oggetti di uso quotidiano</li>
                      <li>Imballaggio speciale per oggetti fragili e di valore</li>
                      <li>Imballaggio su misura per oggetti di grandi dimensioni</li>
                      <li>Imballaggio per spedizioni internazionali</li>
                      <li>Servizio di ritiro a domicilio</li>
                    </ul>
                    <p>Tutti i nostri imballaggi sono realizzati con materiali di alta qualità per garantire la massima protezione durante il trasporto.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Question 2 */}
              <AccordionItem value="item-2" className="border-none">
                <AccordionTrigger className="px-8 py-6 hover:no-underline text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <span className="text-lg font-semibold text-gray-900">
                      Come funziona il servizio di ritiro a domicilio?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 pt-2 text-gray-600">
                  <div className="space-y-4">
                    <p>Il nostro servizio di ritiro a domicilio è semplice e conveniente:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Prenota il ritiro online o telefonicamente</li>
                      <li>Scegli la fascia oraria preferita</li>
                      <li>Il nostro corriere passa a ritirare il pacco</li>
                      <li>Provvediamo all'imballaggio professionale</li>
                      <li>Spediamo il pacco alla destinazione scelta</li>
                    </ol>
                    <p>Il servizio è disponibile in tutta Roma e provincia, con fasce orarie flessibili per adattarsi alle tue esigenze.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Question 3 */}
              <AccordionItem value="item-3" className="border-none">
                <AccordionTrigger className="px-8 py-6 hover:no-underline text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <span className="text-lg font-semibold text-gray-900">Quali sono i tempi di consegna?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 pt-2 text-gray-600">
                  <div className="space-y-4">
                    <p>I tempi di consegna variano in base alla destinazione e al servizio scelto:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Consegna nazionale: 24-48 ore lavorative</li>
                      <li>Consegna internazionale: 2-5 giorni lavorativi</li>
                      <li>Consegna express: disponibile su richiesta</li>
                    </ul>
                    <p>Offriamo anche servizi di consegna urgente per spedizioni che richiedono tempi più rapidi.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Question 4 */}
              <AccordionItem value="item-4" className="border-none">
                <AccordionTrigger className="px-8 py-6 hover:no-underline text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <span className="text-lg font-semibold text-gray-900">
                      Come vengono calcolati i prezzi dei servizi?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 pt-2 text-gray-600">
                  <div className="space-y-4">
                    <p>I prezzi vengono calcolati in base a diversi fattori:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Dimensioni e peso del pacco</li>
                      <li>Tipo di imballaggio richiesto</li>
                      <li>Destinazione della spedizione</li>
                      <li>Servizi aggiuntivi (assicurazione, consegna urgente, etc.)</li>
                    </ul>
                    <p>Offriamo preventivi gratuiti e personalizzati per ogni spedizione. Contattaci per un preventivo dettagliato.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Question 5 */}
              <AccordionItem value="item-5" className="border-none">
                <AccordionTrigger className="px-8 py-6 hover:no-underline text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <span className="text-lg font-semibold text-gray-900">È possibile tracciare le spedizioni?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 pt-2 text-gray-600">
                  <div className="space-y-4">
                    <p>Sì, tutte le nostre spedizioni sono tracciabili. Forniamo un codice di tracciamento unico per ogni spedizione, che potrai utilizzare sul nostro sito web o tramite l'app per monitorare lo stato della consegna in tempo reale.</p>
                    <p>Inoltre, ti invieremo aggiornamenti via email o SMS sulle fasi principali della spedizione.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Question 6 */}
              <AccordionItem value="item-6" className="border-none">
                <AccordionTrigger className="px-8 py-6 hover:no-underline text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <span className="text-lg font-semibold text-gray-900">Cosa succede se il pacco viene danneggiato durante il trasporto?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 pt-2 text-gray-600">
                  <div className="space-y-4">
                    <p>La sicurezza dei tuoi pacchi è la nostra priorità. In caso di danni:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Tutte le nostre spedizioni sono coperte da assicurazione base</li>
                      <li>Offriamo assicurazioni aggiuntive per oggetti di valore</li>
                      <li>In caso di danni, il nostro team si occupa di gestire il reclamo</li>
                      <li>Rimborsiamo o sostituiamo l'oggetto danneggiato secondo i termini dell'assicurazione</li>
                    </ol>
                    <p>La nostra esperienza e i materiali di imballaggio di alta qualità minimizzano il rischio di danni durante il trasporto.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6 text-lg">Hai altre domande?</p>
            <a 
              href="https://wa.me/393515947075?text=Ciao%2C%20necessito%20maggiori%20informazioni%20riguardo%20ai%20vostri%20servizi."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Contatta il nostro team di supporto
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
