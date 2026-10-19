import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

// Inserisci l'email del cliente dove devono arrivare le richieste
const clientEmail = 'info@magicboxroma.it'; // email del cliente


// Scegli un indirizzo email dal dominio verificato per il mittente
const senderEmail = 'info@magicboxroma.it'; // Puoi usare info@, contatto@, noreply@, ecc.

// Endpoint pubblico: formato e lunghezze limitati, e ogni valore viene escapato prima di finire nell'HTML dell'email
const richiestaSchema = z.object({
  name: z.string().trim().min(1).max(100).regex(/^[^\r\n]+$/),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(1).max(40),
  message: z.string().trim().min(1).max(5000),
});

function escapeHtml(v: string) {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export async function POST(request: Request) {
  try {
    // Estrai e valida i dati del form dal corpo della richiesta
    const parsed = richiestaSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid fields', details: 'Controlla i campi del modulo e riprova.' }, { status: 400 });
    }
    const { name, email, phone, message } = parsed.data;

    // Invia l'email usando Resend
    const { data, error } = await resend.emails.send({
      from: senderEmail, // Ora usa l'indirizzo del dominio verificato
      to: [clientEmail], // Ora invia all'email del cliente
      subject: `Nuova Richiesta Preventivo da ${name}`,
      html: `
        <h1>Nuova Richiesta Preventivo</h1>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email (Richiedente):</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefono:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email, // Lascia questo: permette al cliente di rispondere direttamente all'utente
    });

    // Gestisci eventuali errori dall'API di Resend
    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error: 'Error sending email', details: 'Invio non riuscito, riprova più tardi.' }, { status: 500 });
    }

    // Invia una risposta di successo al frontend
    return NextResponse.json({ success: true, message: 'Email sent successfully!', data });

  } catch (err) {
    // Gestisci errori generici (il dettaglio resta nei log, non arriva al browser)
    console.error("API Route Error:", err);
    return NextResponse.json({ error: 'Failed to process request', details: 'Invio non riuscito, riprova più tardi.' }, { status: 500 });
  }
}