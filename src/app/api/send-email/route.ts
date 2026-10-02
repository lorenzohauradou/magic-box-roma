import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Istanzia Resend usando la chiave API dalle variabili d'ambiente
const resend = new Resend(process.env.RESEND_API_KEY);

// Inserisci l'email del cliente dove devono arrivare le richieste
const clientEmail = 'info@magicboxroma.it'; // email del cliente


// Scegli un indirizzo email dal dominio verificato per il mittente
const senderEmail = 'info@magicboxroma.it'; // Puoi usare info@, contatto@, noreply@, ecc.

export async function POST(request: Request) {
  try {
    // Estrai i dati del form dal corpo della richiesta
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validazione base (puoi aggiungerne altra se necessario)
    if (!name || !email || !message || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Invia l'email usando Resend
    const { data, error } = await resend.emails.send({
      from: senderEmail, // Ora usa l'indirizzo del dominio verificato
      to: [clientEmail], // Ora invia all'email del cliente
      subject: `Nuova Richiesta Preventivo da ${name}`,
      html: `
        <h1>Nuova Richiesta Preventivo</h1>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email (Richiedente):</strong> ${email}</p> 
        <p><strong>Telefono:</strong> ${phone}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email, // Lascia questo: permette al cliente di rispondere direttamente all'utente
    });

    // Gestisci eventuali errori dall'API di Resend
    if (error) {
      console.error("Resend Error:", error);
      // Fornisci un messaggio di errore più specifico se disponibile
      const errorMessage = error.message || 'Errore durante invio email.';
      return NextResponse.json({ error: 'Error sending email', details: errorMessage }, { status: 500 });
    }

    // Invia una risposta di successo al frontend
    return NextResponse.json({ success: true, message: 'Email sent successfully!', data });

  } catch (err) {
    // Gestisci errori generici
    console.error("API Route Error:", err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500 });
  }
}