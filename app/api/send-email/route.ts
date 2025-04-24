import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Istanzia Resend usando la chiave API dalle variabili d'ambiente
const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = 'lorenzooradu@gmail.com'; // L'email a cui inviare

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
      from: 'onboarding@resend.dev', // IMPORTANTE: Usa l'indirizzo di default di Resend per iniziare. Dovrai verificare il tuo dominio (magicboxroma.it) su Resend per inviare da info@magicboxroma.it o simile.
      to: [toEmail],
      subject: `Nuova Richiesta Preventivo da ${name}`,
      html: `
        <h1>Nuova Richiesta Preventivo</h1>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefono:</strong> ${phone}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email, // Imposta l'email del sender come indirizzo di risposta
    });

    // Gestisci eventuali errori dall'API di Resend
    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error: 'Error sending email', details: error.message }, { status: 500 });
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