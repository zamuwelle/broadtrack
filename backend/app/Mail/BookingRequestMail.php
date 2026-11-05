<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingRequestMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $borrowerName,
        public string $borrowerEmail,
        public string $purpose,
        public string $startDate,
        public string $endDate,
        public array $items,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New equipment request');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.booking-request');
    }
}
