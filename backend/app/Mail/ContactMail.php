<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public $firstname, public $lastname, public $email, public $message, public $recipients) {}

    public function envelope()
    {
        return new Envelope(
            to: $this->recipients,
            subject: "Broadtrack Support: {$this->firstname} {$this->lastname}",
            replyTo: [new Address($this->email, "{$this->firstname} {$this->lastname}")],
        );
    }

    public function content()
    {
        return new Content(
            view: 'emails.contact',
            with: [
                'name' => "{$this->firstname} {$this->lastname}",
                'email' => $this->email,
                'body' => nl2br(e($this->message)),
            ],
        );
    }
}
