<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmailMail extends Mailable implements ShouldQueue
{
	use Queueable, SerializesModels;

	public function __construct(public $verifyUrl, public $firstname) {}

	public function envelope()
	{
		return new Envelope(
			subject: 'Verify Your BroadTrack Email',
		);
	}

	public function content()
	{
		return new Content(
			view: 'emails.verify-email',
			with: [
				'verifyUrl' => $this->verifyUrl,
				'firstname' => $this->firstname,
			],
		);
	}

	public function attachments()
	{
		return [];
	}
}
